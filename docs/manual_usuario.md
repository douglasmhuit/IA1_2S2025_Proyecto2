# Manual de usuario

Explica cómo encender la Raspberry Pi, preparar la cámara, iniciar SmartSlide y recibir las notificaciones en Telegram.

## Requisitos previos
- Raspberry Pi con cámara conectada (USB o CSI).
- Bot de Telegram creado y `configs/config.json` configurado con `telegram_bot_token` y `telegram_chat_id`.
- SmartSlide compilado o la posibilidad de ejecutar `go run` en la Pi.

## Encender y preparar la Raspberry Pi
1. Conecte la cámara y alimente la Raspberry Pi.
2. Abra una terminal.
3. Verifique la cámara:

```bash
ls /dev/video*
```

Si no aparece, revise la conexión o habilite la cámara con `raspi-config`.

## Configurar el bot de Telegram
1. Cree un bot con BotFather y anote el token.
2. Abre `configs/config.json` y coloca:

```json
{
  "telegram_bot_token": "TU_TOKEN_AQUI",
  "telegram_chat_id": 123456789
}
```

`telegram_chat_id` puede ser su ID personal o el ID de un grupo donde el bot esté presente.

## Iniciar SmartSlide
1. Ir al directorio del proyecto:

```bash
cd /ruta/al/proyecto
```

2. Ejecutar (si Go está instalado en la Pi):

```bash
go run ./cmd/smartslide
```

o ejecutar el binario compilado:

```bash
./smartslide
```

3. En la terminal verá mensajes sobre detecciones, OCR y envíos a Telegram.

## Qué recibirá en Telegram
- Foto anotada de la diapositiva (si fue detectada).
- Texto con el contenido extraído por OCR o un resumen breve.

Si no recibe mensajes, revise `configs/config.json` y los logs en la terminal.

## Comandos y controles
En este repositorio los comandos disponibles se definen en `internal/telegram/bot.go`.

## Problemas comunes y soluciones
- No llegan mensajes a Telegram: verificar `telegram_bot_token` y `telegram_chat_id`.
- La cámara no aparece: comprobar conexión física y `raspi-config`.
- OCR con muchos errores: mejorar iluminación, aumentar tamaño del texto o instalar paquetes de idioma de Tesseract.
- Rendimiento lento: reducir la resolución de captura o la frecuencia de procesamiento.
