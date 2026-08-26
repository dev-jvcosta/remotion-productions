# 🖼️ Geração de Imagem (texto → imagem)

Cria uma imagem nova a partir de um prompt. Para alterar uma imagem que já existe, vá para [02-edicao-imagem.md](./02-edicao-imagem.md).

Todos seguem o [padrão assíncrono](./00-nucleo.md#2-ciclo-de-vida-de-uma-tarefa): `POST` → `task_id` → `GET .../{task-id}` → `generated`.

---

## 1. Qual modelo usar

| Modelo | Endpoint | Forte em | Velocidade |
|---|---|---|---|
| **Mystic** | `POST /v1/ai/mystic` | Realismo, controle fino de estilo e estrutura, até 4K | Média |
| **Seedream 5 Pro** | `POST /v1/ai/text-to-image/seedream-v5-pro` | Composição e aderência ao prompt | Média |
| **Nano Banana Pro** | `POST /v1/ai/text-to-image/nano-banana-pro` | Cenas complexas, imagens de referência, 4K | Média |
| **Flux 2 Turbo** | `POST /v1/ai/text-to-image/flux-2-turbo` | Dimensão livre em pixels (512–2048) | Rápida |
| **HyperFlux** | `POST /v1/ai/text-to-image/hyperflux` | Rascunho e iteração | Muito rápida |
| **Z-Image Turbo** | `POST /v1/ai/text-to-image/z-image` | Prototipagem, tamanho por preset | Muito rápida |

> **Regra prática do projeto:** acerte enquadramento e composição no `hyperflux`; só então gere a versão final no `mystic` ou `seedream-v5-pro`. Vale para toda imagem que vai virar fundo de cena.

Há mais famílias no acervo (Flux Dev, Flux Pro 1.1, Flux 2 Pro/Flex/Klein, Flux Kontext, Seedream 4/4.5/5 Lite, Runway, Gemini 2.5 Flash) — todas com o mesmo protocolo. Confira nomes e campos no [catálogo](./catalogo-endpoints.md).

---

## 2. ⚠️ O enquadramento muda de nome em cada modelo

Esta é a armadilha número um desta família. Não existe um `aspect_ratio` universal:

| Modelo | Campo | Valor para 16:9 |
|---|---|---|
| Mystic, HyperFlux, Seedream 5 Pro | `aspect_ratio` | `"widescreen_16_9"` |
| Nano Banana Pro | `aspect_ratio` | `"16:9"` |
| Z-Image | `image_size` | `"landscape_16_9"` |
| Flux 2 Turbo | `image_size` | `{ "width": 1920, "height": 1080 }` |

O cliente do projeto já traduz — passe `aspecto: "16:9"` e ele resolve:

```ts
import { gerarImagem } from "./lib/magnific.ts";

const urls = await gerarImagem({
  prompt: "painel de instrumentos de caminhão ao amanhecer",
  modelo: "mystic",     // ou hyperflux, flux-2-turbo, seedream-v5-pro, nano-banana-pro, z-image
  aspecto: "16:9",      // 16:9 | 9:16 | 1:1 | 4:3 | 3:4
});
```

A tradução vive em `MODELOS_IMAGEM`, em [`scripts/lib/magnific.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/scripts/lib/magnific.ts). Ao acrescentar um modelo, acrescente ali a função de aspecto dele.

Nem todo modelo aceita todo aspecto — o cliente lança um erro nomeando os aceitos em vez de deixar a API devolver 400.

---

## 3. Mystic — `POST /v1/ai/mystic`

O mais completo. Além do prompt, aceita imagens de referência e um sistema de estilos.

| Campo | Tipo | Padrão | Observação |
|---|---|---|---|
| `prompt` | string | — | A descrição da imagem |
| `resolution` | `1k` · `2k` · `4k` | `2k` | |
| `aspect_ratio` | enum Magnific | `square_1_1` | `widescreen_16_9`, `social_story_9_16`, `classic_4_3`, `traditional_3_4`, `standard_3_2`, `portrait_2_3`, `horizontal_2_1`, `vertical_1_2`, `social_5_4`, `social_post_4_5`, `smartphone_horizontal_20_9`, `smartphone_vertical_9_20` |
| `model` | `realism` · `fluid` · `zen` · `flexible` · `super_real` · `editorial_portraits` | `realism` | `zen` = mais limpo e simples; `flexible` = mais obediente ao prompt |
| `engine` | `automatic` · `magnific_illusio` · `magnific_sharpy` · `magnific_sparkle` | `automatic` | `illusio` para ilustração e paisagem; `sharpy` e `sparkle` para foto |
| `creative_detailing` | 0–100 | `33` | Acima de ~60 o resultado ganha ar de HDR artificial |
| `fixed_generation` | boolean | `false` | Mesmos parâmetros produzem a mesma imagem — útil para ajuste fino |
| `filter_nsfw` | boolean | `true` | |
| `structure_reference` | string | — | **Base64 apenas.** Copia a forma/composição da referência |
| `structure_strength` | 0–100 | `50` | Só faz efeito com `structure_reference` |
| `style_reference` | string | — | **Base64 apenas.** Copia a estética da referência |
| `adherence` | 0–100 | `50` | Só faz efeito com `style_reference` |
| `hdr` | 0–100 | `50` | Só faz efeito com `style_reference` |
| `styling.styles[]` | `{ name, strength }` | — | `name` vem de `GET /v1/ai/loras` |
| `styling.characters[]` | `{ id, strength }` | — | `id` vem de `GET /v1/ai/loras` |
| `styling.colors[]` | `{ color, weight }` | — | `color` em hex, `weight` de 0.05 a 1 |

> ⚠️ **`structure_reference` e `style_reference` só aceitam base64** — não URL. É a única inconsistência real desta família: o resto da API prefere URL. Leia o arquivo e converta:
> ```ts
> const base64 = readFileSync("referencia.png").toString("base64");
> ```

```bash
curl -X POST "https://api.magnific.com/v1/ai/mystic" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "painel de instrumentos de caminhão ao amanhecer, luz suave, fotorrealista",
    "aspect_ratio": "widescreen_16_9",
    "resolution": "2k",
    "model": "realism",
    "creative_detailing": 33
  }'
```

```ts
await gerarImagem({
  prompt: "painel de instrumentos de caminhão ao amanhecer",
  modelo: "mystic",
  aspecto: "16:9",
  extras: { resolution: "2k", model: "realism", engine: "magnific_sharpy" },
});
```

---

## 4. HyperFlux — `POST /v1/ai/text-to-image/hyperflux`

O mais rápido e barato. É o modelo de rascunho.

| Campo | Tipo | Padrão |
|---|---|---|
| `prompt` | string | — |
| `aspect_ratio` | enum Magnific | `square_1_1` |
| `seed` | 1–4294967295 | aleatório |
| `styling.effects.color` | `softhue` · `b&w` · `goldglow` · `vibrant` · `coldneon` | — |
| `styling.effects.framing` | `portrait` · `lowangle` · `midshot` · `wideshot` · `tiltshot` · `aerial` | — |
| `styling.effects.lightning` | `iridescent` · `dramatic` · `goldenhour` · `longexposure` · `indorlight` · `flash` · `neon` | — |
| `styling.colors[]` | `{ color, weight }` | — |

Os `effects` são o jeito mais curto de fixar enquadramento e luz sem alongar o prompt:

```ts
await gerarImagem({
  prompt: "estrada de serra vista do alto",
  modelo: "hyperflux",
  aspecto: "16:9",
  extras: { styling: { effects: { framing: "aerial", lightning: "goldenhour" } } },
});
```

> O campo é mesmo `lightning` (relâmpago), e não `lighting` (iluminação). É um erro de digitação do lado da Magnific — escreva como está aqui ou o campo é ignorado.

---

## 5. Seedream 5 Pro — `POST /v1/ai/text-to-image/seedream-v5-pro`

| Campo | Tipo | Padrão |
|---|---|---|
| `prompt` | string | — |
| `resolution` | `1.5k` · `2k` | `2k` |
| `aspect_ratio` | enum Magnific + `cinematic_21_9` | `square_1_1` |
| `seed` | 0–4294967295 | aleatório |

O único desta lista com `cinematic_21_9`. Use `1.5k` quando a imagem for entrar pequena na tela.

---

## 6. Nano Banana Pro — `POST /v1/ai/text-to-image/nano-banana-pro`

Gemini 3. É o único que aceita **imagens de referência com texto associado** — bom para manter coerência entre cenas.

| Campo | Tipo | Padrão |
|---|---|---|
| `prompt` | string | — |
| `aspect_ratio` | `1:1` `2:3` `3:2` `4:3` `3:4` `5:4` `4:5` `16:9` `9:16` `21:9` | `1:1` |
| `resolution` | `1K` · `2K` · `4K` · `low` · `medium` · `high` | `2K` |
| `reference_images[]` | `{ image, text?, mime_type }` | — | Máx. 14 |

`image` aceita URL pública (use [`enviarArquivo`](./00-nucleo.md#3-upload-de-arquivos-locais) para um arquivo local) e `mime_type` é obrigatório: `image/png`, `image/jpeg` ou `image/webp`.

```ts
const base = await enviarArquivo("public/imagens/UltimosTurnos/cena-01.png");

await gerarImagem({
  prompt: "a mesma cabine, agora ao entardecer",
  modelo: "nano-banana-pro",
  aspecto: "16:9",
  extras: {
    resolution: "2K",
    reference_images: [
      { image: base, mime_type: "image/png", text: "manter a cabine e o painel" },
    ],
  },
});
```

---

## 7. Flux 2 Turbo — `POST /v1/ai/text-to-image/flux-2-turbo`

O único com dimensão livre em pixels — útil quando a composição Remotion pede um tamanho exato.

| Campo | Tipo | Padrão |
|---|---|---|
| `prompt` | string | — |
| `image_size` | `{ width, height }`, 512–2048 cada | 1024×1024 |
| `guidance_scale` | 1–20 | `2.5` | Baixo (1–3) = mais criativo; alto (7+) = mais literal |
| `seed` | 0–4294967295 | aleatório |
| `output_format` | `png` · `jpeg` | `png` |
| `enable_safety_checker` | boolean | `true` |

```ts
await gerarImagem({
  prompt: "textura de asfalto molhado, vista de cima",
  modelo: "flux-2-turbo",
  aspecto: "16:9",                       // vira { width: 1920, height: 1080 }
  extras: { guidance_scale: 4, output_format: "png" },
});
```

---

## 8. Z-Image Turbo — `POST /v1/ai/text-to-image/z-image`

| Campo | Tipo | Padrão |
|---|---|---|
| `prompt` | string | — |
| `image_size` | `square` · `square_hd` · `portrait_3_4` · `portrait_9_16` · `landscape_4_3` · `landscape_16_9` | `square_hd` |
| `num_inference_steps` | 1–50 | `8` | 8 é o recomendado para a variante turbo |
| `seed` | 0–4294967295 | aleatório |
| `output_format` | `png` · `jpeg` | `png` |
| `enable_safety_checker` | boolean | `true` |

---

## 9. Estilos e personagens (LoRAs)

`GET /v1/ai/loras` lista os estilos e personagens disponíveis. Os nomes de lá alimentam `styling.styles[].name` e `styling.characters[].id` do Mystic.

```bash
curl "https://api.magnific.com/v1/ai/loras" -H "x-magnific-api-key: $MAGNIFIC_API_KEY"
```

Há também `POST /v1/ai/loras/styles` e `POST /v1/ai/loras/characters` para treinar os seus.

---

## 10. Armadilhas desta família

1. **Enquadramento tem nome diferente por modelo** (seção 2). Prefira o cliente a montar o corpo na mão.
2. **`structure_reference` e `style_reference` do Mystic são base64**, não URL.
3. **`styling.effects.lightning`** está escrito assim mesmo, com o erro de digitação.
4. **`has_nsfw`** vem no resultado, um booleano por imagem. Com `filter_nsfw: true` a imagem barrada volta em branco — confira o array antes de assumir que a geração deu certo.
5. **Nem todo modelo aceita todo aspecto.** Veja `MODELOS_IMAGEM` no cliente.
6. **`fixed_generation` (Mystic) e `seed` (os demais)** são o que torna uma geração reproduzível. Anote o valor quando acertar o visual — sem ele, cada chamada devolve algo diferente.
