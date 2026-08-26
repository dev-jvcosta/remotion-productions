# 👄 Sincronização Labial

Faz a boca de uma pessoa acompanhar uma faixa de áudio.

---

## 1. Duas coisas diferentes com o mesmo nome

| Modelo | Entrada | O que faz |
|---|---|---|
| **LatentSync** | **vídeo** + áudio | Redubla um vídeo que já existe: troca a fala mantendo a cena |
| **VEED Fabric 1.0** | **imagem** + áudio | Anima um retrato parado, criando um vídeo de alguém falando |

Escolher errado é o erro mais comum aqui: `latent-sync` recusa uma imagem, e `veed-fabric` recusa um vídeo.

---

## 2. LatentSync — `POST /v1/ai/lip-sync/latent-sync`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `video_url` | URL | ✅ | |
| `audio_url` | URL | ✅ | |
| `guidance_scale` | number | | `1` — quanto o áudio manda no movimento |
| `seed` | integer | | `0` |
| `return_private_url` | boolean | | `false` — devolve URI `gs://` em vez de URL pública |

Consulta em `GET /v1/ai/lip-sync/latent-sync/{task-id}`.

---

## 3. VEED Fabric 1.0 — `POST /v1/ai/lip-sync/veed-fabric-1-0`

| Campo | Tipo | Obrig. |
|---|---|---|
| `image_url` | URL | ✅ |
| `audio_url` | URL | ✅ |
| `resolution` | `720p` · `480p` | ✅ |

Existe a variante `veed-fabric-1-0-fast`, com os mesmos campos e menor custo.

> ⚠️ `resolution` é **obrigatório** aqui — não tem padrão. Omitir dá 400.

A imagem precisa de um rosto claramente visível e de frente. Retrato de perfil ou com o rosto pequeno no quadro produz resultado ruim.

---

## 4. Fluxo completo neste projeto

Os arquivos são locais, e os endpoints só aceitam URL — então tudo passa por [`enviarArquivo`](./00-nucleo.md#3-upload-de-arquivos-locais):

```ts
import { enviarArquivo, executarTarefa, baixarAsset } from "./lib/magnific.ts";

// A locução já existe: foi gerada por scripts/gerar-locucao.ts
const audio = await enviarArquivo("public/voiceover/UltimosTurnos/cena-01.mp3");
const retrato = await enviarArquivo("public/imagens/UltimosTurnos/apresentador.png");

const tarefa = await executarTarefa(
  "/v1/ai/lip-sync/veed-fabric-1-0",
  { image_url: retrato, audio_url: audio, resolution: "720p" },
  { timeoutEmSegundos: 900 },
);

await baixarAsset(tarefa.generated[0], "public/videos/UltimosTurnos/apresentador-cena-01.mp4");
```

---

## 5. Como isso se encaixa no projeto

Há um caminho alternativo já instalado: [`scripts/gerar-avatar.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/scripts/gerar-avatar.ts), que usa a **HeyGen** para gerar avatar e voz juntos.

| | HeyGen (`gerar-avatar.ts`) | Magnific lip-sync |
|---|---|---|
| Entrada | Texto | Áudio pronto + imagem ou vídeo |
| Voz | Gerada pela HeyGen | A que você já tem |
| Créditos | Conta HeyGen | Conta Magnific |
| Serve para | Avatar do zero | Casar a locução que já existe com um rosto |

Se a locução já foi gerada pela ElevenLabs (o padrão deste projeto), o lip-sync da Magnific é o caminho: reaproveita o áudio aprovado em vez de gerar uma voz nova.

---

## 6. Armadilhas

1. **LatentSync quer vídeo; VEED Fabric quer imagem.** Não são intercambiáveis.
2. **`resolution` é obrigatório no VEED Fabric.**
3. **Só URL.** Arquivo local passa por `enviarArquivo` — e a `asset_url` vale ~24 h.
4. **Vídeo demora minutos.** Deixe o `timeoutEmSegundos` folgado; estourar o timeout não cancela nem estorna a tarefa.
5. **`return_private_url: true` devolve `gs://`**, que `baixarAsset` não consegue baixar.
