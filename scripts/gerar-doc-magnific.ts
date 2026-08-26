/**
 * Regenera `.agents/skills/magnific-api/referencias/catalogo-endpoints.md` a
 * partir do spec OpenAPI oficial da Magnific.
 *
 *   node --strip-types scripts/gerar-doc-magnific.ts
 *
 * Não precisa de chave de API: o spec é público.
 *
 * Por que existe: a Magnific publica modelos novos toda semana (só de vídeo são
 * mais de cem endpoints). Escrever isso à mão envelhece em dias. As referências
 * temáticas ao lado do catálogo explicam QUANDO usar cada família; este arquivo
 * gerado responde QUAIS endpoints existem e o que cada um exige.
 *
 * Depende do `npx js-yaml` para converter o spec — mesma estratégia do ffmpeg
 * em `gerar-locucao.ts`: ferramenta externa em vez de dependência no
 * package.json.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  URL_SPEC,
  baixarSpec,
  propriedades,
  requeridos,
  type Operacao,
  type Spec,
} from "./lib/openapi.ts";

const DESTINO = join(
  process.cwd(),
  ".agents/skills/magnific-api/referencias/catalogo-endpoints.md",
);

/**
 * Famílias no escopo da skill, na ordem em que aparecem no catálogo.
 * Fora daqui ficam Analytics, Audit Logs e vozes clonadas (Business/Enterprise).
 */
const FAMILIAS: { titulo: string; padrao: RegExp }[] = [
  { titulo: "Geração de Imagem", padrao: /^\/v1\/ai\/(mystic|text-to-image\/(?!.*-edit))/ },
  {
    titulo: "Edição de Imagem",
    padrao:
      /^\/v1\/ai\/(text-to-image\/.*-edit|ideogram-image-edit|image-relight|image-style-transfer|image-change-camera|image-expand|beta\/remove-background|skin-enhancer|image-upscaler)/,
  },
  { titulo: "Geração de Ícones", padrao: /^\/v1\/ai\/text-to-icon/ },
  { titulo: "Classificador de Imagem IA", padrao: /^\/v1\/ai\/classifier/ },
  {
    titulo: "Conteúdo de Stock",
    padrao: /^\/v1\/(resources|icons|videos|music|sound-effects)(\/|$)/,
  },
  { titulo: "Sincronização Labial", padrao: /^\/v1\/ai\/lip-sync/ },
  { titulo: "Imagem para Prompt", padrao: /^\/v1\/ai\/image-to-prompt/ },
  { titulo: "Melhoria de Prompt", padrao: /^\/v1\/ai\/improve-prompt/ },
  { titulo: "Fluxos", padrao: /^\/v1\/ai\/(flows|me\/flows)/ },
  {
    titulo: "Geração de Áudio",
    padrao: /^\/v1\/ai\/(music-generation|sound-effects|voiceover|audio-isolation)/,
  },
  {
    titulo: "Geração de Vídeo",
    padrao:
      /^\/v1\/ai\/(text-to-video|image-to-video|reference-to-video|video|video-edit|video-upscaler)/,
  },
  { titulo: "Upload de Arquivos", padrao: /^\/v1\/ai\/uploads/ },
];

type Campos = { obrigatorios: string[]; opcionais: string[] };

/** Separa os campos do corpo entre obrigatórios e opcionais. */
const camposDoCorpo = (spec: Spec, operacao: Operacao): Campos => {
  const schema = operacao.requestBody?.content?.["application/json"]?.schema;
  const achatado = propriedades(spec, schema);
  const exigidos = requeridos(spec, schema);

  const obrigatorios: string[] = [];
  const opcionais: string[] = [];

  for (const nome of Object.keys(achatado)) {
    // O webhook_url existe em quase todo endpoint e nunca é a informação
    // interessante numa tabela — a exceção (ícones) é obrigatória e aparece.
    if (nome === "webhook_url" && !exigidos.has(nome)) {
      continue;
    }

    (exigidos.has(nome) ? obrigatorios : opcionais).push(nome);
  }

  return { obrigatorios, opcionais };
};

