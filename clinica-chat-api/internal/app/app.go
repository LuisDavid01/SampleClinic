package app

import (
	"context"
	"fmt"

	"log"
	"net/http"
	"os"

	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/ws"
)

type Application struct {
	Logger  *log.Logger
	Manager *ws.Manager
}

func NewApplication() (*Application, error) {
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)
	ctx := context.Background()
	manager := ws.NewManager(ctx)

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
	log.Println("someone hit this")
	fmt.Fprintf(w, "Status is avaliable\n")
}
