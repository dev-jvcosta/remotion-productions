/**
 * Gera um vídeo com a Magnific e grava em `public/`.
 *
 *   # texto → vídeo
 *   node --env-file=.env --strip-types scripts/gerar-video-ia.ts \
 *     --prompt "estrada de serra vista de cima, câmera avançando devagar" \
 *     --duracao 6 --saida public/videos/UltimosTurnos/broll-serra.mp4
 *
 *   # imagem → vídeo (o upload da imagem local é automático)
 *   node --env-file=.env --strip-types scripts/gerar-video-ia.ts \
 *     --prompt "leve movimento de câmera para a direita" \
 *     --imagem public/imagens/UltimosTurnos/cena-01.png \
 *     --saida public/videos/UltimosTurnos/cena-01-animada.mp4
 *
 * Documentação: `.agents/skills/magnific-api/referencias/11-video.md`
 */

import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  MODELOS_VIDEO,
  gerarVideo,
  baixarAsset,
  enviarArquivo,
  melhorarPrompt,
  type ModeloVideo,
  type Aspecto,
} from "./lib/magnific.ts";
import { lerArgumentos } from "./lib/argumentos.ts";

const ASPECTOS: Aspecto[] = ["16:9", "9:16", "1:1", "4:3", "3:4"];

const ajuda = () => {
  console.log(`
Gera um vídeo com a Magnific API.

  node --env-file=.env --strip-types scripts/gerar-video-ia.ts --prompt "..." --saida <arquivo>

Obrigatórios
  --prompt <texto>     Descrição do vídeo
  --saida  <arquivo>   Onde gravar (ex.: public/videos/UltimosTurnos/broll.mp4)

Opcionais
  --imagem  <arquivo>  Primeiro quadro. Com ele vira imagem→vídeo; o upload é automático
  --modelo  <nome>     Padrão: kling-v3-turbo-720p
  --aspecto <valor>    ${ASPECTOS.join(" | ")}   Padrão: 16:9 (ignorado com --imagem)
  --duracao <segundos> Padrão: 5. É ajustado ao que o modelo aceita
  --melhorar           Passa o prompt pelo improve-prompt (type: video) antes de gerar
  --forcar             Regera mesmo se o arquivo já existir

Modelos disponíveis`);

  for (const nome of Object.keys(MODELOS_VIDEO) as ModeloVideo[]) {
    console.log(`  ${nome.padEnd(22)} ${MODELOS_VIDEO[nome].rotulo}`);
  }

  console.log(`
Vídeo é o item mais caro da API e leva minutos. Gere um exemplar antes de
qualquer lote, e prefira --melhorar: melhorar o prompt custa quase nada e muda
muito o resultado.
`);
};

const argumentos = lerArgumentos();

if (argumentos.flag("ajuda") || argumentos.flag("help") || process.argv.length <= 2) {
  ajuda();
  process.exit(0);
}

const saida = argumentos.textoObrigatorio("saida");
const modelo = (argumentos.texto("modelo") ?? "kling-v3-turbo-720p") as ModeloVideo;
const aspecto = (argumentos.texto("aspecto") ?? "16:9") as Aspecto;
const duracaoEmSegundos = argumentos.numero("duracao", 5);
const imagemLocal = argumentos.texto("imagem");

if (!(modelo in MODELOS_VIDEO)) {
  throw new Error(
    `Modelo "${modelo}" não existe. Disponíveis: ${Object.keys(MODELOS_VIDEO).join(", ")}`,
  );
}

if (!ASPECTOS.includes(aspecto)) {
  throw new Error(`Aspecto "${aspecto}" inválido. Use: ${ASPECTOS.join(", ")}`);
}

if (existsSync(saida) && !argumentos.flag("forcar")) {
  console.log(`⏭  ${saida} já existe. Use --forcar para regerar.`);
  process.exit(0);
}

if (imagemLocal && !existsSync(imagemLocal)) {
  throw new Error(`Imagem não encontrada: ${imagemLocal}`);
}

let prompt = argumentos.textoObrigatorio("prompt");

if (argumentos.flag("melhorar")) {
  process.stdout.write("Melhorando o prompt");
  const [melhorado] = await melhorarPrompt({ prompt, tipo: "video", idioma: "pt" });
  prompt = melhorado ?? prompt;
  console.log(`\n\n${prompt}\n`);
}

let imagemUrl: string | undefined;

if (imagemLocal) {
  process.stdout.write(`Enviando ${imagemLocal}... `);
  imagemUrl = await enviarArquivo(imagemLocal);
  console.log("ok");
}

console.log(`Modelo:  ${modelo}`);
console.log(`Modo:    ${imagemUrl ? "imagem → vídeo" : "texto → vídeo"}`);
console.log(`Duração: ~${duracaoEmSegundos}s${imagemUrl ? "" : ` (${aspecto})`}`);
console.log(`Destino: ${saida}`);
process.stdout.write("Gerando (leva minutos)");

const inicio = Date.now();
const urls = await gerarVideo({
  prompt,
  modelo,
  aspecto,
  duracaoEmSegundos,
  imagemUrl,
});

if (urls.length === 0) {
  throw new Error(
    "A tarefa terminou como COMPLETED mas `generated` veio vazio.\n" +
      "Costuma ser o filtro de conteúdo barrando o prompt.",
  );
}

const bytes = await baixarAsset(urls[0], saida);

console.log(
  `\n✅ ${saida} — ${Math.round(bytes / 1024 / 1024)} MB em ${((Date.now() - inicio) / 1000).toFixed(0)}s`,
);

/**
 * O fps do arquivo importa: a composição roda a 30 fps e um clipe a 25 (padrão
 * do LTX-2) é reamostrado no render, o que treme em movimento de câmera. Melhor
 * descobrir agora do que depois de montar a cena.
 */
try {
  const info = execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=r_frame_rate,width,height:format=duration",
      "-of", "default=noprint_wrappers=1",
      saida,
    ],
    { encoding: "utf8" },
  );

  console.log(`\n${info.trim()}`);
} catch {
  console.log("\n(ffprobe indisponível — não deu para conferir fps e duração)");
}

console.log(
  `\nNo componente:  <OffthreadVideo src={staticFile("${saida.replace(/^public\//, "")}")} />`,
);
