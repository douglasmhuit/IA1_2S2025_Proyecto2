package metrics

import (
	"encoding/json"
	"os"
	"sync"
)

type Record struct {
	TimeISO      string  `json:"time_iso"`
	SlidePath    string  `json:"slide_path"`
	RawPath      string  `json:"raw_path"`
	ChangeScore  float64 `json:"change_score"`
	OCRMillis    int64   `json:"ocr_ms"`
	TotalMillis  int64   `json:"total_ms"`
	TextChars    int     `json:"text_chars"`
	CaptionChars int     `json:"caption_chars"`
	SendOK       bool    `json:"send_ok"`
	OCROK        bool    `json:"ocr_ok"`
	Error        string  `json:"error,omitempty"`
}

type Writer struct {
	mu sync.Mutex
	f  *os.File
}

func New(path string) (*Writer, error) {
	f, err := os.OpenFile(path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}
	return &Writer{f: f}, nil
}

func (w *Writer) Close() error {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.f.Close()
}

func (w *Writer) Write(r Record) {
	w.mu.Lock()
	defer w.mu.Unlock()
	b, _ := json.Marshal(r)
	_, _ = w.f.Write(append(b, '\n'))
}
