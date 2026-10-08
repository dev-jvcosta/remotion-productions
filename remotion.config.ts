/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);

// Overlay para o Final Cut Pro: .mov ProRes 4444 com canal alfa (decisão de 2026-09-25).
// Os três precisam andar juntos: JPEG não tem alfa, e sem o pixel format "yuva" o
// ProRes sai opaco mesmo com quadros PNG.
Config.setVideoImageFormat("png");
Config.setCodec("prores");
Config.setProResProfile("4444");
Config.setPixelFormat("yuva444p10le");

Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);
