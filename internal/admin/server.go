package admin

import (
	"encoding/json"
	"net/http"

	"IA1_EV2025_Proyecto2/internal/app"
	"IA1_EV2025_Proyecto2/internal/config"
)

type Server struct {
	State   *app.State
	GetCfg  func() config.Config
	SetCfg  func(config.Config) error
	Control chan<- app.ControlState
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, s.State.Snapshot())
	})

	mux.HandleFunc("/config", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			writeJSON(w, s.GetCfg())
		case http.MethodPost:
			var c config.Config
			if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := s.SetCfg(c); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			writeJSON(w, map[string]any{"ok": true})
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/control/start", func(w http.ResponseWriter, r *http.Request) {
		s.Control <- app.StateRunning
		writeJSON(w, map[string]any{"ok": true})
	})
	mux.HandleFunc("/control/pause", func(w http.ResponseWriter, r *http.Request) {
		s.Control <- app.StatePaused
		writeJSON(w, map[string]any{"ok": true})
	})
	mux.HandleFunc("/control/stop", func(w http.ResponseWriter, r *http.Request) {
		s.Control <- app.StateStopped
		writeJSON(w, map[string]any{"ok": true})
	})

	return corsMiddleware(mux)
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}
