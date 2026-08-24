/**
 * Cliente mínimo da ElevenLabs para text-to-speech.
 *
 * Usa `fetch` nativo — sem SDK, sem dependência nova no package.json.
 * A API devolve o MP3 direto no corpo da resposta.
 */

import { elevenlabs } from "./env.ts";

export type OpcoesFala = {
  /** Texto a ser narrado. */
  texto: string;
  /**
   * 0 = mais expressiva e variável, 1 = mais monótona e previsível.
   * 0.5 é o equilíbrio recomendado para narração instrucional.
   */
  stability?: number;
  /** Quanto a voz gerada se cola ao timbre original. */
  similarityBoost?: number;
  /** Exagero de estilo. Alto demais atrapalha a dicção em pt-BR. */
  style?: number;
  /** Sobrescreve o ELEVENLABS_SPEED do .env. */
  speed?: number;
};

/** Gera a fala e devolve o MP3 como Buffer. */
export const gerarFala = async ({
  texto,
  stability = 0.5,
  similarityBoost = 0.75,
  style = 0.2,
  speed,
}: OpcoesFala): Promise<Buffer> => {
  const config = elevenlabs();
  const { apiKey, voiceId, modelId } = config;

  const resposta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: texto,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          speed: speed ?? config.speed,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(
      `ElevenLabs respondeu ${resposta.status} ${resposta.statusText}\n${detalhe}`,
    );
  }

  return Buffer.from(await resposta.arrayBuffer());
};
