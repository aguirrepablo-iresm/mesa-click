package auth

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"net/smtp"
	"time"
)

type EmailSender interface {
	EnviarMagicLink(ctx context.Context, email, link string) error
}

// LogEmailSender solo loguea el link para desarrollo local.
type LogEmailSender struct{}

func (s *LogEmailSender) EnviarMagicLink(ctx context.Context, email, link string) error {
	slog.InfoContext(ctx, "Enviando magic link por LOG (Desarrollo)", "email", email, "link", link)
	return nil
}

// SMTPEmailSender envía correos a través de cualquier servidor SMTP estándar (Gmail, Outlook, Brevo, SendGrid, etc.).
type SMTPEmailSender struct {
	host     string
	port     string
	user     string
	password string
	from     string
}

func NuevoSMTPEmailSender(host, port, user, password, from string) *SMTPEmailSender {
	if port == "" {
		port = "587"
	}
	if from == "" {
		from = user
	}
	return &SMTPEmailSender{
		host:     host,
		port:     port,
		user:     user,
		password: password,
		from:     from,
	}
}

func (s *SMTPEmailSender) EnviarMagicLink(ctx context.Context, toEmail, link string) error {
	addr := fmt.Sprintf("%s:%s", s.host, s.port)
	subject := "Tu enlace de acceso a Mesa CLICK"

	htmlContent := fmt.Sprintf(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f6f1; margin: 0; padding: 24px; color: #0a2414; }
    .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .logo { font-size: 20px; font-weight: 700; color: #0a2414; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #1ad379; color: #0a2414; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 20px 0; font-size: 15px; }
    .footer { font-size: 12px; color: #607166; margin-top: 24px; line-height: 1.5; }
    .link-alt { word-break: break-all; color: #17b267; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🍽️ Mesa CLICK</div>
    <h2 style="font-size: 18px; margin: 0 0 12px 0;">Iniciar sesión en Mesa CLICK</h2>
    <p style="font-size: 14px; line-height: 1.5; color: #283a2e;">
      Hacé clic en el siguiente botón para acceder directamente a tu panel de control. Este enlace es de un solo uso y expira en 15 minutos:
    </p>
    <div style="text-align: center;">
      <a href="%s" class="btn">Ingresar al panel</a>
    </div>
    <p class="footer">
      O copiá y pegá este enlace en tu navegador:<br>
      <a href="%s" class="link-alt">%s</a>
    </p>
    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;">
    <p class="footer" style="margin: 0;">
      Si no solicitaste este acceso, podés ignorar este correo de forma segura.
    </p>
  </div>
</body>
</html>`, link, link, link)

	msg := []byte(fmt.Sprintf("From: %s\r\n"+
		"To: %s\r\n"+
		"Subject: %s\r\n"+
		"MIME-Version: 1.0\r\n"+
		"Content-Type: text/html; charset=UTF-8\r\n\r\n"+
		"%s", s.from, toEmail, subject, htmlContent))

	var auth smtp.Auth
	if s.user != "" && s.password != "" {
		auth = smtp.PlainAuth("", s.user, s.password, s.host)
	}

	// Manejo especial para puerto 465 (SSL directo)
	if s.port == "465" {
		tlsConfig := &tls.Config{
			ServerName: s.host,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("error conectando SSL/TLS al servidor SMTP: %w", err)
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, s.host)
		if err != nil {
			return fmt.Errorf("error creando cliente SMTP: %w", err)
		}
		defer client.Quit()

		if auth != nil {
			if err := client.Auth(auth); err != nil {
				return fmt.Errorf("error autenticando SMTP: %w", err)
			}
		}

		if err := client.Mail(s.from); err != nil {
			return err
		}
		if err := client.Rcpt(toEmail); err != nil {
			return err
		}

		w, err := client.Data()
		if err != nil {
			return err
		}
		if _, err := w.Write(msg); err != nil {
			return err
		}
		if err := w.Close(); err != nil {
			return err
		}
	} else {
		// Puerto 587 / 25 con STARTTLS automático
		if err := smtp.SendMail(addr, auth, s.from, []string{toEmail}, msg); err != nil {
			return fmt.Errorf("error enviando email por SMTP (%s:%s): %w", s.host, s.port, err)
		}
	}

	slog.InfoContext(ctx, "magic link enviado con éxito vía SMTP", "email", toEmail, "smtp_host", s.host)
	return nil
}

// ResendEmailSender envía correos a través de la API REST de Resend.
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
