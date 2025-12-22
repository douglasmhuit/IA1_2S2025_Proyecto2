package capture

import (
	"image"
	"time"

	"gocv.io/x/gocv"
)

type Detector struct {
	sensitivity float64
	minGap      time.Duration
	lastTrigger time.Time
}

func NewDetector(sensitivity float64, minGap time.Duration) *Detector {
	return &Detector{
		sensitivity: sensitivity,
		minGap:      minGap,
	}
}

// score ~ proporción de pixeles que cambiaron (0..1 aprox)
func (d *Detector) IsNewSlide(prev, cur gocv.Mat) (bool, float64) {
	if prev.Empty() || cur.Empty() {
		return false, 0
	}
	if time.Since(d.lastTrigger) < d.minGap {
		return false, 0
	}

	pg := gocv.NewMat()
	cg := gocv.NewMat()
	defer pg.Close()
	defer cg.Close()

	gocv.CvtColor(prev, &pg, gocv.ColorBGRToGray)
	gocv.CvtColor(cur, &cg, gocv.ColorBGRToGray)

	gocv.GaussianBlur(pg, &pg, image.Pt(5, 5), 0, 0, gocv.BorderDefault)
	gocv.GaussianBlur(cg, &cg, image.Pt(5, 5), 0, 0, gocv.BorderDefault)

	diff := gocv.NewMat()
	defer diff.Close()

	gocv.AbsDiff(pg, cg, &diff)
	gocv.Threshold(diff, &diff, 25, 255, gocv.ThresholdBinary)

	changed := gocv.CountNonZero(diff)
	total := diff.Rows() * diff.Cols()
	if total <= 0 {
		return false, 0
	}

	score := float64(changed) / float64(total)
	if score >= d.sensitivity {
		d.lastTrigger = time.Now()
		return true, score
	}
	return false, score
}
