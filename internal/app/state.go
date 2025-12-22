package app

import (
	"sync"
	"time"
)

type ControlState string

const (
	StateStopped ControlState = "stopped"
	StateRunning ControlState = "running"
	StatePaused  ControlState = "paused"
)

type State struct {
	mu sync.RWMutex

	Status         ControlState
	StartedAt      time.Time
	LastSlideAt    time.Time
	SlidesCaptured int
	LastError      string
}

func NewState() *State {
	return &State{Status: StateStopped}
}

func (s *State) Snapshot() State {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return State{
		Status:         s.Status,
		StartedAt:      s.StartedAt,
		LastSlideAt:    s.LastSlideAt,
		SlidesCaptured: s.SlidesCaptured,
		LastError:      s.LastError,
	}
}

func (s *State) SetStatus(st ControlState) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.Status = st
	if st == StateRunning && s.StartedAt.IsZero() {
		s.StartedAt = time.Now()
	}
}

func (s *State) SetError(err string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.LastError = err
}

func (s *State) MarkSlideCaptured() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.SlidesCaptured++
	s.LastSlideAt = time.Now()
}
