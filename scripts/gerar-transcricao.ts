/**
 * Transcreve o áudio de um vídeo já renderizado.
 *
 *   node --env-file=.env --strip-types scripts/gerar-transcricao.ts
 *   node --env-file=.env --strip-types scripts/gerar-transcricao.ts out/OutroVideo.mp4
 *
 * Gera em `out/transcrição/`:
 *   <nome>.txt  — texto corrido, para leitura e revisão
 *   <nome>.srt  — legendas com tempo, prontas para o Final Cut ou YouTube
 *
 * Por que transcrever se já temos o texto em `roteiro.ts`? Porque isto lê o
 * que a voz REALMENTE falou, não o que mandamos falar. É assim que se pegam
 * abreviações mal pronunciadas ("Mot.", "Ant.", "Km/l") — o roteiro nunca
 * denunciaria isso.
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { execFileSync } from "node:child_process";
import { requireEnv } from "./lib/env.ts";

/** Sem argumento, pega o render mais recente de `out/` — o padrão fixo apodrecia a cada versão. */
const maisRecente = () => {
  const dir = join(process.cwd(), "out");
  if (!existsSync(dir)) return "";

  const videos = readdirSync(dir)
    .filter((f) => f.endsWith(".mp4"))
    .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);

  return videos.length > 0 ? join("out", videos[0].f) : "";
};

const entrada = process.argv[2] ?? maisRecente();

if (!entrada || !existsSync(entrada)) {
  console.error(`Vídeo não encontrado: ${entrada || "(nenhum .mp4 em out/)"}`);
  console.error("Renderize primeiro: npx remotion render UltimosTurnos out/UltimosTurnos_v4.mp4");
  process.exit(1);
}

const nome = basename(entrada, extname(entrada));
const destino = join(process.cwd(), "out", "transcrição");
mkdirSync(destino, { recursive: true });

// A API aceita o mp4 direto, mas extrair o áudio deixa o upload muito menor.
const audio = join(destino, `${nome}.audio.mp3`);
console.log(`Extraindo áudio de ${entrada}...`);
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", entrada, "-vn", "-acodec", "libmp3lame", "-q:a", "4", audio], { stdio: "pipe" });

console.log("Transcrevendo (ElevenLabs scribe_v1, pt)...");

const form = new FormData();
form.append("model_id", "scribe_v1");
form.append("language_code", "por");
form.append("timestamps_granularity", "word");
form.append("file", new Blob([readFileSync(audio)]), `${nome}.mp3`);

const resposta = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
  method: "POST",
  headers: { "xi-api-key": requireEnv("ELEVENLABS_API_KEY") },
  body: form,
});

if (!resposta.ok) {
  const detalhe = await resposta.text().catch(() => "");
  throw new Error(`ElevenLabs respondeu ${resposta.status} ${resposta.statusText}\n${detalhe}`);
}

type Palavra = { text: string; start: number; end: number; type: string };
const dados = (await resposta.json()) as { text: string; words?: Palavra[] };

/* ---------------------------------------------------------------------------
 * SRT — agrupa as palavras em blocos legíveis.
 * Quebra quando passa de ~42 caracteres, quando a fala pausa mais de 0,6 s ou
 * quando termina uma frase. Legenda de motorista é lida de relance: bloco
 * curto vale mais que bloco cheio.
 * ------------------------------------------------------------------------- */
const PAUSA_LONGA = 0.6;

type Bloco = { inicio: number; fim: number; texto: string };

const palavras = (dados.words ?? []).filter((p) => p.type === "word");

/**
 * Agrupa as palavras em blocos.
 *
 * `limiteCaracteres` é o que separa os dois usos: a legenda quebra curto,
 * porque é lida de relance; o texto de leitura quebra por frase, porque ler
 * um parágrafo picado em pedaços de 42 caracteres é pior que ler a frase.
 */
const agrupar = (limiteCaracteres: number): Bloco[] => {
  const blocos: Bloco[] = [];

  for (const palavra of palavras) {
    const atual = blocos[blocos.length - 1];
    const fimDeFrase = atual ? /[.!?]$/.test(atual.texto) : false;
    const pausou = atual ? palavra.start - atual.fim > PAUSA_LONGA : false;
    const cheio = atual
      ? atual.texto.length + palavra.text.length + 1 > limiteCaracteres
      : false;

    if (!atual || fimDeFrase || pausou || cheio) {
      blocos.push({ inicio: palavra.start, fim: palavra.end, texto: palavra.text });
    } else {
      atual.texto += ` ${palavra.text}`;
      atual.fim = palavra.end;
    }
  }

  return blocos;
};

const blocos = agrupar(42);
const frases = agrupar(Number.POSITIVE_INFINITY);

const carimbo = (segundos: number) => {
  const ms = Math.round(segundos * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, "0")}`;
};

const srt = blocos
  .map((b, i) => `${i + 1}\n${carimbo(b.inicio)} --> ${carimbo(b.fim)}\n${b.texto}\n`)
  .join("\n");

writeFileSync(join(destino, `${nome}.srt`), srt, "utf8");

/* ---------------------------------------------------------------------------
 * TXT — mesmo esqueleto do .srt (bloco + tempo + fala), mas quebrado por frase
 * e com cabeçalho, para revisar o vídeo lendo.
 * ------------------------------------------------------------------------- */
const duracao = Number(
  execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", entrada])
    .toString()
    .trim(),
);

const cabecalho = [
  `TRANSCRIÇÃO — ${nome}`,
  `Vídeo    : ${entrada}`,
  `Duração  : ${carimbo(duracao).slice(0, 8)}`,
  `Blocos   : ${frases.length} falas`,
  `Origem   : ElevenLabs scribe_v1 (pt) — áudio renderizado, não o roteiro`,
  "=".repeat(64),
  "",
].join("\n");

const corpo = frases
  .map(
    (b, i) =>
      `[${String(i + 1).padStart(2, "0")}]  ${carimbo(b.inicio)} --> ${carimbo(b.fim)}\n     ${b.texto}\n`,
  )
  .join("\n");

writeFileSync(join(destino, `${nome}.txt`), `${cabecalho}${corpo}`, "utf8");

console.log(`\n✅ out/transcrição/${nome}.txt  (${frases.length} falas)`);
console.log(`✅ out/transcrição/${nome}.srt  (${blocos.length} blocos)`);
console.log(`   áudio extraído: out/transcrição/${nome}.audio.mp3`);
