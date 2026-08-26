# 🔑 Núcleo — autenticação, tarefas, uploads, webhooks e limites

Tudo aqui vale para **todas** as famílias. Leia antes de qualquer referência temática.

---

## 1. Autenticação

Uma única forma: chave privada no header. Só chamadas servidor-a-servidor.

```bash
curl "https://api.magnific.com/v1/ai/flows" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY"
```

> ⚠️ **É `x-magnific-api-key`, não `Authorization: Bearer`.** Este é o erro mais comum de quem chega de outra API. Um `Bearer` devolve 401 sem explicar por quê.

No projeto, a chave nunca é lida direto de `process.env`:

```ts
import { magnific } from "./lib/env.ts";
const { apiKey } = magnific();   // lança um erro que explica o conserto se faltar
```

Gere ou revogue chaves em https://www.magnific.com/user/organization/api-keys (é preciso ser administrador; contas enterprise precisam pedir a liberação da API ao representante).

---

## 2. Ciclo de vida de uma tarefa

Quase todo endpoint de IA é assíncrono e **uniforme**. O POST não devolve o resultado — devolve um protocolo.

```
POST /v1/ai/<familia>/<modelo>
  → 200 { "data": { "task_id": "046b…", "status": "CREATED", "generated": [] } }

GET  /v1/ai/<familia>/<modelo>/{task-id}
  → { "data": { "task_id": "046b…", "status": "IN_PROGRESS", "generated": [] } }
  → { "data": { "task_id": "046b…", "status": "COMPLETED",
                "generated": ["https://ai-statics.freepik.com/…"],
                "has_nsfw": [false] } }
```

| Status | Significado |
|---|---|
| `CREATED` | Aceita, ainda não começou |
| `IN_PROGRESS` | Processando |
| `COMPLETED` | Pronta — o resultado está em `generated` |
| `FAILED` | Falhou. O campo `error` quase sempre vem `null` |

### Três detalhes que enganam

1. **A rota de consulta é o caminho do POST + `/{task-id}`.** Não existe um `/v1/ai/tasks/{id}` genérico: para consultar uma tarefa você precisa lembrar de qual endpoint ela saiu.
2. **`generated` nem sempre é URL.** Em `improve-prompt` e `image-to-prompt` esse array traz o **texto** gerado. O nome do campo é o mesmo; o conteúdo, não.
3. **`GET` no caminho sem o `task-id` lista suas tarefas daquele modelo.** É o jeito de recuperar um `task_id` perdido.

### As quatro exceções ao padrão

