/**
 * Cliente da Magnific API (https://api.magnific.com).
 *
 * Usa `fetch` nativo — sem SDK, sem dependência nova no package.json, igual ao
 * `elevenlabs.ts`.
 *
 * Duas coisas explicam quase todo o desenho deste arquivo:
 *
 * 1. A autenticação é pelo header `x-magnific-api-key`, NÃO por `Bearer`.
 * 2. Praticamente todo endpoint de IA é assíncrono e uniforme: o POST devolve
 *    `{ data: { task_id, status, generated: [] } }` e você consulta
 *    `GET <mesmo caminho>/{task-id}` até `status === "COMPLETED"`, quando o
 *    array `generated` finalmente traz as URLs do resultado.
 *
 * O resto do arquivo é, em boa medida, o tratamento das exceções a esse
 * padrão — todas verificadas contra o spec OpenAPI oficial:
 *
 *   - Flows fala `workflow_run_identifier` em vez de `task_id`, consulta numa
 *     rota própria e usa status em MINÚSCULAS  →  `executarFluxo`
 *   - O classificador e a remoção de fundo são SÍNCRONOS, sem `task_id`
 *   - Ícones não têm rota de consulta nenhuma: só webhook  →  `gerarIcone`
 *   - `image-style-transfer` responde sem o envelope `data` e chama o status
 *     de `task_status`  →  `normalizarTarefa`
 *   - Cada modelo nomeia enquadramento e duração de um jeito  →  `MODELOS_*`
 *
 * Documentação completa em `.agents/skills/magnific-api/`.
 */

import { createWriteStream, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname } from "node:path";
import { magnific } from "./env.ts";

export const BASE_URL = "https://api.magnific.com";

// ---------------------------------------------------------------------------
// Requisição base
// ---------------------------------------------------------------------------

export type Metodo = "GET" | "POST" | "PUT" | "DELETE";

/**
 * Chamada crua à API, já com a chave injetada e o erro traduzido.
 *
 * A mensagem de erro inclui o corpo da resposta porque a Magnific devolve ali
 * o motivo real (parâmetro fora do range, créditos insuficientes, modelo
 * indisponível) — sem isso, um 400 vira adivinhação.
 */
export const requisicao = async <T>(
  metodo: Metodo,
  caminho: string,
  corpo?: unknown,
  /**
   * `"form"` envia `application/x-www-form-urlencoded`.
   *
   * Existe por causa de um único endpoint: `POST /v1/ai/beta/remove-background`
   * é o **único** dos 354 caminhos do spec que não aceita JSON.
   */
  formato: "json" | "form" = "json",
): Promise<T> => {
  const { apiKey } = magnific();

  const ehForm = formato === "form";

  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    method: metodo,
    headers: {
      "x-magnific-api-key": apiKey,
      "Content-Type": ehForm
        ? "application/x-www-form-urlencoded"
        : "application/json",
      Accept: "application/json",
    },
    body:
      corpo === undefined
        ? undefined
        : ehForm
          ? new URLSearchParams(corpo as Record<string, string>).toString()
          : JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    const detalhe = await resposta.text().catch(() => "");
    throw new Error(
      `Magnific respondeu ${resposta.status} ${resposta.statusText} em ${metodo} ${caminho}\n${detalhe}`,
    );
  }

  return (await resposta.json()) as T;
};

// ---------------------------------------------------------------------------
// Ciclo de tarefas assíncronas
// ---------------------------------------------------------------------------

export type StatusTarefa = "CREATED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export type Tarefa = {
  task_id: string;
  status: StatusTarefa;
  /**
   * URLs do resultado. Vazio enquanto a tarefa não termina.
   *
   * Em `improve-prompt` e `image-to-prompt` este array traz o TEXTO gerado, não
   * uma URL — o nome do campo é o mesmo, o conteúdo não.
   */
  generated: string[];
  /** Um booleano por item de `generated`. Só em endpoints de imagem. */
  has_nsfw?: boolean[];
  /** Motivo da falha, quando a API o fornece. Costuma vir `null`. */
  error?: string | null;
};

type Envelope<T> = { data: T };

/**
 * Aceita as três formas em que a Magnific devolve uma tarefa.
 *
 * O padrão é `{ data: { task_id, status, generated } }`, mas há exceções
 * documentadas no próprio spec:
 *   - `POST /v1/ai/image-style-transfer` devolve os campos no TOPO e chama o
 *     status de `task_status`;
 *   - `POST /v1/ai/beta/text-to-image/reimagine-flux` devolve no topo, com
 *     `status`.
 *
 * Normalizar aqui é mais barato do que espalhar `if` por cada atalho — e
 * evita o `status: undefined` que faria `aguardarTarefa` girar para sempre.
 */
