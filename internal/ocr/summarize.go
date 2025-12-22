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
	raw := strings.TrimSpace(text)
	clean := nonWord.ReplaceAllString(raw, " ")
	lines := splitLines(clean)

	title := ""
	if len(lines) > 0 {
		title = strings.TrimSpace(lines[0])
		if len(title) > 80 {
			title = title[:80]
		}
	}

	var bullets []string
	for _, ln := range lines {
		ln = strings.TrimSpace(ln)
		if len(ln) >= 20 && len(ln) <= 140 {
			bullets = append(bullets, ln)
		}
		if len(bullets) >= 5 {
			break
		}
	}

	keywords := topKeywords(clean, 8)

	return Summary{
		Title:    title,
		Bullets:  bullets,
		Keywords: keywords,
		RawText:  raw,
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
