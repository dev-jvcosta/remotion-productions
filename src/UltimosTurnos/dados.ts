/* ==========================================================================
 * DADOS — VD-014 · Pontuação · "O que mudou nos Últimos Turnos"
 *
 * É AQUI que você edita para gerar um novo caso: as linhas da tabela e o
 * texto que aparece ESCRITO na tela. O texto FALADO fica em `roteiro.ts`.
 *
 * Os números são numéricos (ponto decimal); a vírgula é aplicada só na hora
 * de exibir. Ex.: 3.03 aparece como "3,03".
 * ========================================================================== */

/** Formata no padrão pt-BR: 3.5 -> "3,50". */
export const fmt = (value: number, decimals: number) =>
  value.toFixed(decimals).replace(".", ",");

export type LinhaTurno = {
  dia: string;
  turno: string;
  carro: string;
  /** Coluna "Mot." (antiga "Km/l"): sua média no turno. */
  mot: number;
  /** Verde quando `mot` >= média da linha. */
  motPositivo: boolean;
  /** Coluna "Ant.": sua média da semana anterior. 0 = ainda sem dado. */
  ant: number;
  /** Verde quando `mot` >= `ant`. */
  antPositivo: boolean;
  giro: number;
  giroPositivo: boolean;
  freio: number;
  freioPositivo: boolean;
  pedal: number;
  pedalPositivo: boolean;
};

/**
 * Linhas do print novo (carro 28526).
 *
 * As MESMAS linhas são usadas do começo ao fim do vídeo — inclusive na cena 2,
 * que mostra a tabela "antiga". É de propósito: assim a única coisa que muda
 * em tela é o que estamos ensinando (o nome da coluna e a coluna nova), e não
 * os dados. O motorista não precisa reencontrar nada a cada corte.
 *
 * A linha 0 (20/08 Man.) é a que a cena 5 destaca: Mot. verde + Ant. vermelho
 * ao mesmo tempo. É o caso que quebra a leitura "verde = bom, vermelho = ruim".
 */
export const LINHAS: LinhaTurno[] = [
  {
    dia: "20/08",
    turno: "Man.",
    carro: "28526",
    mot: 3.03,
    motPositivo: true,
    ant: 3.18,
    antPositivo: false,
    giro: 1,
    giroPositivo: true,
    freio: 2,
    freioPositivo: true,
    pedal: 4,
    pedalPositivo: true,
  },
  {
    dia: "20/08",
    turno: "Mad.",
    carro: "28526",
    mot: 3.9,
    motPositivo: true,
    ant: 4.07,
    antPositivo: false,
    giro: 1,
    giroPositivo: true,
    freio: 3,
    freioPositivo: true,
    pedal: 8,
    pedalPositivo: true,
  },
  {
    dia: "19/08",
    turno: "Man.",
    carro: "28526",
    mot: 3.21,
    motPositivo: true,
    ant: 3.29,
    antPositivo: false,
    giro: 0,
    giroPositivo: true,
    freio: 2,
    freioPositivo: true,
    pedal: 3,
    pedalPositivo: true,
  },
  {
    dia: "19/08",
    turno: "Mad.",
    carro: "28526",
    mot: 3.92,
    motPositivo: true,
    ant: 3.71,
    antPositivo: true,
    giro: 1,
    giroPositivo: true,
    freio: 3,
    freioPositivo: true,
    pedal: 9,
    pedalPositivo: true,
  },
  {
    dia: "18/08",
    turno: "Man.",
    carro: "28526",
    mot: 3.22,
    motPositivo: true,
    ant: 3.00,
    antPositivo: true,
    giro: 0,
    giroPositivo: true,
    freio: 3,
    freioPositivo: true,
    pedal: 3,
    pedalPositivo: true,
  },
];

/** Índice da linha que a cena 5 usa como exemplo (20/08 · Man.). */
export const LINHA_EXEMPLO = 0;

/** Casas decimais das colunas Mot. e Ant. */
export const CASAS_DECIMAIS = 2;
