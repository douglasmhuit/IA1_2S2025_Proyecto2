package ocr

import (
	"fmt"
	"regexp"
	"sort"
	"strings"
)

type Summary struct {
	Title    string
	Bullets  []string
	Keywords []string
	RawText  string
}

var nonWord = regexp.MustCompile(`[^\p{L}\p{N}\s]+`)

func Summarize(text string) Summary {
	// Limpiar texto primero
	clean := cleanText(text)
	lines := strings.Split(clean, "\n")

	// Extraer título de manera inteligente
	title := extractTitle(lines)

	// Extraer bullets
	bullets := extractBullets(lines)

	// Si no encontramos bullets, usar líneas más significativas
	if len(bullets) == 0 {
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if len(line) >= 20 && len(line) <= 120 && !isNoiseLine(line) {
				bullets = append(bullets, line)
				if len(bullets) >= 3 {
					break
				}
			}
		}
	}

	keywords := topKeywords(clean, 6) // Reducir a 6 keywords

	return Summary{
		Title:    title,
		Bullets:  bullets,
		Keywords: keywords,
		RawText:  text,
	}
}

func BuildCaption(s Summary, maxChars int, changeScore float64) string {
	var b strings.Builder

	if s.Title != "" {
		b.WriteString("Título: ")
		b.WriteString(s.Title)
		b.WriteString("\n")
	}

	if len(s.Bullets) > 0 {
		b.WriteString("\nPuntos:\n")
		for _, x := range s.Bullets {
			b.WriteString("• ")
			b.WriteString(x)
			b.WriteString("\n")
		}
	}

	if len(s.Keywords) > 0 {
		b.WriteString("\nPalabras clave: ")
		b.WriteString(strings.Join(s.Keywords, ", "))
		b.WriteString("\n")
	}

	b.WriteString("\nCambio: ")
	b.WriteString(fmt.Sprintf("%.1f%%", changeScore*100))

	out := b.String()
	if len(out) > maxChars {
		out = out[:maxChars-3] + "..."
	}
	return out
}

func splitLines(s string) []string {
	parts := strings.Split(s, "\n")
	var out []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		p = strings.Join(strings.Fields(p), " ")
		out = append(out, p)
	}
	return out
}

func topKeywords(s string, n int) []string {
	words := strings.Fields(strings.ToLower(s))
	stop := map[string]bool{
		"de": true, "la": true, "el": true, "y": true, "en": true, "a": true, "que": true,
		"los": true, "las": true, "un": true, "una": true, "por": true, "para": true,
		"con": true, "del": true, "al": true, "se": true, "es": true, "su": true,
		"uno": true, "como": true, "más": true, "mas": true,
	}

	freq := map[string]int{}
	for _, w := range words {
		if len(w) < 4 || stop[w] {
			continue
		}
		freq[w]++
	}

	type kv struct {
		k string
		v int
	}

	var arr []kv
	for k, v := range freq {
		arr = append(arr, kv{k: k, v: v})
	}

	sort.Slice(arr, func(i, j int) bool { return arr[i].v > arr[j].v })

	var out []string
	for i := 0; i < len(arr) && len(out) < n; i++ {
		out = append(out, arr[i].k)
	}
	return out
}

func cleanText(text string) string {
	// Reemplazar múltiples espacios y saltos
	text = strings.ReplaceAll(text, "\r\n", "\n")
	text = strings.ReplaceAll(text, "\r", "\n")

	// Normalizar espacios
	reMultiSpace := regexp.MustCompile(`\s+`)
	text = reMultiSpace.ReplaceAllString(text, " ")

	// Eliminar líneas con solo números o símbolos
	lines := strings.Split(text, "\n")
	var cleanedLines []string

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Filtrar líneas que son solo números/puntuación
		if isNoiseLine(line) {
			continue
		}

		cleanedLines = append(cleanedLines, line)
	}

	return strings.Join(cleanedLines, "\n")
}

func isNoiseLine(line string) bool {
	// Si la línea es muy corta (menos de 3 caracteres)
	if len(line) < 3 {
		return true
	}

	// Si es solo números (como números de página)
	matched, _ := regexp.MatchString(`^\d+$`, line)
	if matched {
		return true
	}

	// Si contiene muchos símbolos especiales
	specialChars := regexp.MustCompile(`[^\p{L}\p{N}\s]`)
	specialCount := len(specialChars.FindAllString(line, -1))
	if float64(specialCount)/float64(len(line)) > 0.5 {
		return true
	}

	return false
}

func extractTitle(lines []string) string {
	if len(lines) == 0 {
		return ""
	}

	// Buscar la línea más prominente (mayor tamaño, posición superior)
	for i, line := range lines {
		if i > 5 { // Solo mirar primeras líneas
			break
		}

		line = strings.TrimSpace(line)
		if len(line) < 10 || len(line) > 100 {
			continue
		}

		// Verificar si parece un título (sin puntos al final, mayúsculas, etc.)
		if !strings.HasSuffix(line, ".") && !strings.HasSuffix(line, ",") {
			// Contar palabras en mayúscula
			words := strings.Fields(line)
			upperCount := 0
			for _, w := range words {
				if len(w) > 1 && strings.ToUpper(w) == w {
					upperCount++
				}
			}

			// Si tiene características de título
			if len(words) >= 2 && len(words) <= 10 && float64(upperCount)/float64(len(words)) < 0.7 {
				return line
			}
		}
	}

	// Si no encontramos título claro, usar primera línea no-ruido
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if len(line) >= 10 && len(line) <= 80 && !isNoiseLine(line) {
			return line
		}
	}

	return ""
}

func extractBullets(lines []string) []string {
	var bullets []string

	for _, line := range lines {
		line = strings.TrimSpace(line)

		// Filtrar líneas irrelevantes
		if len(line) < 15 || len(line) > 200 {
			continue
		}

		if isNoiseLine(line) {
			continue
		}

		// Verificar si parece un punto de lista
		// 1. Comienza con bullet (•, -, *, ◦)
		// 2. Comienza con número seguido de punto o paréntesis
		// 3. Es una oración completa

		trimmed := line
		bulletPatterns := []string{"• ", "- ", "* ", "◦ ", "▪ "}
		for _, pattern := range bulletPatterns {
			if strings.HasPrefix(line, pattern) {
				trimmed = strings.TrimPrefix(line, pattern)
				break
			}
		}

		// También detectar números: "1. ", "a) ", etc.
		numPattern := regexp.MustCompile(`^(\d+|[a-z])[\.\)]\s+`)
		if match := numPattern.FindString(line); match != "" {
			trimmed = strings.TrimPrefix(line, match)
		}

		// Asegurar que sea una oración coherente
		words := strings.Fields(trimmed)
		if len(words) < 3 || len(words) > 20 {
			continue
		}

		bullets = append(bullets, trimmed)
		if len(bullets) >= 5 {
			break
		}
	}

	return bullets
}
