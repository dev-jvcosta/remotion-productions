# 🎞️ Geração de Vídeo

A maior família da API: **mais de 110 endpoints de criação**, quase todos variações do mesmo protocolo. Esta página cobre a escolha do modelo e os seis recomendados em detalhe; a lista completa está no [catálogo](./catalogo-endpoints.md).

> ⚠️ **Vídeo é o item mais caro da API e leva minutos.** Antes de gerar: melhore o prompt com [`improve-prompt`](./08-melhoria-prompt.md) (`type: "video"`), e considere se um clipe do [acervo de stock](./05-stock.md) não resolve — lá o vídeo já vem com `aspect_ratio` e `duration` declarados.

---

## 1. Os quatro modos

| Modo | Prefixo da rota | Entrada |
|---|---|---|
| Texto → vídeo | `/v1/ai/text-to-video/…` | Só prompt |
| Imagem → vídeo | `/v1/ai/image-to-video/…` | Imagem (primeiro quadro) + prompt opcional |
| Referência → vídeo | `/v1/ai/reference-to-video/…` | Imagens de referência para manter personagem/estilo |
| Edição e pós | `/v1/ai/video/…`, `/video-edit/…`, `/video-upscaler…` | Vídeo existente |

**Animar uma imagem que você já gerou costuma dar mais controle do que gerar do zero:** você aprova o quadro (barato) e só depois paga a animação.

---

## 2. Qual modelo usar

Os seis que o cliente do projeto conhece, em `MODELOS_VIDEO`:

| Modelo | Duração | Áudio | Aspectos | Bom para |
|---|---|---|---|---|
| `kling-v3-turbo-720p` | 3–15 s | não | 16:9, 9:16, 1:1 | **Padrão.** Melhor custo-benefício |
| `kling-v3-turbo-1080p` | 3–15 s | não | 16:9, 9:16, 1:1 | O mesmo em resolução cheia |
| `veo-3-1-fast` | 4, 6, 8 s | **sim** | 16:9, 9:16 | Quando o clipe precisa de som próprio |
| `veo-3-1` | 4, 6, 8 s | **sim** | 16:9, 9:16 | Versão cheia do Veo |
| `wan-2-7` | 2–15 s | sim | 16:9, 9:16, 1:1, 4:3, 3:4 | Quadro inicial **e final**, continuação de vídeo |
| `ltx-2-fast` | 6–20 s (passo 2) | opcional | por resolução | Clipes longos, até 2160p |
| `pixverse-v6` | 1–15 s | opcional | todos | Estilos: anime, 3D, clay, cyberpunk, comic |

Outras famílias no acervo, todas no mesmo protocolo: **Kling** (v2, v2.1, v2.5, v2.6, O1, 4K, Motion Control, Omni, Elements), **Seedance** (1.5/2/2.5 Pro, Fast, Mini, até 4K), **MiniMax Hailuo** (02 e 2.3, 768p/1080p), **Wan** (2.2, 2.5, 2.6), **Runway** (Gen4 Turbo, Gen 4.5, Act Two), **PixVerse** (v5, v5.5, v6 e transições), **LTX-2** (Pro e Fast), **Happy Horse** (1 e 1.1), **OmniHuman 1.5**, **VFX**.

---

## 3. ⚠️ As armadilhas desta família

### 3.1 Em imagem → vídeo, `aspect_ratio` só existe em alguns modelos

O enquadramento normalmente sai da própria imagem, e a maioria dos endpoints de imagem→vídeo **nem define** o campo. Mas não é regra geral — verificado no spec:

| Modelo | O imagem→vídeo aceita `aspect_ratio`? |
|---|---|
| Kling v3 Turbo | **não** |
| Wan 2.7 | **não** |
| LTX-2 Fast | **não** |
| Veo 3.1 e 3.1 Fast | **sim** |
| PixVerse V6 | **sim** |

O cliente sabe disso por modelo (campo `aspectoNaImagem`) e só manda onde é aceito. Chamando na mão, confira antes.

### 3.2 O campo da imagem muda de nome — e não há padrão

| Modelo | Campo do primeiro quadro |
|---|---|
| Kling, Veo | `image` |
| **LTX-2, PixVerse V6** | **`image_url`** |
| **Wan 2.7** | **`start_image_url`** (e `end_image_url` para o último quadro) |

