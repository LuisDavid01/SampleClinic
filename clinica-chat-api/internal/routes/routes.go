package routes

import (
	//"io"
	//"html/template"
	"net/http"
	"os"

	_ "github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/docs"
	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/app"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
	"github.com/go-chi/chi/v5"
	httpSwagger "github.com/swaggo/http-swagger/v2"
)

func SetupRoutes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()

	// Health check route
	r.Get("/api/health", app.HealthCheck)

	//swagger
	if os.Getenv("GO_ENV") != "production" {
		r.Get("/swagger/*", httpSwagger.Handler(
			httpSwagger.URL("http://localhost:8081/swagger/doc.json"),
		))
	}
	r.Post("/api/otp", clerkhttp.WithHeaderAuthorization()(http.HandlerFunc(app.Manager.OtpHandler)).ServeHTTP)
	//route enableing ws
	r.Get("/ws", app.Manager.ServeWs)

	return r
}
