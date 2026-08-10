import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { RankSum, RANK_SUM_DATA } from "./RankSum/RankSum";

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
    </>
  );
};
