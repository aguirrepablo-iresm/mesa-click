# Dockerfile
#
# Construye el servidor Mesa CLICK en dos etapas:
# 1. "builder" compila el código Go en un binario
# 2. La imagen final solo contiene ese binario (sin el compilador)
# Resultado: imagen muy liviana (~20MB)

# --- Etapa 1: compilación ---
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copiamos los archivos de dependencias primero
# (Docker los cachea si no cambian, acelerando builds futuros)
COPY go.mod ./
RUN go mod download

# Copiamos el resto del código
COPY . .

# Compilamos el binario
RUN CGO_ENABLED=0 go build -o servidor ./cmd/server

# --- Etapa 2: imagen final ---
FROM alpine:3.19

WORKDIR /app

# Copiamos solo el binario compilado
COPY --from=builder /app/servidor .

# Copiamos las migraciones (el servidor las necesita al arrancar)
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080

CMD ["./servidor"]
