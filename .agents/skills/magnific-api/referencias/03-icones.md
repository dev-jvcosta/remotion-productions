# 🔷 Geração de Ícones (texto → ícone)

Cria ícones em PNG ou SVG a partir de um prompt.

---

## 1. ⚠️ Leia isto antes de tentar usar

**Esta família não pode ser acompanhada por polling.** E isso não é preferência: a API expõe só três rotas, todas `POST`, e **nenhuma delas é uma consulta de tarefa**.

```
POST /v1/ai/text-to-icon
POST /v1/ai/text-to-icon/preview
POST /v1/ai/text-to-icon/{task-id}/render/{format}
```

Não existe `GET /v1/ai/text-to-icon/{task-id}`. Sem rota de consulta não há como saber quando a tarefa terminou — por isso o `webhook_url` é obrigatório no corpo do POST. Ele é o **único** canal de notificação.

Consequência prática: `executarTarefa` e `aguardarTarefa` **não funcionam aqui**. `gerarIcone` só dispara e devolve o `task_id`; quem avisa que acabou é o webhook, e aí você chama `baixarIcone`.

Duas saídas práticas:

| Situação | O que fazer |
|---|---|
| Você só quer um ícone | Use o acervo de stock: `GET /v1/icons` → [05-stock.md](./05-stock.md). Milhares de ícones vetoriais, sem webhook e sem gerar |
| Você precisa mesmo gerar | Suba um receptor público (túnel, função serverless) e valide a assinatura conforme [00-nucleo.md](./00-nucleo.md#5-webhooks) |

O restante desta página documenta o endpoint para quando a segunda opção existir.

---

## 2. Endpoints

| Método e rota | Para quê |
|---|---|
| `POST /v1/ai/text-to-icon` | Gera o ícone |
| `POST /v1/ai/text-to-icon/preview` | Gera só a prévia (mais barato, para escolher o estilo) |
| `POST /v1/ai/text-to-icon/{task-id}/render/{format}` | Baixa o ícone pronto no formato pedido |

> ⚠️ **O download é `POST`, não `GET`** — e `{format}` é `png` ou `svg`.
>
> Repare que **não há nenhum `GET`** nesta lista. É a única família da API sem rota de consulta.

---

## 3. Corpo do POST

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `prompt` | string | ✅ | |
| `webhook_url` | string | ✅ | — |
| `style` | `solid` · `outline` · `color` · `flat` · `sticker` | | `solid` |
| `format` | `png` · `svg` | | `png` |
| `num_inference_steps` | 10–50 | | |
| `guidance_scale` | 0–10 | | |

O endpoint `/preview` aceita os mesmos campos **menos** `format`.

```bash
curl -X POST "https://api.magnific.com/v1/ai/text-to-icon" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "caminhão visto de lado, traço simples",
    "webhook_url": "https://seu-endereco-publico/magnific",
    "style": "outline",
    "format": "svg"
  }'
```

```ts
import { gerarIcone, baixarIcone } from "./lib/magnific.ts";

// 1. dispara — devolve na hora, sem esperar
const tarefa = await gerarIcone({
  prompt: "caminhão visto de lado, traço simples",
  webhookUrl: "https://seu-endereco-publico/magnific",
  estilo: "outline",
  formato: "svg",
});

// 2. só depois que o webhook avisar que terminou:
const pronto = await baixarIcone(tarefa.task_id, "svg");
// pronto.generated traz a URL do arquivo
```

Para escolher o estilo antes de gastar na versão final, use a prévia:

```ts
await gerarIcone({ prompt: "...", webhookUrl: "...", estilo: "flat", previa: true });
```

> ⚠️ O endpoint `/preview` **não aceita `format`** — `gerarIcone` omite o campo quando `previa: true`.

---

## 4. SVG no Remotion

Ícone vetorial é preferível a PNG numa composição: escala sem perder nitidez e a cor pode vir do CSS.

```tsx
import { Img, staticFile } from "remotion";

<Img src={staticFile("imagens/UltimosTurnos/icone-caminhao.svg")} />
```

Para animar traços ou trocar cor por cena, cole o conteúdo do SVG direto no JSX em vez de carregá-lo como imagem.

---

## 5. Armadilhas

1. **Não existe rota de consulta de tarefa.** `aguardarTarefa` e `executarTarefa` não servem aqui.
2. **`webhook_url` é obrigatório** — é o único canal de notificação.
3. **O download é `POST .../render/{format}`**, não um GET.
4. **`/preview` não aceita `format`.**
5. **Use `/preview` para escolher o estilo** antes de gerar a versão final — sai mais barato.
6. **Antes de gerar, veja o acervo.** `GET /v1/icons` resolve a maioria dos casos sem nenhuma dessas complicações.