const normalizarTarefa = (resposta: unknown, contexto: string): Tarefa => {
  const bruto = resposta as Record<string, unknown>;
  const corpo = (bruto?.data ?? bruto) as Record<string, unknown>;

  const status = (corpo?.status ?? corpo?.task_status) as
    | StatusTarefa
    | undefined;

  if (!corpo?.task_id || !status) {
    throw new Error(
      `Resposta inesperada de ${contexto}: faltou task_id ou status.\n` +
        `${JSON.stringify(resposta).slice(0, 500)}`,
    );
  }

  return {
    task_id: corpo.task_id as string,
    status,
    generated: (corpo.generated as string[] | undefined) ?? [],
    has_nsfw: corpo.has_nsfw as boolean[] | undefined,
    error: (corpo.error as string | null | undefined) ?? null,
  };
};

/** Dispara a tarefa. Devolve na hora, com `status` normalmente `CREATED`. */
export const criarTarefa = async (
  caminho: string,
  corpo: Record<string, unknown>,
): Promise<Tarefa> => {
  const resposta = await requisicao<Envelope<Tarefa>>("POST", caminho, corpo);
  return normalizarTarefa(resposta, `POST ${caminho}`);
};

/** Consulta uma tarefa já criada. */
export const consultarTarefa = async (
  caminho: string,
  taskId: string,
): Promise<Tarefa> => {
  const resposta = await requisicao<Envelope<Tarefa>>(
    "GET",
    `${caminho}/${taskId}`,
  );
  return normalizarTarefa(resposta, `GET ${caminho}/${taskId}`);
};

const dormir = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

export type OpcoesEspera = {
  /** Desiste depois disso. Vídeo costuma levar minutos; imagem, segundos. */
  timeoutEmSegundos?: number;
  /** Intervalo inicial entre consultas. Cresce até `intervaloMaximo`. */
  intervaloEmSegundos?: number;
  intervaloMaximoEmSegundos?: number;
  /** Imprime o andamento no terminal. */
  silencioso?: boolean;
};

/**
 * Consulta a tarefa até ela terminar.
 *
 * O intervalo cresce (backoff) porque o teto da API é de 300 requisições por
 * minuto por chave: um poll fixo de 1 s em cinco gerações paralelas já chega
 * perto do limite.
 */
export const aguardarTarefa = async (
  caminho: string,
  taskId: string,
  opcoes: OpcoesEspera = {},
): Promise<Tarefa> => {
  const {
    // 900 s por medição, não por chute: uma geração no HyperFlux — anunciado
    // como o Flux mais rápido — levou 318 s num dia de fila. Modelos pesados
    // passam disso.
    timeoutEmSegundos = 900,
    intervaloEmSegundos = 2,
    intervaloMaximoEmSegundos = 15,
    silencioso = false,
  } = opcoes;

  const limite = Date.now() + timeoutEmSegundos * 1000;
  let intervalo = intervaloEmSegundos;

  for (;;) {
    const tarefa = await consultarTarefa(caminho, taskId);

    if (tarefa.status === "COMPLETED") {
      return tarefa;
    }

    if (tarefa.status === "FAILED") {
      throw new Error(
        `Tarefa ${taskId} falhou em ${caminho}.\n` +
          (tarefa.error ??
            "A Magnific costuma devolver `error: null` — confira créditos, o " +
              "prompt (filtro NSFW) e se a URL de entrada continua acessível."),
      );
    }

    if (Date.now() > limite) {
      throw new Error(
        `Tarefa ${taskId} ainda estava em ${tarefa.status} após ${timeoutEmSegundos}s.\n` +
          `Ela não foi cancelada — consulte depois com:\n` +
          `  GET ${BASE_URL}${caminho}/${taskId}`,
      );
    }

    if (!silencioso) {
      process.stdout.write(".");
    }

    await dormir(intervalo * 1000);
    intervalo = Math.min(intervalo * 1.5, intervaloMaximoEmSegundos);
  }
};

/** POST + polling num passo só. É o atalho usado por quase tudo aqui. */
export const executarTarefa = async (
  caminho: string,
  corpo: Record<string, unknown>,
  opcoes: OpcoesEspera = {},
): Promise<Tarefa> => {
  const tarefa = await criarTarefa(caminho, corpo);
  return aguardarTarefa(caminho, tarefa.task_id, opcoes);
};

// ---------------------------------------------------------------------------
// Upload de arquivos locais
// ---------------------------------------------------------------------------

const TIPOS_POR_EXTENSAO: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
};

type RespostaUpload = {
  files: {
    file_id: string;
    upload_url: string;
    headers: Record<string, string>;
    expires_in: number;
    asset_url: string;
    asset_url_expires_in: number;
  }[];
};

/**
 * Envia um arquivo local e devolve a `asset_url` pública.
 *
 * Serve para alimentar qualquer endpoint que peça `image_url`, `video_url`,
 * `audio_url` ou uma imagem de referência.
 *
 * > A `asset_url` expira em ~24 h e o arquivo some em ~7 dias. É área de
 * > passagem, não armazenamento: não guarde essa URL em lugar nenhum.
 */
