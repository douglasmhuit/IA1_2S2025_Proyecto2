package annotate

import (
	"image"
	"image/color"
	"strings"

	"gocv.io/x/gocv"
)

func Annotate(frame gocv.Mat, keywords []string) gocv.Mat {
	out := frame.Clone()

	// 1) Overlay con keywords arriba
	txt := "KW: " + strings.Join(keywords, ", ")
	gocv.PutText(&out, txt, image.Pt(15, 30), gocv.FontHersheySimplex, 0.8, color.RGBA{R: 0, G: 255, B: 0, A: 0}, 2)

	// 2) Cajas por contornos (aprox “zonas de texto”)
	gray := gocv.NewMat()
	defer gray.Close()
	gocv.CvtColor(out, &gray, gocv.ColorBGRToGray)

	edges := gocv.NewMat()
	defer edges.Close()
	gocv.Canny(gray, &edges, 50, 150)

	contours := gocv.FindContours(edges, gocv.RetrievalExternal, gocv.ChainApproxSimple)
	for i := 0; i < contours.Size(); i++ {
		c := contours.At(i)
		r := gocv.BoundingRect(c)

		if r.Dx() < 120 || r.Dy() < 40 {
			continue
		}
		// evitar que encierre TODO el frame
		if r.Dx() > out.Cols()-10 && r.Dy() > out.Rows()-10 {
			continue
		}
		gocv.Rectangle(&out, r, color.RGBA{R: 255, G: 0, B: 0, A: 255}, 2)
	}
	return out
}
