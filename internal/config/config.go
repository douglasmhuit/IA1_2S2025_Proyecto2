package config

import (
	"encoding/json"
	"errors"
	"os"
)

type Config struct {
	CameraIndex             int     `json:"camera_index"`
	CaptureFPS              int     `json:"capture_fps"`
	Sensitivity             float64 `json:"sensitivity"`
	MinSecondsBetweenSlides int     `json:"min_seconds_between_slides"`

	TelegramBotToken string `json:"telegram_bot_token"`
	TelegramChatID   int64  `json:"telegram_chat_id"`

	TesseractLang string `json:"tesseract_lang"`

	OutputDir        string `json:"output_dir"`
	EnableAnnotation bool   `json:"enable_annotation"`
	MaxCaptionChars  int    `json:"max_caption_chars"`

	AdminHTTPAddr string `json:"admin_http_addr"`
}

func Load(path string) (Config, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return Config{}, err
	}
	var c Config
	if err := json.Unmarshal(b, &c); err != nil {
		return Config{}, err
	}

	// Defaults / validaciones básicas
	if c.CaptureFPS <= 0 {
		c.CaptureFPS = 5
	}
	if c.Sensitivity <= 0 {
		c.Sensitivity = 0.08
	}
	if c.MinSecondsBetweenSlides <= 0 {
		c.MinSecondsBetweenSlides = 2
	}
	if c.OutputDir == "" {
		c.OutputDir = "assets/output"
	}
	if c.MaxCaptionChars <= 0 {
		c.MaxCaptionChars = 900
	}
	if c.AdminHTTPAddr == "" {
		c.AdminHTTPAddr = ":8080"
	}
	if c.TesseractLang == "" {
		c.TesseractLang = "spa"
	}

	if c.TelegramBotToken == "" {
		return Config{}, errors.New("telegram_bot_token vacío")
	}
	if c.TelegramChatID == 0 {
		return Config{}, errors.New("telegram_chat_id inválido (0)")
	}

	return c, nil
}

func Save(path string, c Config) error {
	b, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, b, 0644)
}
