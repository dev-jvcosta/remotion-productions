# 🔀 Fluxos (Flows)

Pipelines visuais montados no [Magnific Spaces](https://www.magnific.com/spaces). Um fluxo encadeia várias ferramentas — gerar, ampliar, animar, dublar — e roda tudo numa chamada só.

---

## 1. ⚠️ Esta família fala outra língua

**Não reaproveite o que você sabe do resto da API aqui.** Tudo muda de nome:

| | Resto da API | Fluxos |
|---|---|---|
| Identificador | `task_id` | **`workflow_run_identifier`** (e `run_id` na consulta) |
| Rota de consulta | `<caminho do POST>/{task-id}` | **`/v1/ai/flows/runs/{run-id}`** |
| Status | `CREATED` `IN_PROGRESS` `COMPLETED` `FAILED` | **minúsculos**: `pending` `running` `completed` `completed_with_errors` `failed` `cancelled` |
| Resultado | `generated: string[]` | **`result: { images, videos, audios }`** |
| Campo do webhook | `webhook_url` | **`webhook`** |

Quem assume o padrão geral fica em loop infinito, porque `data.status` vem `undefined`.

No cliente, `executarFluxo()` encapsula tudo isso. **Não use `aguardarTarefa` com fluxos.**

---

## 2. Endpoints

| Rota | Para quê |
|---|---|
| `GET /v1/ai/flows` | Fluxos publicados como ferramenta que sua chave pode executar. Aceita `?search=` |
| `GET /v1/ai/me/flows` | Fluxos que **você criou**, inclusive rascunhos não publicados |
| `GET /v1/ai/flows/{flow-id}` | Definição completa, com as entradas exigidas e o custo |
| `POST /v1/ai/flows/{flow-id}/run` | Dispara a execução |
| `GET /v1/ai/flows/runs/{run-id}` | Consulta o andamento e o resultado |

O `flow-id` é o campo `sqid` — uma string curta como `93XqNYZ7HO`, não um UUID.

---

## 3. Descobrir o que existe

```ts
import { listarFluxos } from "./lib/magnific.ts";

const fluxos = await listarFluxos();          // ou listarFluxos("stop-motion")
```

Uma consulta real devolveu **69 fluxos** publicados, entre eles:

| `sqid` | Nome |
|---|---|
| `93XqNYZ7HO` | Paper stop-motion assembly |
| `auLgfShW4B` | Film your shot list |
| `vEjja47yeP` | Demo it step by step |

> A listagem devolve só `sqid` e `name`. Custo e entradas só aparecem no detalhe — chame `obterFluxo` antes de rodar qualquer um.

---

## 4. Ler a definição antes de executar

Este passo não é opcional: **as entradas variam de fluxo para fluxo** e você não tem como adivinhar as chaves.

```ts
import { obterFluxo } from "./lib/magnific.ts";
const fluxo = await obterFluxo("93XqNYZ7HO");
```

Trecho de uma resposta real:

```json
{
  "sqid": "93XqNYZ7HO",
  "name": "Paper stop-motion assembly",
  "inputs": [
    {
      "id": "input-20d7ec93-…-1",
      "api_key": "input_1_your_photo",
      "type": "creation",
      "label": "1 · Your photo",
      "config": { "mediaType": "image" },
      "required": true
    },
    {
      "id": "input-f93f9eb9-…-2",
      "api_key": "input_2_setting",
      "type": "text",
      "label": "2 · Setting",
      "required": true,
      "presentation": { "placeholder": "e.g. A snow-covered village" }
    }
  ]
}
```

### Os quatro tipos de entrada

| `type` | Valor aceito |
|---|---|
| `creation` | URL de imagem/mídia, base64, ou o identificador de uma criação existente |
| `text` | String |
| `number` | Número |
| `select` | Um dos valores em `config.options` |

O `presentation.placeholder` é a melhor pista do que o fluxo espera em cada campo de texto — leia antes de preencher.

---

## 5. Executar

> ⚠️ **A chave do objeto `inputs` é o `api_key`**, um slug derivado do rótulo (`"1 · Your photo"` vira `input_1_your_photo`). Não é o `label`, não é o `id`.
>
> O spec ainda cita um campo `key`, mas **a API em produção não o devolve mais** — verificado ao vivo. Use `api_key`.

```ts
import { enviarArquivo, executarFluxo, baixarAsset } from "./lib/magnific.ts";

const foto = await enviarArquivo("public/imagens/UltimosTurnos/cena-01.png");

const execucao = await executarFluxo("93XqNYZ7HO", {
  input_1_your_photo: foto,
  input_2_setting: "uma estrada de serra ao amanhecer",
  input_3_setting_1: "uma oficina mecânica",
  input_4_setting_2: "um pátio de caminhões à noite",
});

const video = execucao.result?.videos?.[0]?.url;
if (video) {
  await baixarAsset(video, "public/videos/UltimosTurnos/stop-motion.mp4");
}
```

Na mão:

```bash
curl -X POST "https://api.magnific.com/v1/ai/flows/93XqNYZ7HO/run" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "inputs": { "input_2_setting": "uma estrada de serra ao amanhecer" } }'
```

Resposta: `{ "status": "running", "workflow_run_identifier": "…" }`.

---

## 6. Consultar o andamento

`GET /v1/ai/flows/runs/{run-id}`, onde `run-id` é o `workflow_run_identifier`.

```json
{
  "data": {
    "run_id": "…",
    "status": "completed",
    "app_id": "93XqNYZ7HO",
    "started_at": "2026-08-26T10:00:00Z",
    "completed_at": "2026-08-26T10:04:12Z",
    "error_message": null,
    "result": { "images": [], "videos": [ { "url": "https://…" } ], "audios": [] }
  }
}
```

| Status | Significado |
|---|---|
| `pending` | Na fila |
| `running` | Executando |
| `completed` | Pronto — o resultado está em `result` |
| `completed_with_errors` | Terminou, mas algum nó falhou. **`result` pode estar parcial** |
| `failed` | Falhou. O motivo está em `error_message` |
| `cancelled` | Cancelado |

`executarFluxo` trata `completed_with_errors` como falha e lança o `error_message` — um resultado parcial silencioso é pior que um erro.

---

## 7. Custo

O detalhe do fluxo traz `tool_metadata.total_cost`: a **soma dos créditos de todos os nós**. Um fluxo que gera imagem, amplia e anima cobra as três etapas.

Confira o `total_cost` antes de rodar em lote — é a diferença entre um teste e uma surpresa na fatura.

---

## 8. Quando usar fluxo em vez de chamadas soltas

| Prefira o fluxo | Prefira chamadas soltas |
|---|---|
| O pipeline já existe pronto e faz o que você quer | Você precisa de um passo só |
| São 4–5 etapas encadeadas | Quer escolher o modelo de cada etapa |
| Não importa qual modelo cada etapa usa | Precisa inspecionar ou salvar o resultado intermediário |

---

## 9. Armadilhas

1. **Status em minúsculas e nome de campo diferente.** Use `executarFluxo`, nunca `aguardarTarefa`.
2. **A chave de `inputs` é o `api_key`**, não o `label` nem o `id`.
3. **`GET /v1/ai/flows` lista só o publicado.** Seus rascunhos estão em `/v1/ai/me/flows`.
4. **O campo do webhook chama `webhook`**, não `webhook_url`.
5. **`completed_with_errors` não é sucesso** — verifique antes de usar o `result`.
6. **Fluxos demoram.** O padrão do cliente é 900 s; encadeamentos com vídeo pedem mais.
