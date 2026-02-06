package auth

import (
	"context"
	"testing"
	"time"
)

func TestValidateOTP(t *testing.T) {
	// Caso 1: OTP válido - validación exitosa
	t.Run("OTP válido - validación exitosa", func(t *testing.T) {
		// Crear retention map sin iniciar el goroutine de retención
		// para evitar interferencia durante la prueba
		rm := make(RetentionMap)

		// Crear un OTP de prueba
		testOTP := rm.NewOTP("testuser", "user", "123")

		// Validar el OTP inmediatamente (antes de que expire)
		otpData, isValid := rm.ValidateOTP(testOTP.Key)

		// Verificar que la validación fue exitosa
		if !isValid {
			t.Error("Se esperaba que el OTP fuera válido, pero la validación falló")
		}

		// Verificar que se devolvieron los datos correctos
		if otpData.Username != "testuser" {
			t.Errorf("Se esperaba username 'testuser', se obtuvo '%s'", otpData.Username)
		}
		if otpData.Rol != "user" {
			t.Errorf("Se esperaba rol 'user', se obtuvo '%s'", otpData.Rol)
		}
		if otpData.UserID != "123" {
			t.Errorf("Se esperaba userID '123', se obtuvo '%s'", otpData.UserID)
		}

		// Verificar que el OTP fue eliminado después de la validación
		_, exists := rm[testOTP.Key]
		if exists {
			t.Error("El OTP debería haber sido eliminado después de la validación")
		}
	})

	// Caso 2: OTP expirado - eliminación por retención
	t.Run("OTP expirado - eliminación por retención", func(t *testing.T) {
		// Crear retention map con contexto controlado
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		rm := make(RetentionMap)

		// Crear un OTP de prueba
		testOTP := rm.NewOTP("testuser2", "admin", "456")

		// Iniciar el goroutine de retención con período de 1 segundo
		// (usamos 1 segundo para acelerar la prueba)
		go rm.Retention(ctx, 1*time.Second)

		// Esperar más tiempo que el período de retención
		// para asegurar que el OTP expire y sea eliminado
		time.Sleep(2 * time.Second)

		// Intentar validar el OTP expirado
		otpData, isValid := rm.ValidateOTP(testOTP.Key)

		// Verificar que la validación falló
		if isValid {
			t.Error("Se esperaba que el OTP expirado fuera inválido, pero la validación tuvo éxito")
		}

		// Verificar que se devolvieron datos vacíos
		if otpData.Key != "" {
			t.Errorf("Se esperaba OTP vacío, se obtuvo Key: '%s'", otpData.Key)
		}

		// Verificar explícitamente que el OTP ya no existe en el mapa
		_, exists := rm[testOTP.Key]
		if exists {
			t.Error("El OTP expirado debería haber sido eliminado por el retention map")
		}
	})

	// Caso adicional: Validar OTP que no existe
	t.Run("OTP inexistente", func(t *testing.T) {
		rm := make(RetentionMap)

		// Intentar validar un OTP que nunca existió
		otpData, isValid := rm.ValidateOTP("otp-inexistente")

		// Verificar que la validación falló
		if isValid {
			t.Error("Se esperaba que el OTP inexistente fuera inválido, pero la validación tuvo éxito")
		}

		// Verificar que se devolvieron datos vacíos
		if otpData.Key != "" {
			t.Errorf("Se esperaba OTP vacío, se obtuvo Key: '%s'", otpData.Key)
		}
	})
}
