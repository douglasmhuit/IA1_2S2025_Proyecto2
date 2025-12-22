package capture

import "gocv.io/x/gocv"

func OpenCamera(index int) (*gocv.VideoCapture, error) {
	cam, err := gocv.OpenVideoCapture(index)
	if err != nil {
		return nil, err
	}
	// Sugerencias (no garantizadas en todas las cámaras)
	cam.Set(gocv.VideoCaptureFrameWidth, 1280)
	cam.Set(gocv.VideoCaptureFrameHeight, 720)
	return cam, nil
}
