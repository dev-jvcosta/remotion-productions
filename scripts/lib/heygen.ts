/**
 * Cliente mínimo da HeyGen para vídeo com avatar.
 *
 * NÃO é usado no VD-014 — a decisão foi entregar o vídeo só com locução,
 * porque o conteúdo é uma tabela e um apresentador no canto disputa atenção
 * exatamente com aquilo que o vídeo está ensinando.
 *
 * Fica pronto para quando um vídeo pedir avatar. Fluxo da API:
 *   1. POST /v2/video/generate  -> devolve video_id
 *   2. GET  /v1/video_status.get?video_id=... -> "processing" até "completed"
 *   3. baixar a URL devolvida no status
 */

import { heygen } from "./env.ts";

export type OpcoesAvatar = {
  /** Texto que o avatar vai falar. */
  texto: string;
  /** Qual avatar usar. Padrão: o ID 01 do .env. */
  avatarId?: string;
  /** Voz da HeyGen. Se omitida, usa a voz padrão do avatar. */
  voiceId?: string;
  width?: number;
  height?: number;
};

/** Dispara a geração e devolve o `video_id` para acompanhamento. */
export const gerarVideoAvatar = async ({
  texto,
  avatarId,
  voiceId,
  width = 1920,
  height = 1080,
}: OpcoesAvatar): Promise<string> => {
  const { apiKey, avatarId01 } = heygen();

  const resposta = await fetch("https://api.heygen.com/v2/video/generate", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: avatarId ?? avatarId01,
            avatar_style: "normal",
          },
          voice: voiceId
            ? { type: "text", input_text: texto, voice_id: voiceId }
            : { type: "text", input_text: texto },
        },
      ],
      dimension: { width, height },
    }),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(
      `HeyGen respondeu ${resposta.status} ${resposta.statusText}\n${detalhe}`,
    );
  }

  const json = (await resposta.json()) as { data?: { video_id?: string } };
  const videoId = json.data?.video_id;

  if (!videoId) {
    throw new Error(
      `HeyGen não devolveu video_id. Resposta: ${JSON.stringify(json)}`,
    );
  }

  return videoId;
};

export type StatusVideo = {
  status: string;
  videoUrl: string | null;
};

/** Consulta o andamento de um vídeo. */
export const consultarStatus = async (
  videoId: string,
): Promise<StatusVideo> => {
  const { apiKey } = heygen();

  const resposta = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
    { headers: { "X-Api-Key": apiKey } },
  );

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(
      `HeyGen respondeu ${resposta.status} ${resposta.statusText}\n${detalhe}`,
    );
  }

  const json = (await resposta.json()) as {
    data?: { status?: string; video_url?: string };
  };

  return {
    status: json.data?.status ?? "desconhecido",
    videoUrl: json.data?.video_url ?? null,
  };
};

/* ==========================================================================
 * TEXT-TO-SPEECH (motor "Starfish", endpoint /v3/voices/speech)
 *
 * Gera SÓ o áudio, sem vídeo, e aceita `speed` de 0.5 a 2.0 — que é
 * exatamente o controle de ritmo que a ElevenLabs não tinha ligado aqui.
 *
 * ⚠️ Exige CRÉDITOS DE API, que na HeyGen são separados dos créditos do
 * Studio. Ter saldo no painel não habilita a API. Confira com:
 *     GET /v2/user/remaining_quota   -> remaining_quota
 * Com quota 0 a chamada volta `insufficient_credit` mesmo com tudo correto.
 * ========================================================================== */

export type OpcoesFalaHeyGen = {
  texto: string;
  /** Sobrescreve o HEYGEN_VOICE_ID do .env. */
  voiceId?: string;
  /** Sobrescreve o HEYGEN_SPEED do .env. Faixa: 0.5–2.0. */
  speed?: number;
};

/** Gera a fala na HeyGen e devolve o MP3 como Buffer. */
export const gerarFalaHeyGen = async ({
  texto,
  voiceId,
  speed,
}: OpcoesFalaHeyGen): Promise<Buffer> => {
  const config = heygen();

  const resposta = await fetch("https://api.heygen.com/v3/voices/speech", {
    method: "POST",
    headers: {
      "X-Api-Key": config.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voice_id: voiceId ?? config.voiceId,
      text: texto,
      speed: speed ?? config.speed,
    }),
  });

  const json = (await resposta.json().catch(() => null)) as {
    data?: { audio_url?: string };
    error?: { code?: string; message?: string };
  } | null;

  if (json?.error) {
    const dica =
      json.error.code === "insufficient_credit"
        ? "\n\nA conta está sem CRÉDITOS DE API da HeyGen (são separados dos créditos do Studio).\nConfira o saldo: GET https://api.heygen.com/v2/user/remaining_quota\nEnquanto isso, use LOCUCAO_PROVEDOR=elevenlabs no .env."
        : "";

    throw new Error(
      `HeyGen recusou a geração de fala: ${json.error.code} — ${json.error.message}${dica}`,
    );
  }

  const audioUrl = json?.data?.audio_url;

  if (!audioUrl) {
    throw new Error(
      `HeyGen não devolveu audio_url. Resposta: ${JSON.stringify(json)}`,
    );
  }

  const audio = await fetch(audioUrl);
  return Buffer.from(await audio.arrayBuffer());
};