export const enviarArquivo = async (caminhoLocal: string): Promise<string> => {
  const extensao = extname(caminhoLocal).toLowerCase();
  const contentType = TIPOS_POR_EXTENSAO[extensao];

  if (!contentType) {
    throw new Error(
      `Extensão não suportada pelo upload da Magnific: "${extensao}".\n` +
        `Aceitas: ${Object.keys(TIPOS_POR_EXTENSAO).join(", ")}`,
    );
  }

  const tamanho = statSync(caminhoLocal).size;
  const UM_GIB = 1024 * 1024 * 1024;

  if (tamanho > UM_GIB) {
    throw new Error(
      `${caminhoLocal} tem ${Math.round(tamanho / 1024 / 1024)} MB — o limite é 1 GiB.`,
    );
  }

  const { files } = await requisicao<RespostaUpload>(
    "POST",
    "/v1/ai/uploads/request-url",
    { files: [{ content_type: contentType }] },
  );

  const alvo = files[0];

  // O PUT vai direto para o storage: a autorização é a assinatura embutida na
  // URL. Mandar a chave da Magnific aqui é erro, e OMITIR os headers devolvidos
  // também — eles fazem parte da assinatura.
  const envio = await fetch(alvo.upload_url, {
    method: "PUT",
    headers: alvo.headers,
    body: new Uint8Array(readFileSync(caminhoLocal)),
  });

  if (!envio.ok) {
    const detalhe = await envio.text().catch(() => "");
    throw new Error(
      `Upload de ${caminhoLocal} falhou com ${envio.status} ${envio.statusText}.\n` +
        "Confira se os headers devolvidos por /uploads/request-url foram " +
        `repetidos no PUT (Content-Type e x-goog-content-length-range).\n${detalhe}`,
    );
  }

  return alvo.asset_url;
};

type ArquivoEnviado = {
  file_id: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  expires_at: string;
  ttl_seconds: number;
  asset_url: string;
  asset_url_expires_in: number;
};

/**
 * Lista os arquivos já enviados. Cada item vem com uma `asset_url` NOVA —
 * é assim que se recupera o acesso a um upload cuja URL expirou.
 */
export const listarEnvios = async (): Promise<ArquivoEnviado[]> => {
  const { files } = await requisicao<{ files: ArquivoEnviado[] }>(
    "GET",
    "/v1/ai/uploads",
  );
  return files;
};

// ---------------------------------------------------------------------------
// Download do resultado
// ---------------------------------------------------------------------------

/**
 * Baixa uma URL de `generated` para o disco, criando os diretórios do caminho.
 * Devolve o tamanho em bytes.
 */
export const baixarAsset = async (
  url: string,
  destino: string,
): Promise<number> => {
  const resposta = await fetch(url);

  if (!resposta.ok || !resposta.body) {
    throw new Error(
      `Falhou ao baixar ${url}: ${resposta.status} ${resposta.statusText}.\n` +
        "URLs de resultado da Magnific são temporárias — se a tarefa terminou " +
        "há muito tempo, gere de novo.",
    );
  }

  mkdirSync(dirname(destino), { recursive: true });

  const bytes = new Uint8Array(await resposta.arrayBuffer());

  await new Promise<void>((ok, falhou) => {
    const fluxo = createWriteStream(destino);
    fluxo.on("error", falhou);
    fluxo.on("finish", ok);
    fluxo.end(bytes);
  });

  return bytes.byteLength;
};

// ---------------------------------------------------------------------------
// Flows — a exceção ao padrão de tarefas
// ---------------------------------------------------------------------------

/** Repare: minúsculas. O resto da API usa MAIÚSCULAS. */
export type StatusFluxo =
  | "pending"
  | "running"
  | "completed"
  | "completed_with_errors"
  | "failed"
  | "cancelled";

export type EntradaFluxo = {
  id: string;
  /**
   * Chave a usar no objeto `inputs` do `run`. É um slug derivado do rótulo
   * (ex.: rótulo "1 · Your photo" vira `input_1_your_photo`).
   *
   * O spec ainda cita um campo `key`, mas a API em produção não o devolve mais
   * — some dela, não do `api_key`.
   */
  api_key?: string;
  key?: string;
  type: "creation" | "text" | "number" | "select";
  label?: string;
  description?: string | null;
  config?: Record<string, unknown> | null;
  required: boolean;
  default?: unknown;
};

export type Fluxo = {
  sqid: string;
  name: string;
  inputs?: EntradaFluxo[];
  tool_metadata?: { total_cost?: number; category?: string };
};

export type AssetFluxo = { url?: string; [chave: string]: unknown };

export type ExecucaoFluxo = {
  run_id: string;
  status: StatusFluxo;
  app_id: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  result: {
    images?: AssetFluxo[];
    videos?: AssetFluxo[];
    audios?: AssetFluxo[];
  } | null;
};

