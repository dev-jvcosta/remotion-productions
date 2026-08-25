import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { loadFont } from "@remotion/google-fonts/Inter";
import { ROTEIRO, caminhoLocucao } from "./roteiro";
import { LINHA_EXEMPLO } from "./dados";
import { TabelaUltimosTurnos } from "./TabelaUltimosTurnos";
import { Cena1Gancho } from "./cenas/Cena1Gancho";
import { Cena2Antes } from "./cenas/Cena2Antes";
import { Cena3Renomeia } from "./cenas/Cena3Renomeia";
import { Cena4NovaColuna } from "./cenas/Cena4NovaColuna";
import { Cena5Exemplo } from "./cenas/Cena5Exemplo";
import { Cena6Fecho } from "./cenas/Cena6Fecho";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

/** Respiro depois da fala de cada cena, para o vídeo não ficar afobado. */
const RESPIRO_EM_SEGUNDOS = 0.35;

/**
 * Cauda extra só na última cena. A locução do fecho acaba exatamente na
 * segunda pergunta; sem esse tempo a mais, a tela de fecho pisca e some.
 */
const CAUDA_FINAL_EM_SEGUNDOS = 1.4;

export type UltimosTurnosProps = {
  /**
   * Duração de cada cena, em frames. Preenchido automaticamente pelo
   * `calculateMetadata` a partir dos mp3 da locução — não edite à mão.
   */
  duracoesEmFrames: number[];
  /**
   * Quais cenas já têm mp3 gerado. Cena sem áudio não monta o `<Audio>`,
   * senão o Remotion acusa asset ausente e o preview quebra.
   */
  locucaoDisponivel: boolean[];
};

export const ULTIMOS_TURNOS_PROPS: UltimosTurnosProps = {
  duracoesEmFrames: [],
  locucaoDisponivel: [],
};

/**
 * Mede a locução e dimensiona o vídeo.
 *
 * Se um mp3 ainda não existe, a cena cai na `duracaoFallbackEmSegundos` do
 * `roteiro.ts`. É o que permite abrir a composição no Studio e renderizar
 * ANTES de gerar a locução — e ela se reajusta sozinha depois.
 */
export const calculateMetadata: CalculateMetadataFunction<
  UltimosTurnosProps
> = async ({ props, defaultProps }) => {
  const fps = 30;

  const medidas = await Promise.all(
    ROTEIRO.map(async (cena) => {
      const respiro = Math.round(RESPIRO_EM_SEGUNDOS * fps);

      try {
        const segundos = await getAudioDurationInSeconds(
          staticFile(caminhoLocucao(cena.id)),
        );
        return { frames: Math.ceil(segundos * fps) + respiro, temAudio: true };
      } catch {
        return {
          frames: Math.round(cena.duracaoFallbackEmSegundos * fps) + respiro,
          temAudio: false,
        };
      }
    }),
  );

  const duracoesEmFrames = medidas.map((m, indice) =>
    indice === medidas.length - 1
      ? m.frames + Math.round(CAUDA_FINAL_EM_SEGUNDOS * fps)
      : m.frames,
  );
  const locucaoDisponivel = medidas.map((m) => m.temAudio);

  return {
    durationInFrames: duracoesEmFrames.reduce((soma, d) => soma + d, 0),
    props: { ...defaultProps, ...props, duracoesEmFrames, locucaoDisponivel },
  };
};

