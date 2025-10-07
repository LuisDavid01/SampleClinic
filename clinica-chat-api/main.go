package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/app"
	"github.com/LuisDavid01/fisioterapeuta-ep/clinica-chat-api/internal/routes"
	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/joho/godotenv"
)

// @title						Clinica Chat API
// @version					1.0
// @description				Microservicio de chat en tiempo real para Selena Fisiotarepia
// @termsOfService				http://swagger.io/terms/
// @securityDefinitions.apikey	BearerAuth
// @in							header
// @name						Authorization
func main() {
	var port int
	flag.IntVar(&port, "port", 8080, "live-chat")
	flag.Parse()
	err := godotenv.Load()
	if err != nil {
		console.log(err)
	}
	clerk.SetKey(os.Getenv("CLERK_SECRET_KEY"))

	app, err := app.NewApplication()
	if err != nil {
		console.log(err)
	}

	r := routes.SetupRoutes(app)
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      r,
		IdleTimeout:  5 * time.Minute,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	app.Logger.Printf("the server started successfuly on port: %d !!\n Swagger docs: http://localhost:8080/swagger/index.html", port)

	log.Fatal(server.ListenAndServe())
}
