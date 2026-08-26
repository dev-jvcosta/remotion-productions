# 📇 Catálogo de Endpoints da Magnific API

> ⚠️ **Arquivo gerado — não edite à mão.** Regenere com:
> `node --strip-types scripts/gerar-doc-magnific.ts`

Fonte: o spec OpenAPI oficial em
`https://storage.googleapis.com/fc-freepik-pro-rev1-eu-api-specs/magnific-api-v1-openapi.yaml`.

Este catálogo responde **quais endpoints existem e o que cada um exige**.
Para saber **quando usar cada família**, leia a referência temática correspondente.

Todo `POST` de IA é assíncrono: devolve `task_id` e você consulta
`GET <mesmo caminho>/{task-id}` até `status: COMPLETED`. As rotas de consulta
estão omitidas da tabela para não triplicar o tamanho — a única exceção ao
padrão é Fluxos, documentada em [09-fluxos.md](./09-fluxos.md).

## Geração de Imagem

19 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/mystic` | Mystic - Create image from text | — | `prompt`, `structure_reference`, `structure_strength`, `style_reference`, `adherence`, `hdr`, `resolution`, `aspect_ratio` +6 |
| `POST /v1/ai/text-to-image/flux-2-flex` | Flux 2 Flex - Create image from text | `prompt` | `width`, `height`, `seed`, `guidance`, `steps`, `safety_tolerance`, `prompt_upsampling`, `output_format` +4 |
| `POST /v1/ai/text-to-image/flux-2-klein` | Flux 2 Klein - Create image from text | `prompt` | `aspect_ratio`, `resolution`, `seed`, `input_image`, `input_image_2`, `input_image_3`, `input_image_4`, `safety_tolerance` +1 |
| `POST /v1/ai/text-to-image/flux-2-pro` | Flux 2 Pro - Create image from text | `prompt` | `width`, `height`, `seed`, `prompt_upsampling`, `input_image`, `input_image_2`, `input_image_3`, `input_image_4` |
| `POST /v1/ai/text-to-image/flux-2-turbo` | Flux 2 Turbo - Create image from text | `prompt` | `guidance_scale`, `seed`, `image_size`, `enable_safety_checker`, `output_format` |
| `POST /v1/ai/text-to-image/flux-dev` | Flux Dev - Create image from text | — | `prompt`, `aspect_ratio`, `styling`, `seed` |
| `POST /v1/ai/text-to-image/flux-kontext-max` | Flux Kontext Max - Edit image from text | `prompt`, `input_image` | `input_image_2`, `input_image_3`, `input_image_4`, `prompt_upsampling`, `seed`, `guidance`, `steps`, `aspect_ratio` +2 |
| `POST /v1/ai/text-to-image/flux-kontext-pro` | Flux Kontext Pro - Create image from text | `prompt` | `input_image`, `prompt_upsampling`, `seed`, `guidance`, `steps`, `aspect_ratio`, `safety_tolerance`, `output_format` |
| `POST /v1/ai/text-to-image/flux-pro-v1-1` | Flux Pro 1.1 - Create image from text | `prompt` | `prompt_upsampling`, `seed`, `aspect_ratio`, `safety_tolerance`, `output_format` |
| `POST /v1/ai/text-to-image/hyperflux` | HyperFlux - Create image from text | — | `prompt`, `aspect_ratio`, `styling`, `seed` |
| `POST /v1/ai/text-to-image/nano-banana-pro` | Create image from text - Nano Banana Pro | `prompt` | `reference_images`, `aspect_ratio`, `resolution` |
| `POST /v1/ai/text-to-image/nano-banana-pro-flash` | Create image from text - Nano Banana Pro Flash | `prompt` | `reference_images`, `aspect_ratio`, `resolution`, `use_google_search_tool` |
| `POST /v1/ai/text-to-image/runway` | Create image from text - RunWay | `prompt`, `ratio` | `seed` |
| `POST /v1/ai/text-to-image/seedream` | Seedream - Create image from text | `prompt` | `aspect_ratio`, `guidance_scale`, `seed` |
| `POST /v1/ai/text-to-image/seedream-v4` | Seedream 4 - Create image from text | `prompt` | `aspect_ratio`, `guidance_scale`, `seed` |
| `POST /v1/ai/text-to-image/seedream-v4-5` | Seedream 4.5 - Create image from text | `prompt` | `aspect_ratio`, `seed`, `enable_safety_checker` |
| `POST /v1/ai/text-to-image/seedream-v5-lite` | Seedream V5 Lite - Create image from text | `prompt` | `aspect_ratio`, `seed`, `enable_safety_checker` |
| `POST /v1/ai/text-to-image/seedream-v5-pro` | Seedream 5.0 Pro - Create image from text | `prompt` | `resolution`, `aspect_ratio`, `seed` |
| `POST /v1/ai/text-to-image/z-image` | Create image from text - Z-Image | `prompt` | `image_size`, `num_inference_steps`, `seed`, `output_format`, `enable_safety_checker` |

## Edição de Imagem

18 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/beta/remove-background` | Remove the background of an image | — | — |
| `POST /v1/ai/ideogram-image-edit` | Ideogram Image Edit - Edit an image using inpainting | `prompt`, `image`, `mask` | `seed`, `rendering_speed`, `magic_prompt`, `color_palette`, `style_codes`, `style_type`, `style_reference_images`, `character_reference_images` |
| `POST /v1/ai/image-change-camera` | Change Camera - Transform image perspective | `image` | `horizontal_angle`, `vertical_angle`, `zoom`, `seed`, `output_format` |
| `POST /v1/ai/image-expand/flux-pro` | Flux Pro - Expand image | `image` | `prompt`, `left`, `right`, `top`, `bottom` |
| `POST /v1/ai/image-expand/ideogram` | Ideogram - Expand image | `image`, `left`, `right`, `top`, `bottom` | `prompt`, `seed` |
| `POST /v1/ai/image-expand/seedream-v4-5` | Seedream V4.5 - Expand image | `image`, `left`, `right`, `top`, `bottom` | `prompt`, `seed` |
| `POST /v1/ai/image-relight` | Relight - Adjust image lighting | `image` | `prompt`, `transfer_light_from_reference_image`, `transfer_light_from_lightmap`, `light_transfer_strength`, `interpolate_from_original`, `change_background`, `style`, `preserve_details` +1 |
| `POST /v1/ai/image-style-transfer` | Style Transfer - Transform image style | `image`, `reference_image` | `prompt`, `style_strength`, `structure_strength`, `is_portrait`, `portrait_style`, `portrait_beautifier`, `flavor`, `engine` +1 |
| `POST /v1/ai/image-upscaler` | Upscaler Creative - Upscale image | `image` | `scale_factor`, `optimized_for`, `prompt`, `creativity`, `hdr`, `resemblance`, `fractality`, `engine` +1 |
| `POST /v1/ai/image-upscaler-precision` | Upscaler Precision - Upscale image | `image` | `sharpen`, `smart_grain`, `ultra_detail`, `filter_nsfw` |
| `POST /v1/ai/image-upscaler-precision-v2` | Upscaler Precision V2 - Upscale image | `image` | `sharpen`, `smart_grain`, `ultra_detail`, `flavor`, `scale_factor`, `filter_nsfw` |
| `POST /v1/ai/skin-enhancer/creative` | Skin Enhancer Creative - Enhance skin | `image` | `sharpen`, `smart_grain` |
| `POST /v1/ai/skin-enhancer/faithful` | Skin Enhancer Faithful - Enhance skin | `image` | `sharpen`, `smart_grain`, `skin_detail` |
| `POST /v1/ai/skin-enhancer/flexible` | Skin Enhancer Flexible - Enhance skin | `image` | `sharpen`, `smart_grain`, `optimized_for` |
| `POST /v1/ai/text-to-image/seedream-v4-5-edit` | Seedream 4.5 - Edit image | `prompt`, `reference_images` | `aspect_ratio`, `seed`, `enable_safety_checker` |
| `POST /v1/ai/text-to-image/seedream-v4-edit` | Seedream 4 - Edit image | `prompt` | `aspect_ratio`, `guidance_scale`, `seed`, `reference_images` |
| `POST /v1/ai/text-to-image/seedream-v5-lite-edit` | Seedream V5 Lite - Edit image | `prompt`, `reference_images` | `aspect_ratio`, `seed`, `enable_safety_checker` |
| `POST /v1/ai/text-to-image/seedream-v5-pro-edit` | Seedream 5.0 Pro - Edit image | `prompt`, `reference_images` | `resolution`, `aspect_ratio`, `seed` |

