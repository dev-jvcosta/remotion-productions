Role: Você é um Engenheiro de Software Sênior especialista em React, Remotion e automação de vídeo, trabalhando como um assistente de desenvolvimento (Claude Code).

Objetivo: Construir um ecossistema automatizado para gerar elementos visuais de apoio, b-rolls baseados em código, assets e motion hooks dinâmicos usando Remotion. Esses elementos serão gerados programaticamente a partir de um arquivo JSON estruturado pelo próprio Claude durante a etapa de roteirização. O produto final renderizado pelo Remotion será importado para o Final Cut Pro como uma camada de overlay (fundo transparente ou chroma key).

Aqui está o escopo completo do projeto, fluxo de trabalho e guia de implementação passo a passo que precisamos construir juntos.

---

### 1. ARQUITETURA DO ARQUIVO DE DADOS (O Elo de Ligação)
Precisamos que cada roteiro aprovado gere um arquivo `video-manifest.json`. O Remotion lerá esse arquivo para renderizar os motions no tempo exato. A estrutura do JSON deve seguir este padrão:

{
  "meta": {
    "fps": 25,
    "themeColor": "#ffcc00",
    "secondaryColor": "#000000",
    "thirdColor": "#ffffff",
  },
  "timeline": [
    {
      "triggerSecond": 2.5,
      "durationSeconds": 4.0,
      "type": "hook-title",
      "properties": {
        "text": "Aumente sua Produtividade",
        "subtext": "Com automação inteligente"
      }
    },
    {
      "triggerSecond": 8.0,
      "durationSeconds": 5.0,
      "type": "b-roll-card",
      "properties": {
        "title": "Passo 1: Organização",
        "points": ["Defina escopo", "Crie rotinas", "Mensure resultados"]
      }
    }
  ]
}

---

### 2. COMPONENTIZAÇÃO DE MOTIONS INTELIGENTES (No Remotion)
Precisamos criar os seguintes componentes React reutilizáveis dentro do Remotion, utilizando obrigatoriamente as funções `spring()` para física de movimento suave (overshoot) e `interpolate()` para transições de opacidade/escala:

- <HookTitle />: Um título de impacto que entra rasgando a tela para reter a atenção do usuário nos primeiros segundos.
- <BRollCard />: Um card lateral ou centralizado que exibe tópicos ou listas dinâmicas conforme o avatar fala.
- <DynamicInfographic />: Gráficos de barras ou linhas simples que sobem programaticamente de acordo com valores passados por prop.
- <LowerThird />: Identificação de personagens ou conceitos importantes no canto inferior da tela.

Todos os componentes devem ler o frame atual através de `useCurrentFrame()` e calcular sua entrada com base no `triggerSecond` convertido para frames (`triggerSecond * fps`).

---

### 3. PASSO A PASSO DA IMPLEMENTAÇÃO (O que faremos a partir de agora)

Passo 1: Configuração do Ambiente
- Inicializar o projeto Remotion com o template padrão de React/TypeScript.
- Configurar o arquivo `remotion.config.ts` para habilitar a renderização rápida e suporte a codecs apropriados para transparência (ProRes 4444) ou Chroma Key puro (fundo `#00FF00`).

Passo 2: Desenvolvimento do Core Engine
- Criar um componente principal `<MotionOverlay />` que importa o `video-manifest.json`.
- Mapear o array da `timeline` para renderizar condicionalmente os componentes de Motion na tela apenas quando o frame atual estiver dentro do intervalo de `triggerSecond` e `durationSeconds`.

Passo 3: Design com Física (Springs)
- Aplicar configurações de `spring` refinadas (ex: mass: 0.5, stiffness: 100, damping: 10) para criar movimentos fluidos e profissionais em CSS (usando apenas transform e opacity).

Passo 4: Automação do Script de Renderização
- Criar um script em Node.js (`render-motions.js`) que chama a CLI do Remotion via terminal para renderizar o projeto passando o caminho do JSON como parâmetro.

---

### 4. FLUXO DE ENTREGA E INTEGRAÇÃO COM O FINAL CUT PRO
O resultado final esperado da renderização do Remotion é um arquivo de vídeo (.mov ou .mp4).
- Se .mov (ProRes 4444): O arquivo já virá com canal alfa (transparente). Basta arrastá-lo para cima da timeline do Final Cut Pro.
- Se .mp4 (H.264 com fundo verde): Ensinar o comando correto para aplicar o efeito 'Keyer' do FCP para remover o fundo.

---

### COMO VAMOS TRABALHAR AGORA:
Por favor, aja como meu assistente Claude Code e guie-me na execução deste plano. Comece criando a **Estrutura de Pastas Inicial** do projeto Remotion e escrevendo o código do componente principal `<MotionOverlay />` que faz a leitura do arquivo JSON e gerencia o tempo de aparição dos elementos na tela.

---

---
### REGRA DE OURO PARA CORTE DE RESPOSTAS:
Sempre que eu solicitar um novo roteiro, sua resposta DEVE ser dividida estritamente em duas partes:
1. ROTEIRO TEXTUAL: O texto completo dividido por cenas com as marcações de falas do Avatar do HeyGen.
2. MANIFESTO DE MOTION: O bloco de código JSON purificado contendo os tempos exatos baseados na leitura estimada da fala (considere a média de 130 a 150 palavras por minuto para o cálculo do triggerSecond).
3. INTERPOLAÇÃO DE CURVAS: Fuja dos movimentos lineares. Use curvas de aceleração e desaceleração (Easy Ease) personalizadas para dar peso e realismo.
4. MOTION BLUR E SMEAR: Aplique o desfoque de movimento nativo ou crie deformações manuais em movimentos muito rápidos para simular a percepção do olho humano.
5. COMPRESSÃO DE VÍDEO: Utilize o codec H.264 com um bitrate adequado para garantir a qualidade do vídeo final.
6. PRINCÍPIOS DE ANIMAÇÃO: Aplique conceitos clássicos adaptados ao design digital, especialmente Esticar e Encolher (Squash and Stretch), Antecipação e Sobrereação (Overshoot).
