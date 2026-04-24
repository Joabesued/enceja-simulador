# ENCCEJA Simulador

PWA offline para simulados do ENCCEJA 2026. Banco de questões em JSON, progresso salvo no navegador. Zero backend, zero custo.

## Arquivos

```
encceja-simulador/
├── index.html       # estrutura
├── app.js           # lógica (carregamento, simulado, relatórios)
├── style.css        # estilo (editorial dark, serif)
├── manifest.json    # PWA
├── sw.js            # service worker (offline + cache)
├── questoes.json    # BANCO DE QUESTÕES (onde você adiciona conteúdo)
├── PROMPT-MESTRE-v2.md  # prompt pra gerar questões (pesquisa ENCCEJA embutida)
└── README.md
```

> **Nome correto:** ENCCEJA (dois C's). Não confundir com ENEM — são 4 alternativas A–D, não 5, e filosofia editorial distinta.

## Deploy no GitHub Pages

Igual ao Foco Essencial:

1. Crie o repositório `encceja-simulador` no GitHub.
2. Suba os 6 arquivos acima.
3. Settings → Pages → Source: `main` → `/ (root)` → Save.
4. Aguarde ~1 minuto. Acesse em `https://joabesued.github.io/encceja-simulador/`.
5. No celular: abra no navegador → "Adicionar à tela inicial". Pronto, PWA instalado.

## Como adicionar questões ao banco

1. Use o prompt-mestre do ENCCEJA (já gerado anteriormente) em uma conversa nova do Claude com Research ativado.
2. Peça: *"Gere 30 questões de [ÁREA], capítulo [CAPÍTULO], no padrão JSON."*
3. Copie o array de questões e cole dentro do campo `questoes` em `questoes.json`.
4. Faça commit/push no GitHub.
5. O app pega a versão nova automaticamente (service worker faz network-first nesse arquivo).

### Schema obrigatório de cada questão

```json
{
  "id": "HUM_CID_001",
  "area": "humanas",
  "capitulo": "cidadania",
  "dificuldade": "media",
  "habilidade_inep": "...",
  "texto_base": {
    "tipo": "noticia",
    "fonte": "Adaptado de ...",
    "conteudo": "..."
  },
  "enunciado": "...",
  "alternativas": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "gabarito": "B",
  "comentario": "..."
}
```

### Códigos de área e capítulo

- **humanas:** cultura_identidade, territorio, natureza_humana, estado_direito, cidadania, impactos_ambientais, urbanizacao_industria, trabalho_globalizacao, tempo_espaco
- **natureza:** ciencia_conhecimento, tecnologias, tecnologia_cotidiano, humanidade_ambiente, saude_brasil, fazer_cientifico, fisica, quimica, biodiversidade
- **matematica:** introducao, logica_argumentacao, numeros, geometria, medidas, grandezas, probabilidade, graficos_tabelas, estatistica
- **linguagens:** publicidade, linguas_estrangeiras, corpo_saude, arte, literatura, sociedade_letrada, argumentacao, contexto_interpretacao, tecnologias_comunicacao

## Modos disponíveis

- **Completo:** 120 questões, 4h (bloqueado até ter 120 no banco)
- **Por área:** 30 questões, 1h (bloqueado até ter 30 na área)
- **Por capítulo:** até 15 questões, tempo proporcional (mínimo 5 por capítulo)
- **Revisão de erros:** só questões que você errou antes
- **Relatório:** gráficos por área e capítulo, histórico de simulados

## Meta de conteúdo

**612 questões** (17 por capítulo × 36 capítulos). Com o prompt-mestre, ~1 capítulo por dia nos dias de estudo = banco completo em ~5 semanas.

## Estado inicial

6 questões de Humanas (as 3 da dose de 21/04 + 3 da dose de 22/04).

## Notas técnicas

- `localStorage` guarda respostas e sessões. Não sincroniza entre dispositivos — use só no celular.
- Cache: `questoes.json` é network-first (atualiza automaticamente). Resto é cache-first (offline total).
- Reset: botão "Apagar histórico" no Relatório limpa tudo.
