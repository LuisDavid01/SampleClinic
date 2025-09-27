package routes

import (
	//"io"
	//"html/template"
	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/app"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
	"github.com/go-chi/chi/v5"
	"net/http"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	// Health check route
	r.Get("/api/health", app.HealthCheck)

	r.Post("/api/otp", clerkhttp.WithHeaderAuthorization()(http.HandlerFunc(app.Manager.OtpHandler)).ServeHTTP)
	//route enableing ws
	r.Get("/ws", app.Manager.ServeWs)

	return r
}
