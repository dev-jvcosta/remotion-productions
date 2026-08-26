# 📦 Conteúdo de Stock

Acervo pronto: fotos, vetores, templates PSD, ícones, vídeos, músicas e efeitos sonoros. **Buscar é grátis; baixar é que custa.**

> **Considere isto antes de gerar.** Uma textura de asfalto, uma trilha neutra ou um ícone de caminhão já existem no acervo — saem em segundos e, no plano Premium/Pro, sem consumir crédito.

---

## 1. Os cinco acervos

| Acervo | Busca | Detalhe | Download |
|---|---|---|---|
| Fotos, vetores, PSD, templates | `GET /v1/resources` | `GET /v1/resources/{resource-id}` | `GET /v1/resources/{resource-id}/download` |
| Ícones | `GET /v1/icons` | `GET /v1/icons/{id}` | `GET /v1/icons/{id}/download` |
| Vídeos | `GET /v1/videos` | `GET /v1/videos/{id}` | `GET /v1/videos/{id}/download` |
| Músicas | `GET /v1/music` | `GET /v1/music/{music-id}` | `GET /v1/music/{music-id}/download` |
| Efeitos sonoros | `GET /v1/sound-effects` | `GET /v1/sound-effects/{sfx-id}` | `GET /v1/sound-effects/{sfx-id}/download` |

**Tudo é `GET`.** Nenhum é assíncrono — não há `task_id` em nenhum endpoint desta família.

> ⚠️ **Cuidado com a colisão de nomes.** `GET /v1/sound-effects` (acervo pronto) e `POST /v1/ai/sound-effects` ([gerar do zero](./10-audio.md)) são coisas diferentes. O mesmo vale para `/v1/icons` versus `/v1/ai/text-to-icon`, e `/v1/music` versus `/v1/ai/music-generation`.

---

## 2. Custo — regra própria, diferente do resto da API

| Plano | Downloads de stock via API |
|---|---|
| Premium, Premium+, Pro | **Não consomem crédito**, teto de **100 por dia** |
| Business, Enterprise | Sem teto diário, **cada download debita crédito** |

Estourado o teto diário, os downloads passam a ser recusados até o dia seguinte. **A busca não conta para o teto** — só o download.

---

## 3. Fotos, vetores e templates — `GET /v1/resources`

| Parâmetro | Onde | Observação |
|---|---|---|
| `term` | query | Termo de busca |
| `page` | query | 1 a 100 |
| `limit` | query | Resultados por página |
| `order` | query | `relevance` (padrão) ou `recent` |
| `filters` | query | Orientação, tipo de conteúdo, licença e afins |
| `Accept-Language` | header | ISO 639-1 + ISO 3166-1, ex.: `pt-BR` |

O `Accept-Language` muda o idioma da **busca**, não só o da resposta — vale mandar `pt-BR` quando o termo estiver em português.

```bash
curl -G "https://api.magnific.com/v1/resources" \
  -H "x-magnific-api-key: $MAGNIFIC_API_KEY" \
  -H "Accept-Language: pt-BR" \
  --data-urlencode "term=estrada de serra" \
  --data-urlencode "limit=10"
```

### Baixar

`GET /v1/resources/{resource-id}/download` aceita `image_size` na query — um valor em pixels (100 a 2000) ou uma palavra-chave — e devolve a URL do arquivo.

Para escolher o formato: `GET /v1/resources/{resource-id}/download/{resource-format}`, com `resource-format` em `psd`, `ai`, `eps`, `atn`, `fonts`, `resources`, `png`, `jpg`, `3d-render`, `svg`, `mockup`.

---

## 4. Ícones — `GET /v1/icons`

| Parâmetro | Observação |
|---|---|
| `term` · `slug` | Busca |
| `page` · `per_page` | Paginação (repare: aqui é `per_page`, não `limit`) |
| `family-id` | Restringe a uma família — é assim que se mantém coerência de traço |
| `order` | `relevance` ou `recent` |
| `thumbnail_size` | Padrão 128 |
| `filters` | |

Cada resultado traz `free_svg`, dizendo se o SVG sai sem custo.

### Baixar — `GET /v1/icons/{id}/download`

| Parâmetro | Valores |
|---|---|
| `format` | `svg`, `png`, `gif`, `mp4`, `aep`, `json`, `psd`, `eps` |
| `png_size` | 512 (padrão), 256, 128, 64, 32, 24, 16 — só com `format=png` |

> ⚠️ `gif`, `mp4`, `aep`, `json`, `psd` e `eps` **não estão disponíveis nos planos standard**.

**Para o Remotion, peça `svg`**: escala sem perder nitidez e a cor pode vir do CSS.

