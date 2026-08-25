import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/* Cena 3 — Só o nome mudou.
 * Esta cena existe SOZINHA de propósito. Juntar a renomeação com a coluna nova
 * (cena 4) é a causa número 1 de o motorista concluir que a conta mudou.
 * O selo "MESMO CÁLCULO" é o antídoto, e por isso entra junto com o título. */
export const Cena3Renomeia: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Cena 3 - Renomeia"
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
        MUDANÇA 1 DE 2
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
        <span style={{ color: '#ffcc00' }}>Km/l</span> agora se chama Mot.
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
          opacity: interpolate(frame, [102, 125], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Apenas o nome mudou.
      </Interactive.Div>

      <Interactive.Div
        name="Selo mesmo calculo"
        style={{
          position: 'absolute',
          left: 1298,
          top: 268,
          padding: '20px 38px',
          borderRadius: 999,
          backgroundColor: '#FDCA00',
          color: '#111111',
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: 1.4,
          whiteSpace: 'nowrap',
          rotate: '-3deg',
          scale: interpolate(frame, [156, 187], [0.7, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.spring({ damping: 12 }),
            output: 'perceptual-scale',
          }),
          opacity: interpolate(frame, [156, 176], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        MESMO CÁLCULO
      </Interactive.Div>
    </AbsoluteFill>
  );
};
