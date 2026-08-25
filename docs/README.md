# 📚 Central de Documentação e FAQ — Remotion Productions

Bem-vindo à documentação do repositório de vídeos em Remotion. Aqui você encontra guias práticos, comandos rápidos e respostas para as dúvidas mais comuns sobre edição, renderização, geração de locuções e legendas.

---

## 🧭 Guias Disponíveis

- ❓ **[FAQ — Perguntas Frequentes](./FAQ.md)**: Respostas diretas sobre onde alterar textos, como renderizar, gerar legendas, renderizar apenas uma cena específica e regras de diretórios.
- 🎬 **[Guia de Produção e Fluxo de Trabalho](./GUIA_DE_PRODUCAO.md)**: Passo a passo completo do ciclo de vida de um vídeo (Roteiro ➔ Áudio ➔ Visual ➔ Studio ➔ Render ➔ Transcrição).

---

## ⚡ Comandos Rápidos do Dia a Dia

```bash
# 1. Abrir o Remotion Studio no navegador (Preview interativo)
npm run dev

# 2. Gerar ou atualizar a locução com IA (ElevenLabs)
node --env-file=.env --strip-types scripts/gerar-locucao.ts --forcar

# 3. Renderizar o vídeo completo em MP4
npx remotion render UltimosTurnos out/UltimosTurnos_v7.mp4

# 4. Renderizar um Still (imagem PNG de um frame específico)
npx remotion still UltimosTurnos out/Revs/rev7/f1250.png --frame=1250

# 5. Renderizar apenas um trecho/cena específica do vídeo
npx remotion render UltimosTurnos out/trecho_cena6.mp4 --frames=1707-1930

# 6. Gerar transcrição e legendas (.srt e .txt) do vídeo renderizado
node --env-file=.env --strip-types scripts/gerar-transcricao.ts out/UltimosTurnos_v7.mp4
```

---

## 📂 Estrutura das Pastas de Saída (`out/`)

| Diretório | O que deve conter |
|---|---|
| `out/` | Vídeos finais exportados (`UltimosTurnos_v1.mp4`, `UltimosTurnos_v2.mp4`, etc.) |
| `out/Revs/rev<N>/` | Frames estáticos (`.png`) gerados para revisão visual de cada versão (ex: `out/Revs/rev7/`) |
| `out/transcrição/` | Arquivos de legenda (`.srt`), texto de revisão (`.txt`) e áudios extraídos |
| `out/checks/` | Capturas rápidas de validação |
