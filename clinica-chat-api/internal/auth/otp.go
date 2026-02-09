package auth

import (
	"context"
	"sync"
	"time"

	"github.com/google/uuid"
)


type OTP struct {
	Key      string
	Created  time.Time
	Rol      string
	Username string
	UserID   string
}
type RetentionMap struct {
	data map[string]OTP
	sync.Mutex
}



func NewRetentionMap(ctx context.Context, retentionPeriod time.Duration) *RetentionMap {
	rm := &RetentionMap{
		data: make(map[string]OTP),
	}
 
	go rm.Retention(ctx, retentionPeriod)
	return rm

}

func (rm *RetentionMap) NewOTP(username, rol, userID string) OTP {
	rm.Lock()
	defer rm.Unlock()

	newOtp := OTP{
		Key:      uuid.NewString(),
		Created:  time.Now(),
		Rol:      rol,
		Username: username,
		UserID:   userID,
	}

	rm.data[newOtp.Key] = newOtp
	return newOtp
}

func (rm *RetentionMap) ValidateOTP(otp string) (OTP, bool) {
	rm.Lock()
	defer rm.Unlock()

	if _, ok := rm.data[otp]; !ok {
		return OTP{}, false
	}
	currOtp := rm.data[otp]
	delete(rm.data, otp)
	return currOtp, true
}

func (rm *RetentionMap) Retention(ctx context.Context, retentionPeriod time.Duration) {
	ticker := time.NewTicker(400 * time.Millisecond)

	for {
		select {
		case <-ticker.C:
			rm.Lock()
			for _, otp := range rm.data {
				if otp.Created.Add(retentionPeriod).Before(time.Now()) {
					delete(rm.data, otp.Key)
				}
			}
			rm.Unlock()

		case <-ctx.Done():
			return
		}
	}
}
