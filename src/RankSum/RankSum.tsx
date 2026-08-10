import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

/* ==========================================================================
 * VALORES DO MOTION — é AQUI que você edita para gerar um novo caso.
 * Tudo abaixo vem da tela "Ranking Lombada" do ACE CoPilot.
 * Os números são numéricos (ponto decimal), a vírgula é aplicada na hora
 * de exibir. Ex.: 3.5 aparece como "3,50".
 * ========================================================================== */
export type RankSumData = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  total: number;
  totalLabel: string;
  aceLabel: string;
  ace: number;
  acumLabel: string;
  acum: number;
  rankLabel: string;
  rank: number;
  countFrom: number;
  caption: string;
  decimals: number;
  fadeOutNoFinal: boolean;
};

export const RANK_SUM_DATA: RankSumData = {
  // Cabeçalho
  eyebrow: "COLUNA RANK",
  titleLine1: "Como funciona",
  titleLine2: "o Rank?",
  subtitle: "O ranking é a soma das duas colunas.",

  // Card grande (é o card centralizado do app, com a Pontuação)
  total: 3.93,
  totalLabel: "PTO RANKING LOMBADA",

  // Cards pequenos: ACE + ACUM. = RANK
  aceLabel: "ACE",
  ace: 3.5,
  acumLabel: "ACUM.",
  acum: 0.43,
  rankLabel: "RANK",
  rank: 3.93,

  // De qual valor a contagem do card RANK começa (ela sobe até `rank`)
  countFrom: 3.5,

  // Frase final
  caption:
    "Esse valor exibido é o mesmo valor do card centralizado com sua Pontuação",

  // Casas decimais de todos os números
  decimals: 2,

  // Fade para preto nos últimos 10 frames (o motion antigo tinha isso)
  fadeOutNoFinal: true,
};

/* Formata no padrão pt-BR: 3.5 -> "3,50" */
const fmt = (value: number, decimals: number) =>
  value.toFixed(decimals).replace(".", ",");

