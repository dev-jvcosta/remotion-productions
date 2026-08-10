# RankSum — "Como funciona o Rank?"

Motion vertical 1080×1920, 30 fps, 8 s (240 frames) usado no vídeo
**VD-013 — Tutorial Ranking Lombada**.

Tudo vive em um único arquivo: [`RankSum.tsx`](./RankSum.tsx).

---

## 1. Trocar os valores (o que você vai mexer 90 % das vezes)

Abra `RankSum.tsx` e edite o bloco **`RANK_SUM_DATA`**, logo no começo do arquivo.
É a única coisa que precisa mudar para gerar um novo caso.

```ts
export const RANK_SUM_DATA: RankSumData = {
  eyebrow: "COLUNA RANK",                    // texto pequeno com a bolinha amarela
  titleLine1: "Como funciona",                // título, 1ª linha
  titleLine2: "o Rank?",                      // título, 2ª linha
  subtitle: "O ranking é a soma das duas colunas.",

  total: 3.93,                                // número do CARD GRANDE
  totalLabel: "PTO RANKING LOMBADA",          // rótulo do CARD GRANDE

  aceLabel: "ACE",    ace: 3.5,               // 1º card pequeno
  acumLabel: "ACUM.", acum: 0.43,             // 2º card pequeno
  rankLabel: "RANK",  rank: 3.93,             // 3º card pequeno

  countFrom: 3.5,                             // de onde a contagem do RANK parte

  caption: "Esse valor exibido é o mesmo valor do card centralizado com sua Pontuação",

  decimals: 2,                                // casas decimais de TODOS os números
  fadeOutNoFinal: true,                       // fade para preto nos últimos 10 frames
};
```

### Regras importantes

- **Use ponto, não vírgula**: escreva `3.5`, que aparece na tela como `3,50`.
  A conversão para o padrão brasileiro é automática (função `fmt`).
- **`ace + acum` tem que dar `rank`**, e `rank` tem que ser igual a `total` —
  é justamente isso que o motion está ensinando. Se não fechar, o vídeo fica errado.
  - Exemplo atual (linha 07/08 da tabela): `3,50 + 0,43 = 3,93`.
  - Na tela do app a coluna *Acum.* mostra 3 casas (`0,429`); aqui exibimos
    arredondado (`0,43`) para a conta fechar visualmente.
- **`countFrom`** é só estética: o card RANK começa mostrando esse valor e sobe
  contando até `rank`. Normalmente deixe igual a `ace`.
- **Título**: as duas linhas são separadas de propósito (`titleLine1` / `titleLine2`)
  porque cada uma entra com um pequeno atraso. Não use `\n` — use os dois campos.
- **Texto muito longo**: o título usa `whiteSpace: "nowrap"`, então uma linha grande
  demais vaza da tela. Se precisar, quebre melhor entre as duas linhas ou diminua
  o `fontSize: 88` das duas `Interactive.Div` de título.

### Também dá para editar sem mexer no código

No Remotion Studio (`npm run dev`), selecione a composição **RankSum** e use o
painel de props na lateral direita — ele expõe exatamente os campos acima.
Bom para testar; para valer, salve no arquivo.

---

## 2. Mexer no tempo da animação

Cada elemento tem seu próprio `interpolate(frame, [inicio, fim], ...)`.
Os números são **frames** (30 frames = 1 segundo). Tabela do que está valendo hoje:

| Frames | Elemento |
|---|---|
| 5–20 | bolinha do eyebrow |
| 6–18 | texto "COLUNA RANK" |
| 22–34 | título, linha 1 |
| 25–37 | título, linha 2 |
| 28–40 | régua amarela (cresce de 0 a 180 px) |
| 33–45 | subtítulo |
| 42–62 | card grande (fade + *pop*) |
| 66–80 | seta descendo |
| 84–100 | card ACE |
| 98–114 | operador `+` e card ACUM. |
| 112–128 | operador `=` e card RANK |
| 118–140 | contagem do número do card RANK |
| 142–154 | frase final |
| 230–240 | fade para preto |

Para deixar algo mais lento, aumente o segundo número. Para atrasar, aumente os dois.
A duração total (240) está em `src/Root.tsx`, em `durationInFrames`.

---

## 3. Mexer no layout / cores

As posições são absolutas, em pixels, medidas a partir do motion original:

| Item | Valor |
|---|---|
| Margem esquerda do texto | `left: 72` |
| Amarelo | `#FDCA00` |
| Fundo creme | `#FCFBF5` |
| Texto escuro | `#111111` |
| Rótulo dentro do card amarelo | `rgba(0, 0, 0, 0.62)` |
| Card pequeno | 252 × 179, `borderRadius: 20` |
| Card grande | 620 × 208, `borderRadius: 28`, `left: 230` (centralizado) |
| Espaço entre cards pequenos | 90–92 px (onde ficam o `+` e o `=`) |

Os estilos são todos inline e literais de propósito: assim o Remotion Studio
consegue selecionar o elemento no preview e editar estilo/keyframes na interface.
Evite extrair valores para constantes ou fazer contas dentro do `style`.

---

## 4. Preview e render

Preview:

```bash
npm run dev
```

Render final (ProRes 4444 — mesmas specs do motion antigo, pronto para o Final Cut):

```bash
npx remotion render RankSum "/Volumes/EXT_STORAGE/ACE_CoPilot_Video_Production/2026/VD-013_TUTORIAL_RANKING_LOMBADA/ASSETS/RemotionOut/RankSum_v3.mov" --codec=prores --prores-profile=4444
```

Só um frame, para conferir rápido sem renderizar o vídeo inteiro:

```bash
npx remotion still RankSum out/teste.png --frame=160
```

> Troque o nome do arquivo a cada versão (`_v3`, `_v4`…) para não sobrescrever
> um arquivo já importado na biblioteca do Final Cut.

---

## 5. Fonte

O código-fonte do motion original se perdeu, então a fonte foi identificada a partir
dos frames do vídeo: usamos **Inter** (via `@remotion/google-fonts`), que fica embutida
no render — o resultado é igual em qualquer máquina.

Único desvio conhecido: os algarismos do vídeo antigo eram ~15 % mais largos que os do
Inter (a altura bate). Se algum dia quiser o numeral idêntico, é trocar o `fontFamily`
só dos elementos de valor.
