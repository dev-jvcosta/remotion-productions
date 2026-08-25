import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* Cena 5 — Lendo as duas juntas. É o coração do vídeo.
 *
 * A linha 20/08 é o melhor material de ensino que existe nesta tela: Mot.
 * VERDE e Ant. VERMELHO ao mesmo tempo. Ensinar pelo caso fácil (tudo verde)
 * deixa o motorista com a regra errada na cabeça — "verde = bom, vermelho =
 * ruim". Ensinar pelo caso difícil obriga a separar as duas referências:
 * a linha (os colegas) e você mesmo na semana passada.
 *
 * As outras linhas apagam para 0,22 na tabela; aqui em cima ficam as duas
 * etiquetas, cada uma alinhada com a coluna que ela explica. */
export const Cena5Exemplo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Cena 5 - Exemplo"
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
        A LEITURA QUE IMPORTA

        <Interactive.Div
          name="Traco do eyebrow"
          style={{
            position: "absolute",
            left: 0,
            top: 46,
            height: 5,
            borderRadius: 3,
            backgroundColor: "#FDCA00",
            width: interpolate(frame, [10, 24], ["0%", "100%"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
      </Interactive.Div>


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
        São duas perguntas diferentes
      </Interactive.Div>

      {/* Etiqueta da coluna Mot. — alinhada com a coluna na tabela. */}
      <Interactive.Div
        name="Etiqueta Mot"
        style={{
          position: "absolute",
          left: 700,
          top: 352,
          width: 280,
          textAlign: "center",
          padding: "12px 0px",
          borderRadius: 12,
          backgroundColor: "#5CE49B",
          color: "#111111",
          fontSize: 26,
          fontWeight: 700,
          whiteSpace: "nowrap",
          opacity: interpolate(frame, [161, 183], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [161, 186], ["0px -18px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        melhor que a linha ✓
      </Interactive.Div>

      {/* Etiqueta da coluna Ant. */}
      <Interactive.Div
        name="Etiqueta Ant"
        style={{
          position: "absolute",
          left: 992,
          top: 352,
          width: 320,
          textAlign: "center",
          padding: "12px 0px",
          borderRadius: 12,
          backgroundColor: "#F97070",
          color: "#111111",
          fontSize: 26,
          fontWeight: 700,
          whiteSpace: "nowrap",
          opacity: interpolate(frame, [242, 264], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [242, 267], ["0px -18px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        abaixo de você mesmo ✗
      </Interactive.Div>
    </AbsoluteFill>
  );
};
