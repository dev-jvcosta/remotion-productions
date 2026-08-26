# 📚 Central de Documentação e FAQ — Remotion Productions

Bem-vindo à documentação do repositório de vídeos em Remotion. Aqui você encontra guias práticos, comandos rápidos e respostas para as dúvidas mais comuns sobre edição, renderização, geração de locuções e legendas.

---

## 🧭 Guias Disponíveis

- ❓ **[FAQ — Perguntas Frequentes](./FAQ.md)**: Respostas diretas sobre onde alterar textos, como renderizar, gerar legendas, renderizar apenas uma cena específica e regras de diretórios.
- 🎬 **[Guia de Produção e Fluxo de Trabalho](./GUIA_DE_PRODUCAO.md)**: Passo a passo completo do ciclo de vida de um vídeo (Roteiro ➔ Áudio ➔ Visual ➔ Studio ➔ Render ➔ Transcrição).
- 🎨 **[Magnific API — assets de IA](../.agents/skills/magnific-api/SKILL.md)**: Gerar imagens, vídeo (B-roll), trilha, efeitos sonoros e ícones por IA, além de buscar conteúdo de stock. Inclui um catálogo com todos os endpoints e um cliente pronto em `scripts/lib/magnific.ts`.

---

## ⚡ Comandos Rápidos do Dia a Dia

```bash
# 1. Abrir o Remotion Studio no navegador (Preview interativo)
npm run dev

# 2. Gerar ou atualizar a locução com IA (ElevenLabs)
node --env-file=.env --strip-types scripts/gerar-locucao.ts --forcar

# 3. Renderizar o vídeo completo em MP4 (padrão: out/Renders/aaaa_mm_dd_render_vX.mp4)
npx remotion render UltimosTurnos out/Renders/2026_08_25_render_v8.mp4

# 4. Renderizar um Still (imagem PNG de um frame específico)
npx remotion still UltimosTurnos out/Revs/rev8/f1250.png --frame=1250

# 5. Renderizar apenas um trecho/cena específica do vídeo
npx remotion render UltimosTurnos out/Renders/2026_08_25_trecho_cena6.mp4 --frames=1707-1930

# 6. Gerar transcrição e legendas (.srt e .txt) do vídeo renderizado
node --env-file=.env --strip-types scripts/gerar-transcricao.ts

# 7. Gerar uma imagem com IA (Magnific) para usar numa cena
node --env-file=.env --strip-types scripts/gerar-imagem-ia.ts \
  --prompt "painel de instrumentos de caminhão ao amanhecer" \
  --saida public/imagens/UltimosTurnos/fundo-cena-01.png

# 8. Gerar um B-roll em vídeo com IA (Magnific)
node --env-file=.env --strip-types scripts/gerar-video-ia.ts \
  --prompt "estrada de serra vista de cima, câmera avançando devagar" \
  --duracao 6 --saida public/videos/UltimosTurnos/broll-serra.mp4
```

> Rode os scripts 7 e 8 sem argumentos para ver todas as opções e a lista de modelos.

---

## 📂 Estrutura das Pastas de Saída (`out/`)

| Diretório | Padrão de Nomenclatura | O que deve conter |
|---|---|---|
| `out/Renders/` | `aaaa_mm_dd_render_vX.mp4` | Vídeos finais renderizados em MP4 |
| `out/Revs/rev<N>/` | `f<frame>.png` | Frames estáticos (stills) gerados para revisão visual |
| `out/transcrição/` | `<nome_do_render>.srt` / `.txt` | Arquivos de legenda (`.srt`), texto de revisão (`.txt`) e áudios extraídos |
| `out/checks/` | `*.png` | Capturas rápidas de validação |

---

## 🎨 Assets Gerados por IA (`public/`)

Tudo que o Remotion consome via `staticFile()` vive em `public/`, separado por composição:

| Diretório | O que contém | Gerado por |
|---|---|---|
| `public/voiceover/<Composicao>/` | Locução (`cena-0N.mp3`) | `scripts/gerar-locucao.ts` (ElevenLabs) |
| `public/imagens/<Composicao>/` | Imagens geradas ou editadas | `scripts/gerar-imagem-ia.ts` (Magnific) |
| `public/videos/<Composicao>/` | B-roll e vídeo gerado | `scripts/gerar-video-ia.ts` (Magnific) |
| `public/audio/<Composicao>/` | Trilha e efeitos sonoros | Cliente Magnific em `scripts/lib/magnific.ts` |

> ⚠️ As URLs devolvidas pela Magnific são temporárias. **Baixe sempre para `public/`** — apontar uma composição para a URL faz o render quebrar dias depois, sem aviso.
