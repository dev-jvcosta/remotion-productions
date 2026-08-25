import { LINHAS, fmt, CASAS_DECIMAIS } from "./dados";

/* ==========================================================================
 * A TABELA "ÚLTIMOS TURNOS"
 *
 * Renderizada UMA vez, em `UltimosTurnos.tsx`, por baixo de todas as cenas.
 * Ela não é trocada entre cenas — ela se TRANSFORMA. É o que faz o motorista
 * não precisar reencontrar as colunas a cada corte.
 *
 * Este componente não usa `useCurrentFrame()`: quem anima é a raiz, que passa
 * os valores já interpolados nas props abaixo. Assim toda a linha do tempo do
 * vídeo fica legível em um arquivo só.
 *
 * NOTA sobre o padrão do repositório: diferente de `RankSum.tsx`, aqui os
 * valores de layout são constantes e as posições são calculadas. São 5 linhas
 * × 8 colunas = 40+ células; transformar cada uma em `Interactive.Div` com
 * estilo literal deixaria a timeline do Studio inutilizável. Os textos que
 * você realmente vai querer ajustar à mão (títulos, balões, etiquetas) estão
 * nas cenas, esses sim como `Interactive.Div` com estilo inline.
 * ========================================================================== */

const VERDE = "#5CE49B";
const VERMELHO = "#F97070";
const LARANJA = "#EFA93C";
const CREME = "#FDF6E8";
const ESCURO = "#262626";
const TEXTO = "#111111";

const L_DIA = 175;
const L_TURNO = 175;
const L_CARRO = 235;
const L_MOT = 230;
const L_ANT = 230;
const L_GIRO = 155;
const L_FREIO = 175;
const L_PEDAL = 175;

const BLOCO_ESCURO = L_DIA + L_TURNO + L_CARRO;
const X_MOT = BLOCO_ESCURO + 18;
const X_ANT = X_MOT + L_MOT + 6;

const GRUPO_H = 52;
const CAB_Y = 60;
const CAB_H = 64;
const LINHAS_Y = 136;
const LINHA_H = 78;
const LINHA_GAP = 8;

export type TabelaProps = {
  /** 0 = coluna "Ant." escondida, 1 = totalmente aberta. */
  revelarAnt: number;
  /** 0 = cabeçalho escrito "Km/l", 1 = escrito "Mot.". */
  renomearCabecalho: number;
  /** 0 = sem o cabeçalho laranja agrupador, 1 = com ele. */
  grupoKmL: number;
  /** Qual coluna fica acesa; as outras escurecem. */
  destaqueColuna: "kml" | "ant" | null;
  /** Qual linha fica acesa; as outras escurecem. `null` = todas iguais. */
  destaqueLinha: number | null;
  /** Opacidade geral, para a tabela entrar e sair. */
  opacidade: number;
};

