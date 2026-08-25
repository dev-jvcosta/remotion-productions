import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* Cena 6 — Fecho.
 * A tabela sai e ficam só as duas perguntas, em tela cheia. O fecho é
 * acionável de propósito: o motorista leva duas perguntas para o próximo
 * turno, não um "procure seu supervisor". */
export const Cena6Fecho: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Cena 6 - Fecho"
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
        name="Pergunta 1"
        style={{
          position: "absolute",
          left: 0,
          top: 372,
          width: 1920,
          textAlign: "center",
          color: "#111111",
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: -2,
          opacity: interpolate(frame, [58, 76], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [58, 78], ["0px 28px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Fui melhor que a linha?
      </Interactive.Div>

      <Interactive.Div
        name="Regua amarela"
        style={{
          position: "absolute",
          left: 860,
          top: 534,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#FDCA00",
          width: interpolate(frame, [74, 92], [0, 200], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />

      <Interactive.Div
        name="Pergunta 2"
        style={{
          position: "absolute",
          left: 0,
          top: 582,
          width: 1920,
          textAlign: "center",
          color: "#111111",
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: -2,
          opacity: interpolate(frame, [104, 122], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [104, 124], ["0px 28px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Fui melhor que eu mesmo na semana Anterior?
      </Interactive.Div>

    </AbsoluteFill>
  );
};
