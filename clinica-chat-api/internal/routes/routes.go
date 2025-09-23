package routes

import (
	//"io"
	//"html/template"
	//"net/http"
	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/app"
	"github.com/go-chi/chi/v5"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	// Health check route
	r.Get("/api/health", app.HealthCheck)

	r.Post("/api/otp", app.Manager.OtpHandler)
	//route enableing ws
	r.Get("/ws", app.Manager.ServeWs)

	return r
}