## Geração de Ícones

3 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/text-to-icon` | AI Icon generation | `prompt`, `webhook_url` | `format`, `style`, `num_inference_steps`, `guidance_scale` |
| `POST /v1/ai/text-to-icon/preview` | AI Icon generation | `prompt`, `webhook_url` | `style`, `num_inference_steps`, `guidance_scale` |
| `POST /v1/ai/text-to-icon/{task-id}/render/{format}` | AI Icon generation | — | — |

## Classificador de Imagem IA

1 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/classifier/image` | Analyzes an image to determine its likelihood of being AI-generated | `image` | — |

## Conteúdo de Stock

17 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `GET /v1/icons` | Search and filter icons by specified order | — | — |
| `GET /v1/icons/{id}` | Get detailed icon information by ID | — | — |
| `GET /v1/icons/{id}/download` | Download an icon | — | — |
| `GET /v1/music` | Search and filter music | — | — |
| `GET /v1/music/{music-id}` | Get detailed music information by ID | — | — |
| `GET /v1/music/{music-id}/download` | Download music | — | — |
| `GET /v1/resources` | Search and filter resources with advanced options | — | — |
| `GET /v1/resources/{resource-id}` | Get detailed resource information by ID | — | — |
| `GET /v1/resources/{resource-id}/download` | Download an resource | — | — |
| `GET /v1/resources/{resource-id}/download/{resource-format}` | Get available download formats for resource | — | — |
| `GET /v1/sound-effects` | Search and filter sound effects | — | — |
| `GET /v1/sound-effects/{sfx-id}` | Get detailed sound effect information by ID | — | — |
| `GET /v1/sound-effects/{sfx-id}/download` | Download a sound effect | — | — |
| `GET /v1/videos` | Search and filter videos by specified order | — | — |
| `GET /v1/videos/{id}` | Get detailed video information by ID | — | — |
| `GET /v1/videos/{id}/download` | Download a video by ID. | — | — |
| `GET /v1/videos/{id}/options/{option-id}/download` | Download a video by option id. | — | — |

