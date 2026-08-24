/* ==========================================================================
 * ROTEIRO — VD-014 · Pontuação · "O que mudou nos Últimos Turnos"
 *
 * Este arquivo é a FONTE ÚNICA do texto falado. Ele é lido por dois lados:
 *   - scripts/gerar-locucao.ts  → manda cada `narracao` para a ElevenLabs
 *   - src/UltimosTurnos/UltimosTurnos.tsx → monta a trilha e os tempos
 *
 * O texto que aparece ESCRITO na tela NÃO vem daqui — ele vive em `dados.ts`.
 * Essa separação é de propósito: a locução precisa soar bem falada, e a tela
 * precisa ser curta o bastante para ler de relance. São escritas diferentes.
 *
 * PRONÚNCIA: se a voz errar alguma abreviação ("Mot.", "Ant.", "Km/l"),
 * conserte AQUI escrevendo como se fala (ex.: "Km por litro" em vez de
 * "Km/l") e rode o script de novo. A tela não muda.
 * ========================================================================== */

export type CenaRoteiro = {
  /** Vira o nome do arquivo: `cena-01.mp3`. Não mude depois de gerar. */
  id: string;
  /** Nome que aparece na timeline do Remotion Studio. */
  titulo: string;
  /** Texto enviado para o TTS. */
  narracao: string;
  /**
   * Duração usada ENQUANTO o mp3 não existe, para o vídeo já abrir no Studio.
   * Assim que a locução é gerada, a duração real do áudio manda.
   */
  duracaoFallbackEmSegundos: number;
};

export const ROTEIRO: CenaRoteiro[] = [
  {
    id: "cena-01",
    titulo: "Gancho",
    narracao:
      "Na sua Pontuação, a tabela de Últimos Turnos mudou. Em um minuto você entende o que mudou e como usar isso a seu favor.",
    duracaoFallbackEmSegundos: 6,
  },
  {
    id: "cena-02",
    titulo: "O que já existia",
    narracao:
      "Esta coluna se chamava Km por litro: é a sua média no turno. Ela fica verde quando você alcança a média da linha, a média de todos que rodaram no mesmo dia, turno, carro e linha.",
    duracaoFallbackEmSegundos: 11,
  },
  {
    id: "cena-03",
    titulo: "Só o nome mudou",
    narracao:
      "Agora ela se chama Mot., de motorista. Mudou só o nome. O cálculo e as cores continuam iguais.",
    duracaoFallbackEmSegundos: 8,
  },
  {
    id: "cena-04",
    titulo: "A coluna nova",
    narracao:
      "A novidade é a coluna Ant., de anterior. Ela mostra a sua média da semana passada. Se a sua média de agora for igual ou maior, ela fica verde. Se for menor, fica vermelha.",
    duracaoFallbackEmSegundos: 12,
  },
  {
    id: "cena-05",
    titulo: "Lendo as duas juntas",
    narracao:
      "Repare nesta linha: Mot. verde, Ant. vermelho. Você foi melhor que a média da linha, mas rodou abaixo do que você mesmo fez na semana passada. São duas perguntas diferentes.",
    duracaoFallbackEmSegundos: 13,
  },
  {
    id: "cena-06",
    titulo: "Fecho",
    narracao:
      "E se aparecer zero, é porque ainda não existe dado da semana anterior. A cada turno, duas perguntas: fui melhor que a linha? Fui melhor que eu mesmo?",
    duracaoFallbackEmSegundos: 9,
  },
];

/** Pasta dos mp3 dentro de `public/`. */
export const PASTA_LOCUCAO = "voiceover/UltimosTurnos";

/** Caminho relativo a `public/` — use com `staticFile()`. */
export const caminhoLocucao = (id: string) => `${PASTA_LOCUCAO}/${id}.mp3`;
