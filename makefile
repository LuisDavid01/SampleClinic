GIT_SHA := $(shell git rev-parse HEAD)
BUILD_TAG := $(if $(BUILD_TAG),$(BUILD_TAG),latest)


build-chat-windows:
	cd clinica-chat-api &&  go build -o ../chatApi.exe .
build-chat:
	cd clinica-chat-api && GOOS=linux GOARCH=amd64 go build -o ../chatApi .

run-chat-windows: 
	chatApi.exe
run-chat:
	chatApi

build-image-chat:
	docker buildx build \
		--platform linux/amd64,linux/arm64 \
		--tag "clinica/chat-api:$(GIT_SHA)-build" \
		--target build \
		./clinica-chat-api
	docker buildx build \
		--cache-from "clinica/chat-api:$(GIT_SHA)-build" \
		--platform linux/amd64,linux/arm64 \
		--tag "clinica/chat-api:$(GIT_SHA)" \
		./clinica-chat-api


build-image-chat-promote:
	docker image tag clinica/chat-api:$(GIT_SHA) clinica/chat-api:$(BUILD_TAG)

down:
	docker compose down --remove-orphans --volumes

up: down
	docker compose up --detach
