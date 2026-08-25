---
name: ultimos-turnos
description: Diretrizes, regras e fluxos de trabalho para o vídeo VD-014 (Últimos Turnos / Pontuação). Use sempre que for alterar falas no roteiro, atualizar linhas da tabela, modificar textos em tela das cenas, regerar áudios com ElevenLabs, renderizar vídeos em out/Renders/ ou gerar legendas/transcrições SRT/TXT.
version: 1.0.0
---

# 🎬 Skill: Produção do Vídeo Últimos Turnos (VD-014)

Este documento reúne todas as instruções, regras de arquitetura, comandos e especificações para manutenção e produção do vídeo **VD-014 — Pontuação · "O que mudou nos Últimos Turnos"** (1920×1080, 30 fps, horizontal).

---

## 1. Mapa de Arquivos

O projeto separa rigorosamente o **texto falado**, o **texto visual** e os **dados**:

| Arquivo | Função | O que contém |
|---|---|---|
| [`src/UltimosTurnos/roteiro.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/src/UltimosTurnos/roteiro.ts) | **Texto FALADO** | Fonte única da locução (enviado ao TTS da ElevenLabs). |
| [`src/UltimosTurnos/dados.ts`](file:///Users/jvcosta/Development/Projetos/remotion-productions/src/UltimosTurnos/dados.ts) | **DADOS** | Linhas da tabela, colunas `Mot.`/`Ant.`, cores positivas/negativas e linha do exemplo. |
| [`src/UltimosTurnos/cenas/Cena*.tsx`](file:///Users/jvcosta/Development/Projetos/remotion-productions/src/UltimosTurnos/cenas) | **Texto ESCRITO** | Textos visuais em tela (títulos, subtítulos, perguntas finais) cena por cena. |
| [`src/UltimosTurnos/TabelaUltimosTurnos.tsx`](file:///Users/jvcosta/Development/Projetos/remotion-productions/src/UltimosTurnos/TabelaUltimosTurnos.tsx) | **Tabela** | Componente visual da tabela (recebe dados via props). |
| [`src/UltimosTurnos/UltimosTurnos.tsx`](file:///Users/jvcosta/Development/Projetos/remotion-productions/src/UltimosTurnos/UltimosTurnos.tsx) | **Composição Principal** | Orquestração da linha do tempo, trilhas de áudio, cálculo de metadados e animações da tabela. |

---

## 2. Regras de Edição de Dados (`dados.ts`)

- **Ponto decimal:** Use sempre ponto (`3.03`), pois a função `fmt` converte automaticamente para o padrão pt-BR (`3,03`).
- **Validação de `antPositivo`:** `antPositivo` deve ser `true` quando `mot >= ant`. Isso não é validado em tempo de execução; se preenchido errado, a cor exibida ensinará a regra errada.
- **Linha de Exemplo (`LINHA_EXEMPLO`):** A Cena 5 destaca uma linha com **Mot. verde e Ant. vermelho ao mesmo tempo** para ensinar que são perguntas diferentes. Se trocar as linhas, garanta que o índice aponte para uma linha com esse comportamento.

---

## 3. Regras de Roteiro e Locução (`roteiro.ts`)

- **Pronúncia da IA:** Se a voz errar pronúncias ou abreviações ("Mot.", "Ant.", "Km/l"), conserte no `roteiro.ts` escrevendo por extenso como se fala (ex.: `"Km por litro"`, `"Mot"`).
- **Gerar locução com ElevenLabs:**
  ```bash
  # Regerar todas as cenas:
  node --env-file=.env --strip-types scripts/gerar-locucao.ts --forcar

  # Regerar apenas uma cena modificada:
  # 1. Apague public/voiceover/UltimosTurnos/cena-0X.mp3
  # 2. Execute sem a flag --forcar:
  node --env-file=.env --strip-types scripts/gerar-locucao.ts
  ```

---

## 4. Linha do Tempo e Cálculo de Duração

- A duração total e o tempo de cada cena são calculados dinamicamente pela função `calculateMetadata` em `UltimosTurnos.tsx`, medindo os arquivos `.mp3` em `public/voiceover/UltimosTurnos/`.
- **Folgas configuráveis:**
  - `RESPIRO_EM_SEGUNDOS`: Pausa entre falas de cenas.
  - `CAUDA_FINAL_EM_SEGUNDOS`: Tempo extra na Cena 6 para leitura das perguntas finais.
- Se os `.mp3` não existirem, o Remotion usa a `duracaoFallbackEmSegundos` de cada cena definida em `roteiro.ts`.

---

## 5. Preview e Renderização

### Preview no navegador (Remotion Studio):
```bash
npm run dev
```

### Renderizar novo vídeo completo (.mp4):
Todos os novos renders devem seguir o padrão de data e versão dentro de `out/Renders/`:
```bash
npx remotion render UltimosTurnos out/Renders/aaaa_mm_dd_render_vx.mp4
# Exemplo:
npx remotion render UltimosTurnos out/Renders/2026_08_25_render_v8.mp4
```

### Renderizar Still (imagem congelada para revisão de frames):
Todas as imagens de revisão devem ir para `out/Revs/rev<N>/`:
```bash
npx remotion still UltimosTurnos out/Revs/rev8/f1250.png --frame=1250 --scale=0.5
```

### Renderizar trecho ou cena específica:
```bash
npx remotion render UltimosTurnos out/Renders/2026_08_25_trecho.mp4 --frames=1707-1930
```

---

## 6. Transcrição e Legendas (`scripts/gerar-transcricao.ts`)

A transcrição extrai o áudio do vídeo renderizado e gera legendas (.srt) e texto de revisão (.txt):

```bash
# Busca automaticamente o render mais recente em out/Renders/:
node --env-file=.env --strip-types scripts/gerar-transcricao.ts

# Ou apontando para um render específico:
node --env-file=.env --strip-types scripts/gerar-transcricao.ts out/Renders/2026_08_25_render_v8.mp4
```

> ⚠️ **A transcrição depende obrigatoriamente do .mp4 já renderizado**, pois ela analisa o áudio final montado e sincronizado para garantir que as legendas batam perfeitamente com os cortes do vídeo.

---

## 7. Estrutura de Diretórios de Saída (`out/`)

```text
out/
├── Renders/                        <-- Vídeos finais (aaaa_mm_dd_render_vx.mp4)
├── Revs/                           <-- Revisões de stills (rev2/, rev3/, rev8/, etc.)
└── transcrição/                    <-- Arquivos .srt, .txt e áudios extraídos
```
