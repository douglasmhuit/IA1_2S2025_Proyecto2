package app

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"IA1_EV2025_Proyecto2/internal/annotate"
	"IA1_EV2025_Proyecto2/internal/capture"
	"IA1_EV2025_Proyecto2/internal/config"
	"IA1_EV2025_Proyecto2/internal/metrics"
	"IA1_EV2025_Proyecto2/internal/ocr"
	"IA1_EV2025_Proyecto2/internal/telegram"

	"gocv.io/x/gocv"
)

type Runner struct {
	CfgPath string

	cfg   config.Config
	State *State

	Metrics *metrics.Writer
	Bot     *telegram.Client

	ctrlCh chan ControlState
}

func NewRunner(cfgPath string, cfg config.Config, st *State, mw *metrics.Writer, bot *telegram.Client) *Runner {
	return &Runner{
		CfgPath: cfgPath,
		cfg:     cfg,
		State:   st,
		Metrics: mw,
		Bot:     bot,
		ctrlCh:  make(chan ControlState, 10),
	}
}

func (r *Runner) ControlChan() chan<- ControlState { return r.ctrlCh }

func (r *Runner) GetConfig() config.Config { return r.cfg }

func (r *Runner) UpdateConfig(cfg config.Config) error {
	// Persistir a disco
	if err := config.Save(r.CfgPath, cfg); err != nil {
		return err
	}
	r.cfg = cfg
	return nil
}

func (r *Runner) Run(ctx context.Context) error {
	if err := os.MkdirAll(r.cfg.OutputDir, 0755); err != nil {
		return err
	}

	r.State.SetStatus(StateRunning)

	cam, err := capture.OpenCamera(r.cfg.CameraIndex)
	if err != nil {
		r.State.SetError(err.Error())
		return err
	}
	defer cam.Close()

	det := capture.NewDetector(
		r.cfg.Sensitivity,
		time.Duration(r.cfg.MinSecondsBetweenSlides)*time.Second,
	)

	tess, err := ocr.NewClient(r.cfg.TesseractLang)
	if err != nil {
		r.State.SetError(err.Error())
		return err
	}
	defer tess.Close()

	ticker := time.NewTicker(time.Second / time.Duration(r.cfg.CaptureFPS))
	defer ticker.Stop()

	prev := gocv.NewMat()
	defer prev.Close()

	for {
		select {
		case <-ctx.Done():
			r.State.SetStatus(StateStopped)
			return nil

		case st := <-r.ctrlCh:
			switch st {
			case StatePaused:
				r.State.SetStatus(StatePaused)
			case StateRunning:
				r.State.SetStatus(StateRunning)
			case StateStopped:
				r.State.SetStatus(StateStopped)
				return nil
			}

		case <-ticker.C:
			if r.State.Snapshot().Status != StateRunning {
				continue
			}

			frame := gocv.NewMat()
			if ok := cam.Read(&frame); !ok || frame.Empty() {
				frame.Close()
				continue
			}

			// Primer frame: solo set prev
			if prev.Empty() {
				frame.CopyTo(&prev)
				frame.Close()
				continue
			}

			changed, score := det.IsNewSlide(prev, frame)
			if !changed {
				frame.Close()
				continue
			}

			start := time.Now()

			ts := time.Now().Format("20060102_150405")
			rawPath := filepath.Join(r.cfg.OutputDir, fmt.Sprintf("slide_%s_raw.jpg", ts))
			_ = gocv.IMWrite(rawPath, frame)

			// OCR
			text, ocrMs, ocrErr := tess.ExtractText(frame)
			if ocrErr != nil {
				r.State.SetError(ocrErr.Error())
			}

			summary := ocr.Summarize(text)

			finalPath := rawPath
			if r.cfg.EnableAnnotation {
				ann := annotate.Annotate(frame, summary.Keywords)
				annotatedPath := filepath.Join(r.cfg.OutputDir, fmt.Sprintf("slide_%s_annotated.jpg", ts))
				_ = gocv.IMWrite(annotatedPath, ann)
				ann.Close()
				finalPath = annotatedPath
			}

			caption := ocr.BuildCaption(summary, r.cfg.MaxCaptionChars, score)
			sendErr := r.Bot.SendPhotoWithCaption(finalPath, caption)
			if sendErr != nil {
				r.State.SetError(sendErr.Error())
			}

			totalMs := time.Since(start).Milliseconds()

			r.State.MarkSlideCaptured()
			r.Metrics.Write(metrics.Record{
				TimeISO:      time.Now().Format(time.RFC3339),
				SlidePath:    finalPath,
				RawPath:      rawPath,
				ChangeScore:  score,
				OCRMillis:    ocrMs,
				TotalMillis:  totalMs,
				TextChars:    len(text),
				CaptionChars: len(caption),
				SendOK:       sendErr == nil,
				OCROK:        ocrErr == nil,
				Error:        pickErr(ocrErr, sendErr),
			})

			// actualizar prev
			frame.CopyTo(&prev)
			frame.Close()
		}
	}
}

func pickErr(a, b error) string {
	if a != nil {
		return a.Error()
	}
	if b != nil {
		return b.Error()
	}
	return ""
}
