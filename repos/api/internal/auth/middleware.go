package auth

import (
	"context"
	"net/http"
	"os"
	"strings"
)

func Requerir(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		secreto := os.Getenv("JWT_SECRET")

		var tokenStr string

		if h := r.Header.Get("Authorization"); strings.HasPrefix(h, "Bearer ") {
			tokenStr = strings.TrimPrefix(h, "Bearer ")
		}
		if tokenStr == "" {
			if c, err := r.Cookie("session"); err == nil {
				tokenStr = c.Value
			}
		}

		if tokenStr == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error":"no autorizado"}`))
			return
		}

		claims, err := ValidarJWT(tokenStr, secreto)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error":"token inválido"}`))
			return
		}

		ctx := context.WithValue(r.Context(), claimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
