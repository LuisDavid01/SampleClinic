build-chat:
	cd clinica-chat-api && go build -o ../chatApi.exe .
build-image-chat:
	docker buildx build \
		--platform linux/amd64,linux/arm64 \
		--tag clinica/chat-api:latest \
		--target build \
		./clinica-chat-api

