package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"IA1_EV2025_Proyecto2/internal/admin"
	"IA1_EV2025_Proyecto2/internal/app"
	"IA1_EV2025_Proyecto2/internal/config"
	"IA1_EV2025_Proyecto2/internal/metrics"
	"IA1_EV2025_Proyecto2/internal/telegram"
)

func main() {
	cfgPath := "configs/config.json"

	cfg, err := config.Load(cfgPath)
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	// CREAR DIRECTORIOS NECESARIOS
	if err := os.MkdirAll(cfg.OutputDir, 0755); err != nil {
		log.Fatalf("no se pudo crear directorio de salida: %v", err)
	}
	
	// Crear también el directorio para métricas
	metricsDir := cfg.OutputDir
	if err := os.MkdirAll(metricsDir, 0755); err != nil {
		log.Fatalf("no se pudo crear directorio de métricas: %v", err)
	}

	st := app.NewState()

	mw, err := metrics.New(cfg.OutputDir + "/metrics.jsonl")
	if err != nil {
		log.Fatalf("metrics: %v", err)
	}
	defer func() {
		_ = mw.Close()
	}()

	bot, err := telegram.New(cfg.TelegramBotToken, cfg.TelegramChatID)
	if err != nil {
		log.Fatalf("telegram: %v", err)
	}

	runner := app.NewRunner(cfgPath, cfg, st, mw, bot)

	adm := &admin.Server{
		State:  st,
		GetCfg: func() config.Config { return runner.GetConfig() },
		SetCfg: func(c config.Config) error { return runner.UpdateConfig(c) },
		Control: runner.ControlChan(),
	}

	// Admin server
	go func() {
		log.Printf("[admin] listening on %s", cfg.AdminHTTPAddr)
		if err := http.ListenAndServe(cfg.AdminHTTPAddr, adm.Routes()); err != nil {
			log.Printf("[admin] error: %v", err)
		}
	}()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Señales para cerrar ordenado
	go func() {
		ch := make(chan os.Signal, 1)
		signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)
		<-ch
		log.Println("[main] signal received, stopping...")
		cancel()
	}()

	log.Println("[main] SmartSlide starting...")
	if err := runner.Run(ctx); err != nil {
		log.Fatalf("runner: %v", err)
	}
	log.Println("[main] SmartSlide stopped.")
}
