# UltimosTurnos — "O que mudou nos Últimos Turnos"

Vídeo horizontal 1920×1080, 30 fps, ~64 s, usado no
**VD-014 — Pontuação · Últimos Turnos**.

Explica para o motorista as duas mudanças na tabela **Últimos Turnos**, dentro
da seção **Pontuação** do ACE CoPilot:

1. a coluna `Km/l` passou a se chamar `Mot.` — mesmo cálculo, mesmas cores;
2. entrou a coluna `Ant.`, com a média km/l da **semana anterior** do próprio
   motorista.

---

## 1. Os arquivos

| Arquivo | O que é |
|---|---|
| `roteiro.ts` | **O texto FALADO.** Fonte única da locução. |
| `dados.ts` | **As linhas da tabela.** |
| `TabelaUltimosTurnos.tsx` | A tabela. Não anima sozinha — recebe tudo pronto. |
| `cenas/Cena*.tsx` | O texto ESCRITO em tela, cena por cena. |
| `UltimosTurnos.tsx` | Amarra tudo: tempos, áudio e a animação da tabela. |

O texto falado e o texto escrito são separados de propósito: a locução precisa
soar bem **falada**, a tela precisa ser curta o bastante para ler **de relance**.
São escritas diferentes, e mexer numa não deve obrigar a mexer na outra.

---

## 2. Trocar os valores (o que você vai mexer 90 % das vezes)

### As linhas da tabela — `dados.ts`, bloco `LINHAS`

```ts
{
  dia: "20/08", turno: "Man.", carro: "28526",
  mot: 3.03,  motPositivo: true,   // coluna Mot. — verde se alcançou a média da linha
  ant: 3.18,  antPositivo: false,  // coluna Ant. — verde se mot >= ant
  giro: 1, giroPositivo: true,
  freio: 2, freioPositivo: true,
  pedal: 4, pedalPositivo: true,
}
```

**Regras importantes**

- **Use ponto, não vírgula**: escreva `3.03`, que aparece na tela como `3,03`.
  A conversão para o padrão brasileiro é automática (função `fmt`).
- **`antPositivo` tem que bater com a conta**: é `true` quando `mot >= ant`.
  Nada valida isso automaticamente — se errar, o vídeo ensina a regra errada.
- **`LINHA_EXEMPLO`** diz qual linha a cena 5 acende. Hoje é a `0` (20/08 · Man.),
  escolhida porque é a única com **Mot. verde e Ant. vermelho ao mesmo tempo**.
  Se trocar as linhas, escolha outra com essa combinação — ela é o coração do
  vídeo. Uma linha toda verde não ensina nada.

### O texto falado — `roteiro.ts`

Edite `narracao` e rode o script de novo (seção 5). Se a voz errar alguma
abreviação, conserte **no roteiro**, escrevendo como se fala — `"Km por litro"`
em vez de `"Km/l"`. A tela não muda junto.

### O texto escrito — `cenas/Cena*.tsx`

Está inline dentro de cada `Interactive.Div`, junto com o estilo. Dá para
editar direto no Remotion Studio, clicando no elemento.

---

## 3. Mexer no tempo

**Você quase nunca precisa.** A duração de cada cena vem do mp3 da locução:
`calculateMetadata` mede os arquivos e dimensiona o vídeo sozinho. Reescreveu
uma fala mais longa? A cena estica junto.

Duas folgas ajustáveis no topo de `UltimosTurnos.tsx`:

| Constante | Hoje | Para quê |
|---|---|---|
| `RESPIRO_EM_SEGUNDOS` | `0.35` | Pausa depois da fala de cada cena. |
| `CAUDA_FINAL_EM_SEGUNDOS` | `1.4` | Tempo a mais só na cena 6 — a locução acaba em cima da segunda pergunta e sem isso a tela de fecho pisca e some. |

### Tempos que estão valendo hoje

Cenas (frames absolutos, 30 f = 1 s):

| Cena | Começa | Dura | Conteúdo |
|---|---|---|---|
| 1 · Gancho | 0 | 241 | Título "O que mudou nos Últimos Turnos" |
| 2 · Antes | 241 | 466 | Coluna `Km/l` acesa |
| 3 · Renomeia | 707 | 251 | `Km/l` → `Mot.` + selo MESMO CÁLCULO |
| 4 · Coluna nova | 958 | 363 | Entra a `Ant.` + regra das cores |
| 5 · Exemplo | 1321 | 386 | Linha 20/08 acesa + as duas etiquetas |
| 6 · Fecho | 1707 | 223 | As duas perguntas, em tela cheia |
| **Total** | | **1930** | ~64,3 s |

> Esses números mudam sozinhos sempre que a locução é regerada. Os pontos de
> sincronia **dentro** de cada cena (quando o subtítulo entra, quando um selo
> aparece) são frames locais fixos, afinados de ouvido contra a fala atual —
> se você mudar a velocidade ou o texto, reconfira esses pontos.

Animações da tabela (em `UltimosTurnos.tsx`, relativas ao início da cena — por
isso continuam certas mesmo quando a locução muda de tamanho):