export const UltimosTurnos: React.FC<UltimosTurnosProps> = ({
  duracoesEmFrames,
  locucaoDisponivel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Se o calculateMetadata ainda não rodou, usa o fallback do roteiro.
  const duracoes =
    duracoesEmFrames.length === ROTEIRO.length
      ? duracoesEmFrames
      : ROTEIRO.map((cena, indice) =>
          Math.round(
            (cena.duracaoFallbackEmSegundos +
              RESPIRO_EM_SEGUNDOS +
              (indice === ROTEIRO.length - 1 ? CAUDA_FINAL_EM_SEGUNDOS : 0)) *
              fps,
          ),
        );

  // Frame em que cada cena começa.
  const inicios: number[] = [];
  duracoes.reduce((acumulado, duracao) => {
    inicios.push(acumulado);
    return acumulado + duracao;
  }, 0);

  const [, inicio2, inicio3, inicio4, inicio5, inicio6] = inicios;

  /* ---------------------------------------------------------------------
   * A TABELA
   * Ela é uma só, por baixo de todas as cenas, e se transforma em tela.
   * Os tempos abaixo são relativos ao início de cada cena, então continuam
   * certos mesmo quando a locução muda de tamanho.
   * ------------------------------------------------------------------- */
  const destaqueColuna =
    frame >= inicio2 + 36 && frame < inicio3
      ? "kml"
      : frame >= inicio4 + 109 && frame < inicio5
        ? "ant"
        : null;

  return (
    <AbsoluteFill
      name="Ultimos Turnos"
      style={{ backgroundColor: "#FCFBF5", fontFamily }}
    >
      <TabelaUltimosTurnos
        revelarAnt={interpolate(frame, [inicio4 + 68, inicio4 + 104], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}
        renomearCabecalho={interpolate(
          frame,
          [inicio3 + 64, inicio3 + 91],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        )}
        grupoKmL={interpolate(frame, [inicio4 + 46, inicio4 + 66], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}
        destaqueColuna={destaqueColuna}
        destaqueLinha={
          frame >= inicio5 + 25 && frame < inicio6 ? LINHA_EXEMPLO : null
        }
        opacidade={interpolate(
          frame,
          [inicio2, inicio2 + 16, inicio6 - 8, inicio6 + 20],
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
        )}
      />

      {/* ------------------------------------------------------------------
       * CENAS — cada uma com a sua locução.
       * ---------------------------------------------------------------- */}
      <Sequence
        name="Cena 1 - Gancho"
        from={inicios[0]}
        durationInFrames={duracoes[0]}
      >
        <Locucao id={ROTEIRO[0].id} disponivel={locucaoDisponivel[0]} />
        <Cena1Gancho />
      </Sequence>

      <Sequence
        name="Cena 2 - Antes"
        from={inicios[1]}
        durationInFrames={duracoes[1]}
      >
        <Locucao id={ROTEIRO[1].id} disponivel={locucaoDisponivel[1]} />
        <Cena2Antes />
      </Sequence>

      <Sequence
        name="Cena 3 - Renomeia"
        from={inicios[2]}
        durationInFrames={duracoes[2]}
      >
        <Locucao id={ROTEIRO[2].id} disponivel={locucaoDisponivel[2]} />
        <Cena3Renomeia />
      </Sequence>

      <Sequence
        name="Cena 4 - Coluna nova"
        from={inicios[3]}
        durationInFrames={duracoes[3]}
      >
        <Locucao id={ROTEIRO[3].id} disponivel={locucaoDisponivel[3]} />
        <Cena4NovaColuna />
      </Sequence>

      <Sequence
        name="Cena 5 - Exemplo"
        from={inicios[4]}
        durationInFrames={duracoes[4]}
      >
        <Locucao id={ROTEIRO[4].id} disponivel={locucaoDisponivel[4]} />
        <Cena5Exemplo />
      </Sequence>

      <Sequence
        name="Cena 6 - Fecho"
        from={inicios[5]}
        durationInFrames={duracoes[5]}
      >
        <Locucao id={ROTEIRO[5].id} disponivel={locucaoDisponivel[5]} />
        <Cena6Fecho />
      </Sequence>
    </AbsoluteFill>
  );
};

/**
 * A locução de uma cena.
 *
 * `disponivel` vem do `calculateMetadata`, que já tentou medir cada mp3. Sem
 * essa guarda, uma cena ainda não gerada faria o Remotion acusar asset
 * ausente e derrubaria o preview inteiro.
 */
const Locucao: React.FC<{ id: string; disponivel: boolean }> = ({
  id,
  disponivel,
}) => {
  if (!disponivel) {
    return null;
  }

  return <Audio name="Locucao" src={staticFile(caminhoLocucao(id))} />;
};