> **Coerência visual:** pegue o `family.id` do primeiro ícone que servir e filtre por `family-id` nas buscas seguintes. Ícones de famílias diferentes têm espessura de traço e cantos diferentes, e isso aparece na tela.

---

## 5. Músicas — `GET /v1/music`

| Parâmetro | Observação |
|---|---|
| `q` | Busca em título, artista e tags |
| `genre` · `mood` | Vários valores separados por vírgula |
| `include-premium` | `false` por padrão — **só devolve música gratuita** |
| `time_range` | `7d`, `30d`, `90d` |
| `order_by` | `relevance`, `popularity`, `created_at`, `title`, `seconds`, `bpm` — prefixe com `-` para descendente |
| `limit` · `offset` | Padrão 10 e 0 |

Resposta: `{ count, results }` — **sem envelope `data`**.

O detalhe (`GET /v1/music/{music-id}`) traz `seconds`, `bpm`, `genres`, `moods`, `preview_url` e `download_url`. **Use `seconds` para casar a trilha com a duração da composição** antes de baixar.

> ⚠️ Sem `include-premium=true` você vê só o acervo gratuito — e pode concluir por engano que não há nada bom.

---

## 6. Efeitos sonoros — `GET /v1/sound-effects`

Mesmos parâmetros da música, mais `category`. As categorias mais úteis para vídeo institucional:

`transitions` · `epic-transitions` · `cinematic-impacts` · `whooshes` · `risers` · `intros-and-outros` · `interface-and-alerts` · `user-interface` · `ambience` · `room-tones` · `machines-and-tools` · `cars-and-airplanes`

Filtrar por uma categoria-pai inclui as filhas.

Resposta: `{ count, results }`. Cada item traz `duration`, `file_url`, `is_premium` e `category` — esta última com a categoria-pai aninhada (ex.: `Whooshes` dentro de `Transitions`).

> ⚠️ **`duration` costuma vir `0` na listagem.** Verificado em resposta real do endpoint. Não confie nele para filtrar: consulte o detalhe, ou meça o arquivo depois de baixar.

---

## 7. Vídeos — `GET /v1/videos`

O acervo mais útil para o Remotion, porque cada resultado já diz se serve antes de você baixar:

| Campo do resultado | Por que importa |
|---|---|
| `aspect_ratio` | Vem pronto (ex.: `"16:9"`) — filtre por ele em vez de descobrir depois |
| `duration` | Casa com a duração da cena |
| `quality` | Resolução disponível |
| `premium` | Se conta como download premium |
| `is_ai_generated` | Diz se o clipe já é material de IA |
| `previews` · `thumbnails` | Para conferir antes de gastar o download |

Além de `GET /v1/videos/{id}/download`, existe `GET /v1/videos/{id}/options/{option-id}/download` para escolher resolução ou codec entre as opções que o detalhe lista.

---

## 8. Do acervo para a composição

Nenhum destes endpoints devolve o arquivo: devolvem uma **URL**. Baixe para `public/` — nunca aponte a composição para a URL do acervo.

```ts
import { requisicao, baixarAsset } from "./lib/magnific.ts";

// 1. buscar
const busca = await requisicao<{ results: { id: number; title: string; seconds: number }[] }>(
  "GET",
  "/v1/music?q=corporate%20uplifting&include-premium=true&limit=5",
);

// 2. escolher pela duração
const faixa = busca.results.find((m) => m.seconds >= 60);

// 3. pegar a URL e baixar
const { download_url } = await requisicao<{ download_url: string }>(
  "GET",
  `/v1/music/${faixa!.id}/download`,
);

await baixarAsset(download_url, "public/audio/UltimosTurnos/trilha.mp3");
```

---

## 9. Armadilhas

1. **`/v1/sound-effects` (acervo) ≠ `/v1/ai/sound-effects` (geração).** Vale para ícones e música também.
2. **`include-premium=false` é o padrão** em música e efeitos — quase sempre você quer `true`.
3. **A paginação muda de nome:** `limit`/`offset` em música e efeitos, `page`/`per_page` em ícones, `page`/`limit` em resources.
4. **Duas formas de resposta convivem aqui**, ambas verificadas ao vivo: música e efeitos devolvem `{ count, results }`; ícones, resources e vídeos devolvem `{ data, meta }`. Nenhuma das duas é o envelope `{ data }` simples do resto da API.
5. **O teto de 100/dia (Premium/Pro) conta downloads, não buscas.**
6. **Formatos animados de ícone são bloqueados em planos standard.**
7. **Confira `seconds` / `duration` antes de baixar** — trocar a trilha depois de montar a linha do tempo custa mais que escolher certo.