Três nomes diferentes para a mesma coisa, dentro da mesma API. `MODELOS_VIDEO` guarda o nome certo de cada um, e [`scripts/conferir-magnific.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/scripts/conferir-magnific.ts) valida isso contra o spec.

### 3.3 O tipo da duração muda

**Kling espera `duration` como string** (`"5"`); todos os outros esperam número (`5`). O cliente converte.

### 3.4 As durações são discretas, não contínuas

Veo aceita só 4, 6 ou 8. LTX-2 Fast, só pares de 6 a 20. Pedir 7 s no Veo é 400 — o cliente escolhe o valor permitido mais próximo.

### 3.5 A notação do aspecto muda

`16:9` no Kling, Veo e Wan; `widescreen_16_9` no PixVerse. O cliente traduz a partir de `aspecto: "16:9"`.

### 3.6 Nem todo modelo aceita todo aspecto

Veo só faz 16:9 e 9:16. O cliente lança um erro nomeando os aceitos em vez de deixar a API recusar.

---

## 4. O cliente do projeto

```ts
import { gerarVideo, enviarArquivo, baixarAsset } from "./lib/magnific.ts";

// texto → vídeo
const urls = await gerarVideo({
  prompt: "estrada de serra vista de cima, câmera avançando devagar ao amanhecer",
  modelo: "kling-v3-turbo-720p",
  aspecto: "16:9",
  duracaoEmSegundos: 6,
});

// imagem → vídeo (o aspect_ratio é omitido automaticamente)
const quadro = await enviarArquivo("public/imagens/UltimosTurnos/cena-01.png");

const animado = await gerarVideo({
  prompt: "leve movimento de câmera para a direita, poeira no ar",
  modelo: "kling-v3-turbo-720p",
  imagemUrl: quadro,
  duracaoEmSegundos: 5,
});

await baixarAsset(animado[0], "public/videos/UltimosTurnos/cena-01-animada.mp4");
```

Pela linha de comando: [`scripts/gerar-video-ia.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/scripts/gerar-video-ia.ts) — ele faz o upload da imagem local sozinho.

---

## 5. Os modelos em detalhe

### Kling v3 Turbo — `text-to-video/kling-v3-turbo-720p` · `-1080p`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `prompt` | string (máx. 3072 chars; ≤2500 recomendado) | ✅ | — |
| `aspect_ratio` | `16:9` · `9:16` · `1:1` | | `16:9` |
| `duration` | **string** `"3"` a `"15"` | | `"5"` |

Na variante imagem → vídeo: só `image` é obrigatório (base64 ou URL), `prompt` é opcional — sem ele o movimento é inferido da imagem — e não existe `aspect_ratio`.

Consulta em `GET /v1/ai/image-to-video/kling-v3-turbo/{task-id}` — repare que a rota de consulta **não tem o sufixo de resolução**.

### Veo 3.1 — `text-to-video/veo-3-1` · `veo-3-1-fast` · `veo-3-1-lite`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `prompt` | string | ✅ | — |
| `negative_prompt` | string | | — |
| `duration` | inteiro `4` · `6` · `8` | | `8` |
| `resolution` | `720p` · `1080p` · `4k` | | `720p` |
| `aspect_ratio` | `16:9` · `9:16` | | `16:9` |
| `generate_audio` | boolean | | **`true`** |
| `seed` | inteiro | | — |

Na variante imagem → vídeo, `image` e `prompt` são **ambos obrigatórios**; `image_end` permite interpolar até um último quadro; e, ao contrário da maioria, o `aspect_ratio` **é aceito**.

> ⚠️ **`generate_audio` vem `true` por padrão.** Se o clipe é B-roll sob locução, mande `false`: você paga por um áudio que vai descartar, e ele briga com a narração.

### Wan 2.7 — `text-to-video/wan-2-7`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `prompt` | string | ✅ | — |
| `negative_prompt` | string | | — |
| `aspect_ratio` | `16:9` `9:16` `1:1` `4:3` `3:4` | | `16:9` |
| `resolution` | **`720P` · `1080P`** (maiúsculas) | | `1080P` |
| `duration` | inteiro 2–15 | | `5` |
| `audio_url` | URL (WAV/MP3, 2–30 s, ≤15 MB) | | — |
| `seed` | 0–2147483647 | | — |
| `additional_settings.prompt_extend` | boolean | | `true` |

Na variante imagem → vídeo é o mais flexível de todos:

| Campo | Para quê |
|---|---|
| `start_image_url` | Primeiro quadro |
| `end_image_url` | Último quadro — anima de A até B |
| `video_url` | Continua ou estende um vídeo existente (2–10 s) |
| `audio_url` | Guia a geração pelo áudio |

> ⚠️ Aqui `resolution` é **`720P`/`1080P` em maiúsculas**. Os outros modelos usam minúsculas. É 400 se trocar.

**`start_image_url` + `end_image_url` é a ferramenta certa para transição entre duas cenas** cujos quadros você já aprovou.