export const RankSum: React.FC<{ data: RankSumData }> = ({ data }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      name="Cena Rank"
      style={{
        backgroundColor: "#FCFBF5",
        fontFamily,
      }}
    >
      {/* ---------------------------------------------------------------
       * CABEÇALHO
       * --------------------------------------------------------------- */}
      <Interactive.Div
        name="Eyebrow bolinha"
        style={{
          position: "absolute",
          left: 70,
          top: 455,
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: "#FDCA00",
          scale: interpolate(frame, [5, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      />

      <Interactive.Div
        name="Eyebrow texto"
        style={{
          position: "absolute",
          left: 101,
          top: 447,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 4.8,
          lineHeight: 1,
          color: "#111111",
          opacity: interpolate(frame, [6, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [6, 18], ["-16px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {data.eyebrow}
      </Interactive.Div>

      <Interactive.Div
        name="Titulo linha 1"
        style={{
          position: "absolute",
          left: 72,
          top: 505,
          fontSize: 88,
          fontWeight: 800,
          letterSpacing: -1.5,
          lineHeight: 1,
          color: "#111111",
          whiteSpace: "nowrap",
          opacity: interpolate(frame, [22, 32], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [22, 34], ["0px 26px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {data.titleLine1}
      </Interactive.Div>

      <Interactive.Div
        name="Titulo linha 2"
        style={{
          position: "absolute",
          left: 72,
          top: 596,
          fontSize: 88,
          fontWeight: 800,
          letterSpacing: -1.5,
          lineHeight: 1,
          color: "#111111",
          whiteSpace: "nowrap",
          opacity: interpolate(frame, [25, 35], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [25, 37], ["0px 26px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {data.titleLine2}
      </Interactive.Div>

      <Interactive.Div
        name="Regua amarela"
        style={{
          position: "absolute",
          left: 72,
          top: 713,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#FDCA00",
          width: interpolate(frame, [28, 40], [0, 180], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />

      <Interactive.Div
        name="Subtitulo"
        style={{
          position: "absolute",
          left: 72,
          top: 752,
          fontSize: 40,
          fontWeight: 500,
          lineHeight: 1,
          color: "#111111",
          opacity: interpolate(frame, [33, 45], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [33, 45], ["0px 18px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {data.subtitle}
      </Interactive.Div>

      {/* ---------------------------------------------------------------
       * CARD GRANDE — a Pontuação que aparece centralizada no app
       * --------------------------------------------------------------- */}
      <Interactive.Div
        name="Card grande"
        style={{
          position: "absolute",
          left: 230,
          top: 860,
          width: 620,
          height: 208,
          borderRadius: 28,
          backgroundColor: "#FDCA00",
          opacity: interpolate(frame, [42, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [42, 62], [0.86, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <Interactive.Div
          name="Card grande valor"
          style={{
            position: "absolute",
            left: 0,
            top: 32,
            width: 620,
            textAlign: "center",
            fontSize: 94,
            fontWeight: 800,
            letterSpacing: -1,
            lineHeight: 1,
            color: "#111111",
          }}
        >
          {fmt(data.total, data.decimals)}
        </Interactive.Div>

        <Interactive.Div
          name="Card grande rotulo"
          style={{
            position: "absolute",
            left: 0,
            top: 143,
            width: 620,
            textAlign: "center",
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: 3.4,
            lineHeight: 1,
            color: "rgba(0, 0, 0, 0.62)",
          }}
        >
          {data.totalLabel}
        </Interactive.Div>
      </Interactive.Div>

      {/* ---------------------------------------------------------------
       * SETA — do card grande para a conta que o origina
       * --------------------------------------------------------------- */}
      <Interactive.Div
        name="Seta"
        style={{
          position: "absolute",
          left: 520,
          top: 1100,
          width: 40,
          overflow: "hidden",
          height: interpolate(frame, [66, 80], [0, 80], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <svg viewBox="0 0 40 80" width={40} height={80}>
          <Interactive.Path
            name="Haste"
            d="M20 0 V 58"
            stroke="#111111"
            strokeWidth={5}
            fill="none"
          />
          <Interactive.Path
            name="Ponta"
            d="M6 55 L20 79 L34 55 Z"
            fill="#111111"
          />
        </svg>
      </Interactive.Div>

      {/* ---------------------------------------------------------------
       * CARDS PEQUENOS — ACE + ACUM. = RANK
       * --------------------------------------------------------------- */}
      <Interactive.Div
        name="Card ACE"
        style={{
          position: "absolute",
          left: 72,
          top: 1215,
          width: 252,
          height: 179,
          borderRadius: 20,
          backgroundColor: "#FDCA00",
          opacity: interpolate(frame, [84, 92], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [84, 100], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <Interactive.Div
          name="ACE rotulo"
          style={{
            position: "absolute",
            left: 0,
            top: 33,
            width: 252,
            textAlign: "center",
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: 3.4,
            lineHeight: 1,
            color: "rgba(0, 0, 0, 0.62)",
          }}
        >
          {data.aceLabel}
        </Interactive.Div>
        <Interactive.Div
          name="ACE valor"
          style={{
            position: "absolute",
            left: 0,
            top: 80,
            width: 252,
            textAlign: "center",
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -0.5,
            lineHeight: 1,
            color: "#111111",
          }}
        >
          {fmt(data.ace, data.decimals)}
        </Interactive.Div>
      </Interactive.Div>

      <Interactive.Div
        name="Operador mais"
        style={{
          position: "absolute",
          left: 324,
          top: 1272,
          width: 90,
          textAlign: "center",
          fontSize: 62,
          fontWeight: 800,
          lineHeight: 1,
          color: "#111111",
          opacity: interpolate(frame, [98, 106], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        +
      </Interactive.Div>

      <Interactive.Div
        name="Card ACUM"
        style={{
          position: "absolute",
          left: 414,
          top: 1215,
          width: 252,
          height: 179,
          borderRadius: 20,
          backgroundColor: "#FDCA00",
          opacity: interpolate(frame, [98, 106], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [98, 114], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <Interactive.Div
          name="ACUM rotulo"
          style={{
            position: "absolute",
            left: 0,
            top: 33,
            width: 252,
            textAlign: "center",
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: 3.4,
            lineHeight: 1,
            color: "rgba(0, 0, 0, 0.62)",
          }}
        >
          {data.acumLabel}
        </Interactive.Div>
        <Interactive.Div
          name="ACUM valor"
          style={{
            position: "absolute",
            left: 0,
            top: 80,
            width: 252,
            textAlign: "center",
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -0.5,
            lineHeight: 1,
            color: "#111111",
          }}
        >
          {fmt(data.acum, data.decimals)}
        </Interactive.Div>
      </Interactive.Div>

      <Interactive.Div
        name="Operador igual"
        style={{
          position: "absolute",
          left: 666,
          top: 1272,
          width: 92,
          textAlign: "center",
          fontSize: 62,
          fontWeight: 800,
          lineHeight: 1,
          color: "#111111",
          opacity: interpolate(frame, [112, 120], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        =
      </Interactive.Div>

      <Interactive.Div
        name="Card RANK"
        style={{
          position: "absolute",
          left: 758,
          top: 1215,
          width: 252,
          height: 179,
          borderRadius: 20,
          backgroundColor: "#FDCA00",
          opacity: interpolate(frame, [112, 120], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [112, 128], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <Interactive.Div
          name="RANK rotulo"
          style={{
            position: "absolute",
            left: 0,
            top: 33,
            width: 252,
            textAlign: "center",
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: 3.4,
            lineHeight: 1,
            color: "rgba(0, 0, 0, 0.62)",
          }}
        >
          {data.rankLabel}
        </Interactive.Div>
        <Interactive.Div
          name="RANK valor"
          style={{
            position: "absolute",
            left: 0,
            top: 80,
            width: 252,
            textAlign: "center",
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -0.5,
            lineHeight: 1,
            color: "#111111",
          }}
        >
          {fmt(
            interpolate(frame, [118, 140], [data.countFrom, data.rank], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            data.decimals,
          )}
        </Interactive.Div>
      </Interactive.Div>

      {/* ---------------------------------------------------------------
       * FRASE FINAL
       * --------------------------------------------------------------- */}
      <Interactive.Div
        name="Legenda final"
        style={{
          position: "absolute",
          left: 90,
          top: 1426,
          width: 900,
          textAlign: "center",
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.28,
          color: "#111111",
          opacity: interpolate(frame, [142, 154], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [142, 154], ["0px 16px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {data.caption}
      </Interactive.Div>

      {/* ---------------------------------------------------------------
       * FADE FINAL PARA PRETO
       * --------------------------------------------------------------- */}
      {data.fadeOutNoFinal ? (
        <Interactive.Div
          name="Fade final"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 1920,
            backgroundColor: "#000000",
            opacity: interpolate(frame, [230, 240], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.linear,
            }),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