## Sincronização Labial

3 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/lip-sync/latent-sync` | Latent Sync - Lip-sync video generation | `video_url`, `audio_url` | `seed`, `guidance_scale`, `return_private_url` |
| `POST /v1/ai/lip-sync/veed-fabric-1-0` | Veed Fabric 1.0 - Generate talking video | `resolution`, `audio_url`, `image_url` | — |
| `POST /v1/ai/lip-sync/veed-fabric-1-0-fast` | Veed Fabric 1.0 Fast - Generate talking video | `resolution`, `audio_url`, `image_url` | — |

## Imagem para Prompt

1 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/image-to-prompt` | Image to Prompt - Generate prompt | `image` | — |

## Melhoria de Prompt

1 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/improve-prompt` | Improve Prompt - Enhance prompt | `prompt`, `type` | `language` |

## Fluxos

5 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `GET /v1/ai/flows` | Flows - List flows | — | — |
| `GET /v1/ai/flows/runs/{run-id}` | Flows - Get run status | — | — |
| `GET /v1/ai/flows/{flow-id}` | Flows - Get flow definition | — | — |
| `POST /v1/ai/flows/{flow-id}/run` | Flows - Run a flow | `inputs` | `webhook` |
| `GET /v1/ai/me/flows` | Flows - List my flows | — | — |

## Geração de Áudio

6 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/audio-isolation` | Audio Isolation - Extract sounds from audio/video | `description` | `audio`, `video`, `x1`, `y1`, `x2`, `y2`, `sample_fps`, `reranking_candidates` +1 |
| `POST /v1/ai/music-generation` | Music Generation - Generate from text | `prompt`, `music_length_seconds` | — |
| `POST /v1/ai/music-generation/google-lyria` | Google Lyria - Generate music from text | `prompt` | `negative_prompt`, `seed` |
| `POST /v1/ai/music-generation/lyria-3` | Lyria 3 - Generate music from text | `prompt` | `model`, `reference_images` |
| `POST /v1/ai/sound-effects` | Sound Effects - Generate from text | `text`, `duration_seconds` | `loop`, `prompt_influence` |
| `POST /v1/ai/voiceover/elevenlabs-turbo-v2-5` | Voiceover - Generate speech from text | `text`, `voice_id` | `stability`, `similarity_boost`, `speed`, `use_speaker_boost` |

## Geração de Vídeo