| Quando | O quê |
|---|---|
| `inicio2` → `+16` | tabela entra |
| `inicio2 + 36` | coluna `Km/l` acende, resto apaga |
| `inicio3 + 64` → `+91` | `Km/l` vira `Mot.` (crossfade no mesmo lugar) |
| `inicio4 + 46` → `+66` | cabeçalho laranja agrupador aparece |
| `inicio4 + 68` → `+104` | coluna `Ant.` abre e empurra o resto |
| `inicio4 + 109` | coluna `Ant.` acende |
| `inicio5 + 25` | linha do exemplo acende, resto apaga |
| `inicio6 - 8` → `+20` | tabela sai já na virada, dando a tela às perguntas |

Dentro de cada cena os tempos são **frames locais** (a cena começa no 0), com
os `interpolate()` inline em cada elemento — igual ao `RankSum`.

---

## 4. Layout e cores

A tabela se **recentraliza sozinha** conforme a coluna `Ant.` entra, em vez de
ficar torta em metade do vídeo. As posições saem das constantes no topo de
`TabelaUltimosTurnos.tsx`.

**Destaque de coluna:** quando uma coluna está acesa, TUDO o mais cai para
`0.28` — inclusive o bloco escuro de Dia/Turno/Carro. Ele ficava aceso e, sendo
o elemento de maior contraste da tela, roubava o olho justamente da coluna que
a cena estava ensinando.

| Item | Valor |
|---|---|
| Verde (positivo) | `#5CE49B` |
| Vermelho (negativo) | `#F97070` |
| Laranja (grupo `Km/l`) | `#EFA93C` |
| Creme sob `Mot.`/`Ant.` | `#FDF6E8` |
| Células escuras (Dia/Turno/Carro) | `#262626`, texto `#FFFFFF` |
| Amarelo (réguas, selos) | `#FDCA00` |
| Fundo | `#FCFBF5` |
| Linha da tabela | 78 px de altura, 8 px de espaço |
| Topo da tabela | `424` |
| Amarelo de destaque no texto | `#ffcc00` |

Padrão de cabeçalho das cenas 2–5 (é o que dá a "harmonia" entre elas): eyebrow
em `126`, título 82 px em `200`, subtítulo 40 px em `344`. O salto de ~46 px
entre título e subtítulo é proposital — é o que separa as duas hierarquias.

**O traço amarelo é filho do eyebrow**, não um elemento solto. Como o eyebrow é
absoluto e não tem largura, ele encolhe até o texto — então `width: "100%"` no
traço É a largura do texto, e o sublinhado acompanha sozinho tanto
`COMO ERA` quanto `A LEITURA QUE IMPORTA`. Antes era um valor fixo de 132 px que
não servia para os dois.

> **Por que a tabela foge da regra do `RankSum`.** O README do `RankSum` manda
> não extrair valores para constantes, para o Studio conseguir editar estilo e
> keyframes clicando no elemento. Aqui a tabela tem 5 linhas × 8 colunas = 40+
> células; transformar cada uma em `Interactive.Div` deixaria a timeline
> inutilizável. Então: **a tabela é um componente com props**, e os textos que
> você realmente vai querer ajustar à mão (títulos, subtítulos, selos,
> etiquetas) continuam `Interactive.Div` com estilo inline nas cenas.

---

## 5. Gerar a locução

Vozes e chaves ficam no `.env` (template em `.env.example`).

```bash
node --env-file=.env --strip-types scripts/gerar-locucao.ts
```

### Modelo e velocidade da fala

Hoje: `ELEVENLABS_MODEL_ID=eleven_v3` + `LOCUCAO_ATEMPO=0.92`.

⚠️ **O `eleven_v3` ignora o `ELEVENLABS_SPEED`.** Medido com 3 amostras do mesmo
texto: `speed 1.0` → média 6,45 s; `speed 0.7` → média 6,43 s. A API aceita o
parâmetro e devolve 200, mas não aplica. No `eleven_multilingual_v2` o `speed`
funciona de verdade (o mesmo texto: 6,32 s → 6,83 s → 8,87 s em 1.0 / 0.9 / 0.7).

Por isso existem **dois controles de ritmo**, e você usa um ou outro:

| Modelo | Como desacelerar | Observação |
|---|---|---|
| `eleven_multilingual_v2` | `ELEVENLABS_SPEED` | Melhor: o modelo **reentoa** a fala. Deixe `LOCUCAO_ATEMPO=1`. |
| `eleven_v3` | `LOCUCAO_ATEMPO` | Estica a onda com ffmpeg depois de gerar. Deixe `ELEVENLABS_SPEED` de lado. |

**O v3 já é naturalmente mais lento**: o mesmo roteiro deu 50,1 s no v2 a
`speed 1.0` e 58,0 s no v3 sem esticar nada. Com `LOCUCAO_ATEMPO=0.92` vai a
63,1 s de fala (vídeo de ~67 s). Se ficar arrastado, `LOCUCAO_ATEMPO=1`
devolve o vídeo para ~61 s sem trocar de modelo.

