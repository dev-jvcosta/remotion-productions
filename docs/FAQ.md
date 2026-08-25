# ❓ FAQ — Perguntas Frequentes

Guia de referência rápida para dúvidas de desenvolvimento, edição, renderização e transcrição.

---

## Índice

1. [Onde alterar cada tipo de conteúdo no projeto?](#1-onde-alterar-cada-tipo-de-conteúdo-no-projeto)
2. [Como visualizar e pré-visualizar o vídeo no navegador?](#2-como-visualizar-e-pré-visualizar-o-vídeo-no-navegador)
3. [Como renderizar uma nova versão do vídeo (.mp4)?](#3-como-renderizar-uma-nova-versão-do-vídeo-mp4)
4. [Como renderizar apenas uma cena específica ou um trecho?](#4-como-renderizar-apenas-uma-cena-específica-ou-um-trecho)
5. [Como renderizar apenas um frame congelado (Still / PNG)?](#5-como-renderizar-apenas-um-frame-congelado-still--png)
6. [Como gerar arquivos SRT e TXT (Transcrição e Legendas)?](#6-como-gerar-arquivos-srt-e-txt-transcrição-e-legendas)
7. [A transcrição depende de uma renderização prévia? Por quê?](#7-a-transcrição-depende-de-uma-renderização-prévia-por-quê)
8. [Qual é a regra para a pasta de revisões `out/Revs/`?](#8-qual-é-a-regra-para-a-pasta-de-revisões-outrevs)
9. [Como funciona o cálculo automático de duração do vídeo?](#9-como-funciona-o-cálculo-automático-de-duração-do-vídeo)
10. [A voz da IA errou a pronúncia de uma palavra, o que fazer?](#10-a-voz-da-ia-errou-a-pronúncia-de-uma-palavra-o-que-fazer)

---

## 1. Onde alterar cada tipo de conteúdo no projeto?

O projeto separa estritamente o **texto falado** (locução), o **texto escrito** (tela) e os **dados** (tabela):

| O que você quer alterar | Onde alterar | Exemplo de arquivos |
|---|---|---|
| **Locução falada / Áudio** (o que a IA da ElevenLabs narra) | `roteiro.ts` da composição | `src/UltimosTurnos/roteiro.ts` |
| **Texto escrito na tela** (títulos, subtítulos, perguntas, frases, selos) | `cenas/Cena*.tsx` | `src/UltimosTurnos/cenas/Cena6Fecho.tsx` |
| **Linhas e valores da tabela** (números, quais campos ficam verdes/vermelhos) | `dados.ts` | `src/UltimosTurnos/dados.ts` |
| **Animações globais, layout e tempos entre cenas** | Componente principal da composição | `src/UltimosTurnos/UltimosTurnos.tsx` |

> 💡 **Nota importante:** Se você alterar a narração em `roteiro.ts`, lembre-se de regerar os arquivos de áudio antes de renderizar (veja o [Guia de Produção](./GUIA_DE_PRODUCAO.md)).

---

## 2. Como visualizar e pré-visualizar o vídeo no navegador?

Execute o comando do Remotion Studio:

```bash
npm run dev
```

- Isso abrirá o Remotion Studio em `http://localhost:3000`.
- No Studio você pode:
  - Navegar frame a frame ou dar Play/Pause com a barra de espaço.
  - Selecionar a composição desejada no menu lateral (`UltimosTurnos`, `RankSum`, etc.).
  - Conferir a sincronia visual com a faixa de áudio da locução.
  - Inspecionar e ajustar elementos marcados com `Interactive.Div`.

---

## 3. Como renderizar uma nova versão do vídeo (.mp4)?

Para renderizar o vídeo completo em formato MP4 (H.264), salve na pasta `out/Renders/` utilizando o padrão de data e versão `aaaa_mm_dd_render_vx.mp4`:

```bash
# Exemplo para a versão 8 renderizada no dia 25/08/2026:
npx remotion render UltimosTurnos out/Renders/2026_08_25_render_v8.mp4
```

### Regra de Nomenclatura dos Renders:
- **Diretório obrigatório:** Todos os vídeos finais devem ser salvos dentro de `out/Renders/`.
- **Formato do nome:** `aaaa_mm_dd_render_vx.mp4` (onde `aaaa` é o ano, `mm` o mês, `dd` o dia e `x` o número sequencial da versão).
- **Vantagem:** Mantém o histórico ordenado por data e versão sem sobrescrever renders anteriores.

---

## 4. Como renderizar apenas uma cena específica ou um trecho?

Você pode usar o parâmetro `--frames` no comando de render para exportar apenas um intervalo de frames (inclusive com áudio):

```bash
npx remotion render UltimosTurnos out/Renders/2026_08_25_trecho_cena6.mp4 --frames=1707-1930
```

### Como saber os frames de cada cena?
Os frames de início e duração de cada cena podem ser visualizados na régua do Remotion Studio (`npm run dev`) ou na tabela de tempos do README do vídeo (`src/UltimosTurnos/README.md`).

---

## 5. Como renderizar apenas um frame congelado (Still / PNG)?

Para exportar uma imagem estática (PNG) em alta qualidade de um frame específico para revisão:

```bash
# Renderiza o frame 1250 em tamanho real (1920x1080) na pasta da revisão correspondente:
npx remotion still UltimosTurnos out/Revs/rev8/f1250.png --frame=1250

# Renderiza com escala reduzida (50%) para conferência rápida:
npx remotion still UltimosTurnos out/Revs/rev8/f1250_thumb.png --frame=1250 --scale=0.5
```

---

## 6. Como gerar arquivos SRT e TXT (Transcrição e Legendas)?

Para extrair o áudio e gerar automaticamente a legenda formatada (`.srt`) e a revisão em texto corrido (`.txt`):

```bash
# Omitindo o argumento (ele seleciona automaticamente o .mp4 mais recente em out/Renders/):
node --env-file=.env --strip-types scripts/gerar-transcricao.ts

# Ou apontando para um vídeo específico:
node --env-file=.env --strip-types scripts/gerar-transcricao.ts out/Renders/2026_08_25_render_v8.mp4
```

### Arquivos gerados em `out/transcrição/`:
- **`<nome>.srt`**: Legendas temporizadas com quebras curtas (~42 caracteres), ideais para importar no Final Cut Pro, Premiere ou YouTube.
- **`<nome>.txt`**: Transcrição dividida por frases completas com timestamps e cabeçalho, ideal para revisão e validação textual.
- **`<nome>.audio.mp3`**: Áudio extraído do vídeo renderizado.

---

## 7. A transcrição depende de uma renderização prévia? Por quê?

**SIM, a transcrição depende obrigatoriamente de o vídeo `.mp4` já estar renderizado.**

### Por que não transcrever direto do `roteiro.ts`?
1. **Verificação da fala real:** O modelo de voz da IA pode interpretar abreviações de maneiras imprevistas (ex: "Km/l" lido como "K-M-barra-L" em vez de "quilômetros por litro"). A transcrição ouve o que foi **realmente falado** no áudio.
2. **Sincronismo exato:** Ao extrair o áudio do `.mp4` renderizado, as pausas, transições entre cenas e tempos reais da linha do tempo ficam perfeitamente alinhados com o arquivo de vídeo final.

---

## 8. Qual é a regra para as pastas `out/Renders/` e `out/Revs/`?

A pasta `out/` é organizada de forma limpa e modular:

### Estrutura padronizada:
```text
out/
├── Renders/
│   ├── UltimosTurnos_v1.mp4
│   ├── UltimosTurnos_v7.mp4
│   └── 2026_08_25_render_v8.mp4    <-- padrão para novos renders
├── Revs/
│   ├── rev2/
│   ├── rev3/
│   ├── rev4/
│   ├── rev5/
│   ├── rev6/
│   ├── rev7/
│   └── rev8/                       <-- padrão para novas revisões de stills
│       ├── f420.png
│       └── f1250.png
└── transcrição/
    ├── 2026_08_25_render_v8.srt
    └── 2026_08_25_render_v8.txt
```

> 📌 **Regras de ouro:**
> 1. **Vídeos (.mp4):** Devem sempre ir para `out/Renders/` no formato `aaaa_mm_dd_render_vx.mp4`.
> 2. **Imagens de revisão (stills .png):** Devem sempre ir para `out/Revs/rev<N>/`.

---

## 9. Como funciona o cálculo automático de duração do vídeo?

No Remotion, a composição utiliza a função `calculateMetadata` (definida em `src/UltimosTurnos/UltimosTurnos.tsx`):
- O código lê a duração real de cada arquivo `.mp3` dentro de `public/voiceover/UltimosTurnos/`.
- Cada cena é dimensionada automaticamente com base na duração do seu áudio + pausas de respiro configuradas (`RESPIRO_EM_SEGUNDOS` e `CAUDA_FINAL_EM_SEGUNDOS`).
- Se os arquivos de áudio ainda não existirem, o Remotion usa automaticamente o `duracaoFallbackEmSegundos` definido no `roteiro.ts`.

---

## 10. A voz da IA errou a pronúncia de uma palavra, o que fazer?

1. Abra o arquivo de roteiro (ex: `src/UltimosTurnos/roteiro.ts`).
2. No campo `narracao`, escreva a palavra foneticamente ou por extenso exatamente como deve ser falada (exemplo: troque `"Km/l"` por `"Km por litro"`, ou `"Mot."` por `"Móte"` se necessário).
3. Regere a locução:
   ```bash
   node --env-file=.env --strip-types scripts/gerar-locucao.ts --forcar
   ```
4. Renderize o vídeo novamente:
   ```bash
   npx remotion render UltimosTurnos out/UltimosTurnos_v8.mp4
   ```