/** Fluxos publicados como ferramenta que esta chave pode executar. */
export const listarFluxos = async (busca?: string): Promise<Fluxo[]> => {
  const query = busca ? `?search=${encodeURIComponent(busca)}` : "";
  const { data } = await requisicao<Envelope<Fluxo[]>>(
    "GET",
    `/v1/ai/flows${query}`,
  );
  return data;
};

/** Definição completa, com as entradas que o `run` vai exigir. */
export const obterFluxo = async (flowId: string): Promise<Fluxo> => {
  const { data } = await requisicao<Envelope<Fluxo>>(
    "GET",
    `/v1/ai/flows/${flowId}`,
  );
  return data;
};

export const consultarExecucaoFluxo = async (
  runId: string,
): Promise<ExecucaoFluxo> => {
  const { data } = await requisicao<Envelope<ExecucaoFluxo>>(
    "GET",
    `/v1/ai/flows/runs/${runId}`,
  );
  return data;
};

/**
 * Executa um fluxo e espera terminar.
 *
 * As chaves de `inputs` são o `api_key` de cada entrada (descubra com
 * `obterFluxo`), não o rótulo que aparece na interface do Magnific Spaces.
 */
export const executarFluxo = async (
  flowId: string,
  inputs: Record<string, unknown>,
  opcoes: OpcoesEspera = {},
): Promise<ExecucaoFluxo> => {
  const {
    timeoutEmSegundos = 900,
    intervaloEmSegundos = 3,
    intervaloMaximoEmSegundos = 15,
    silencioso = false,
  } = opcoes;

  const inicio = await requisicao<{ workflow_run_identifier: string }>(
    "POST",
    `/v1/ai/flows/${flowId}/run`,
    { inputs },
  );

  const runId = inicio.workflow_run_identifier;
  const limite = Date.now() + timeoutEmSegundos * 1000;
  let intervalo = intervaloEmSegundos;

  for (;;) {
    const execucao = await consultarExecucaoFluxo(runId);

    if (execucao.status === "completed") {
      return execucao;
    }

    if (
      execucao.status === "failed" ||
      execucao.status === "cancelled" ||
      execucao.status === "completed_with_errors"
    ) {
      throw new Error(
        `Fluxo ${flowId} terminou em "${execucao.status}".\n` +
          (execucao.error_message ?? "Sem detalhe de erro na resposta."),
      );
    }

    if (Date.now() > limite) {
      throw new Error(
        `Execução ${runId} ainda estava em "${execucao.status}" após ${timeoutEmSegundos}s.\n` +
          `Consulte depois com: GET ${BASE_URL}/v1/ai/flows/runs/${runId}`,
      );
    }

    if (!silencioso) {
      process.stdout.write(".");
    }

    await dormir(intervalo * 1000);
    intervalo = Math.min(intervalo * 1.5, intervaloMaximoEmSegundos);
  }
};

// ---------------------------------------------------------------------------
// Catálogo de modelos
//
// Cada modelo da Magnific nomeia o enquadramento de um jeito diferente:
// o Mystic quer `aspect_ratio: "widescreen_16_9"`, o Veo quer
// `aspect_ratio: "16:9"`, o Z-Image quer `image_size: "landscape_16_9"` e o
// Flux 2 Turbo quer `image_size: { width, height }`. Em vez de espalhar esse
// conhecimento por todo script que gera asset, cada modelo traz aqui a função
// que traduz um aspecto normalizado para o corpo que ELE entende.
// ---------------------------------------------------------------------------

export type Aspecto = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

const naoSuporta = (modelo: string, aspecto: Aspecto, aceitos: Aspecto[]) => {
  throw new Error(
    `O modelo "${modelo}" não aceita o aspecto ${aspecto}. Use: ${aceitos.join(", ")}.`,
  );
};

/** Nomenclatura própria da Magnific, usada por Mystic, HyperFlux e PixVerse. */
const aspectoMagnific = (aspecto: Aspecto): Record<string, unknown> => ({
  aspect_ratio: {
    "16:9": "widescreen_16_9",
    "9:16": "social_story_9_16",
    "1:1": "square_1_1",
    "4:3": "classic_4_3",
    "3:4": "traditional_3_4",
  }[aspecto],
});

/** Notação com dois-pontos, usada por Veo, Wan, Kling e Nano Banana. */
const aspectoDoisPontos = (aspecto: Aspecto): Record<string, unknown> => ({
  aspect_ratio: aspecto,
});

export type ModeloImagemDef = {
  caminho: string;
  rotulo: string;
  aspecto: (aspecto: Aspecto) => Record<string, unknown>;
};