### LTX-2 Fast — `text-to-video/ltx-2-fast`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `prompt` | string | ✅ | — |
| `resolution` | `1080p` · `1440p` · `2160p` | | `1080p` |
| `duration` | inteiro `6,8,10,…,20` | | `6` |
| `fps` | `25` · `50` | | `25` |
| `generate_audio` | boolean | | `false` |
| `seed` | inteiro | | — |

Na variante imagem → vídeo o campo do quadro é **`image_url`** (não `image`), e ali `prompt` e `image_url` são ambos obrigatórios.

> ⚠️ Duas restrições cruzadas: acima de 10 s **só 25 fps**; e 50 fps **só até 10 s**. Não há `aspect_ratio` — o enquadramento sai da resolução.

O único que passa de 15 s. Para B-roll longo, é este.

### PixVerse V6 — `text-to-video/pixverse-v6`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `prompt` | string | ✅ | — |
| `aspect_ratio` | enum Magnific (`widescreen_16_9`, `cinematic_21_9`, …) | | `widescreen_16_9` |
| `resolution` | `360p` · `540p` · `720p` · `1080p` | | — |
| `duration` | inteiro 1–15 | | `5` |
| `style` | `anime` · `3d_animation` · `clay` · `cyberpunk` · `comic` | | — |
| `negative_prompt` | string | | `""` |
| `generate_audio_switch` | boolean | | `false` |
| `generate_multi_clip_switch` | boolean | | `false` |
| `thinking_type` | `enabled` · `disabled` · `auto` | | `enabled` |
| `seed` | inteiro | | — |

O único com `style` pronto e o único com `cinematic_21_9`. `generate_multi_clip_switch` produz cortes de câmera dentro de uma geração só.

Na variante imagem → vídeo o campo do quadro é **`image_url`**, e aparecem dois campos que o texto→vídeo não tem: `last_frame_image` (último quadro) e `camera_movement`. Este é um dos dois modelos cujo imagem→vídeo **aceita** `aspect_ratio`.

Há ainda `pixverse-v6-transition`, que recebe dois quadros (`first_image_url` e `end_image_url`) e gera a passagem entre eles.

---

## 6. Pós-produção

| Endpoint | Para quê |
|---|---|
| `POST /v1/ai/video-upscaler` | Amplia o vídeo |
| `POST /v1/ai/video-upscaler/turbo` | Mais rápido, menos refinado |
| `POST /v1/ai/video-upscaler-precision` | Amplia sem inventar detalhe |
| `POST /v1/ai/video-upscaler-topaz` | Motor Topaz |
| `POST /v1/ai/video/vfx` | Efeitos visuais por IA |
| `POST /v1/ai/video-edit/wan-2-7` | Edição por prompt sobre um vídeo |
| `POST /v1/ai/video/runway-act-two` | Atuação com personagem consistente |
| `POST /v1/ai/video/omni-human-1-5` | Anima humano a partir de áudio |
| `POST /v1/ai/video/kling-v3-motion-control-pro` | Controle preciso de câmera e movimento |

**Gere em 720p e amplie depois** costuma sair mais barato e mais rápido do que gerar em 1080p direto — e você só amplia o clipe que foi aprovado.

---

## 7. Vídeo no Remotion

```tsx
import { OffthreadVideo, staticFile } from "remotion";

<OffthreadVideo src={staticFile("videos/UltimosTurnos/broll-serra.mp4")} />
```

`<OffthreadVideo>` é o correto para render; `<Video>` serve para preview interativo.

**Casar o fps.** A composição roda a 30 fps. Um clipe a 25 fps (padrão do LTX-2) é reamostrado no render e pode tremer em movimento de câmera. Prefira 24, 30 ou 60 quando o modelo deixar escolher, e confira com:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate,width,height,duration \
  -of default=noprint_wrappers=1 public/videos/UltimosTurnos/broll-serra.mp4
```

**Peça sempre um pouco mais de duração do que a cena precisa.** Cortar sobra no `<Sequence>` é trivial; gerar de novo porque faltou meio segundo custa outra rodada inteira.

---

## 8. Resumo das armadilhas

1. **Em imagem → vídeo, `aspect_ratio` só existe em Veo e PixVerse.**
2. **O campo da imagem tem três nomes:** `image`, `image_url` ou `start_image_url`.
3. **Kling quer `duration` como string.**
4. **Durações são discretas** — Veo aceita só 4, 6 ou 8.
5. **Wan usa `720P`/`1080P` em maiúsculas.**
6. **LTX-2: acima de 10 s só 25 fps.**
7. **`generate_audio` do Veo vem `true`** — desligue para B-roll.
8. **A rota de consulta do Kling não tem o sufixo de resolução.**
9. **Deixe o timeout folgado.** O padrão do cliente é 900 s. Estourar não cancela nem estorna.
10. **Confira o fps do arquivo baixado** antes de montar a cena.
