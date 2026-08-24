import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* Cena 1 — Gancho.
 * A tabela ainda não está em tela: aqui o objetivo é só situar o motorista na
 * seção certa do app ("Pontuação") e prometer o que ele ganha em um minuto.
 *
 * O `opacity` do AbsoluteFill de fora é o fade da cena inteira. Ele usa
 * `durationInFrames`, que dentro de uma <Sequence> vale a duração DAQUELA
 * cena — ou seja, o fade se ajusta sozinho quando a locução muda de tamanho. */
export const Cena1Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Cena 1 - Gancho"
      style={{
        opacity: interpolate(
          frame,
          [0, 8, durationInFrames - 10, durationInFrames - 1],
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
        name="Bolinha do eyebrow"
        style={{
          position: "absolute",
          left: 758,
          top: 352,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "#FDCA00",
          scale: interpolate(frame, [4, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Eyebrow"
        style={{
          position: "absolute",
          left: 798,
          top: 340,
          color: "#111111",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 5.4,
          opacity: interpolate(frame, [5, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        PONTUAÇÃO
      </Interactive.Div>

      <Interactive.Div
        name="Titulo linha 1"
        style={{
          position: "absolute",
          left: 0,
          top: 412,
          width: 1920,
          textAlign: "center",
          color: "#111111",
          fontSize: 132,
          fontWeight: 800,
          letterSpacing: -2.4,
          opacity: interpolate(frame, [16, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [16, 32], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        O que mudou nos
      </Interactive.Div>
      <Interactive.Div
        name="Titulo linha 2"
        style={{
          position: "absolute",
          left: 0,
          top: 556,
          width: 1920,
          textAlign: "center",
          color: "#111111",
          fontSize: 132,
          fontWeight: 800,
          letterSpacing: -2.4,
          opacity: interpolate(frame, [21, 35], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [21, 37], ["0px 30px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Últimos Turnos
      </Interactive.Div>

      <Interactive.Div
        name="Regua amarela"
        style={{
          position: "absolute",
          left: 860,
          top: 768,
          height: 12,
          borderRadius: 6,
          backgroundColor: "#FDCA00",
          width: interpolate(frame, [28, 44], [0, 200], {
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
          left: 0,
          top: 826,
          width: 1920,
          textAlign: "center",
          color: "#111111",
          fontSize: 52,
          fontWeight: 500,
          opacity: interpolate(frame, [116, 135], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Um minuto para entender — e usar a seu favor.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
