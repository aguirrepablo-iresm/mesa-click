package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"
)

type EmailSender interface {
	EnviarMagicLink(ctx context.Context, email, link string) error
}

type LogEmailSender struct{}

func (s *LogEmailSender) EnviarMagicLink(ctx context.Context, email, link string) error {
	slog.InfoContext(ctx, "Enviando magic link por LOG (Desarrollo)", "email", email, "link", link)
	return nil
}

type ResendEmailSender struct {
	apiKey    string
	fromEmail string
}

func NuevoResendEmailSender(apiKey, fromEmail string) *ResendEmailSender {
	return &ResendEmailSender{apiKey: apiKey, fromEmail: fromEmail}
}

func (s *ResendEmailSender) EnviarMagicLink(ctx context.Context, toEmail, link string) error {
	url := "https://api.resend.com/emails"
	body := map[string]any{
		"from":    s.fromEmail,
		"to":      []string{toEmail},
		"subject": "Tu acceso a Mesa CLICK",
		"html":    fmt.Sprintf("<p>Hola,</p><p>Haz clic en el siguiente enlace para ingresar a tu cuenta de Mesa CLICK (expira en 15 minutos):</p><p><a href='%s'>Ingresar a Mesa CLICK</a></p><p>Si no solicitaste este enlace, puedes ignorar este correo.</p>", link),
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("error serializando request de email: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error enviando request a Resend: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("error de Resend: status %d", resp.StatusCode)
	}

	slog.InfoContext(ctx, "magic link enviado con éxito por Resend", "email", toEmail)
	return nil
}
