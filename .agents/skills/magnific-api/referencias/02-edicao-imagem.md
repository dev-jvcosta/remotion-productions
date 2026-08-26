# ✂️ Edição de Imagem (imagem → imagem)

Altera uma imagem que já existe. Para criar do zero, vá para [01-geracao-imagem.md](./01-geracao-imagem.md).

---

## 1. Qual endpoint para qual tarefa

| Quero… | Endpoint |
|---|---|
| Trocar um trecho descrevendo a mudança (com máscara) | `POST /v1/ai/ideogram-image-edit` |
| Editar mantendo o sujeito, sem máscara | `POST /v1/ai/text-to-image/seedream-v5-pro-edit` |
| Ampliar a resolução com invenção de detalhe | `POST /v1/ai/image-upscaler` |
| Ampliar sem inventar nada | `POST /v1/ai/image-upscaler-precision-v2` |
| Estender a imagem para além da moldura | `POST /v1/ai/image-expand/flux-pro` |
| Trocar a iluminação | `POST /v1/ai/image-relight` |
| Aplicar a estética de outra imagem | `POST /v1/ai/image-style-transfer` |
| Tirar o fundo | `POST /v1/ai/beta/remove-background` |
| Mudar o ângulo de câmera | `POST /v1/ai/image-change-camera` |
| Melhorar pele em retrato | `POST /v1/ai/skin-enhancer/{creative\|faithful\|flexible}` |

---

## 2. ⚠️ Três endpoints desta família fogem do padrão

Esta é a família menos uniforme da API. Antes de escrever qualquer chamada:

| Endpoint | O que muda |
|---|---|
| `POST /v1/ai/beta/remove-background` | **Síncrono** (sem `task_id`) **e o único endpoint do spec inteiro que não aceita JSON** — o corpo vai como `application/x-www-form-urlencoded` |
| `POST /v1/ai/image-style-transfer` | Devolve os campos **no topo**, sem o envelope `data`, e chama o status de **`task_status`** |
| `POST /v1/ai/image-upscaler` e `image-expand/flux-pro` | Aceitam **só base64** no campo `image`, não URL |

O cliente do projeto já normaliza as duas primeiras — `criarTarefa` entende as três formas de resposta, e `removerFundo()` tem assinatura própria. Se for chamar na mão, trate cada uma.

---

## 3. Edição por prompt

### Ideogram Image Edit — `POST /v1/ai/ideogram-image-edit`

Edição com **máscara**: você diz onde mexer.

| Campo | Tipo | Obrig. | Observação |
|---|---|---|---|
| `image` | URL ou base64 | ✅ | JPEG, WebP ou PNG, máx. 10 MB |
| `mask` | URL ou base64 | ✅ | Mesmo tamanho da imagem. **Preto = a região a editar** |
| `prompt` | string | ✅ | Descreve a mudança |
| `rendering_speed` | `TURBO` · `DEFAULT` · `QUALITY` | | `DEFAULT` |
| `magic_prompt` | `AUTO` · `ON` · `OFF` | | Enriquece o prompt automaticamente |
| `color_palette` | `{ name }` ou `{ members }` | | Um **ou** outro, nunca os dois |
| `style_codes` | string[] | | |
| `style_type` | string | | |
| `style_reference_images` | array | | |
| `character_reference_images` | array | | Mantém um personagem entre edições |
| `seed` | 0–2147483647 | | |

Presets de paleta: `EMBER`, `FRESH`, `JUNGLE`, `MAGIC`, `MELON`, `MOSAIC`, `PASTEL`, `ULTRAMARINE`.

> ⚠️ A máscara é **preta onde você quer editar** — o contrário do que muita ferramenta faz.

### Seedream 5 Pro Edit — `POST /v1/ai/text-to-image/seedream-v5-pro-edit`

Sem máscara. Preserva sujeito, iluminação e cor a partir de referências.

| Campo | Tipo | Obrig. |
|---|---|---|
| `prompt` | string | ✅ |
| `reference_images` | string[] (1 a 10) | ✅ |
| `resolution` | `1.5k` · `2k` | |
| `aspect_ratio` | enum Magnific + `cinematic_21_9` | |
| `seed` | 0–4294967295 | |

