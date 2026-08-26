/**
 * Leitura do spec OpenAPI público da Magnific.
 *
 * Compartilhado por `gerar-doc-magnific.ts` (que produz o catálogo) e
 * `conferir-magnific.ts` (que valida o cliente contra o spec). Nenhum dos dois
 * precisa de chave de API — o spec é público.
 *
 * A conversão YAML → JSON sai do `npx js-yaml`, mesma estratégia do ffmpeg em
 * `gerar-locucao.ts`: ferramenta externa em vez de dependência no
 * package.json.
 */

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export const URL_SPEC =
  "https://storage.googleapis.com/fc-freepik-pro-rev1-eu-api-specs/magnific-api-v1-openapi.yaml";

export type Schema = {
  $ref?: string;
  type?: string;
  enum?: unknown[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  properties?: Record<string, Schema>;
  required?: string[];
  allOf?: Schema[];
  items?: Schema;
  description?: string;
};

export type Operacao = {
  summary?: string;
  description?: string;
  requestBody?: { content?: Record<string, { schema?: Schema }> };
};

export type Spec = {
  paths: Record<string, Record<string, Operacao>>;
  components?: Record<string, unknown>;
};

export const baixarSpec = (silencioso = false): Spec => {
  const bruto = join(tmpdir(), "magnific-openapi.yaml");

  if (!silencioso) {
    console.log(`Baixando o spec de ${URL_SPEC}`);
  }

  execFileSync("curl", ["-sSL", "-o", bruto, URL_SPEC], { stdio: "pipe" });

  if (!silencioso) {
    console.log("Convertendo YAML → JSON (npx js-yaml)...");
  }

  const json = execFileSync("npx", ["--yes", "js-yaml", bruto], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  rmSync(bruto, { force: true });

  return JSON.parse(json) as Spec;
};

/** Resolve um `$ref`. Os schemas do spec se referenciam bastante. */
export const resolver = (
  spec: Spec,
  schema: Schema | undefined,
): Schema | undefined => {
  if (!schema) {
    return undefined;
  }

  if (!schema.$ref) {
    return schema;
  }

  const partes = schema.$ref.replace(/^#\//, "").split("/");
  let alvo: unknown = spec;

  for (const parte of partes) {
    alvo = (alvo as Record<string, unknown> | undefined)?.[parte];
  }

  return resolver(spec, alvo as Schema | undefined);
};

/** Achata as propriedades de um schema, atravessando os `allOf`. */
export const propriedades = (
  spec: Spec,
  schema: Schema | undefined,
  profundidade = 0,
): Record<string, Schema> => {
  const resolvido = resolver(spec, schema);

  if (!resolvido || profundidade > 5) {
    return {};
  }

  const saida: Record<string, Schema> = { ...(resolvido.properties ?? {}) };

  for (const parte of resolvido.allOf ?? []) {
    Object.assign(saida, propriedades(spec, parte, profundidade + 1));
  }

  return saida;
};

/**
 * Nomes dos campos obrigatórios, atravessando os `allOf`.
 *
 * Precisa resolver o schema antes de ler `required`: no spec da Magnific o
 * corpo quase sempre chega como `$ref`, e ler `.required` do `$ref` cru devolve
 * `undefined` — o que faz todo campo parecer opcional.
 */
export const requeridos = (
  spec: Spec,
  schema: Schema | undefined,
  profundidade = 0,
): Set<string> => {
  const resolvido = resolver(spec, schema);
  const saida = new Set<string>();

  if (!resolvido || profundidade > 5) {
    return saida;
  }

  for (const nome of resolvido.required ?? []) {
    saida.add(nome);
  }

  for (const parte of resolvido.allOf ?? []) {
    for (const nome of requeridos(spec, parte, profundidade + 1)) {
      saida.add(nome);
    }
  }

  return saida;
};

/** Propriedades do corpo JSON de um `POST`, ou `null` se a rota não existe. */
export const corpoDoPost = (
  spec: Spec,
  caminho: string,
): Record<string, Schema> | null => {
  const operacao = spec.paths[caminho]?.post;

  if (!operacao) {
    return null;
  }

  return propriedades(
    spec,
    operacao.requestBody?.content?.["application/json"]?.schema,
  );
};
