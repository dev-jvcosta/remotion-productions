/**
 * Leitura mínima de argumentos de linha de comando, no formato
 * `--chave valor` e `--flag`.
 *
 * Existe para os scripts da Magnific, que têm mais opções do que o
 * `process.argv.includes("--forcar")` de `gerar-locucao.ts` comporta. Continua
 * sem dependência nova — só `process.argv`.
 */

export type Argumentos = {
  /** Valor de `--chave`, ou `undefined` se não veio. */
  texto: (chave: string) => string | undefined;
  /** Igual ao `texto`, mas explode com uma mensagem útil se faltar. */
  textoObrigatorio: (chave: string) => string;
  /** Valor numérico de `--chave`, validado. */
  numero: (chave: string, padrao: number) => number;
  /** `true` quando `--flag` está presente. */
  flag: (chave: string) => boolean;
};

export const lerArgumentos = (
  argv: string[] = process.argv.slice(2),
): Argumentos => {
  const valores = new Map<string, string>();
  const flags = new Set<string>();

  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];

    if (!item.startsWith("--")) {
      continue;
    }

    const chave = item.slice(2);
    const proximo = argv[i + 1];

    if (proximo === undefined || proximo.startsWith("--")) {
      flags.add(chave);
    } else {
      valores.set(chave, proximo);
      i++;
    }
  }

  const texto = (chave: string) => valores.get(chave);

  return {
    texto,
    textoObrigatorio: (chave) => {
      const valor = texto(chave);

      if (!valor) {
        throw new Error(`Faltou o argumento obrigatório --${chave}`);
      }

      return valor;
    },
    numero: (chave, padrao) => {
      const valor = texto(chave);

      if (valor === undefined) {
        return padrao;
      }

      const numero = Number(valor);

      if (Number.isNaN(numero)) {
        throw new Error(`--${chave} precisa ser um número, veio "${valor}"`);
      }

      return numero;
    },
    flag: (chave) => flags.has(chave),
  };
};
