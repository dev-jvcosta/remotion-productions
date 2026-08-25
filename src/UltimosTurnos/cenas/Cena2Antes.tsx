import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* Cena 2 — O que já existia.
 * Recapitula a coluna Km/l ANTES de mexer em qualquer nome. Sem essa base, a
 * cena 3 vira "mudaram a conta" na cabeça do motorista. */
export const Cena2Antes: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Cena 2 - Antes"
      style={{
        opacity: interpolate(
          frame,
          [0, 10, durationInFrames - 10, durationInFrames - 1],
          [0, 1, 1, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
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
          position: 'absolute',
          left: 161,
          top: 126,
          color: '#111111',
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 4.8,
          opacity: interpolate(frame, [4, 16], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        COMO ERA
        <Interactive.Div
          name="Traco do eyebrow"
          style={{
            position: 'absolute',
            left: 0,
            top: 46,
            height: 5,
            borderRadius: 3,
            backgroundColor: '#FDCA00',
            width: interpolate(frame, [10, 24], ['0%', '100%'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Titulo"
        style={{
          position: 'absolute',
          left: 161,
          top: 200,
          color: '#111111',
          fontSize: 82,
          fontWeight: 800,
          letterSpacing: -1.6,
          opacity: interpolate(frame, [10, 24], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [10, 26], ['0px 24px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <span style={{ color: '#ffcc00' }}>Km/l</span> = sua média na linha e
        turno.
      </Interactive.Div>

      <Interactive.Div
        name="Subtitulo"
        style={{
          position: 'absolute',
          left: 161,
          top: 344,
          color: '#111111',
          fontSize: 40,
          fontWeight: 500,
          opacity: interpolate(frame, [172, 195], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Fica verde quando você alcança ou supera a média da linha geral.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
