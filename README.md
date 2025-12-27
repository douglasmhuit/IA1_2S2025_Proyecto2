# SmartSlide

> Universidad de San Carlos de Guatemala
> Facultad de Ingeniería
> Inteligencia Artifical
> Vacaciones Diciembre 2025

### Grupo 7


| Nombre                      | Carné    |
| --------------------------- | --------- |
| Jhonatan Josué Tzunún Yax | 201900831 |
| Aldo Saúl Vásquez Moreira | 202109754 |
| Luis Enrique Patal Ajzac | 201408562 |
| ---                         | ---       |
| ---                         | ---       |

## Descripción

SmartSlide es un sistema de captura inteligente basado en que detecta automáticamente cambios en diapositivas durante presentaciones, las procesa usando OCR y visión por computadora, genera resúmenes automáticos y las distribuye instantáneamente a través de un bot de Telegram.

## Características


| Característica            | Descripción                                             |
| -------------------------- | -------------------------------------------------------- |
| **Captura Automática**    | Monitoreo continuo a 5 FPS con detección de cambios     |
| **Detección Inteligente** | Algoritmo AbsDiff + Gaussian Blur + Threshold adaptativo |
| **OCR Multilenguaje**      | Tesseract con soporte español e inglés simultáneo     |
| **Resúmenes AI**          | Extracción de título, bullets y top 8 keywords         |
| **Anotaciones RA**         | Overlay de keywords y contornos en zonas de texto        |
| **Cooldown Inteligente**   | 2 segundos entre capturas para evitar duplicados         |

## Tecnologías


| Componente                | Tecnología           | Versión |
| ------------------------- | --------------------- | -------- |
| **Lenguaje**              | Go                    | 1.22     |
| **Visión Computacional** | OpenCV (gocv)         | v0.37.0  |
| **OCR**                   | Tesseract (gosseract) | v2.4.1   |
| **Bot**                   | Telegram Bot API      | v5.5.1   |
| **Hardware**              | Raspberry Pi 4        | 4GB RAM  |
| **OS**                    | Raspberry Pi OS       | 64-bit   |

---

## Documentación

- **[Manual Técnico](docs/manual_tecnico.md)**: Arquitectura, instalación detallada
- **[Manual de Usuario](docs/manual_usuario.md)**: Guía de uso, solución de problemas
