/**
 * Gera a locução do VD-014 com a ElevenLabs.
 *
 *   node --env-file=.env --strip-types scripts/gerar-locucao.ts
 *   node --env-file=.env --strip-types scripts/gerar-locucao.ts --forcar
 *
 * Sem `--forcar`, cenas que já têm mp3 são puladas — você pode reescrever o
 * texto de uma cena só em `roteiro.ts`, apagar aquele mp3 e rodar de novo
 * sem gastar créditos com as outras.
 */

import { mkdirSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { gerarFala } from "./lib/elevenlabs.ts";
import { gerarFalaHeyGen } from "./lib/heygen.ts";
import { provedorLocucao, atempoLocucao } from "./lib/env.ts";
import { ROTEIRO, PASTA_LOCUCAO } from "../src/UltimosTurnos/roteiro.ts";

const forcar = process.argv.includes("--forcar");
const provedor = provedorLocucao();
const atempo = atempoLocucao();

/**
 * Estica o mp3 com ffmpeg sem mexer no tom da voz.
 *
 * Necessário porque o `eleven_v3` ignora o `speed` do voice_settings. Com o
 * `eleven_multilingual_v2`, prefira o `speed` nativo e deixe LOCUCAO_ATEMPO=1:
 * o modelo reentoa a fala, enquanto o atempo só estica a onda.
 */
const esticar = (arquivo: string, fator: number) => {
  const temporario = `${arquivo}.tmp.mp3`;

  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-v", "error", "-i", arquivo, "-filter:a", `atempo=${fator}`, temporario],
      { stdio: "pipe" },
    );
  } catch {
    throw new Error(
      `Falhou ao aplicar atempo=${fator} em ${arquivo}.\n` +
        "Confira se o ffmpeg está instalado e no PATH, ou use LOCUCAO_ATEMPO=1.",
    );
  }

  renameSync(temporario, arquivo);
};
const destino = join(process.cwd(), "public", PASTA_LOCUCAO);

mkdirSync(destino, { recursive: true });

console.log(`Locução VD-014 → public/${PASTA_LOCUCAO}/`);
console.log(`provedor: ${provedor}`);
if (atempo !== 1) {
  console.log(`atempo: ${atempo} (esticando o áudio depois de gerar)`);
}
console.log(`${ROTEIRO.length} cenas${forcar ? " (regerando todas)" : ""}\n`);

let geradas = 0;
let puladas = 0;

for (const cena of ROTEIRO) {
  const arquivo = join(destino, `${cena.id}.mp3`);

  if (!forcar && existsSync(arquivo)) {
    console.log(`  ⏭  ${cena.id}  ${cena.titulo} — já existe`);
    puladas++;
    continue;
  }

  process.stdout.write(`  ⏳ ${cena.id}  ${cena.titulo}...`);

  const audio =
    provedor === "heygen"
      ? await gerarFalaHeyGen({ texto: cena.narracao })
      : await gerarFala({ texto: cena.narracao });
  writeFileSync(arquivo, audio);

  if (atempo !== 1) {
    esticar(arquivo, atempo);
  }

  geradas++;

  console.log(`\r  ✅ ${cena.id}  ${cena.titulo} — ${Math.round(audio.byteLength / 1024)} KB`);
}

console.log(`\n${geradas} gerada(s), ${puladas} pulada(s).`);

if (geradas > 0) {
  console.log(
    "Abra o Studio e confira o sincronismo: npx remotion studio --no-open",
  );
}