```ts
import { enviarArquivo, executarTarefa } from "./lib/magnific.ts";

const base = await enviarArquivo("public/imagens/UltimosTurnos/cena-01.png");

const tarefa = await executarTarefa("/v1/ai/text-to-image/seedream-v5-pro-edit", {
  prompt: "mesma cabine, agora com chuva na janela",
  reference_images: [base],
  aspect_ratio: "widescreen_16_9",
});
```

Há as mesmas variantes em `seedream-v4-edit`, `seedream-v4-5-edit` e `seedream-v5-lite-edit`, além de `flux-kontext-pro` e `flux-kontext-max` — todas no [catálogo](./catalogo-endpoints.md).

---

## 4. Ampliação (upscale)

### Creative — `POST /v1/ai/image-upscaler`

O upscaler clássico da Magnific: amplia **inventando** detalhe.

| Campo | Tipo | Padrão | Observação |
|---|---|---|---|
| `image` | **base64** | — | Resultado não pode passar de 25,3 milhões de pixels |
| `scale_factor` | `2x` · `4x` · `8x` · `16x` | `2x` | |
| `optimized_for` | `standard`, `soft_portraits`, `hard_portraits`, `art_n_illustration`, `videogame_assets`, `nature_n_landscapes`, `films_n_photography`, `3d_renders`, `science_fiction_n_horror` | `standard` | |
| `prompt` | string | — | Repetir o prompt original da geração melhora muito o resultado |
| `creativity` | −10 a 10 | `0` | Quanto a IA pode inventar |
| `hdr` | −10 a 10 | `0` | Definição e detalhe |
| `resemblance` | −10 a 10 | `0` | Fidelidade ao original |
| `fractality` | −10 a 10 | `0` | Intensidade do prompt por pixel |
| `engine` | `automatic`, `magnific_illusio`, `magnific_sharpy`, `magnific_sparkle` | `automatic` | |
| `filter_nsfw` | boolean | `false` | |

> **Dica que muda o resultado:** ao ampliar uma imagem que você mesmo gerou, mande no `prompt` o mesmo texto usado na geração. O upscaler usa isso para decidir o que inventar.

### Precision — `POST /v1/ai/image-upscaler-precision-v2`

Amplia sem inventar. Use quando a imagem tem texto, gráfico ou logotipo — coisas que o Creative distorce.

---

## 5. Expansão de moldura — `POST /v1/ai/image-expand/flux-pro`

| Campo | Tipo | Obrig. |
|---|---|---|
| `image` | **base64** | ✅ |
| `prompt` | string | | O que aparece na área nova |
| `left` · `right` · `top` · `bottom` | 0–2048 px | | Quanto crescer em cada lado |

Serve para adaptar um asset 1:1 ao 16:9 da composição sem cortar o sujeito:

```ts
import { readFileSync } from "node:fs";
import { executarTarefa } from "./lib/magnific.ts";

const base64 = readFileSync("public/imagens/UltimosTurnos/quadrada.png").toString("base64");

await executarTarefa("/v1/ai/image-expand/flux-pro", {
  image: base64,
  prompt: "continuar a estrada e o céu",
  left: 448,
  right: 448,
});
```

Também há `image-expand/ideogram` e `image-expand/seedream-v4-5`, que aceitam URL.

---

## 6. Reiluminação — `POST /v1/ai/image-relight`

O endpoint com mais controle da API. Ótimo para casar um asset gerado com a paleta da composição.

| Campo | Tipo | Padrão |
|---|---|---|
| `image` | URL ou base64 | — |
| `prompt` | string | — | Descreve a luz desejada |
| `transfer_light_from_reference_image` | URL ou base64 | — | **Incompatível com o lightmap** |
| `transfer_light_from_lightmap` | URL ou base64 | — | **Incompatível com a imagem de referência** |
| `light_transfer_strength` | 0–100 | `100` |
| `change_background` | boolean | `true` | Desligue para preservar o fundo |
| `preserve_details` | boolean | `true` | Mantém textura e texto |
| `interpolate_from_original` | boolean | `false` |
| `style` | `standard`, `darker_but_realistic`, `clean`, `smooth`, `brighter`, `contrasted_n_hdr`, `just_composition` | `standard` |
| `advanced_settings` | objeto | — | `whites`, `blacks`, `brightness`, `contrast`, `saturation` (0–100 cada), `engine`, `transfer_light_a`, `transfer_light_b`, `fixed_generation` |

