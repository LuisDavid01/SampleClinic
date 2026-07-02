FROM public.ecr.aws/docker/library/golang:1.26-alpine AS build


WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . . 

RUN go build -o main 

FROM alpine:latest AS runner


WORKDIR /app
ENV GO_ENV="development"
ENV CLERK_SECRET_KEY=""
COPY --from=build /app/main .
EXPOSE 8080

CMD ["./main"]
