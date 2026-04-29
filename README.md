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

## Como adicionar questões ao banco (fluxo automatizado)

**Fluxo recomendado (sem editar arquivos):**

1. Em conversa nova do Claude (com Research ativado), cole o `PROMPT-MESTRE.md`.
2. Peça: *"Gere 30 questões de [ÁREA], disciplina [DISCIPLINA]."*
3. Copie o JSON inteiro que o Claude entregou (pode incluir o comentário `// auto-revisão...` no topo, o app ignora).
4. Abra o app → "Banco de questões" → "+ Adicionar lote".
5. Cole o JSON na caixa de texto, toque "Validar" — o app checa schema, IDs duplicados, e mostra a distribuição por área.
6. Se tudo verde, toque "Adicionar ao banco". Pronto.

As questões adicionadas pelo Admin ficam salvas no `localStorage` do navegador (marcadas como "local"). Elas funcionam offline e não dependem do GitHub.

**Backup semanal (recomendado):** no domingo, vá em "Banco de questões" → "↓ Exportar banco". Isso baixa o `questoes.json` atualizado. Substitua o arquivo no repositório do GitHub e dê commit. Assim o banco fica versionado e disponível em outros dispositivos.

**Trocar de celular:** após exportar do antigo, no novo abra "Banco" → "↑ Importar banco" → escolha o arquivo. Tudo é restaurado.

**Fluxo manual (alternativa):** se preferir, ainda dá pra editar `questoes.json` direto no GitHub (vide schema abaixo) e o app puxa automaticamente.

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