export const MODELOS_IMAGEM = {
  /** Padrão da casa: o mais realista, com controle de estilo e estrutura. */
  mystic: {
    caminho: "/v1/ai/mystic",
    rotulo: "Mystic — realismo alto, 1k/2k/4k, estilos via LoRA",
    aspecto: aspectoMagnific,
  },
  /** O mais barato e rápido. Bom para rascunho e teste de enquadramento. */
  hyperflux: {
    caminho: "/v1/ai/text-to-image/hyperflux",
    rotulo: "HyperFlux — o Flux mais rápido, ideal para iterar",
    aspecto: aspectoMagnific,
  },
  "flux-2-turbo": {
    caminho: "/v1/ai/text-to-image/flux-2-turbo",
    rotulo: "Flux 2 Turbo — dimensões livres de 512 a 2048 px",
    aspecto: (aspecto) => ({
      image_size: {
        "16:9": { width: 1920, height: 1080 },
        "9:16": { width: 1080, height: 1920 },
        "1:1": { width: 1024, height: 1024 },
        "4:3": { width: 1440, height: 1080 },
        "3:4": { width: 1080, height: 1440 },
      }[aspecto],
    }),
  },
  "seedream-v5-pro": {
    caminho: "/v1/ai/text-to-image/seedream-v5-pro",
    rotulo: "Seedream 5 Pro — melhor composição e aderência ao prompt",
    aspecto: aspectoMagnific,
  },
  "nano-banana-pro": {
    caminho: "/v1/ai/text-to-image/nano-banana-pro",
    rotulo: "Nano Banana Pro (Gemini 3) — até 4K, aceita imagens de referência",
    aspecto: aspectoDoisPontos,
  },
  "z-image": {
    caminho: "/v1/ai/text-to-image/z-image",
    rotulo: "Z-Image Turbo — rápido, tamanho por preset",
    aspecto: (aspecto) => ({
      image_size: {
        "16:9": "landscape_16_9",
        "9:16": "portrait_9_16",
        "1:1": "square_hd",
        "4:3": "landscape_4_3",
        "3:4": "portrait_3_4",
      }[aspecto],
    }),
  },
} satisfies Record<string, ModeloImagemDef>;

export type ModeloImagem = keyof typeof MODELOS_IMAGEM;

export type ModeloVideoDef = {
  rotulo: string;
  /** Ausente quando o modelo só anima imagem. */
  caminhoTexto?: string;
  /** Ausente quando o modelo só gera a partir de texto. */
  caminhoImagem?: string;
  /**
   * Nome do campo que recebe o primeiro quadro no endpoint de imagem — e ele
   * muda de modelo para modelo, sem padrão: `image` (Kling, Veo),
   * `image_url` (LTX-2, PixVerse), `start_image_url` (Wan).
   */
  campoImagem?: string;
  /**
   * `true` quando o endpoint de imagem→vídeo DEFINE `aspect_ratio` no corpo.
   *
   * A maioria não define — o enquadramento sai da própria imagem. Veo e
   * PixVerse são as exceções, verificadas no spec.
   */
  aspectoNaImagem?: boolean;
  aspecto: (aspecto: Aspecto) => Record<string, unknown>;
  /** Ajusta os segundos pedidos ao que o modelo aceita, no tipo certo. */
  duracao: (segundos: number) => Record<string, unknown>;
};

/** Escolhe o valor permitido mais próximo do pedido. */
const maisProximo = (segundos: number, permitidos: number[]): number =>
  permitidos.reduce((melhor, atual) =>
    Math.abs(atual - segundos) < Math.abs(melhor - segundos) ? atual : melhor,
  );

const entre = (segundos: number, minimo: number, maximo: number): number =>
  Math.min(maximo, Math.max(minimo, Math.round(segundos)));

