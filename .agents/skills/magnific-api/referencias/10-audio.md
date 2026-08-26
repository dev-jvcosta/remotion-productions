# 🔊 Geração de Áudio

Trilha, efeito sonoro, locução e isolamento de som. Para material pronto de acervo, veja [05-stock.md](./05-stock.md).

> ⚠️ **Não confunda as rotas.** `POST /v1/ai/music-generation` **gera** música; `GET /v1/music` **busca** no acervo. O mesmo par existe para efeitos sonoros: `/v1/ai/sound-effects` versus `/v1/sound-effects`.

---

## 1. O que existe

| Quero… | Endpoint | Duração |
|---|---|---|
| Trilha original | `POST /v1/ai/music-generation` | 10 a 240 s |
| Trilha instrumental (Google Lyria) | `POST /v1/ai/music-generation/google-lyria` | 30 s fixos |
| Trilha guiada por imagens (Lyria 3) | `POST /v1/ai/music-generation/lyria-3` | — |
| Efeito sonoro | `POST /v1/ai/sound-effects` | 0,5 a 22 s |
| Locução | `POST /v1/ai/voiceover/elevenlabs-turbo-v2-5` | — |
| Separar um som de uma gravação | `POST /v1/ai/audio-isolation` | — |

Todos seguem o [padrão assíncrono](./00-nucleo.md#2-ciclo-de-vida-de-uma-tarefa).

---

## 2. Trilha — `POST /v1/ai/music-generation`

| Campo | Tipo | Obrig. |
|---|---|---|
| `prompt` | string | ✅ |
| `music_length_seconds` | 10–240 | ✅ |

```ts
import { gerarMusica, baixarAsset } from "./lib/magnific.ts";

const urls = await gerarMusica({
  prompt: "corporativo otimista, piano e cordas leves, sem percussão marcada, 90 bpm",
  duracaoEmSegundos: 90,
});

await baixarAsset(urls[0], "public/audio/UltimosTurnos/trilha.mp3");
```

**Descreva gênero, clima, instrumentos e andamento.** "Música alegre" produz qualquer coisa; "corporativo otimista, piano e cordas leves, sem percussão marcada, 90 bpm" produz o que serve.

### Variantes

| Modelo | Diferença |
|---|---|
| `google-lyria` | 30 s fixos, instrumental. Aceita `negative_prompt` e `seed` |
| `lyria-3` | Aceita `model` (`clip` ou `pro`) e `reference_images[]` — imagens que guiam o clima da composição |

O `lyria-3` é o único que deixa a **imagem** guiar a música: mande quadros da própria composição para a trilha combinar com o visual.

```ts
import { enviarArquivo, executarTarefa } from "./lib/magnific.ts";

const quadro = await enviarArquivo("public/imagens/UltimosTurnos/cena-01.png");

await executarTarefa("/v1/ai/music-generation/lyria-3", {
  prompt: "clima de estrada ao amanhecer, minimalista",
  model: "pro",
  reference_images: [{ image: quadro, mime_type: "image/png" }],
});
```

> ⚠️ `reference_images[].mime_type` é obrigatório: `image/png`, `image/jpeg` ou `image/webp`.

---

## 3. Efeito sonoro — `POST /v1/ai/sound-effects`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `text` | string | ✅ | Repare: `text`, não `prompt` |
| `duration_seconds` | 0,5–22 | ✅ | |
| `loop` | boolean | | `false` — costura início e fim para repetir sem emenda |
| `prompt_influence` | 0–1 | | `0.3` — quanto o texto manda no resultado |

```ts
import { gerarEfeitoSonoro } from "./lib/magnific.ts";

const [whoosh] = await gerarEfeitoSonoro({
  texto: "whoosh curto e seco de transição, sem cauda",
  duracaoEmSegundos: 0.8,
});
```

**`loop: true` é o que torna um som utilizável como ambiente contínuo** numa cena longa — sem ele, a emenda estala a cada repetição.

---

## 4. Locução — `POST /v1/ai/voiceover/elevenlabs-turbo-v2-5`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `text` | string | ✅ | |
| `voice_id` | string | ✅ | ID da voz na biblioteca ElevenLabs |
| `stability` | 0–1 | | `0.5` — 0 é expressiva, 1 é monótona |
| `similarity_boost` | 0–1 | | `0.2` |
| `speed` | 0,7–1,2 | | `1` |
| `use_speaker_boost` | boolean | | `true` |

### ⚠️ Este projeto NÃO usa este endpoint

A locução do projeto sai de [`scripts/gerar-locucao.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/scripts/gerar-locucao.ts), que fala com a ElevenLabs direto.

| | ElevenLabs direto (o padrão daqui) | Magnific voiceover |
|---|---|---|
| Modelo | Configurável (`eleven_multilingual_v2`, `eleven_v3`) | Fixo em `turbo_v2_5` |
| Controles | `style`, `use_speaker_boost`, modelo | Sem `style` |
| Faixa de `speed` | Livre | 0,7 a 1,2 |
| Créditos | Conta ElevenLabs | Conta Magnific |
| Retorno | MP3 no corpo, síncrono | URL, assíncrono |

**Regra:** para a locução das cenas, use `gerar-locucao.ts`. Só recorra ao endpoint da Magnific se quiser tudo num crédito só — e saiba que perde o controle de modelo e de `style`.

> Há também `GET /v1/cloned-voices`, para listar vozes clonadas. **Enterprise apenas.**

---

## 5. Isolamento de áudio — `POST /v1/ai/audio-isolation`

Extrai um som específico de uma gravação, descrito em texto. Roda sobre áudio **ou** vídeo.

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `description` | string | ✅ | O som a extrair. Seja específico |
| `audio` | URL ou base64 | | WAV, MP3, FLAC, OGG, M4A. **Exclusivo com `video`** |
| `video` | URL ou base64 | | MP4, MOV, WEBM, AVI. **Exclusivo com `audio`** |
| `x1` `y1` `x2` `y2` | inteiros | | Caixa em pixels que localiza a fonte do som. **Só para vídeo** |
| `sample_fps` | 1–5 | | `2` — mais preciso no tempo, mais lento |
| `reranking_candidates` | 1–8 | | `1` — mais qualidade, mais lento |
| `predict_spans` | boolean | | `false` — ligue para fala e notas musicais |

Usos: tirar a fala de uma gravação com ruído, isolar um instrumento, separar um som ambiente do resto.

> ⚠️ `audio` e `video` são **mutuamente exclusivos**. A caixa delimitadora só faz sentido com vídeo — é assim que se diz "quero o som *daquela* pessoa".

---

## 6. Áudio no Remotion

Baixe para `public/audio/<Composicao>/` e use `<Audio>`:

```tsx
import { Audio, staticFile } from "remotion";

<Audio src={staticFile("audio/UltimosTurnos/trilha.mp3")} volume={0.25} />
```

**Meça a duração antes de montar a linha do tempo.** A composição `UltimosTurnos` calcula o total em `calculateMetadata` a partir dos MP3 de locução — trilha e efeitos entram por cima e não devem esticar o vídeo.

Para trilha, gere com folga sobre a duração da composição e corte no `<Sequence>`: música que acaba antes do vídeo é bem mais visível que música cortada no fim.

---

## 7. Armadilhas

1. **`/v1/ai/sound-effects` gera; `/v1/sound-effects` busca no acervo.** Idem música.
2. **Em efeitos sonoros o campo é `text`**, não `prompt`. Nos de música é `prompt`.
3. **Limites de duração são rígidos:** música 10–240 s, efeitos 0,5–22 s, Google Lyria sempre 30 s.
4. **`loop: true`** é obrigatório para som ambiente que vai repetir.
5. **No isolamento, `audio` e `video` se excluem.**
6. **Para locução, prefira `gerar-locucao.ts`** — mais controle e o fluxo do projeto já está montado nele.
7. **Descreva a música com gênero, clima, instrumentos e bpm.** É o que separa um resultado usável de um genérico.
