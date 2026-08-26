# 🔍 Classificador de Imagem IA

Estima a probabilidade de uma imagem ter sido gerada por inteligência artificial.

---

## 1. ⚠️ É síncrono

Junto com [`remove-background`](./02-edicao-imagem.md#8-remoção-de-fundo), é um dos dois endpoints do escopo que **respondem na hora**: sem `task_id`, sem polling.

---

## 2. Endpoint

`POST /v1/ai/classifier/image`

| Campo | Tipo | Obrig. |
|---|---|---|
| `image` | URL **ou** base64 | ✅ |

```bash
curl -X POST "https://api.magnific.com/v1/ai/classifier/image" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "image": "https://exemplo.com/foto.jpg" }'
```

### Resposta

```json
{
  "data": [
    { "class_name": "not_ai", "probability": 0.0503 },
    { "class_name": "ai",     "probability": 0.9497 }
  ]
}
```

Duas classes, `not_ai` e `ai`, com probabilidades que somam 1. Este exemplo é uma resposta real do endpoint sobre uma imagem gerada no HyperFlux — ele acertou com 94,97% de confiança.

```ts
import { classificarImagem } from "./lib/magnific.ts";

const classes = await classificarImagem(urlOuBase64);
const ehIA = classes.find((c) => c.class_name === "ai")?.probability ?? 0;

if (ehIA > 0.8) {
  console.log("Provavelmente gerada por IA");
}
```

---

## 3. Quando isso é útil aqui

- **Triar material de terceiros** antes de usar num vídeo, quando a origem importa.
- **Conferir se um asset veio do acervo de stock ou de uma geração**, num diretório em que os dois se misturaram.

Não use como prova: é uma estimativa. Uma foto real muito editada pode pontuar alto em `ai`, e uma geração muito boa pode pontuar baixo.

---

## 4. Armadilhas

1. **Não procure `task_id`** — a resposta já é o resultado.
2. **`data` é um array**, não um objeto: leia pelo `class_name`, não pela posição.
3. **Arquivo local não vale.** Passe uma URL (use [`enviarArquivo`](./00-nucleo.md#3-upload-de-arquivos-locais)) ou converta para base64.