export const MODELOS_VIDEO = {
  "kling-v3-turbo-720p": {
    rotulo: "Kling v3 Turbo 720p — 3 a 15 s, bom custo-benefício",
    caminhoTexto: "/v1/ai/text-to-video/kling-v3-turbo-720p",
    caminhoImagem: "/v1/ai/image-to-video/kling-v3-turbo-720p",
    campoImagem: "image",
    aspecto: (aspecto) =>
      aspecto === "4:3" || aspecto === "3:4"
        ? naoSuporta("kling-v3-turbo-720p", aspecto, ["16:9", "9:16", "1:1"])
        : aspectoDoisPontos(aspecto),
    // Kling é o único que espera a duração como STRING.
    duracao: (s) => ({ duration: String(entre(s, 3, 15)) }),
  },
  "kling-v3-turbo-1080p": {
    rotulo: "Kling v3 Turbo 1080p — mesma família, resolução cheia",
    caminhoTexto: "/v1/ai/text-to-video/kling-v3-turbo-1080p",
    caminhoImagem: "/v1/ai/image-to-video/kling-v3-turbo-1080p",
    campoImagem: "image",
    aspecto: (aspecto) =>
      aspecto === "4:3" || aspecto === "3:4"
        ? naoSuporta("kling-v3-turbo-1080p", aspecto, ["16:9", "9:16", "1:1"])
        : aspectoDoisPontos(aspecto),
    duracao: (s) => ({ duration: String(entre(s, 3, 15)) }),
  },
  "veo-3-1-fast": {
    aspectoNaImagem: true,
    rotulo: "Veo 3.1 Fast — 4/6/8 s com áudio sincronizado, só 16:9 e 9:16",
    caminhoTexto: "/v1/ai/text-to-video/veo-3-1-fast",
    caminhoImagem: "/v1/ai/image-to-video/veo-3-1-fast",
    campoImagem: "image",
    aspecto: (aspecto) =>
      aspecto === "16:9" || aspecto === "9:16"
        ? aspectoDoisPontos(aspecto)
        : naoSuporta("veo-3-1-fast", aspecto, ["16:9", "9:16"]),
    duracao: (s) => ({ duration: maisProximo(s, [4, 6, 8]) }),
  },
  "veo-3-1": {
    aspectoNaImagem: true,
    rotulo: "Veo 3.1 — a versão cheia do Veo, mesma grade de durações",
    caminhoTexto: "/v1/ai/text-to-video/veo-3-1",
    caminhoImagem: "/v1/ai/image-to-video/veo-3-1",
    campoImagem: "image",
    aspecto: (aspecto) =>
      aspecto === "16:9" || aspecto === "9:16"
        ? aspectoDoisPontos(aspecto)
        : naoSuporta("veo-3-1", aspecto, ["16:9", "9:16"]),
    duracao: (s) => ({ duration: maisProximo(s, [4, 6, 8]) }),
  },
  "wan-2-7": {
    rotulo: "Wan 2.7 — 2 a 15 s, aceita quadro inicial E final",
    caminhoTexto: "/v1/ai/text-to-video/wan-2-7",
    caminhoImagem: "/v1/ai/image-to-video/wan-2-7",
    // Wan foge do padrão: o campo do primeiro quadro é `start_image_url`.
    campoImagem: "start_image_url",
    aspecto: aspectoDoisPontos,
    duracao: (s) => ({ duration: entre(s, 2, 15) }),
  },
  "ltx-2-fast": {
    rotulo: "LTX-2 Fast — 6 a 20 s em passos de 2, até 2160p",
    caminhoTexto: "/v1/ai/text-to-video/ltx-2-fast",
    caminhoImagem: "/v1/ai/image-to-video/ltx-2-fast",
    campoImagem: "image_url",
    // O LTX-2 define o enquadramento pela resolução, não por aspect_ratio.
    aspecto: () => ({}),
    duracao: (s) => ({ duration: maisProximo(s, [6, 8, 10, 12, 14, 16, 18, 20]) }),
  },
  "pixverse-v6": {
    aspectoNaImagem: true,
    rotulo: "PixVerse V6 — 1 a 15 s, estilos (anime, 3d, clay, comic)",
    caminhoTexto: "/v1/ai/text-to-video/pixverse-v6",
    caminhoImagem: "/v1/ai/image-to-video/pixverse-v6",
    campoImagem: "image_url",
    aspecto: aspectoMagnific,
    duracao: (s) => ({ duration: entre(s, 1, 15) }),
  },
} satisfies Record<string, ModeloVideoDef>;

export type ModeloVideo = keyof typeof MODELOS_VIDEO;

// ---------------------------------------------------------------------------
// Atalhos por família
//
// Todos aceitam `extras` para qualquer campo específico do modelo que não
// esteja normalizado aqui (seed, negative_prompt, resolution, styling…).
// Consulte `.agents/skills/magnific-api/referencias/` para saber o que cada
// modelo aceita.
// ---------------------------------------------------------------------------

export type OpcoesImagem = {
  prompt: string;
  modelo?: ModeloImagem;
  aspecto?: Aspecto;
  extras?: Record<string, unknown>;
  espera?: OpcoesEspera;
};

/** Gera a imagem e devolve as URLs prontas (já esperou a tarefa terminar). */
export const gerarImagem = async ({
  prompt,
  modelo = "mystic",
  aspecto = "16:9",
  extras = {},
  espera = {},
}: OpcoesImagem): Promise<string[]> => {
  const definicao: ModeloImagemDef = MODELOS_IMAGEM[modelo];

  const tarefa = await executarTarefa(
    definicao.caminho,
    { prompt, ...definicao.aspecto(aspecto), ...extras },
    espera,
  );

  return tarefa.generated;
};

export type OpcoesVideo = {
  prompt: string;
  modelo?: ModeloVideo;
  aspecto?: Aspecto;
  duracaoEmSegundos?: number;
  /**
   * URL do primeiro quadro. Com ela, usa-se o endpoint image-to-video do
   * modelo; sem ela, o text-to-video. Para um arquivo local, passe primeiro
   * por `enviarArquivo`.
   */
  imagemUrl?: string;
  extras?: Record<string, unknown>;
  espera?: OpcoesEspera;
};

