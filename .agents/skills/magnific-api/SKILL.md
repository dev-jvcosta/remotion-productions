---
name: magnific-api
description: Geração de conteúdo audiovisual por IA via Magnific API — imagens, edição de imagem, ícones, vídeo (texto→vídeo e imagem→vídeo), áudio (música, efeitos sonoros, locução), sincronização labial, conteúdo de stock, classificador de imagem IA, imagem→prompt, melhoria de prompt e Fluxos. Use ao criar ou editar assets de IA para as composições Remotion, ao chamar api.magnific.com, ou ao rodar scripts/gerar-imagem-ia.ts e scripts/gerar-video-ia.ts.
version: 1.0.0
---

# 🎨 Skill: Magnific API — assets de IA para o Remotion

A Magnific API gera **imagens, vídeo, áudio e ícones** e dá acesso a um acervo de **conteúdo de stock**. Neste projeto ela alimenta as composições Remotion com material que não dá para desenhar em código: fundos, B-roll, trilha, efeitos sonoros.

> ⚠️ **Toda chamada de IA consome créditos da organização.** Planos "Unlimited" cobrem apenas o app web da Magnific — a API sempre cobra. Antes de gerar em lote, gere um exemplar e confira o resultado.

---

## 1. O essencial (leia antes de qualquer chamada)

| Item | Valor |
|---|---|
| Base URL | `https://api.magnific.com` |
| Autenticação | Header **`x-magnific-api-key`** — **não** é `Authorization: Bearer` |
| Chave | `MAGNIFIC_API_KEY` no `.env`, lida por `magnific()` em [`scripts/lib/env.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/scripts/lib/env.ts) |
| Painel | https://www.magnific.com/user/organization/api-keys |
| Cliente do projeto | [`scripts/lib/magnific.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/scripts/lib/magnific.ts) |

**Nunca monte a chamada na mão se o cliente já cobre o caso.** Ele resolve autenticação, polling com backoff, upload de arquivo local e download do resultado.

### O padrão assíncrono, que vale para quase tudo

```text
POST /v1/ai/<familia>/<modelo>     →  { data: { task_id, status: "CREATED", generated: [] } }
GET  /v1/ai/<familia>/<modelo>/{task-id}
                                   →  status: IN_PROGRESS  … repita
                                   →  status: COMPLETED → generated: ["https://…"]
                                   →  status: FAILED     → sem detalhe do motivo
```

Status são **MAIÚSCULOS**: `CREATED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`.

Quatro exceções, e todas mordem:

| Exceção | O que muda |
|---|---|
| [Fluxos](./referencias/09-fluxos.md) | Outro identificador, outra rota, status em minúsculas |
| [Classificador](./referencias/04-classificador.md) | Síncrono — responde na hora, sem `task_id` |
| [Remoção de fundo](./referencias/02-edicao-imagem.md) | Síncrono, e num formato próprio |
| [Ícones](./referencias/03-icones.md) | **Não tem rota de consulta.** Só webhook |

---

## 2. Índice de referências

Leia **apenas** a referência da família que a tarefa exige.

| # | Referência | Use quando precisar de |
|---|---|---|
| 00 | [Núcleo](./referencias/00-nucleo.md) | Autenticação, ciclo de tarefas, upload de arquivo, webhooks, erros, limites, créditos |
| 01 | [Geração de Imagem](./referencias/01-geracao-imagem.md) | Criar imagem a partir de texto (Mystic, Flux, Seedream, Nano Banana, HyperFlux, Z-Image) |
| 02 | [Edição de Imagem](./referencias/02-edicao-imagem.md) | Alterar imagem existente: editar por prompt, expandir, reiluminar, transferir estilo, tirar fundo, ampliar (upscale) |
| 03 | [Geração de Ícones](./referencias/03-icones.md) | Ícone vetorial (SVG) ou PNG a partir de texto |
| 04 | [Classificador de Imagem IA](./referencias/04-classificador.md) | Estimar se uma imagem foi gerada por IA |
| 05 | [Conteúdo de Stock](./referencias/05-stock.md) | Buscar e baixar foto, vetor, template, ícone, vídeo, música e efeito sonoro do acervo |
| 06 | [Sincronização Labial](./referencias/06-lip-sync.md) | Casar a boca de um vídeo com uma faixa de áudio |
| 07 | [Imagem para Prompt](./referencias/07-imagem-para-prompt.md) | Descrever uma referência visual como prompt reutilizável |
| 08 | [Melhoria de Prompt](./referencias/08-melhoria-prompt.md) | Transformar um prompt curto num prompt detalhado |
| 09 | [Fluxos](./referencias/09-fluxos.md) | Executar um pipeline pronto do Magnific Spaces |
| 10 | [Geração de Áudio](./referencias/10-audio.md) | Trilha, efeito sonoro, locução, isolamento de áudio |
| 11 | [Geração de Vídeo](./referencias/11-video.md) | B-roll por texto ou animando uma imagem; edição e ampliação de vídeo |
| — | [Catálogo de Endpoints](./referencias/catalogo-endpoints.md) | Conferir se um endpoint existe e quais campos ele exige (arquivo gerado) |

### Manutenção

A Magnific publica modelos novos com frequência. Dois scripts mantêm isto vivo, e nenhum dos dois precisa de chave de API nem gasta crédito:

