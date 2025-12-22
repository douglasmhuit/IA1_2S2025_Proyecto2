package telegram

import (
	"os"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type Client struct {
	bot    *tgbotapi.BotAPI
	chatID int64
}

func New(token string, chatID int64) (*Client, error) {
	bot, err := tgbotapi.NewBotAPI(token)
	if err != nil {
		return nil, err
	}
	return &Client{bot: bot, chatID: chatID}, nil
}

func (c *Client) SendPhotoWithCaption(path string, caption string) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	// Versión actualizada de la API
	file := tgbotapi.FileReader{
		Name:   "slide.jpg",
		Reader: f,
	}

	msg := tgbotapi.NewPhoto(c.chatID, file)
	msg.Caption = caption

	_, err = c.bot.Send(msg)
	return err
}