export const gerarVideo = async ({
  prompt,
  modelo = "kling-v3-turbo-720p",
  aspecto = "16:9",
  duracaoEmSegundos = 5,
  imagemUrl,
  extras = {},
  espera = {},
}: OpcoesVideo): Promise<string[]> => {
  const definicao: ModeloVideoDef = MODELOS_VIDEO[modelo];
  const caminho = imagemUrl ? definicao.caminhoImagem : definicao.caminhoTexto;

  if (!caminho) {
    throw new Error(
      `O modelo "${modelo}" não tem endpoint de ${imagemUrl ? "image" : "text"}-to-video.`,
    );
  }

  const corpo: Record<string, unknown> = {
    prompt,
    ...definicao.duracao(duracaoEmSegundos),
  };

  if (imagemUrl) {
    corpo[definicao.campoImagem ?? "image"] = imagemUrl;

    // Na maioria dos modelos o enquadramento sai da própria imagem, e o corpo
    // do endpoint nem define `aspect_ratio` — mandar assim mesmo é campo
    // desconhecido. Veo e PixVerse são as exceções e aceitam.
    if (definicao.aspectoNaImagem) {
      Object.assign(corpo, definicao.aspecto(aspecto));
    }
  } else {
    Object.assign(corpo, definicao.aspecto(aspecto));
  }

  // `extras` por último, para poder sobrepor o que foi normalizado acima
  // (ex.: um aspect_ratio que só aquele modelo aceita).
  Object.assign(corpo, extras);

  const tarefa = await executarTarefa(caminho, corpo, {
    timeoutEmSegundos: 900,
    ...espera,
  });

  return tarefa.generated;
};

export type OpcoesMusica = {
  prompt: string;
  duracaoEmSegundos: number;
  espera?: OpcoesEspera;
};

/** Trilha original. Duração de 10 a 240 s. */
export const gerarMusica = async ({
  prompt,
  duracaoEmSegundos,
  espera = {},
}: OpcoesMusica): Promise<string[]> => {
  const tarefa = await executarTarefa(
    "/v1/ai/music-generation",
    {
      prompt,
      music_length_seconds: Math.min(240, Math.max(10, Math.round(duracaoEmSegundos))),
    },
    { timeoutEmSegundos: 600, ...espera },
  );

  return tarefa.generated;
};

export type OpcoesEfeitoSonoro = {
  texto: string;
  duracaoEmSegundos: number;
  /** Costura o começo e o fim para o efeito poder repetir sem emenda. */
  emLoop?: boolean;
  /** 0 a 1: quanto o texto manda no resultado. */
  influenciaDoPrompt?: number;
  espera?: OpcoesEspera;
};

/** Efeito sonoro pontual. Duração de 0,5 a 22 s. */
export const gerarEfeitoSonoro = async ({
  texto,
  duracaoEmSegundos,
  emLoop = false,
  influenciaDoPrompt = 0.3,
  espera = {},
}: OpcoesEfeitoSonoro): Promise<string[]> => {
  const tarefa = await executarTarefa(
    "/v1/ai/sound-effects",
    {
      text: texto,
      duration_seconds: Math.min(22, Math.max(0.5, duracaoEmSegundos)),
      loop: emLoop,
      prompt_influence: influenciaDoPrompt,
    },
    espera,
  );

  return tarefa.generated;
};

export type OpcoesLocucaoMagnific = {
  texto: string;
  vozId: string;
  /** 0 = expressiva e variável, 1 = monótona e previsível. */
  stability?: number;
  similarityBoost?: number;
  /** 0.7 a 1.2. */
  speed?: number;
  espera?: OpcoesEspera;
};

/**
 * Locução via ElevenLabs Turbo v2.5 dentro da Magnific.
 *
 * O projeto já fala com a ElevenLabs direto em `elevenlabs.ts`, o que dá mais
 * controle (modelo, `style`, `use_speaker_boost`) e cobra na conta da
 * ElevenLabs. Use este atalho só quando quiser tudo num crédito só.
 */
export const gerarLocucao = async ({
  texto,
  vozId,
  stability = 0.5,
  similarityBoost = 0.2,
  speed = 1,
  espera = {},
}: OpcoesLocucaoMagnific): Promise<string[]> => {
  const tarefa = await executarTarefa(
    "/v1/ai/voiceover/elevenlabs-turbo-v2-5",
    {
      text: texto,
      voice_id: vozId,
      stability,
      similarity_boost: similarityBoost,
      speed,
    },
    espera,
  );

  return tarefa.generated;
};

export type OpcoesMelhorarPrompt = {
  prompt: string;
  tipo: "image" | "video";
  /** Código ISO 639-1. `pt` devolve o prompt melhorado em português. */
  idioma?: string;
  espera?: OpcoesEspera;
};