> ⚠️ `transfer_light_from_reference_image` e `transfer_light_from_lightmap` são **mutuamente exclusivos**. Mandar os dois é 400.

---

## 7. Transferência de estilo — `POST /v1/ai/image-style-transfer`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `image` | URL ou base64 | ✅ | |
| `reference_image` | URL ou base64 | ✅ | A imagem cujo estilo será copiado |
| `prompt` | string | | |
| `style_strength` | 0–100 | | `100` |
| `structure_strength` | 0–100 | | `50` |
| `flavor` | `faithful`, `gen_z`, `psychedelia`, `detaily`, `clear`, `donotstyle`, `donotstyle_sharp` | | `faithful` |
| `engine` | `balanced`, `definio`, `illusio`, `3d_cartoon`, `colorful_anime`, `caricature`, `real`, `super_real`, `softy` | | `balanced` |
| `is_portrait` | boolean | | `false` |
| `portrait_style` | `standard` · `pop` · `super_pop` | | Só com `is_portrait: true` |
| `portrait_beautifier` | `beautify_face` · `beautify_face_max` | | Só com `is_portrait: true` |
| `fixed_generation` | boolean | | `false` |

> ⚠️ **A resposta deste POST não tem envelope `data` e o status se chama `task_status`.** O cliente normaliza; um `fetch` na mão não.

---

## 8. Remoção de fundo — `POST /v1/ai/beta/remove-background`

Único campo: `image_url`. Duas particularidades, e as duas quebram uma chamada escrita por analogia com o resto da API.

> ⚠️ **É `application/x-www-form-urlencoded`, não JSON.** Este é o único dos 354 caminhos do spec que não aceita JSON. Mandar `Content-Type: application/json` aqui não funciona.

> ⚠️ **É síncrono.** A resposta já é o resultado — não há `task_id` para consultar.

```bash
curl -X POST "https://api.magnific.com/v1/ai/beta/remove-background" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "image_url=https://exemplo.com/foto.png"
```

```ts
import { removerFundo, baixarAsset } from "./lib/magnific.ts";

const { url } = await removerFundo(assetUrl);
await baixarAsset(url, "public/imagens/UltimosTurnos/sujeito-sem-fundo.png");
```

Resposta real do endpoint:

```json
{
  "original":        "https://api.magnific.com/v1/ai/beta/images/original/<id>/thumbnail.jpg",
  "high_resolution": "https://api.magnific.com/v1/ai/beta/images/download/<id>/high.png",
  "preview":         "https://api.magnific.com/v1/ai/beta/images/download/<id>/preview.png",
  "url":             "https://api.magnific.com/v1/ai/beta/images/download/<id>/high.png"
}
```

`url` e `high_resolution` apontam para o mesmo arquivo. Diferente do resto da API, essas URLs ficam no host `api.magnific.com` — mas **não exigem a chave** para baixar, e o PNG vem com canal alfa.

---

## 9. Outros

| Endpoint | Para quê |
|---|---|
| `POST /v1/ai/image-change-camera` | Recria a cena de outro ângulo |
| `POST /v1/ai/skin-enhancer/faithful` | Pele natural, mudança mínima |
| `POST /v1/ai/skin-enhancer/flexible` | Equilíbrio |
| `POST /v1/ai/skin-enhancer/creative` | Retoque forte |

As três variantes do skin-enhancer compartilham a consulta em `GET /v1/ai/skin-enhancer/{task-id}`.

---

## 10. Armadilhas desta família

1. **`remove-background` é síncrono E form-urlencoded** — as duas coisas ao mesmo tempo.
2. **`image-style-transfer` responde sem `data` e com `task_status`.**
3. **`image-upscaler` e `image-expand/flux-pro` só aceitam base64** no campo `image`. Os demais aceitam URL — e para arquivo local o caminho é [`enviarArquivo`](./00-nucleo.md#3-upload-de-arquivos-locais).
4. **A máscara do Ideogram é preta na área a editar**, e precisa ter exatamente o mesmo tamanho da imagem.
5. **No relight, referência e lightmap se excluem.**
6. **No upscaler, repita o prompt da geração original.** É o parâmetro que mais muda o resultado e o mais esquecido.
