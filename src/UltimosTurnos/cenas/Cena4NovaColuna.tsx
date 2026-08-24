import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* Cena 4 — A coluna nova.
 * A regra das cores é dita aqui e SÓ aqui, no momento em que a coluna aparece
 * na tabela. Dizer a regra antes de existir coluna não gruda. */
export const Cena4NovaColuna: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Cena 4 - Coluna nova"
      style={{
        opacity: interpolate(
          frame,
          [0, 10, durationInFrames - 10, durationInFrames - 1],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [
              Easing.bezier(0.16, 1, 0.3, 1),
              Easing.linear,
              Easing.bezier(0.7, 0, 0.84, 0),
            ],
          },
        ),
      }}
    >
      <Interactive.Div
        name="Eyebrow"
        style={{
          position: "absolute",
          left: 161,
          top: 126,
          color: "#111111",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 4.8,
          opacity: interpolate(frame, [4, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        MUDANÇA 2 DE 2
      </Interactive.Div>

      <Interactive.Div
        name="Traco do eyebrow"
        style={{
          position: "absolute",
          left: 161,
          top: 172,
          height: 5,
          borderRadius: 3,
          backgroundColor: "#FDCA00",
          width: interpolate(frame, [10, 24], [0, 132], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />

      <Interactive.Div
        name="Titulo"
        style={{
          position: "absolute",
          left: 161,
          top: 200,
          color: "#111111",
          fontSize: 82,
          fontWeight: 800,
          letterSpacing: -1.6,
          opacity: interpolate(frame, [10, 24], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [10, 26], ["0px 24px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Entrou a coluna Ant.
      </Interactive.Div>

      <Interactive.Div
        name="Subtitulo"
        style={{
          position: "absolute",
          left: 161,
          top: 344,
          color: "#111111",
          fontSize: 40,
          fontWeight: 500,
          opacity: interpolate(frame, [154, 173], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        A sua média da semana anterior.
      </Interactive.Div>

      <Interactive.Div
        name="Regra verde"
        style={{
          position: "absolute",
          left: 1160,
          top: 186,
          padding: "16px 30px",
          borderRadius: 12,
          backgroundColor: "#5CE49B",
          color: "#111111",
          fontSize: 36,
          fontWeight: 700,
          opacity: interpolate(frame, [243, 262], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [243, 266], ["24px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Hoje igual ou maior → verde
      </Interactive.Div>

      <Interactive.Div
        name="Regra vermelha"
        style={{
          position: "absolute",
          left: 1160,
          top: 296,
          padding: "16px 30px",
          borderRadius: 12,
          backgroundColor: "#F97070",
          color: "#111111",
          fontSize: 36,
          fontWeight: 700,
          opacity: interpolate(frame, [322, 342], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [322, 344], ["24px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Hoje menor → vermelho
      </Interactive.Div>
    </AbsoluteFill>
  );
};
