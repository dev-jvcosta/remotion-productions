/**
 * Confere o catálogo de modelos de `scripts/lib/magnific.ts` contra o spec
 * OpenAPI oficial da Magnific.
 *
 *   node --strip-types scripts/conferir-magnific.ts
 *
 * Não precisa de chave de API e não gasta crédito: só lê o spec público.
 *
 * Por que existe: `MODELOS_IMAGEM` e `MODELOS_VIDEO` codificam, para cada
 * modelo, o nome do campo de enquadramento, o valor de enum aceito, o nome do
 * campo da imagem e o tipo da duração — e nada disso é padronizado na API. Um
 * `image` que na verdade é `image_url`, ou um `duration` numérico onde o modelo
 * quer string, só apareceria como 400 depois de minutos de espera e crédito
 * gasto. Este script pega isso em segundos.
 *
 * Rode depois de acrescentar um modelo ao catálogo, e de tempos em tempos —
 * a Magnific publica modelos novos com frequência.
 */

import {
  MODELOS_IMAGEM,
  MODELOS_VIDEO,
  type Aspecto,
  type ModeloImagemDef,
  type ModeloVideoDef,
} from "./lib/magnific.ts";
import { baixarSpec, resolver, corpoDoPost, type Spec, type Schema } from "./lib/openapi.ts";

const ASPECTOS: Aspecto[] = ["16:9", "9:16", "1:1", "4:3", "3:4"];
const DURACOES_DE_TESTE = [1, 5, 8, 15, 30];

const problemas: string[] = [];
const falhar = (mensagem: string) => {
  problemas.push(mensagem);
  console.log(`  ❌ ${mensagem}`);
};

/** Confere se um par campo/valor cabe no schema do corpo. */
const conferirCampo = (
  spec: Spec,
  corpo: Record<string, Schema>,
  modelo: string,
  contexto: string,
  campo: string,
  valor: unknown,
): boolean => {
  const esperado = resolver(spec, corpo[campo]);

  if (!esperado) {
    falhar(`${modelo}: o campo "${campo}" não existe no corpo de ${contexto}`);
    return false;
  }

  if (esperado.enum && !esperado.enum.includes(valor as never)) {
    falhar(
      `${modelo}: ${campo}=${JSON.stringify(valor)} fora do enum aceito em ${contexto}`,
    );
    return false;
  }

  const tipoEsperado = esperado.type === "string" ? "string" : "number";

  if (
    (esperado.type === "string" || esperado.type === "integer" || esperado.type === "number") &&
    typeof valor !== tipoEsperado
  ) {
    falhar(
      `${modelo}: ${campo} devia ser ${esperado.type}, o cliente manda ${typeof valor}`,
    );
    return false;
  }

  if (typeof valor === "number") {
    if (esperado.minimum !== undefined && valor < esperado.minimum) {
      falhar(`${modelo}: ${campo}=${valor} abaixo do mínimo ${esperado.minimum}`);
      return false;
    }

    if (esperado.maximum !== undefined && valor > esperado.maximum) {
      falhar(`${modelo}: ${campo}=${valor} acima do máximo ${esperado.maximum}`);
      return false;
    }
  }

  return true;
};

const spec = baixarSpec();

console.log("\n── MODELOS_IMAGEM ──");

for (const [nome, definicao] of Object.entries<ModeloImagemDef>(MODELOS_IMAGEM)) {
  const corpo = corpoDoPost(spec, definicao.caminho);

  if (!corpo) {
    falhar(`${nome}: a rota ${definicao.caminho} não existe no spec`);
    continue;
  }

  let ok = true;

  for (const aspecto of ASPECTOS) {
    let saida: Record<string, unknown>;

    try {
      saida = definicao.aspecto(aspecto);
    } catch {
      continue; // recusa explícita do cliente — é o comportamento desejado
    }

    for (const [campo, valor] of Object.entries(saida)) {
      // `image_size` como objeto {width,height} não tem enum para conferir.
      if (typeof valor === "object") {
        if (!(campo in corpo)) {
          falhar(`${nome}: o campo "${campo}" não existe no corpo`);
          ok = false;
        }
        continue;
      }

      if (!conferirCampo(spec, corpo, nome, definicao.caminho, campo, valor)) {
        ok = false;
      }
    }
  }

  if (ok) {
    console.log(`  ✅ ${nome}`);
  }
}

console.log("\n── MODELOS_VIDEO ──");

for (const [nome, definicao] of Object.entries<ModeloVideoDef>(MODELOS_VIDEO)) {
  let ok = true;

  const texto = definicao.caminhoTexto
    ? corpoDoPost(spec, definicao.caminhoTexto)
    : null;
  const imagem = definicao.caminhoImagem
    ? corpoDoPost(spec, definicao.caminhoImagem)
    : null;

  if (definicao.caminhoTexto && !texto) {
    falhar(`${nome}: a rota ${definicao.caminhoTexto} não existe no spec`);
    ok = false;
  }

  if (definicao.caminhoImagem && !imagem) {
    falhar(`${nome}: a rota ${definicao.caminhoImagem} não existe no spec`);
    ok = false;
  }

  if (imagem) {
    const campo = definicao.campoImagem ?? "image";

    if (!(campo in imagem)) {
      const candidatos = Object.keys(imagem).filter((c) => /image|video/.test(c));
      falhar(
        `${nome}: campoImagem "${campo}" não existe no imagem→vídeo. Candidatos: ${candidatos.join(", ")}`,
      );
      ok = false;
    }

    const specTemAspecto = "aspect_ratio" in imagem;

    if (Boolean(definicao.aspectoNaImagem) !== specTemAspecto) {
      falhar(
        `${nome}: aspectoNaImagem=${Boolean(definicao.aspectoNaImagem)}, mas o imagem→vídeo ${
          specTemAspecto ? "aceita" : "não aceita"
        } aspect_ratio`,
      );
      ok = false;
    }
  }

  if (texto) {
    for (const aspecto of ASPECTOS) {
      let saida: Record<string, unknown>;

      try {
        saida = definicao.aspecto(aspecto);
      } catch {
        continue;
      }

      for (const [campo, valor] of Object.entries(saida)) {
        if (!conferirCampo(spec, texto, nome, "texto→vídeo", campo, valor)) {
          ok = false;
        }
      }
    }

    for (const segundos of DURACOES_DE_TESTE) {
      for (const [campo, valor] of Object.entries(definicao.duracao(segundos))) {
        if (
          !conferirCampo(spec, texto, nome, `texto→vídeo (${segundos}s)`, campo, valor)
        ) {
          ok = false;
        }
      }
    }
  }

  if (ok) {
    console.log(`  ✅ ${nome}`);
  }
}

if (problemas.length > 0) {
  console.log(`\n❌ ${problemas.length} problema(s). Ajuste o catálogo em scripts/lib/magnific.ts.`);
  process.exit(1);
}

console.log("\n✅ O catálogo do cliente está consistente com o spec da Magnific.");