const escapar = (texto: string) => texto.replace(/\|/g, "\\|");

const gerar = (spec: Spec): string => {
  const caminhos = Object.keys(spec.paths).sort();
  const usados = new Set<string>();
  const linhas: string[] = [];

  linhas.push("# 📇 Catálogo de Endpoints da Magnific API");
  linhas.push("");
  linhas.push(
    "> ⚠️ **Arquivo gerado — não edite à mão.** Regenere com:",
    "> `node --strip-types scripts/gerar-doc-magnific.ts`",
  );
  linhas.push("");
  linhas.push(
    "Fonte: o spec OpenAPI oficial em",
    `\`${URL_SPEC}\`.`,
  );
  linhas.push("");
  linhas.push(
    "Este catálogo responde **quais endpoints existem e o que cada um exige**.",
    "Para saber **quando usar cada família**, leia a referência temática correspondente.",
  );
  linhas.push("");
  linhas.push(
    "Todo `POST` de IA é assíncrono: devolve `task_id` e você consulta",
    "`GET <mesmo caminho>/{task-id}` até `status: COMPLETED`. As rotas de consulta",
    "estão omitidas da tabela para não triplicar o tamanho — a única exceção ao",
    "padrão é Fluxos, documentada em [09-fluxos.md](./09-fluxos.md).",
  );
  linhas.push("");

  for (const familia of FAMILIAS) {
    const daFamilia = caminhos.filter(
      (caminho) => familia.padrao.test(caminho) && !usados.has(caminho),
    );

    const linhasTabela: string[] = [];

    for (const caminho of daFamilia) {
      usados.add(caminho);

      for (const metodo of ["post", "get", "put", "delete"]) {
        const operacao = spec.paths[caminho][metodo];

        if (!operacao) {
          continue;
        }

        // Rotas de consulta de tarefa: previsíveis, omitidas de propósito.
        if (metodo === "get" && caminho.includes("{task-id}")) {
          continue;
        }

        if (metodo === "get" && /^\/v1\/ai\/.+$/.test(caminho) && !operacao.requestBody) {
          const ehListagemDeTarefas = /Get the status of all|List tasks/i.test(
            `${operacao.summary ?? ""} ${operacao.description ?? ""}`,
          );

          if (ehListagemDeTarefas) {
            continue;
          }
        }

        const { obrigatorios, opcionais } = camposDoCorpo(spec, operacao);

        const formatar = (nomes: string[]) =>
          nomes.length === 0
            ? "—"
            : nomes.map((nome) => `\`${nome}\``).join(", ");

        linhasTabela.push(
          `| \`${metodo.toUpperCase()} ${caminho}\` | ${escapar(
            operacao.summary ?? "",
          )} | ${formatar(obrigatorios)} | ${formatar(opcionais.slice(0, 8))}${
            opcionais.length > 8 ? ` +${opcionais.length - 8}` : ""
          } |`,
        );
      }
    }

    if (linhasTabela.length === 0) {
      continue;
    }

    linhas.push(`## ${familia.titulo}`);
    linhas.push("");
    linhas.push(`${linhasTabela.length} endpoint(s).`);
    linhas.push("");
    linhas.push("| Endpoint | Resumo | Obrigatórios | Opcionais |");
    linhas.push("|---|---|---|---|");
    linhas.push(...linhasTabela);
    linhas.push("");
  }

  return `${linhas.join("\n")}\n`;
};

const spec = baixarSpec();
const markdown = gerar(spec);

mkdirSync(join(DESTINO, ".."), { recursive: true });
writeFileSync(DESTINO, markdown);

console.log(
  `\n✅ ${DESTINO}\n   ${markdown.split("\n").length} linhas, ${Object.keys(spec.paths).length} paths no spec.`,
);