export const TabelaUltimosTurnos: React.FC<TabelaProps> = ({
  revelarAnt,
  renomearCabecalho,
  grupoKmL,
  destaqueColuna,
  destaqueLinha,
  opacidade,
}) => {
  // Largura da coluna "Ant." enquanto ela entra; empurra o resto para a direita.
  const larguraAnt = L_ANT * revelarAnt;
  const xResto = X_ANT + larguraAnt + 12;
  const xGiro = xResto;
  const xFreio = xGiro + L_GIRO + 6;
  const xPedal = xFreio + L_FREIO + 6;
  const larguraTotal = xPedal + L_PEDAL;

  // A tabela se recentraliza sozinha conforme a coluna nova entra, em vez de
  // ficar torta em metade do vídeo.
  const esquerda = (1920 - larguraTotal) / 2;

  const apagadaColuna = (coluna: "kml" | "ant" | "outra") => {
    if (destaqueColuna === null) return 1;
    if (destaqueColuna === "kml") return coluna === "kml" ? 1 : 0.28;
    return coluna === "ant" ? 1 : 0.28;
  };

  const apagadaLinha = (indice: number) =>
    destaqueLinha === null || destaqueLinha === indice ? 1 : 0.22;

  return (
    <div
      style={{
        position: "absolute",
        left: esquerda,
        top: 424,
        width: larguraTotal,
        height: LINHAS_Y + LINHAS.length * LINHA_H + (LINHAS.length - 1) * LINHA_GAP,
        opacity: opacidade,
      }}
    >
      {/* Cabeçalho laranja agrupando Mot. + Ant. --------------------------- */}
      <div
        style={{
          position: "absolute",
          left: X_MOT,
          top: 0,
          width: L_MOT + 6 + larguraAnt,
          height: GRUPO_H,
          backgroundColor: LARANJA,
          borderRadius: 10,
          opacity: grupoKmL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: TEXTO,
          fontSize: 32,
          fontWeight: 700,
        }}
      >
        Km/l
      </div>

      {/* Faixa creme atrás dos rótulos Mot. / Ant. ------------------------- */}
      <div
        style={{
          position: "absolute",
          left: X_MOT,
          top: CAB_Y,
          width: L_MOT + 6 + larguraAnt,
          height: CAB_H,
          backgroundColor: CREME,
          borderRadius: 10,
          opacity: grupoKmL,
        }}
      />

      {/* Rótulos do cabeçalho --------------------------------------------- */}
      <RotuloCabecalho x={0} largura={L_DIA} texto="Dia" opacidade={apagadaColuna("outra")} />
      <RotuloCabecalho x={L_DIA} largura={L_TURNO} texto="Turno" opacidade={apagadaColuna("outra")} />
      <RotuloCabecalho x={L_DIA + L_TURNO} largura={L_CARRO} texto="Carro" opacidade={apagadaColuna("outra")} />

      {/* "Km/l" e "Mot." ocupam o MESMO lugar e trocam por crossfade: é o que
          mostra que a coluna não mudou de posição nem de conta, só de nome. */}
      <RotuloCabecalho
        x={X_MOT}
        largura={L_MOT}
        texto="Km/l"
        opacidade={(1 - renomearCabecalho) * apagadaColuna("kml")}
      />
      <RotuloCabecalho
        x={X_MOT}
        largura={L_MOT}
        texto="Mot."
        opacidade={renomearCabecalho * apagadaColuna("kml")}
      />

      <div style={{ position: "absolute", left: X_ANT, top: CAB_Y, width: larguraAnt, height: CAB_H, overflow: "hidden" }}>
        <div
          style={{
            width: L_ANT,
            height: CAB_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: TEXTO,
            fontSize: 32,
            fontWeight: 700,
            opacity: apagadaColuna("ant"),
          }}
        >
          Ant.
        </div>
      </div>

      <RotuloCabecalho x={xGiro} largura={L_GIRO} texto="Giro" opacidade={apagadaColuna("outra")} />
      <RotuloCabecalho x={xFreio} largura={L_FREIO} texto="Freio" opacidade={apagadaColuna("outra")} />
      <RotuloCabecalho x={xPedal} largura={L_PEDAL} texto="Pedal" opacidade={apagadaColuna("outra")} />

      {/* Linhas ------------------------------------------------------------ */}
      {LINHAS.map((linha, indice) => {
        const y = LINHAS_Y + indice * (LINHA_H + LINHA_GAP);

        return (
          <div
            key={`${linha.dia}-${linha.turno}`}
            style={{ position: "absolute", left: 0, top: y, width: larguraTotal, height: LINHA_H, opacity: apagadaLinha(indice) }}
          >
            {/* Bloco escuro: Dia / Turno / Carro */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: BLOCO_ESCURO,
                height: LINHA_H,
                backgroundColor: ESCURO,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                color: "#FFFFFF",
                fontSize: 38,
                fontWeight: 700,
                // Apaga junto com as colunas vizinhas quando uma coluna está em
                // destaque — antes o bloco escuro ficava aceso e roubava o olho
                // justamente da coluna que a cena estava ensinando.
                opacity: apagadaColuna("outra"),
              }}
            >
              <span style={{ width: L_DIA, textAlign: "center" }}>{linha.dia}</span>
              <span style={{ width: L_TURNO, textAlign: "center" }}>{linha.turno}</span>
              <span style={{ width: L_CARRO, textAlign: "center" }}>{linha.carro}</span>
            </div>

            <Celula x={X_MOT} largura={L_MOT} positivo={linha.motPositivo} opacidade={apagadaColuna("kml")}>
              {fmt(linha.mot, CASAS_DECIMAIS)}
            </Celula>

            {/* A coluna "Ant." nasce com largura zero e vai abrindo. */}
            <div style={{ position: "absolute", left: X_ANT, top: 0, width: larguraAnt, height: LINHA_H, overflow: "hidden" }}>
              <div
                style={{
                  width: L_ANT,
                  height: LINHA_H,
                  backgroundColor: linha.antPositivo ? VERDE : VERMELHO,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: TEXTO,
                  fontSize: 44,
                  fontWeight: 700,
                  opacity: apagadaColuna("ant"),
                }}
              >
                {fmt(linha.ant, CASAS_DECIMAIS)}
              </div>
            </div>

            <Celula x={xGiro} largura={L_GIRO} positivo={linha.giroPositivo} opacidade={apagadaColuna("outra")}>
              {linha.giro}
            </Celula>
            <Celula x={xFreio} largura={L_FREIO} positivo={linha.freioPositivo} opacidade={apagadaColuna("outra")}>
              {linha.freio}
            </Celula>
            <Celula x={xPedal} largura={L_PEDAL} positivo={linha.pedalPositivo} opacidade={apagadaColuna("outra")}>
              {linha.pedal}
            </Celula>
          </div>
        );
      })}
    </div>
  );
};

const RotuloCabecalho: React.FC<{
  x: number;
  largura: number;
  texto: string;
  opacidade: number;
}> = ({ x, largura, texto, opacidade }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: CAB_Y,
      width: largura,
      height: CAB_H,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: TEXTO,
      fontSize: 32,
      fontWeight: 700,
      opacity: opacidade,
    }}
  >
    {texto}
  </div>
);

const Celula: React.FC<{
  x: number;
  largura: number;
  positivo: boolean;
  opacidade: number;
  children: React.ReactNode;
}> = ({ x, largura, positivo, opacidade, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 0,
      width: largura,
      height: LINHA_H,
      backgroundColor: positivo ? VERDE : VERMELHO,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: TEXTO,
      fontSize: 44,
      fontWeight: 700,
      opacity: opacidade,
    }}
  >
    {children}
  </div>
);
