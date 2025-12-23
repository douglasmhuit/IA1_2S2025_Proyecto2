# Manual técnico
## Resumen
SmartSlide captura imágenes de diapositivas desde una cámara conectada a una Raspberry Pi, extrae texto con OCR, agrega anotaciones y envía imágenes y resúmenes a Telegram. Este documento explica la arquitectura, dependencias, configuración y el flujo completo del sistema.

## Arquitectura general
Componentes principales:

- Captura: `internal/capture` — lectura de la cámara y detección de diapositivas.
- OCR y resumen: `internal/ocr` — procesamiento de imágenes, integración con Tesseract y generación de resúmenes.
- Anotaciones: `internal/annotate` — dibujo de cajas y texto sobre las imágenes.
- Envío a Telegram: `internal/telegram` — envío de fotos y mensajes usando `tgbotapi`.
- Administración y métricas: `internal/admin` y `internal/metrics`.
- Entrada principal: `cmd/smartslide/main.go`.

## Dependencias y bibliotecas usadas

- `gocv` (gocv.io/x/gocv): captura y procesamiento de imágenes.
- `gosseract` (github.com/otiai10/gosseract/v2): cliente para Tesseract OCR.
- `tgbotapi` (github.com/go-telegram-bot-api/telegram-bot-api/v5): cliente de Telegram.
- Módulos internos: `internal/config`, `internal/metrics`, entre otros.

Archivos clave donde se integran estas dependencias: `internal/ocr/ocr.go`, `internal/telegram/bot.go`, `internal/capture/detect.go`, `internal/annotate/annotate.go`.

## Configuración recomendada de la Raspberry Pi

- Sistema: Raspberry Pi OS actualizado.
- Instalar Go (versión compatible con `go.mod` del proyecto).
- Instalar OpenCV (requisito para `gocv`). Seguir la guía oficial de `gocv`.
- Instalar Tesseract OCR:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y tesseract-ocr libtesseract-dev
```

- Verificar la cámara:

```bash
ls /dev/video*
```

Para cámaras CSI, usar `raspi-config` para habilitarlas.

## Instalación y preparación del proyecto

1. Clonar el repositorio o copiar el código a la Pi.
2. Descargar dependencias:

```bash
go mod download
```

3. Compilar en la Pi:

```bash
go build -o smartslide ./cmd/smartslide
```

Si compila fuera de la Pi, usar:

```bash
GOOS=linux GOARCH=arm go build -o smartslide ./cmd/smartslide
```

## Configuración del bot de Telegram

1. Crear un bot con BotFather y obtener el token.
2. En `configs/config.json` establecer `telegram_bot_token` y `telegram_chat_id`.

Ejemplo mínimo:

```json
{
	"telegram_bot_token": "TU_TOKEN_AQUI",
	"telegram_chat_id": 123456789
}
```

## Flujo completo

1. Captura: `internal/capture` lee frames de la cámara con `gocv`.
2. Detección: `internal/capture/detect.go` identifica la región de la diapositiva y la recorta.
3. Preprocesamiento: ajuste de la imagen (contraste, escala) para mejorar OCR.
4. OCR: `internal/ocr/ocr.go` convierte el frame a JPEG en memoria y usa `gosseract` para extraer texto.
5. Agrupado y resumen: textos de varias capturas se limpian y se condensan en un resumen breve.
6. Anotaciones: `internal/annotate` dibuja bounding boxes y superpone texto en la imagen.
7. Envío: `internal/telegram/bot.go` envía la imagen anotada y el texto al chat configurado.
8. Administración: `internal/admin` expone endpoints para estado y control; `internal/metrics` recoge estadísticas.

## Lógica de anotaciones y resúmenes

- Anotaciones: se detectan regiones relevantes y se dibujan cajas y etiquetas con el texto OCR y timestamp.
- Resúmenes automáticos: se agrupan textos en una ventana temporal (por ejemplo, últimas N capturas o último minuto), se eliminan duplicados y se genera un texto breve.

Parámetros ajustables: frecuencia de captura, tamaño de la ventana para resumen, umbrales de detección en `detect.go`.

## Despliegue y operación

- Ejecutar el binario en la Pi:

```bash
./smartslide
```

- Compilar desde otra máquina:

```bash
GOOS=linux GOARCH=arm go build -o smartslide ./cmd/smartslide
```

- Revisar logs en la terminal y los endpoints de `internal/admin` para el estado.

## Archivos clave

- `cmd/smartslide/main.go`
- `configs/config.json`
- `internal/capture/detect.go`
- `internal/ocr/ocr.go`
- `internal/ocr/summarize.go`
- `internal/annotate/annotate.go`
- `internal/telegram/bot.go`
- `internal/admin/server.go`

## Mantenimiento y recomendaciones

- Ajustar parámetros de detección si hay falsos positivos.
- Mejorar la iluminación y el contraste para OCR más preciso.
- Instalar paquetes de idioma de Tesseract según el idioma de las diapositivas.
- Añadir reintentos y manejo de errores en el envío a Telegram para mayor robustez.
