/**
 * Gera uma imagem com a Magnific e grava em `public/`.
 *
 *   node --env-file=.env --strip-types scripts/gerar-imagem-ia.ts \
 *     --prompt "painel de instrumentos de caminhão ao amanhecer" \
 *     --saida public/imagens/UltimosTurnos/fundo-cena-01.png
 *
 * Sem `--forcar`, um arquivo que já existe é preservado — assim reexecutar o
 * comando não queima crédito à toa, mesma lógica de `gerar-locucao.ts`.
 *
 * Documentação: `.agents/skills/magnific-api/referencias/01-geracao-imagem.md`
 */

import { existsSync } from "node:fs";
import {
  MODELOS_IMAGEM,
  gerarImagem,
  baixarAsset,
  melhorarPrompt,
  type ModeloImagem,
  type Aspecto,
} from "./lib/magnific.ts";
import { lerArgumentos } from "./lib/argumentos.ts";

const ASPECTOS: Aspecto[] = ["16:9", "9:16", "1:1", "4:3", "3:4"];

const ajuda = () => {
  console.log(`
Gera uma imagem com a Magnific API.

  node --env-file=.env --strip-types scripts/gerar-imagem-ia.ts --prompt "..." --saida <arquivo>

Obrigatórios
  --prompt <texto>     Descrição da imagem
  --saida  <arquivo>   Onde gravar (ex.: public/imagens/UltimosTurnos/fundo.png)

Opcionais
  --modelo  <nome>     Padrão: mystic
  --aspecto <valor>    ${ASPECTOS.join(" | ")}   Padrão: 16:9
  --melhorar           Passa o prompt pelo improve-prompt antes de gerar
  --forcar             Regera mesmo se o arquivo já existir

Modelos disponíveis`);

  for (const nome of Object.keys(MODELOS_IMAGEM) as ModeloImagem[]) {
    console.log(`  ${nome.padEnd(18)} ${MODELOS_IMAGEM[nome].rotulo}`);
  }

  console.log(`
Campos específicos de cada modelo (seed, resolution, styling…) não têm flag —
use o cliente em código, passando \`extras\`. Veja a referência 01.
`);
};

const argumentos = lerArgumentos();

if (argumentos.flag("ajuda") || argumentos.flag("help") || process.argv.length <= 2) {
  ajuda();
  process.exit(0);
}

const saida = argumentos.textoObrigatorio("saida");
const modelo = (argumentos.texto("modelo") ?? "mystic") as ModeloImagem;
const aspecto = (argumentos.texto("aspecto") ?? "16:9") as Aspecto;

if (!(modelo in MODELOS_IMAGEM)) {
  throw new Error(
    `Modelo "${modelo}" não existe. Disponíveis: ${Object.keys(MODELOS_IMAGEM).join(", ")}`,
  );
}

if (!ASPECTOS.includes(aspecto)) {
  throw new Error(`Aspecto "${aspecto}" inválido. Use: ${ASPECTOS.join(", ")}`);
}

if (existsSync(saida) && !argumentos.flag("forcar")) {
  console.log(`⏭  ${saida} já existe. Use --forcar para regerar.`);
  process.exit(0);
}

let prompt = argumentos.textoObrigatorio("prompt");

if (argumentos.flag("melhorar")) {
  process.stdout.write("Melhorando o prompt");
  const [melhorado] = await melhorarPrompt({ prompt, tipo: "image", idioma: "pt" });
  prompt = melhorado ?? prompt;
  console.log(`\n\n${prompt}\n`);
}

console.log(`Modelo:  ${modelo} (${aspecto})`);
console.log(`Destino: ${saida}`);
process.stdout.write("Gerando");

const inicio = Date.now();
const urls = await gerarImagem({ prompt, modelo, aspecto });

if (urls.length === 0) {
  throw new Error(
    "A tarefa terminou como COMPLETED mas `generated` veio vazio.\n" +
      "Costuma ser o filtro NSFW barrando o prompt.",
  );
}

const bytes = await baixarAsset(urls[0], saida);

console.log(
  `\n✅ ${saida} — ${Math.round(bytes / 1024)} KB em ${((Date.now() - inicio) / 1000).toFixed(0)}s`,
);

if (urls.length > 1) {
  console.log(`   (o modelo devolveu ${urls.length} imagens; a primeira foi salva)`);
}

console.log(`\nNo componente:  <Img src={staticFile("${saida.replace(/^public\//, "")}")} />`);
