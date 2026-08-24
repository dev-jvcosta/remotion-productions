/**
 * Gera um vídeo com avatar na HeyGen e baixa o resultado.
 *
 *   node --env-file=.env --strip-types scripts/gerar-avatar.ts "texto falado"
 *   node --env-file=.env --strip-types scripts/gerar-avatar.ts "texto" --avatar=02
 *
 * NÃO é usado no VD-014. A decisão foi entregar o vídeo só com locução: o
 * conteúdo é uma tabela, e um apresentador no canto disputa atenção
 * exatamente com aquilo que o vídeo está ensinando.
 *
 * Fica aqui pronto para o dia em que um vídeo pedir avatar. O mp4 cai em
 * `public/avatar/` e você referencia com `staticFile()` numa composição.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gerarVideoAvatar, consultarStatus } from "./lib/heygen.ts";
import { heygen } from "./lib/env.ts";

const texto = process.argv[2];

if (!texto || texto.startsWith("--")) {
  console.error(
    'Uso: node --env-file=.env --strip-types scripts/gerar-avatar.ts "texto a falar" [--avatar=01|02]',
  );
  process.exit(1);
}

const querSegundoAvatar = process.argv.includes("--avatar=02");
const { avatarId01, avatarId02 } = heygen();
const avatarId = querSegundoAvatar ? avatarId02 : avatarId01;

console.log(`HeyGen · avatar ${querSegundoAvatar ? "02" : "01"}`);

const videoId = await gerarVideoAvatar({ texto, avatarId });
console.log(`Enfileirado. Acompanhando...`);

const esperar = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let tentativas = 0;

// A HeyGen leva de ~30 s a alguns minutos. 60 tentativas × 10 s = 10 min.
while (tentativas < 60) {
  await esperar(10_000);
  tentativas++;

  const { status, videoUrl } = await consultarStatus(videoId);
  console.log(`  [${tentativas}] ${status}`);

  if (status === "completed" && videoUrl) {
    const destino = join(process.cwd(), "public", "avatar");
    mkdirSync(destino, { recursive: true });

    const arquivo = join(destino, `${videoId}.mp4`);
    const resposta = await fetch(videoUrl);
    writeFileSync(arquivo, Buffer.from(await resposta.arrayBuffer()));

    console.log(`\n✅ public/avatar/${videoId}.mp4`);
    console.log(`   Use com: staticFile("avatar/${videoId}.mp4")`);
    process.exit(0);
  }

  if (status === "failed") {
    console.error("\n❌ A HeyGen reportou falha na geração.");
    process.exit(1);
  }
}

console.error("\n⏱  Tempo esgotado. O vídeo pode ainda estar processando.");
console.error(`   Consulte manualmente o video_id: ${videoId}`);
process.exit(1);
