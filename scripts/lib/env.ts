/**
 * Acesso centralizado às credenciais de API.
 *
 * Os scripts rodam com o carregador nativo do Node (v22+):
 *     node --env-file=.env --strip-types scripts/<script>.ts
 * Por isso não há dependência de `dotenv` — este módulo só lê `process.env`
 * e valida.
 *
 * Para adicionar um provedor: declare as variáveis no `.env` e no
 * `.env.example`, e acrescente uma função `<provedor>()` aqui.
 */

/** Lê uma variável obrigatória, com mensagem de erro que explica o conserto. */
export const requireEnv = (nome: string): string => {
  const valor = process.env[nome];

  if (!valor || valor.trim() === "") {
    throw new Error(
      [
        `Variável de ambiente ausente: ${nome}`,
        "",
        "Confira se:",
        "  1. o arquivo .env existe na raiz do projeto (cp .env.example .env)",
        `  2. ele contém a linha ${nome}=...`,
        "  3. o script foi chamado com --env-file=.env",
        "",
        "Exemplo:",
        "  node --env-file=.env --strip-types scripts/gerar-locucao.ts",
      ].join("\n"),
    );
  }

  return valor.trim();
};

/** Lê uma variável opcional, caindo num padrão quando não definida. */
export const optionalEnv = (nome: string, padrao: string): string => {
  const valor = process.env[nome];
  return valor && valor.trim() !== "" ? valor.trim() : padrao;
};

export type ConfigElevenLabs = {
  apiKey: string;
  voiceId: string;
  modelId: string;
  /** 1.0 = normal, <1 mais devagar. */
  speed: number;
};

/** Credenciais da ElevenLabs (locução / TTS). */
export const elevenlabs = (): ConfigElevenLabs => ({
  apiKey: requireEnv("ELEVENLABS_API_KEY"),
  voiceId: requireEnv("ELEVENLABS_VOICE_ID"),
  modelId: optionalEnv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2"),
  speed: Number(optionalEnv("ELEVENLABS_SPEED", "1")),
});

export type ConfigHeyGen = {
  apiKey: string;
  avatarId01: string;
  avatarId02: string;
  /** Grupo de photo avatar — a "identidade". */
  avatarGroupId: string;
  /** Voz que vem junto da identidade. */
  voiceId: string;
  /** Faixa aceita pela API: 0.5–2.0. */
  speed: number;
};

/** Credenciais da HeyGen (avatar e voz). */
export const heygen = (): ConfigHeyGen => ({
  apiKey: requireEnv("HEYGEN_API_KEY"),
  avatarId01: requireEnv("HEYGEN_AVATAR_ID_01"),
  avatarId02: requireEnv("HEYGEN_AVATAR_ID_02"),
  avatarGroupId: requireEnv("HEYGEN_AVATAR_GROUP_ID"),
  voiceId: requireEnv("HEYGEN_VOICE_ID"),
  speed: Number(optionalEnv("HEYGEN_SPEED", "1")),
});

/**
 * Fator de esticamento aplicado ao mp3 depois de gerado (ffmpeg `atempo`).
 * 1 = desligado. <1 deixa mais devagar sem alterar o tom da voz.
 *
 * Existe porque o `eleven_v3` ignora o `speed` do voice_settings — verificado
 * na prática: 3 amostras a speed 1.0 deram média 6,45 s e 3 amostras a 0.7
 * deram 6,43 s. No `eleven_multilingual_v2` o `speed` funciona e é preferível,
 * porque reentoa a fala em vez de esticar a onda.
 */
export const atempoLocucao = (): number =>
  Number(optionalEnv("LOCUCAO_ATEMPO", "1"));

export type Provedor = "elevenlabs" | "heygen";

/** Qual serviço gera a locução. */
export const provedorLocucao = (): Provedor => {
  const valor = optionalEnv("LOCUCAO_PROVEDOR", "elevenlabs");

  if (valor !== "elevenlabs" && valor !== "heygen") {
    throw new Error(
      `LOCUCAO_PROVEDOR inválido: "${valor}". Use "elevenlabs" ou "heygen".`,
    );
  }

  return valor;
};

export type ConfigMagnific = {
  apiKey: string;
  webhookSigningSecret: string;
};

/** Credenciais e configurações da Magnific AI (upscaling / imagem). */
export const magnific = (): ConfigMagnific => ({
  apiKey: requireEnv("MAGNIFIC_API_KEY"),
  webhookSigningSecret: optionalEnv("MAGNIFIC_WEBHOOK_SIGNING_SECRET", ""),
});