123 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `POST /v1/ai/image-to-video/happy-horse-1` | Happy Horse 1.0 - Create video from image | `image_url` | `prompt`, `resolution`, `duration`, `seed` |
| `POST /v1/ai/image-to-video/happy-horse-1-1` | Happy Horse 1.1 - Create video from image | `image_url` | `prompt`, `resolution`, `duration`, `seed` |
| `POST /v1/ai/image-to-video/kling-elements-pro` | Kling Elements Pro - Create video from image | `images` | `prompt`, `negative_prompt`, `duration`, `aspect_ratio` |
| `POST /v1/ai/image-to-video/kling-elements-std` | Kling Elements Standard - Create video from image | `images` | `prompt`, `negative_prompt`, `duration`, `aspect_ratio` |
| `POST /v1/ai/image-to-video/kling-o1-pro` | Kling O1 Pro - Create video from image | — | `prompt`, `first_frame`, `last_frame`, `aspect_ratio`, `duration` |
| `POST /v1/ai/image-to-video/kling-o1-pro-video-reference` | Kling O1 Pro - Create video with reference | `prompt` | `reference_images`, `aspect_ratio`, `duration` |
| `POST /v1/ai/image-to-video/kling-o1-std` | Kling O1 Standard - Create video from image | — | `prompt`, `first_frame`, `last_frame`, `aspect_ratio`, `duration` |
| `POST /v1/ai/image-to-video/kling-o1-std-video-reference` | Kling O1 Standard - Create video with reference | `prompt` | `reference_images`, `aspect_ratio`, `duration` |
| `POST /v1/ai/image-to-video/kling-pro` | Kling 1.6 Pro - Create video from image | `duration` | `image`, `image_tail`, `prompt`, `negative_prompt`, `cfg_scale`, `static_mask`, `dynamic_masks` |
| `POST /v1/ai/image-to-video/kling-std` | Kling 1.6 Standard - Create video from image | `duration` | `image`, `image_tail`, `prompt`, `negative_prompt`, `cfg_scale`, `static_mask`, `dynamic_masks` |
| `POST /v1/ai/image-to-video/kling-v2` | Kling 2.0 - Create video from image | `image`, `duration` | `prompt`, `negative_prompt`, `cfg_scale` |
| `POST /v1/ai/image-to-video/kling-v2-1-master` | Kling 2.1 Master - Create video from image | — | — |
| `POST /v1/ai/image-to-video/kling-v2-1-pro` | Kling 2.1 Pro - Create video from image | `duration` | `image`, `image_tail`, `prompt`, `negative_prompt`, `cfg_scale`, `static_mask`, `dynamic_masks` |
| `POST /v1/ai/image-to-video/kling-v2-1-std` | Kling 2.1 Standard - Create video from image | `duration` | `image`, `prompt`, `negative_prompt`, `cfg_scale`, `static_mask`, `dynamic_masks` |
| `POST /v1/ai/image-to-video/kling-v2-5-pro` | Kling 2.5 Pro - Create video from image | `duration` | `image`, `prompt`, `negative_prompt`, `cfg_scale` |
| `POST /v1/ai/image-to-video/kling-v2-6-pro` | Kling 2.6 Pro - Create video from text or image | — | — |
| `POST /v1/ai/image-to-video/kling-v3-turbo-1080p` | Kling 3.0 Turbo I2V 1080p - Generate video | `image` | `prompt`, `duration` |
| `POST /v1/ai/image-to-video/kling-v3-turbo-720p` | Kling 3.0 Turbo I2V 720p - Generate video | `image` | `prompt`, `duration` |
| `POST /v1/ai/image-to-video/ltx-2-fast` | LTX Video 2.0 Fast - Create video from image | `prompt`, `image_url` | `generate_audio`, `seed`, `resolution`, `duration`, `fps` |
| `POST /v1/ai/image-to-video/ltx-2-pro` | LTX Video 2.0 Pro - Create video from image | `prompt`, `image_url` | `generate_audio`, `seed`, `resolution`, `duration`, `fps` |
| `POST /v1/ai/image-to-video/minimax-hailuo-02-1080p` | MiniMax Hailuo 02 1080p - Create video from text or image | — | — |
| `POST /v1/ai/image-to-video/minimax-hailuo-02-768p` | MiniMax Hailuo 02 768p - Create video from text or image | — | — |
| `POST /v1/ai/image-to-video/minimax-hailuo-2-3-1080p` | MiniMax Hailuo 2.3 1080p - Create video from text or image | — | — |
| `POST /v1/ai/image-to-video/minimax-hailuo-2-3-1080p-fast` | MiniMax Hailuo 2.3 1080p Fast - Create video from text or image | — | — |
| `POST /v1/ai/image-to-video/minimax-hailuo-2-3-768p` | MiniMax Hailuo 2.3 768p - Create video from text or image | — | — |
| `POST /v1/ai/image-to-video/minimax-hailuo-2-3-768p-fast` | MiniMax Hailuo 2.3 768p Fast - Create video from text or image | — | — |
| `POST /v1/ai/image-to-video/minimax-live` | MiniMax Video 01 Live - Create video from image | `prompt`, `image_url` | `prompt_optimizer` |
| `POST /v1/ai/image-to-video/pixverse-v5` | PixVerse V5 - Create video from image | `prompt`, `image_url` | `resolution`, `duration`, `negative_prompt`, `style`, `seed` |
| `POST /v1/ai/image-to-video/pixverse-v5-5` | PixVerse V5.5 - Create video from image | `prompt`, `image_url` | `resolution`, `aspect_ratio`, `duration`, `negative_prompt`, `style`, `seed`, `camera_movement`, `generate_audio_switch` +2 |
| `POST /v1/ai/image-to-video/pixverse-v5-5-transition` | PixVerse V5.5 - Video transition | `prompt`, `first_image_url`, `end_image_url` | `resolution`, `aspect_ratio`, `duration`, `negative_prompt`, `style`, `seed`, `camera_movement`, `generate_audio_switch` +1 |
| `POST /v1/ai/image-to-video/pixverse-v5-transition` | PixVerse V5 - Video transition | `prompt`, `first_image_url`, `last_image_url` | `resolution`, `duration`, `negative_prompt`, `seed` |
| `POST /v1/ai/image-to-video/pixverse-v6` | PixVerse V6 - Create video from image | `prompt`, `image_url` | `last_frame_image`, `resolution`, `aspect_ratio`, `duration`, `negative_prompt`, `style`, `seed`, `camera_movement` +3 |
| `POST /v1/ai/image-to-video/pixverse-v6-transition` | PixVerse V6 - Video transition | `prompt`, `first_image_url`, `end_image_url` | `resolution`, `aspect_ratio`, `duration`, `negative_prompt`, `style`, `seed`, `camera_movement`, `generate_audio_switch` +2 |
| `POST /v1/ai/image-to-video/runway-4-5` | Create video from image - RunWay Gen 4.5 | `image`, `prompt` | `ratio`, `duration`, `seed` |
| `POST /v1/ai/image-to-video/runway-gen4-turbo` | RunWay Gen4 Turbo - Create video from image | `image` | `ratio`, `duration`, `prompt`, `seed` |
| `POST /v1/ai/image-to-video/seedance-lite-1080p` | Seedance Lite 1080p - Create video from image | `prompt` | `image`, `duration`, `camera_fixed`, `aspect_ratio`, `frames_per_second`, `seed` |
| `POST /v1/ai/image-to-video/seedance-lite-480p` | Seedance Lite 480p - Create video from image | `prompt` | `image`, `duration`, `camera_fixed`, `aspect_ratio`, `frames_per_second`, `seed` |
| `POST /v1/ai/image-to-video/seedance-lite-720p` | Seedance Lite 720p - Create video from image | `prompt` | `image`, `duration`, `camera_fixed`, `aspect_ratio`, `frames_per_second`, `seed` |
| `POST /v1/ai/image-to-video/seedance-pro-1080p` | Seedance Pro 1080p - Create video from image | `prompt` | `image`, `duration`, `camera_fixed`, `aspect_ratio`, `frames_per_second`, `seed` |
| `POST /v1/ai/image-to-video/seedance-pro-480p` | Seedance Pro 480p - Create video from image | `prompt` | `image`, `duration`, `camera_fixed`, `aspect_ratio`, `frames_per_second`, `seed` |
| `POST /v1/ai/image-to-video/seedance-pro-720p` | Seedance Pro 720p - Create video from image | `prompt` | `image`, `duration`, `camera_fixed`, `aspect_ratio`, `frames_per_second`, `seed` |
| `POST /v1/ai/image-to-video/veo-3-1` | Create video from image - Veo 3.1 | `image`, `prompt` | `image_end`, `negative_prompt`, `duration`, `resolution`, `aspect_ratio`, `generate_audio`, `seed` |
| `GET /v1/ai/image-to-video/veo-3-1` | Get all Veo 3.1 I2V tasks | — | — |
| `POST /v1/ai/image-to-video/veo-3-1-fast` | Create video from image - Veo 3.1 Fast | `image`, `prompt` | `image_end`, `negative_prompt`, `duration`, `resolution`, `aspect_ratio`, `generate_audio`, `seed` |
| `GET /v1/ai/image-to-video/veo-3-1-fast` | Get all Veo 3.1 I2V Fast tasks | — | — |
| `POST /v1/ai/image-to-video/veo-3-1-lite` | Create video from image - Veo 3.1 Lite | `image`, `prompt` | `negative_prompt`, `duration`, `resolution`, `aspect_ratio`, `generate_audio`, `seed` |
| `GET /v1/ai/image-to-video/veo-3-1-lite` | Get all Veo 3.1 Lite I2V tasks | — | — |
| `POST /v1/ai/image-to-video/wan-2-5-i2v-1080p` | WAN 2.5 1080p - Create video from image | `prompt`, `image` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `seed` |
| `POST /v1/ai/image-to-video/wan-2-5-i2v-480p` | WAN 2.5 480p - Create video from image | `prompt`, `image` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `seed` |
| `POST /v1/ai/image-to-video/wan-2-5-i2v-720p` | WAN 2.5 720p - Create video from image | `prompt`, `image` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `seed` |
| `POST /v1/ai/image-to-video/wan-2-7` | WAN 2.7 - Create video from image | — | `prompt`, `negative_prompt`, `start_image_url`, `end_image_url`, `audio_url`, `video_url`, `resolution`, `duration` +2 |
| `POST /v1/ai/image-to-video/wan-v2-2-480p` | WAN 2.2 480p - Create video from image | `image` | `prompt`, `duration`, `aspect_ratio`, `seed` |
| `POST /v1/ai/image-to-video/wan-v2-2-580p` | WAN 2.2 580p - Create video from image | `image` | `prompt`, `duration`, `aspect_ratio`, `seed` |
| `POST /v1/ai/image-to-video/wan-v2-2-720p` | WAN 2.2 720p - Create video from image | `image` | `prompt`, `duration`, `aspect_ratio`, `seed` |
| `POST /v1/ai/image-to-video/wan-v2-6-1080p` | WAN 2.6 1080p - Create video from image | `prompt`, `image` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `shot_type`, `seed`, `size` |
| `POST /v1/ai/image-to-video/wan-v2-6-720p` | WAN 2.6 720p - Create video from image | `prompt`, `image` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `shot_type`, `seed`, `size` |
| `POST /v1/ai/reference-to-video/happy-horse-1` | Happy Horse 1.0 - Create video from reference images | `prompt`, `image_urls` | `aspect_ratio`, `resolution`, `duration`, `watermark`, `seed` |
| `POST /v1/ai/reference-to-video/happy-horse-1-1` | Happy Horse 1.1 - Create video from reference images | `prompt`, `image_urls` | `aspect_ratio`, `resolution`, `duration`, `watermark`, `seed` |
| `POST /v1/ai/reference-to-video/kling-v3-omni-pro` | Kling 3 Omni Pro - Video-to-video generation | `video_url` | `prompt`, `image_url`, `duration`, `aspect_ratio`, `cfg_scale`, `negative_prompt` |
| `POST /v1/ai/reference-to-video/kling-v3-omni-std` | Kling 3 Omni Standard - Video-to-video generation | `video_url` | `prompt`, `image_url`, `duration`, `aspect_ratio`, `cfg_scale`, `negative_prompt` |
| `POST /v1/ai/reference-to-video/veo-3-1` | Create video with reference images - Veo 3.1 | `image_urls`, `prompt` | `negative_prompt`, `resolution`, `aspect_ratio`, `generate_audio`, `seed` |
| `GET /v1/ai/reference-to-video/veo-3-1` | Get all Veo 3.1 Reference-to-Video tasks | — | — |
| `POST /v1/ai/reference-to-video/wan-2-7` | WAN 2.7 - Create video from reference characters | `prompt` | `negative_prompt`, `image_urls`, `video_urls`, `start_image_url`, `aspect_ratio`, `resolution`, `duration`, `seed` +1 |
| `POST /v1/ai/text-to-video/happy-horse-1` | Happy Horse 1.0 - Create video from text | `prompt` | `aspect_ratio`, `resolution`, `duration`, `seed` |
| `POST /v1/ai/text-to-video/happy-horse-1-1` | Happy Horse 1.1 - Create video from text | `prompt` | `aspect_ratio`, `resolution`, `duration`, `seed` |
| `POST /v1/ai/text-to-video/kling-v3-turbo-1080p` | Kling 3.0 Turbo T2V 1080p - Generate video | `prompt` | `aspect_ratio`, `duration` |
| `POST /v1/ai/text-to-video/kling-v3-turbo-720p` | Kling 3.0 Turbo T2V 720p - Generate video | `prompt` | `aspect_ratio`, `duration` |
| `POST /v1/ai/text-to-video/ltx-2-fast` | LTX Video 2.0 Fast - Create video from text | `prompt` | `generate_audio`, `seed`, `resolution`, `duration`, `fps` |
| `POST /v1/ai/text-to-video/ltx-2-pro` | LTX Video 2.0 Pro - Create video from text | `prompt` | `generate_audio`, `seed`, `resolution`, `duration`, `fps` |
| `POST /v1/ai/text-to-video/pixverse-v5` | PixVerse V5 - Create video from text | `prompt` | `aspect_ratio`, `resolution`, `duration`, `negative_prompt`, `style`, `seed` |
| `POST /v1/ai/text-to-video/pixverse-v5-5` | PixVerse V5.5 - Create video from text | `prompt` | `aspect_ratio`, `resolution`, `duration`, `negative_prompt`, `style`, `seed`, `generate_audio_switch`, `generate_multi_clip_switch` +1 |
| `POST /v1/ai/text-to-video/pixverse-v6` | PixVerse V6 - Create video from text | `prompt` | `aspect_ratio`, `resolution`, `duration`, `negative_prompt`, `style`, `seed`, `generate_audio_switch`, `generate_multi_clip_switch` +1 |
| `POST /v1/ai/text-to-video/runway-4-5` | Create video from text - RunWay Gen 4.5 | `prompt` | `ratio`, `duration` |
| `POST /v1/ai/text-to-video/veo-3-1` | Create video from text - Veo 3.1 | `prompt` | `negative_prompt`, `duration`, `resolution`, `aspect_ratio`, `generate_audio`, `seed` |
| `GET /v1/ai/text-to-video/veo-3-1` | Get all Veo 3.1 T2V tasks | — | — |
| `POST /v1/ai/text-to-video/veo-3-1-fast` | Create video from text - Veo 3.1 Fast | `prompt` | `negative_prompt`, `duration`, `resolution`, `aspect_ratio`, `generate_audio`, `seed` |
| `GET /v1/ai/text-to-video/veo-3-1-fast` | Get all Veo 3.1 T2V Fast tasks | — | — |
| `POST /v1/ai/text-to-video/veo-3-1-lite` | Create video from text - Veo 3.1 Lite | `prompt` | `negative_prompt`, `duration`, `resolution`, `aspect_ratio`, `generate_audio`, `seed` |
| `GET /v1/ai/text-to-video/veo-3-1-lite` | Get all Veo 3.1 Lite T2V tasks | — | — |
| `POST /v1/ai/text-to-video/wan-2-5-t2v-1080p` | WAN 2.5 1080p - Create video from text | `prompt` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `seed` |
| `POST /v1/ai/text-to-video/wan-2-5-t2v-480p` | WAN 2.5 480p - Create video from text | `prompt` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `seed` |
| `POST /v1/ai/text-to-video/wan-2-5-t2v-720p` | WAN 2.5 720p - Create video from text | `prompt` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `seed` |
| `POST /v1/ai/text-to-video/wan-2-7` | WAN 2.7 - Create video from text | `prompt` | `negative_prompt`, `audio_url`, `aspect_ratio`, `resolution`, `duration`, `seed`, `additional_settings` |
| `POST /v1/ai/text-to-video/wan-v2-6-1080p` | WAN 2.6 1080p - Create video from text | `prompt` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `shot_type`, `seed`, `size` |
| `POST /v1/ai/text-to-video/wan-v2-6-720p` | WAN 2.6 720p - Create video from text | `prompt` | `duration`, `negative_prompt`, `enable_prompt_expansion`, `shot_type`, `seed`, `size` |
| `POST /v1/ai/video-edit/happy-horse-1` | Happy Horse 1.0 - Edit video | `video_url`, `prompt` | `image_urls`, `resolution`, `audio_setting`, `seed` |
| `POST /v1/ai/video-edit/wan-2-7` | WAN 2.7 - Edit video | `video_url` | `prompt`, `negative_prompt`, `image_urls`, `aspect_ratio`, `resolution`, `duration`, `seed`, `additional_settings` |
| `POST /v1/ai/video-upscaler` | Video Upscaler - Upscale video | `video` | `creativity`, `resolution`, `fps_boost`, `sharpen`, `smart_grain`, `flavor`, `output_format` |
| `POST /v1/ai/video-upscaler-precision` | Video Upscaler Precision - Upscale video | `video` | `resolution`, `fps_boost`, `sharpen`, `smart_grain`, `strength`, `output_format` |
| `POST /v1/ai/video-upscaler-topaz` | Video Upscaler Topaz - Upscale video | `video`, `enhancement_model` | `resolution`, `target_fps`, `frame_interpolation`, `noise` |
| `POST /v1/ai/video-upscaler/turbo` | Video Upscaler Turbo - Upscale video | `video` | `creativity`, `resolution`, `fps_boost`, `sharpen`, `smart_grain`, `flavor`, `output_format` |
| `POST /v1/ai/video/kling-4k-i2v` | Kling 4K I2V - Generate video from image | `image` | `image_tail`, `prompt`, `negative_prompt`, `cfg_scale`, `duration`, `static_mask`, `dynamic_masks` |
| `POST /v1/ai/video/kling-4k-t2v` | Kling 4K T2V - Generate video from text | `prompt` | `negative_prompt`, `cfg_scale`, `aspect_ratio`, `duration` |
| `POST /v1/ai/video/kling-advanced-custom-elements` | Advanced Custom Elements - Create element | `element_name`, `element_description`, `reference_type` | `element_image_list`, `element_video_list`, `element_voice_id`, `tag_list` |
| `POST /v1/ai/video/kling-v2-6-motion-control-pro` | Kling 2.6 Pro - Motion control video | `image_url`, `video_url` | `prompt`, `character_orientation`, `cfg_scale` |
| `POST /v1/ai/video/kling-v2-6-motion-control-std` | Kling 2.6 Standard - Motion control video | `image_url`, `video_url` | `prompt`, `character_orientation`, `cfg_scale` |
| `POST /v1/ai/video/kling-v3-motion-control-pro` | Kling 3 Pro - Motion control video | `image_url`, `video_url` | `prompt`, `character_orientation`, `cfg_scale` |
| `POST /v1/ai/video/kling-v3-motion-control-std` | Kling 3 Standard - Motion control video | `image_url`, `video_url` | `prompt`, `character_orientation`, `cfg_scale` |
| `POST /v1/ai/video/kling-v3-omni-pro` | Kling 3 Omni Pro - Generate video from text or image | — | `prompt`, `multi_prompt`, `shot_type`, `image_url`, `start_image_url`, `end_image_url`, `image_urls`, `generate_audio` +2 |
| `POST /v1/ai/video/kling-v3-omni-std` | Kling 3 Omni Standard - Generate video from text or image | — | `prompt`, `multi_prompt`, `shot_type`, `image_url`, `start_image_url`, `end_image_url`, `image_urls`, `generate_audio` +2 |
| `POST /v1/ai/video/kling-v3-pro` | Kling 3 Pro - Generate video | — | `prompt`, `multi_prompt`, `start_image_url`, `end_image_url`, `generate_audio`, `multi_shot`, `shot_type`, `aspect_ratio` +3 |
| `POST /v1/ai/video/kling-v3-std` | Kling 3 Standard - Generate video | — | `prompt`, `multi_prompt`, `start_image_url`, `end_image_url`, `generate_audio`, `multi_shot`, `shot_type`, `aspect_ratio` +3 |
| `POST /v1/ai/video/omni-human-1-5` | OmniHuman 1.5 - Create human animation | `image_url`, `audio_url` | `prompt`, `turbo_mode`, `resolution` |
| `POST /v1/ai/video/runway-act-two` | RunWay Act Two Character Performance | `character`, `reference` | `ratio`, `body_control`, `expression_intensity`, `seed` |
| `POST /v1/ai/video/seedance-1-5-pro-1080p` | Seedance 1.5 Pro 1080p - Create video from text or image | `prompt` | `image`, `duration`, `generate_audio`, `camera_fixed`, `aspect_ratio`, `seed` |
| `POST /v1/ai/video/seedance-1-5-pro-480p` | Seedance 1.5 Pro 480p - Create video from text or image | `prompt` | `image`, `duration`, `generate_audio`, `camera_fixed`, `aspect_ratio`, `seed` |
| `POST /v1/ai/video/seedance-1-5-pro-720p` | Seedance 1.5 Pro 720p - Create video from text or image | `prompt` | `image`, `duration`, `generate_audio`, `camera_fixed`, `aspect_ratio`, `seed` |
| `POST /v1/ai/video/seedance-2-5-pro-1080p` | Seedance 2.5 Pro 1080p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_audios`, `duration`, `aspect_ratio`, `camera_fixed`, `camera_motion` +6 |
| `POST /v1/ai/video/seedance-2-5-pro-480p` | Seedance 2.5 Pro 480p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_audios`, `duration`, `aspect_ratio`, `camera_fixed`, `camera_motion` +6 |
| `POST /v1/ai/video/seedance-2-5-pro-720p` | Seedance 2.5 Pro 720p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_audios`, `duration`, `aspect_ratio`, `camera_fixed`, `camera_motion` +6 |
| `GET /v1/ai/video/seedance-2-fast` | Seedance 2.0 Fast - List all tasks | — | — |
| `POST /v1/ai/video/seedance-2-fast-1080p` | Seedance 2.0 Fast 1080p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` +3 |
| `POST /v1/ai/video/seedance-2-fast-480p` | Seedance 2.0 Fast 480p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` +3 |
| `POST /v1/ai/video/seedance-2-fast-720p` | Seedance 2.0 Fast 720p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` +3 |
| `GET /v1/ai/video/seedance-2-mini` | Seedance 2.0 Mini - List all tasks | — | — |
| `POST /v1/ai/video/seedance-2-mini-480p` | Seedance 2.0 Mini 480p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` |
| `POST /v1/ai/video/seedance-2-mini-720p` | Seedance 2.0 Mini 720p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` |
| `GET /v1/ai/video/seedance-2-pro` | Seedance 2.0 Pro - List all tasks | — | — |
| `POST /v1/ai/video/seedance-2-pro-1080p` | Seedance 2.0 Pro 1080p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` +3 |
| `POST /v1/ai/video/seedance-2-pro-480p` | Seedance 2.0 Pro 480p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` +3 |
| `POST /v1/ai/video/seedance-2-pro-4k` | Seedance 2.0 Pro 4K - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` +3 |
| `POST /v1/ai/video/seedance-2-pro-720p` | Seedance 2.0 Pro 720p - Create video from text or image | `prompt` | `image`, `image_end`, `reference_images`, `reference_videos`, `duration`, `aspect_ratio`, `camera_fixed`, `seed` +3 |
| `POST /v1/ai/video/vfx` | VFX - Apply visual effects to video | `video` | `filter_type`, `fps`, `bloom_filter_contrast`, `motion_filter_kernel_size`, `motion_filter_decay_factor` |

## Upload de Arquivos

2 endpoint(s).

| Endpoint | Resumo | Obrigatórios | Opcionais |
|---|---|---|---|
| `GET /v1/ai/uploads` | List your uploaded files | — | — |
| `POST /v1/ai/uploads/request-url` | Request pre-signed URLs to upload files | `files` | — |