/** Reescreve um prompt curto num prompt detalhado. Teto de 1.000 chamadas/dia. */
export const melhorarPrompt = async ({
  prompt,
  tipo,
  idioma = "en",
  espera = {},
}: OpcoesMelhorarPrompt): Promise<string[]> => {
  const tarefa = await executarTarefa(
    "/v1/ai/improve-prompt",
    { prompt, type: tipo, language: idioma },
    espera,
  );

  return tarefa.generated;
};

/**
 * Descreve uma imagem como prompt — útil para reproduzir o visual de uma
 * referência. Aceita URL ou base64. Teto de 1.000 chamadas/dia.
 */
export const imagemParaPrompt = async (
  imagem: string,
  espera: OpcoesEspera = {},
): Promise<string[]> => {
  const tarefa = await executarTarefa(
    "/v1/ai/image-to-prompt",
    { image: imagem },
    espera,
  );

  return tarefa.generated;
};

export type Classificacao = { class_name: "not_ai" | "ai"; probability: number };

/**
 * Estima se uma imagem foi gerada por IA. Aceita URL ou base64.
 *
 * É o único endpoint de IA SÍNCRONO do escopo: responde na hora, sem task_id.
 */
export const classificarImagem = async (
  imagem: string,
): Promise<Classificacao[]> => {
  const { data } = await requisicao<Envelope<Classificacao[]>>(
    "POST",
    "/v1/ai/classifier/image",
    { image: imagem },
  );

  return data;
};

export type FundoRemovido = {
  /** Imagem original enviada. */
  original: string;
  /** Resultado em resolução cheia, sem fundo. */
  high_resolution: string;
  preview: string;
  /** Mesmo arquivo de `high_resolution`, pronto para download direto. */
  url: string;
};

/**
 * Remove o fundo de uma imagem.
 *
 * Acumula duas exceções, e por isso não usa `executarTarefa`:
 *
 *   1. É SÍNCRONO — responde na hora, sem `task_id`, num formato próprio
 *      (a outra família síncrona é o classificador).
 *   2. É o ÚNICO endpoint do spec inteiro que não aceita JSON: o corpo vai
 *      como `application/x-www-form-urlencoded`.
 */
export const removerFundo = async (
  imagemUrl: string,
): Promise<FundoRemovido> =>
  requisicao<FundoRemovido>(
    "POST",
    "/v1/ai/beta/remove-background",
    { image_url: imagemUrl },
    "form",
  );

export type FormatoIcone = "png" | "svg";

export type OpcoesIcone = {
  prompt: string;
  /**
   * OBRIGATÓRIO pela API. Ícones são a única família que não pode ser
   * acompanhada por polling — veja a nota abaixo.
   */
  webhookUrl: string;
  estilo?: "solid" | "outline" | "color" | "flat" | "sticker";
  formato?: FormatoIcone;
  /** Gera só a prévia (`/preview`), mais barata, para escolher o estilo. */
  previa?: boolean;
};

/**
 * Dispara a geração de um ícone. **Não espera terminar** — e isso é uma
 * limitação da API, não uma escolha.
 *
 * A família text-to-icon expõe apenas três rotas, todas POST:
 *   POST /v1/ai/text-to-icon
 *   POST /v1/ai/text-to-icon/preview
 *   POST /v1/ai/text-to-icon/{task-id}/render/{format}
 *
 * Não existe `GET /v1/ai/text-to-icon/{task-id}`. Sem rota de consulta não há
 * como fazer polling — daí o `webhook_url` ser obrigatório. Quando o webhook
 * avisar que terminou, chame `baixarIcone`.
 *
 * Sem um endereço público para receber o webhook, prefira o acervo de ícones
 * em `GET /v1/icons` — veja `referencias/05-stock.md`.
 */
export const gerarIcone = async ({
  prompt,
  webhookUrl,
  estilo = "solid",
  formato = "png",
  previa = false,
}: OpcoesIcone): Promise<Tarefa> => {
  const corpo: Record<string, unknown> = {
    prompt,
    webhook_url: webhookUrl,
    style: estilo,
  };

  // O endpoint /preview não aceita `format`.
  if (!previa) {
    corpo.format = formato;
  }

  return criarTarefa(
    previa ? "/v1/ai/text-to-icon/preview" : "/v1/ai/text-to-icon",
    corpo,
  );
};

/**
 * Baixa um ícone pronto. Chame depois que o webhook avisar que a tarefa
 * terminou.
 *
 * A rota é POST, não GET — outra particularidade desta família.
 */
export const baixarIcone = async (
  taskId: string,
  formato: FormatoIcone = "png",
): Promise<Tarefa> => {
  const resposta = await requisicao<Envelope<Tarefa>>(
    "POST",
    `/v1/ai/text-to-icon/${taskId}/render/${formato}`,
  );

  return normalizarTarefa(resposta, `POST /v1/ai/text-to-icon/${taskId}/render`);
};
