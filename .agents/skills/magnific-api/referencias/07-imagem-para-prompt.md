# 🔤 Imagem para Prompt

Analisa uma imagem e devolve um prompt que a descreve. Serve para reproduzir o visual de uma referência em outras cenas.

---

## 1. Endpoint

`POST /v1/ai/image-to-prompt` → `GET /v1/ai/image-to-prompt/{task-id}`

| Campo | Tipo | Obrig. |
|---|---|---|
| `image` | URL **ou** base64 | ✅ |
| `webhook_url` | string | |

> ⚠️ **`generated` aqui traz TEXTO, não URL.** O campo tem o mesmo nome do resto da API, mas o conteúdo é o prompt gerado. Vale o mesmo para [08-melhoria-prompt.md](./08-melhoria-prompt.md).

```bash
curl -X POST "https://api.magnific.com/v1/ai/image-to-prompt" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "image": "https://exemplo.com/referencia.jpg" }'
```

```ts
import { imagemParaPrompt } from "./lib/magnific.ts";

const [prompt] = await imagemParaPrompt(assetUrl);
console.log(prompt);
```

---

## 2. Limite

**1.000 requisições por dia**, um dos poucos endpoints com teto diário. Compartilha essa lista com `improve-prompt` e a busca por IA.

---

## 3. O fluxo que este endpoint destrava

Manter coerência visual entre cenas de um mesmo vídeo:

```ts
import { enviarArquivo, imagemParaPrompt, gerarImagem, baixarAsset } from "./lib/magnific.ts";

// 1. descrever a cena que já ficou boa
const referencia = await enviarArquivo("public/imagens/UltimosTurnos/cena-01.png");
const [descricao] = await imagemParaPrompt(referencia);

// 2. reaproveitar a descrição, mudando só o que precisa mudar
const urls = await gerarImagem({
  prompt: `${descricao}\n\nMesma cena, agora ao entardecer.`,
  modelo: "mystic",
  aspecto: "16:9",
});

await baixarAsset(urls[0], "public/imagens/UltimosTurnos/cena-02.png");
```

Para coerência mais forte que a textual, prefira `reference_images` no [Nano Banana Pro](./01-geracao-imagem.md#6-nano-banana-pro--post-v1aitext-to-imagenano-banana-pro) ou no [Seedream Edit](./02-edicao-imagem.md#seedream-5-pro-edit--post-v1aitext-to-imageseedream-v5-pro-edit) — elas olham a imagem, não uma descrição dela.

---

## 4. Armadilhas

1. **`generated` é texto.** Não tente baixar como se fosse URL.
2. **Teto de 1.000/dia**, somado ao `improve-prompt`.
3. **É assíncrono** apesar de rápido — respeite o `task_id`.