**Mudar a velocidade desafina o vídeo.** As durações de cena se reajustam
sozinhas, mas os pontos de sincronia dentro de cada cena não. Depois de regerar,
reconfira cena a cena e reescalone os frames pelo mesmo fator.

### Trocar para a voz do HeyGen

`LOCUCAO_PROVEDOR=heygen` no `.env`. A voz é a `HEYGEN_VOICE_ID`
(`Macedo - Instrutor`, pt, masculina), que vem junto da identidade
`HEYGEN_AVATAR_GROUP_ID` (`Macedo 2026`). A velocidade é `HEYGEN_SPEED`, e a API
aceita de `0.5` a `2.0` — faixa bem maior que a da ElevenLabs.

⚠️ **Hoje isso não roda: a conta está com 0 créditos de API na HeyGen.** Os
créditos de API são separados dos créditos do Studio — o painel mostrava 1702
créditos de plano e `remaining_quota: 0`. Confira antes de tentar:

```bash
curl -s -H "X-Api-Key: $HEYGEN_API_KEY" \
  https://api.heygen.com/v2/user/remaining_quota
```

---

## 6. Transcrever o vídeo

```bash
node --env-file=.env --strip-types scripts/gerar-transcricao.ts
node --env-file=.env --strip-types scripts/gerar-transcricao.ts out/OutroVideo.mp4
```

Sem argumento, o script pega o `.mp4` mais recente de `out/`. Sai em
`out/transcrição/`, os dois com timestamp:

- **`<nome>.txt`** — cabeçalho + blocos numerados, quebrados **por frase**. É o
  formato de revisão: dá para ler o vídeo inteiro sem abrir o vídeo.

  ```
  [05]  00:00:13,539 --> 00:00:19,180
        Ela fica verde quando você alcança a média da linha...
  ```

- **`<nome>.srt`** — legendas de verdade, quebradas em ~42 caracteres, prontas
  para o Final Cut ou YouTube.

Os dois saem do mesmo agrupador; muda só o limite de caracteres. Legenda é lida
de relance e por isso quebra curto; texto de revisão quebra por frase, porque
ler um parágrafo picado em pedaços de 42 caracteres é pior que ler a frase.

Transcreve o **áudio renderizado**, não o `roteiro.ts` — é assim que se descobre
o que a voz realmente falou. Foi o que confirmou que `Mot.` e `Ant.` saem como
"Mot" e "Ant" (certo) e que `Km/l` vira "quilômetros por litro" (certo também).
O roteiro nunca denunciaria uma pronúncia errada.

Também é onde aparecem os cochilos de entonação do v3: hoje ele fecha ponto
final depois de "no mesmo dia" e recomeça em "Turno, carro e linha", partindo
a enumeração em duas (blocos 05 e 06). Não atrapalha o entendimento, mas é do
tipo de coisa que só se vê lendo a transcrição.

---

## 7. Detalhes do gerador de locução

Cenas que já têm mp3 são puladas. Para regerar uma só, apague o arquivo dela em
`public/voiceover/UltimosTurnos/` e rode de novo. Para regerar tudo:

```bash
node --env-file=.env --strip-types scripts/gerar-locucao.ts --forcar
```

**Enquanto os mp3 não existem**, cada cena usa a `duracaoFallbackEmSegundos` do
`roteiro.ts` e nenhum `<Audio>` é montado — o vídeo abre e renderiza mudo, sem
erro. É o que permite mexer no visual sem depender da API.

---

## 8. Preview e render

```bash
npm run dev                       # Studio
npx remotion render UltimosTurnos out/UltimosTurnos_v7.mp4
```

Um frame só (still), para conferir rápido (salvar na pasta de revisão `out/Revs/`):

```bash
npx remotion still UltimosTurnos out/Revs/rev7/f1250.png --frame=1250 --scale=0.5
```

> 📖 Para dúvidas de comandos, recortes de cenas e transcrição, consulte o [FAQ do Projeto](file:///Users/jvcosta/Development/Projetos/remotion-productions/docs/FAQ.md).

Entrega para o Final Cut (a pasta `VD-014_…` precisa ser criada no drive, com
os subdiretórios do padrão — `ASSETS/RemotionOut/`, `AUDIO/`, `CAPTIONS/`,
`DOCS/`, `EXPORTS/`):

```bash
npx remotion render UltimosTurnos \
  "/Volumes/EXT_STORAGE/ACE_CoPilot_Video_Production/2026/VD-014_PONTUACAO_ULTIMOS_TURNOS/ASSETS/RemotionOut/UltimosTurnos_v1.mp4"
```

> Troque o nome do arquivo a cada versão (`_v2`, `_v3`…) para não sobrescrever
> um arquivo já importado na biblioteca do Final Cut.

Diferente do `RankSum`, aqui o render é **H.264 com áudio**, não ProRes com
alpha: este é um vídeo fechado, não um motion para compor por cima de outra
coisa.

---

## 9. Fonte

**Inter**, via `@remotion/google-fonts`, pesos 500/700/800 — a mesma do
`RankSum`. Fica embutida no render, então o resultado é igual em qualquer
máquina.
