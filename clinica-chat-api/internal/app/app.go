package app

import (
	"context"
	"fmt"
	"log/slog"

	"net/http"

	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/ws"
)

type Application struct {
	Logger  *slog.Logger
	Manager *ws.Manager
}

func NewApplication(logger *slog.Logger) (*Application, error) {
	ctx := context.Background()
	manager := ws.NewManager(ctx, logger)

	//we construct the application
	app := &Application{
		Logger:  logger,
		Manager: manager,
	}
	return app, nil
}

// HealthCheck godoc
//
//	@Summary		Verifica si el servidor está vivo
//	@Description	Endpoint de health check
//	@Tags			health
//	@Produce		json
//	@Success		200	{string}	string	"OK"
//	@Router			/api/health [get]
func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Status is avaliable\n")
}
