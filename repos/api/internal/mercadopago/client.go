package mercadopago

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"
)

type Client interface {
	CrearPreferencia(ctx context.Context, req PreferenciaRequest) (*PreferenciaResponse, error)
	ObtenerPago(ctx context.Context, paymentID string) (*PagoMercadoPago, error)
}

type httpClient struct {
	accessToken string
	baseURL     string
	client      *http.Client
}

func NuevoCliente(accessToken string) Client {
	return &httpClient{
		accessToken: accessToken,
		baseURL:     "https://api.mercadopago.com",
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *httpClient) CrearPreferencia(ctx context.Context, req PreferenciaRequest) (*PreferenciaResponse, error) {
	if c.accessToken == "" {
		return nil, ErrTokenNoConfigurado
	}

	cuerpo, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("error serializando preferencia: %w", err)
	}

	url := c.baseURL + "/checkout/preferences"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(cuerpo))
	if err != nil {
		return nil, fmt.Errorf("error creando request HTTP: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.accessToken)
	httpReq.Header.Set("Content-Type", "application/json")

	slog.InfoContext(ctx, "creando preferencia en Mercado Pago", "external_reference", req.ExternalReference, "items", len(req.Items))

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("error llamando a Mercado Pago API: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta de Mercado Pago: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		slog.ErrorContext(ctx, "error en respuesta de Mercado Pago al crear preferencia",
			"status", resp.StatusCode, "body", string(respBytes))
		return nil, fmt.Errorf("mercado pago respondió %d: %s", resp.StatusCode, string(respBytes))
	}

	var prefResp PreferenciaResponse
	if err := json.Unmarshal(respBytes, &prefResp); err != nil {
		return nil, fmt.Errorf("error parseando respuesta de preferencia: %w", err)
	}

	return &prefResp, nil
}

func (c *httpClient) ObtenerPago(ctx context.Context, paymentID string) (*PagoMercadoPago, error) {
	if c.accessToken == "" {
		return nil, ErrTokenNoConfigurado
	}

	url := fmt.Sprintf("%s/v1/payments/%s", c.baseURL, paymentID)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creando request HTTP de pago: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.accessToken)

	resp, err := c.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("error consultando pago en Mercado Pago: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta de pago: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		slog.ErrorContext(ctx, "error en respuesta de Mercado Pago al consultar pago",
			"status", resp.StatusCode, "body", string(respBytes))
		return nil, fmt.Errorf("mercado pago respondió %d: %s", resp.StatusCode, string(respBytes))
	}

	var pago PagoMercadoPago
	if err := json.Unmarshal(respBytes, &pago); err != nil {
		return nil, fmt.Errorf("error deserializando respuesta de pago: %w", err)
	}

	return &pago, nil
}