```bash
# Regenera o catálogo a partir do spec OpenAPI oficial
node --strip-types scripts/gerar-doc-magnific.ts

# Confere se MODELOS_IMAGEM e MODELOS_VIDEO ainda batem com o spec
# (nome do campo da imagem, enums de aspecto, tipo e faixa da duração)
node --strip-types scripts/conferir-magnific.ts
```

Rode o `conferir-magnific.ts` depois de acrescentar qualquer modelo ao catálogo. Ele pega em segundos o tipo de erro que, sem ele, só apareceria como `400` depois de minutos de espera e crédito gasto.

---

## 3. Como gerar um asset neste projeto

### Pela linha de comando (o caminho normal)

```bash
# Imagem — o padrão é o modelo mystic em 16:9
node --env-file=.env --strip-types scripts/gerar-imagem-ia.ts \
  --prompt "painel de instrumentos de caminhão ao amanhecer" \
  --saida public/imagens/UltimosTurnos/fundo-cena-01.png

# O mesmo, mais barato, para testar enquadramento antes de gastar no modelo bom
node --env-file=.env --strip-types scripts/gerar-imagem-ia.ts \
  --prompt "..." --modelo hyperflux \
  --saida public/imagens/UltimosTurnos/rascunho.png

# Vídeo a partir de texto
node --env-file=.env --strip-types scripts/gerar-video-ia.ts \
  --prompt "estrada de serra vista de cima, câmera avançando devagar" \
  --duracao 6 \
  --saida public/videos/UltimosTurnos/broll-serra.mp4

# Vídeo animando uma imagem local (o upload é automático)
node --env-file=.env --strip-types scripts/gerar-video-ia.ts \
  --prompt "leve movimento de câmera para a direita" \
  --imagem public/imagens/UltimosTurnos/fundo-cena-01.png \
  --saida public/videos/UltimosTurnos/fundo-animado.mp4
```

Rode qualquer um dos dois sem argumentos para ver as opções e a lista de modelos.

### Em código

```ts
import { gerarImagem, baixarAsset } from "./lib/magnific.ts";

const urls = await gerarImagem({
  prompt: "painel de instrumentos de caminhão ao amanhecer",
  modelo: "mystic",
  aspecto: "16:9",
  extras: { resolution: "2k" }, // campos específicos do modelo entram aqui
});

await baixarAsset(urls[0], "public/imagens/UltimosTurnos/fundo-cena-01.png");
```

---

## 4. Onde os assets ficam

Mesma lógica de `public/voiceover/<Composicao>/`, que já existe: tudo que o Remotion consome via `staticFile()` vive em `public/`, separado por composição.

```text
public/
├── voiceover/<Composicao>/     Locução (ElevenLabs, via gerar-locucao.ts)
├── imagens/<Composicao>/       Imagens geradas ou editadas
├── videos/<Composicao>/        B-roll e vídeo gerado
└── audio/<Composicao>/         Trilha e efeitos sonoros
```

> ⚠️ **Baixe sempre o resultado para `public/`.** As URLs em `generated` são temporárias — apontar uma composição para elas faz o render quebrar dias depois, sem aviso.

No componente:

```tsx
import { Img, staticFile } from "remotion";

<Img src={staticFile("imagens/UltimosTurnos/fundo-cena-01.png")} />
```

---

## 5. Regras que evitam retrabalho

1. **Rascunhe barato, finalize caro.** Acerte enquadramento e composição com `hyperflux` ou `z-image`; só então gere no `mystic` ou `seedream-v5-pro`.
2. **Melhore o prompt antes de gerar vídeo.** Vídeo custa muito mais que imagem; `melhorarPrompt({ tipo: "video" })` custa quase nada e muda o resultado.
3. **Cada modelo nomeia o enquadramento de um jeito diferente** — `widescreen_16_9`, `16:9`, `landscape_16_9` ou `{width, height}`. O cliente já traduz a partir de `aspecto: "16:9"`; se for chamar a API na mão, confira a referência da família.
4. **Em imagem→vídeo, não mande `aspect_ratio`.** O enquadramento vem da imagem, e Kling e Veo devolvem 400 se receberem os dois.
5. **Arquivo local nunca vai direto.** Endpoints pedem URL: passe por `enviarArquivo()`, que devolve uma `asset_url` válida por ~24 h.
6. **Antes de gerar do zero, considere o stock.** Foto e trilha genéricas já existem no acervo, saem mais rápido e (em Premium/Pro) sem consumir crédito → [05-stock.md](./referencias/05-stock.md).
7. **Nunca versione a chave.** Ela mora no `.env`, que está no `.gitignore`; o `.env.example` documenta a variável sem o segredo.

---

## 6. Limites da API

| Limite | Valor |
|---|---|
| Por chave | 300 requisições/minuto |
| Por IP | 50 req/s em janela de 5 s; média de 10 req/s em 2 min |
| `improve-prompt` e `image-to-prompt` | 1.000 requisições/dia |
| Stock (Premium/Pro) | 100 downloads/dia, sem consumir crédito |
| Upload | 14 arquivos por chamada, 1 GiB cada |

O polling do cliente usa backoff crescente justamente para não estourar as 300 RPM quando várias gerações rodam juntas.
