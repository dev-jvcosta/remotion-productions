import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { RankSum, RANK_SUM_DATA } from "./RankSum/RankSum";
import {
  UltimosTurnos,
  ULTIMOS_TURNOS_PROPS,
  calculateMetadata as calcularUltimosTurnos,
} from "./UltimosTurnos/UltimosTurnos";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="RankSum"
        component={RankSum}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ data: RANK_SUM_DATA }}
      />
      {/* VD-014 — Pontuação · "O que mudou nos Últimos Turnos".
          `durationInFrames` aqui é só um valor inicial: quem manda é o
          `calculateMetadata`, que mede a locução em `public/voiceover/`. */}
      <Composition
        id="UltimosTurnos"
        component={UltimosTurnos}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={ULTIMOS_TURNOS_PROPS}
        calculateMetadata={calcularUltimosTurnos}
      />
    </>
  );
};
