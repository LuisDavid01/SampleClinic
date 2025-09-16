package app

import (
	"fmt"

	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/ws"
	"log"
	"net/http"
	"os"
)

type Application struct {
	Logger  *log.Logger
	Manager *ws.Manager
}

func NewApplication() (*Application, error) {
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	manager := &ws.Manager{}

	//we construct the application
	app := &Application{
		Logger:  logger,
		Manager: manager,
	}
	return app, nil
}

func (a *Application) HealthCheck(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Status is avaliable\n")
}
