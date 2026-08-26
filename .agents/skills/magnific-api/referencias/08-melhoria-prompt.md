# ✨ Melhoria de Prompt

Transforma um prompt curto num prompt detalhado, no idioma que você pedir.

---

## 1. Endpoint

`POST /v1/ai/improve-prompt` → `GET /v1/ai/improve-prompt/{task-id}`

| Campo | Tipo | Obrig. | Padrão |
|---|---|---|---|
| `prompt` | string | ✅ | Pode vir vazio — aí ele inventa um prompt criativo |
| `type` | `image` · `video` | ✅ | Muda o vocabulário: `video` fala de movimento e câmera |
| `language` | ISO 639-1 | | `en` — use `pt` para português |
| `webhook_url` | string | | |

> ⚠️ Como em [imagem para prompt](./07-imagem-para-prompt.md), **`generated` traz TEXTO**, não URL.

---

## 2. Exemplo real

```ts
import { melhorarPrompt } from "./lib/magnific.ts";

const [melhorado] = await melhorarPrompt({
  prompt: "painel de instrumentos de caminhão",
  tipo: "image",
  idioma: "pt",
});
```

Resposta obtida do endpoint (3 s):

> Painel de instrumentos de um caminhão antigo, com botões de baquelite e mostradores analógicos desgastados pelo tempo. A luz fraca do amanhecer entra pela janela empoeirada, iluminando partículas de poeira suspensas no ar e criando longas sombras sobre o volante de couro rachado. Um leve brilho emana dos poucos indicadores ainda funcionando. A composição é um close-up, levemente angulado de baixo para cima, capturando a textura rústica dos materiais e a sensação de uma longa jornada. O estilo é fotorrealista, com um toque de nostalgia e melancolia.

Cinco palavras viraram enquadramento, luz, textura e clima — tudo que o modelo de imagem precisa e que um prompt curto deixa ao acaso.

---

## 3. Por que usar sempre antes de gerar vídeo

Uma geração de vídeo custa ordens de grandeza mais que uma melhoria de prompt e leva minutos. Melhorar o prompt antes é a otimização de custo mais barata do fluxo:

```ts
const [descricao] = await melhorarPrompt({
  prompt: "estrada de serra vista de cima",
  tipo: "video",     // fala de movimento de câmera, ritmo, transição
  idioma: "pt",
});

await gerarVideo({ prompt: descricao, modelo: "kling-v3-turbo-720p", duracaoEmSegundos: 6 });
```

Com `type: "video"` o texto ganha instruções de movimento; com `type: "image"`, de composição estática. Usar o tipo errado desperdiça a chamada.

---

## 4. Limite

**1.000 requisições por dia**, compartilhado com `image-to-prompt`.

---

## 5. Armadilhas

1. **`generated` é texto.**
2. **`type` é obrigatório** e muda o resultado de verdade — não mande `image` para gerar vídeo.
3. **`language` só afeta o idioma da saída**, não a qualidade. Modelos de imagem entendem inglês melhor; se o resultado visual decepcionar em português, gere em `en`.
