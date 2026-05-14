package ws

import (
	"sync"
	"time"
)

type SlidingWindowLimiter struct {
	timestamps  []time.Time
	maxRequests int
	window      time.Duration
	mu          sync.Mutex
}

func NewSlidingWindowLimiter(maxRequests int, window time.Duration) *SlidingWindowLimiter {
	return &SlidingWindowLimiter{
		maxRequests: maxRequests,
		window:      window,
		timestamps:  make([]time.Time, 0, maxRequests),
	}
}

func (s *SlidingWindowLimiter) Allow() bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-s.window)

	valid := 0
	for _, t := range s.timestamps {
		if t.After(cutoff) {
			valid++
		}
	}
	s.timestamps = s.timestamps[:valid]

	if len(s.timestamps) >= s.maxRequests {
		return false
	}

	s.timestamps = append(s.timestamps, now)
	return true
}