| Exceção | Como é |
|---|---|
| [Fluxos](./09-fluxos.md) | Devolve `workflow_run_identifier`, consulta em `/v1/ai/flows/runs/{run-id}`, status em **minúsculas** |
| [Classificador](./04-classificador.md) | **Síncrono** — responde na hora, sem `task_id` |
| [Remoção de fundo](./02-edicao-imagem.md#8-remoção-de-fundo) | **Síncrono**, devolve `{ original, high_resolution, preview, url }` e é o **único endpoint do spec que não aceita JSON** (`application/x-www-form-urlencoded`) |
| [Ícones](./03-icones.md) | **Não existe rota de consulta.** Sem polling possível — só webhook |

Duas outras divergências, de forma e não de protocolo, o cliente normaliza sozinho:
`POST /v1/ai/image-style-transfer` devolve os campos no topo e chama o status de
`task_status`; `POST /v1/ai/beta/text-to-image/reimagine-flux` devolve no topo com
`status`. Chamadas na mão precisam tratar as duas.

### No cliente do projeto

```ts
import { executarTarefa, criarTarefa, aguardarTarefa } from "./lib/magnific.ts";

// POST + polling num passo (o normal)
const tarefa = await executarTarefa("/v1/ai/text-to-image/hyperflux", {
  prompt: "estrada de serra ao amanhecer",
  aspect_ratio: "widescreen_16_9",
});
console.log(tarefa.generated);

// Ou em dois tempos, para disparar várias e esperar depois
const { task_id } = await criarTarefa("/v1/ai/mystic", { prompt: "…" });
const pronta = await aguardarTarefa("/v1/ai/mystic", task_id, {
  timeoutEmSegundos: 900,
});
```

`aguardarTarefa` usa backoff crescente (2 s → 15 s) de propósito: o teto é 300 requisições por minuto por chave, e um poll fixo de 1 s em cinco gerações paralelas já chega perto disso.

> ⚠️ **Estouro de timeout não cancela a tarefa.** Ela continua rodando e continua cobrando. O erro do cliente imprime a rota de consulta — use-a em vez de gerar de novo.

---

## 3. Upload de arquivos locais

Os endpoints pedem **URL** (`image_url`, `video_url`, `audio_url`, `reference_images`). Um arquivo no seu disco não tem URL. A API de uploads resolve isso em dois passos.

### Passo 1 — pedir a URL de envio

```bash
curl -X POST "https://api.magnific.com/v1/ai/uploads/request-url" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "files": [ { "content_type": "image/png" } ] }'
```

```json
{
  "files": [{
    "file_id": "upl_img_a1b2c3d4e5f6",
    "upload_url": "https://…",
    "headers": { "Content-Type": "image/png",
                 "x-goog-content-length-range": "0,1073741824" },
    "expires_in": 120,
    "asset_url": "https://cdn-magnific.freepik.com/uploads/…?token=…",
    "asset_url_expires_in": 86400
  }]
}
```

### Passo 2 — mandar os bytes

```bash
curl -X PUT "<upload_url>" \
  -H "Content-Type: image/png" \
  -H "x-goog-content-length-range: 0,1073741824" \
  --data-binary "@./minha-imagem.png"
```

> ⚠️ **Duas regras que fazem o PUT falhar em silêncio:**
> 1. **Não mande a chave da API aqui.** O PUT vai direto ao storage e é autorizado pela assinatura embutida na URL.
> 2. **Repita os `headers` devolvidos no passo 1, exatamente.** Eles fazem parte da assinatura — omitir o `x-goog-content-length-range` ou trocar o `Content-Type` invalida a URL.

### Tipos e limites

| Tipo | MIME aceitos |
|---|---|
| Imagem | `image/png`, `image/jpeg`, `image/webp` |
| Vídeo | `video/mp4`, `video/webm`, `video/quicktime` |
| Áudio | `audio/mpeg`, `audio/wav`, `audio/mp4`, `audio/webm`, `audio/ogg` |

Máximo de **14 arquivos por chamada** e **1 GiB por arquivo**.

### Os dois relógios

| Relógio | Duração | O que acontece no fim |
|---|---|---|
| `asset_url_expires_in` | ~24 h | A URL passa a devolver 403. `GET /v1/ai/uploads` assina uma nova |
| `ttl_seconds` | ~7 dias | O arquivo é apagado. A URL para de funcionar de vez |

> ⚠️ **Upload é área de passagem, não armazenamento.** Não guarde a `asset_url` em lugar nenhum, e nunca aponte uma composição Remotion para ela — baixe o resultado para `public/`.

### No cliente

```ts
import { enviarArquivo, listarEnvios } from "./lib/magnific.ts";

const assetUrl = await enviarArquivo("public/imagens/UltimosTurnos/base.png");
// → usar como image_url / video_url / audio_url em qualquer endpoint

const emStaging = await listarEnvios();  // cada item vem com asset_url nova
```

---

## 4. Baixar o resultado

As URLs em `generated` são temporárias. Grave em `public/` antes de usar no Remotion.

```ts
import { baixarAsset } from "./lib/magnific.ts";
await baixarAsset(urls[0], "public/imagens/UltimosTurnos/fundo.png");
```

---

## 5. Webhooks

Alternativa ao polling: a API faz `POST` no seu endereço a cada mudança de status. Passe `webhook_url` no corpo de qualquer endpoint assíncrono.

**Neste projeto o padrão é polling**, porque não há endereço público para receber a chamada. A única família que **obriga** webhook é a de [ícones](./03-icones.md).

### Verificação da assinatura

Se um dia houver um receptor, a verificação é obrigatória — sem ela qualquer um pode forjar o payload. Chegam três headers:

| Header | Papel |
|---|---|
| `webhook-id` | Identificador único, evita replay |
| `webhook-timestamp` | Momento do envio, limita a janela de replay |
| `webhook-signature` | Lista de assinaturas separadas por espaço, no formato `v1,assinatura` |

O algoritmo é HMAC-SHA256 em base64 sobre os três valores unidos por ponto:

```ts
import { createHmac } from "node:crypto";
import { magnific } from "./lib/env.ts";

const verificar = (
  webhookId: string,
  webhookTimestamp: string,
  corpoBruto: string,
  headerAssinatura: string,
): boolean => {
  const { webhookSigningSecret } = magnific();
  const conteudo = `${webhookId}.${webhookTimestamp}.${corpoBruto}`;

  const esperada = createHmac("sha256", webhookSigningSecret)
    .update(conteudo)
    .digest("base64");

  // O header traz VÁRIAS assinaturas para permitir rotação do segredo.
  // Basta uma bater.
  return headerAssinatura
    .split(" ")
    .some((par) => par.split(",")[1] === esperada);
};
```

> ⚠️ Use o **corpo bruto** da requisição, não o JSON reserializado. Qualquer diferença de espaço ou ordem de chaves quebra a assinatura.

O segredo (`MAGNIFIC_WEBHOOK_SIGNING_SECRET`) é entregue junto com a criação da chave de API, no mesmo painel.

---

## 6. Erros

| Código | Causa típica |
|---|---|
| `400` | Parâmetro fora do enum ou do range; combinação inválida (ex.: `aspect_ratio` num endpoint imagem→vídeo que não o define); JSON enviado ao `remove-background`, que quer form-urlencoded |
| `401` | Chave ausente, errada, ou mandada como `Bearer` |
| `403` | `asset_url` expirada; recurso fora do seu plano |
| `429` | Estourou o limite — veja a seção 7 |
| `500` / `503` | Falha da Magnific. Tente de novo com backoff |

A causa real vem no **corpo** da resposta, não no status. Por isso `requisicao()` inclui o corpo na mensagem do erro que lança.

---

## 7. Limites e créditos

| Limite | Valor |
|---|---|
| Por chave | 300 requisições/minuto |
| Por IP | 50 req/s numa janela de 5 s |
| Por IP (média) | 10 req/s em janela de 2 min |
| `improve-prompt`, `image-to-prompt`, busca por IA | 1.000 requisições/dia |
| Analytics (`/v1/analytics/*`) | 100/dia, não consome crédito, só Business e Enterprise |

**Créditos:** toda geração de IA — imagem, vídeo, áudio, upscale, edição — debita créditos da organização, em qualquer plano pago. Assinatura "Unlimited" vale **só para o app web**.

**Stock** segue outra regra:

| Plano | Downloads de stock via API |
|---|---|
| Premium, Premium+, Pro | Não consomem crédito, teto de 100/dia |
| Business, Enterprise | Sem teto, cada download debita crédito |

---

## 8. Referência rápida do cliente

Tudo em [`scripts/lib/magnific.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/scripts/lib/magnific.ts).

| Função | Faz |
|---|---|
| `requisicao(metodo, caminho, corpo?, formato?)` | Chamada crua, com a chave e o erro traduzido. `formato: "form"` só para o `remove-background` |
| `criarTarefa(caminho, corpo)` | POST → `{ task_id, status }` |
| `consultarTarefa(caminho, taskId)` | GET de uma tarefa |
| `aguardarTarefa(caminho, taskId, opcoes?)` | Polling com backoff até terminar |
| `executarTarefa(caminho, corpo, opcoes?)` | POST + polling num passo |
| `enviarArquivo(caminhoLocal)` | Upload de 2 passos → `asset_url` |
| `listarEnvios()` | Uploads em staging, com URLs novas |
| `baixarAsset(url, destino)` | Grava o resultado no disco |
| `gerarImagem` · `gerarVideo` · `gerarMusica` · `gerarEfeitoSonoro` · `gerarLocucao` | Atalhos por família |
| `gerarIcone` · `baixarIcone` | Ícones — só disparam e baixam, porque não há polling |
| `removerFundo(imagemUrl)` | Remoção de fundo (síncrona) |
| `melhorarPrompt` · `imagemParaPrompt` · `classificarImagem` | Utilitários de prompt e análise |
| `listarFluxos` · `obterFluxo` · `executarFluxo` | Fluxos |
| `MODELOS_IMAGEM` · `MODELOS_VIDEO` | Catálogo com a tradução de aspecto e duração por modelo |
