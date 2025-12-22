package ocr

import (
	"errors"
	"strings"
	"time"

	"github.com/otiai10/gosseract/v2"
	"gocv.io/x/gocv"
)

type Client struct {
	c *gosseract.Client
}

func NewClient(lang string) (*Client, error) {
	c := gosseract.NewClient()
	if c == nil {
		return nil, errors.New("no se pudo crear cliente gosseract")
	}
	_ = c.SetLanguage(lang)
	return &Client{c: c}, nil
}

func (cl *Client) Close() { cl.c.Close() }

func (cl *Client) ExtractText(frame gocv.Mat) (string, int64, error) {
	start := time.Now()

	buf, err := gocv.IMEncode(gocv.JPEGFileExt, frame)
	if err != nil {
		return "", time.Since(start).Milliseconds(), err
	}
	defer buf.Close()

	cl.c.SetImageFromBytes(buf.GetBytes())
	txt, err := cl.c.Text()
	if err != nil {
		return "", time.Since(start).Milliseconds(), err
	}
	txt = strings.TrimSpace(txt)
	return txt, time.Since(start).Milliseconds(), nil
}
