// ENCCEJA Simulador — Joabe
// PWA vanilla JS, banco de questões em JSON, persistência em localStorage

// ============ CONSTANTES ============
const DATA_PROVA = new Date('2026-08-23T13:00:00-03:00');
const AREAS = {
  humanas: { nome: 'Ciências Humanas', cor: '#c9a86a' },
  natureza: { nome: 'Ciências da Natureza', cor: '#7a9971' },
  matematica: { nome: 'Matemática', cor: '#8fa3c4' },
  linguagens: { nome: 'Linguagens', cor: '#d1a4a4' }
};

const CAPITULOS = {
  humanas: ['cultura_identidade','territorio','natureza_humana','estado_direito','cidadania','impactos_ambientais','urbanizacao_industria','trabalho_globalizacao','tempo_espaco'],
  natureza: ['ciencia_conhecimento','tecnologias','tecnologia_cotidiano','humanidade_ambiente','saude_brasil','fazer_cientifico','fisica','quimica','biodiversidade'],
  matematica: ['introducao','logica_argumentacao','numeros','geometria','medidas','grandezas','probabilidade','graficos_tabelas','estatistica'],
  linguagens: ['publicidade','linguas_estrangeiras','corpo_saude','arte','literatura','sociedade_letrada','argumentacao','contexto_interpretacao','tecnologias_comunicacao']
};

const DISCIPLINAS = {
  historia: 'História', geografia: 'Geografia', sociologia: 'Sociologia', filosofia: 'Filosofia',
  biologia: 'Biologia', quimica: 'Química', fisica: 'Física',
  portugues: 'Português', literatura: 'Literatura', lingua_estrangeira: 'Língua Estrangeira',
  artes: 'Artes', educacao_fisica: 'Educação Física',
  numeros: 'Números', geometria: 'Geometria', grandezas_medidas: 'Grandezas e Medidas',
  variacao: 'Variação', algebra_graficos: 'Álgebra e Gráficos',
  graficos_tabelas: 'Gráficos e Tabelas', estatistica_probabilidade: 'Estatística e Probabilidade'
};

const LABELS_CAP = {
  cultura_identidade:'Cultura e identidade', territorio:'Território', natureza_humana:'Natureza', estado_direito:'Estado e direito',
  cidadania:'Cidadania', impactos_ambientais:'Impactos ambientais', urbanizacao_industria:'Urbanização e indústria',
  trabalho_globalizacao:'Trabalho e globalização', tempo_espaco:'Tempo e espaço',
  ciencia_conhecimento:'Ciência e conhecimento', tecnologias:'Tecnologias', tecnologia_cotidiano:'Tecnologia no cotidiano',
  humanidade_ambiente:'Humanidade e ambiente', saude_brasil:'Saúde no Brasil', fazer_cientifico:'Fazer científico',
  fisica:'Física', quimica:'Química', biodiversidade:'Biodiversidade',
  introducao:'Introdução', logica_argumentacao:'Lógica e argumentação', numeros:'Números', geometria:'Geometria',
  medidas:'Medidas', grandezas:'Grandezas', probabilidade:'Probabilidade', graficos_tabelas:'Gráficos e tabelas',
  estatistica:'Estatística',
  publicidade:'Publicidade', linguas_estrangeiras:'Línguas estrangeiras', corpo_saude:'Corpo e saúde', arte:'Arte',
  literatura:'Literatura', sociedade_letrada:'Sociedade letrada', argumentacao:'Argumentação',
  contexto_interpretacao:'Contexto e interpretação', tecnologias_comunicacao:'Tecnologias da comunicação'
};

const FRASES = [
  { t: 'O único problema filosófico verdadeiramente sério é o suicídio — decidir se a vida vale ou não ser vivida.', a: 'Camus' },
  { t: 'O homem está condenado a ser livre.', a: 'Sartre' },
  { t: 'A vida não tem sentido a priori. Cabe a você dar-lhe um sentido.', a: 'Sartre' },
  { t: 'É preciso imaginar Sísifo feliz.', a: 'Camus' },
  { t: 'Não se nasce mulher, torna-se mulher.', a: 'Beauvoir' },
  { t: 'A liberdade é aquilo que você faz com o que fizeram de você.', a: 'Sartre' },
  { t: 'Começar é a parte mais difícil. Depois, só resta continuar.', a: '—' },
  { t: 'Disciplina é a ponte entre metas e realização.', a: 'Jim Rohn' },
  { t: 'Quem tem um porquê suporta quase qualquer como.', a: 'Nietzsche' }
];

// ============ ESTADO ============
let state = {
  questoes: [],
  tela: 'home',
  sessao: null, // { tipo, filtro, questoes, respostas, iniciadoEm, duracaoMin }
  timer: null
};

// ============ STORAGE ============
const LS = {
  RESP: 'fe_respostas',
  SES: 'fe_sessoes'
};

function loadRespostas() {
  try { return JSON.parse(localStorage.getItem(LS.RESP) || '[]'); } catch { return []; }
}
function saveResposta(r) {
  const arr = loadRespostas();
  arr.push(r);
  localStorage.setItem(LS.RESP, JSON.stringify(arr));
}
function loadSessoes() {
  try { return JSON.parse(localStorage.getItem(LS.SES) || '[]'); } catch { return []; }
}
function saveSessao(s) {
  const arr = loadSessoes();
  arr.push(s);
  localStorage.setItem(LS.SES, JSON.stringify(arr));
}

// ============ UTILS ============
function el(tag, props = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.substring(2).toLowerCase(), v);
    else if (v !== undefined && v !== null) e.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (c === null || c === undefined || c === false) return;
    if (typeof c === 'string' || typeof c === 'number') e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function diasRestantes() {
  const diff = DATA_PROVA - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatTime(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function toast(msg) {
  const t = el('div', { class: 'toast' }, msg);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function fraseDia() {
  const dia = new Date().getDate();
  return FRASES[dia % FRASES.length];
}

// ============ CARREGAR BANCO ============
async function carregarBanco() {
  try {
    const res = await fetch('./questoes.json?v=' + Date.now());
    const data = await res.json();
    state.questoes = data.questoes || [];
    return true;
  } catch (err) {
    console.error('Erro ao carregar banco:', err);
    state.questoes = [];
    return false;
  }
}

// ============ ESTATÍSTICAS ============
function statsGerais() {
  const resp = loadRespostas();
  const total = resp.length;
  const acertos = resp.filter(r => r.correta).length;
  const sessoes = loadSessoes().length;
  return { total, acertos, sessoes, taxa: total ? Math.round(acertos / total * 100) : 0 };
}

function statsPorArea() {
  const resp = loadRespostas();
  const out = {};
  Object.keys(AREAS).forEach(a => { out[a] = { total: 0, acertos: 0 }; });
  resp.forEach(r => {
    const q = state.questoes.find(x => x.id === r.id_questao);
    if (q && out[q.area]) {
      out[q.area].total++;
      if (r.correta) out[q.area].acertos++;
    }
  });
  return out;
}

function statsPorCapitulo(area) {
  const resp = loadRespostas();
  const out = {};
  CAPITULOS[area].forEach(c => { out[c] = { total: 0, acertos: 0, disponiveis: 0 }; });
  state.questoes.filter(q => q.area === area).forEach(q => {
    if (out[q.capitulo]) out[q.capitulo].disponiveis++;
  });
  resp.forEach(r => {
    const q = state.questoes.find(x => x.id === r.id_questao);
    if (q && q.area === area && out[q.capitulo]) {
      out[q.capitulo].total++;
      if (r.correta) out[q.capitulo].acertos++;
    }
  });
  return out;
}

// ============ TELAS ============

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const tela = state.tela;
  if (tela === 'home') renderHome(app);
  else if (tela === 'modo-area') renderModoArea(app);
  else if (tela === 'modo-capitulo') renderModoCapitulo(app);
  else if (tela === 'modo-capitulo-lista') renderModoCapituloLista(app);
  else if (tela === 'simulado') renderSimulado(app);
  else if (tela === 'resultado') renderResultado(app);
  else if (tela === 'relatorio') renderRelatorio(app);
  else if (tela === 'revisao') renderRevisao(app);
  window.scrollTo(0, 0);
}

// -------- HOME --------
function renderHome(app) {
  const st = statsGerais();
  const dias = diasRestantes();
  const frase = fraseDia();
  const totalQ = state.questoes.length;

  app.appendChild(el('header', { class: 'brand' },
    el('h1', {}, 'ENCCEJA ', el('em', {}, 'Simulador')),
    el('div', { class: 'sub' }, 'Banco próprio · Progresso local · Offline')
  ));

  app.appendChild(el('div', { class: 'countdown' },
    el('div', {},
      el('div', { class: 'label' }, 'Até a prova'),
      el('div', { class: 'value' }, String(dias), el('small', {}, dias === 1 ? ' dia' : ' dias'))
    ),
    el('div', { style: 'text-align: right;' },
      el('div', { class: 'label' }, '23 ago 2026'),
      el('div', { class: 'value', style: 'font-size: 1.1rem; color: var(--ink-dim);' }, 'Domingo')
    )
  ));

  app.appendChild(el('div', { class: 'stats' },
    el('div', { class: 'stat' },
      el('div', { class: 'n' }, String(st.total)),
      el('div', { class: 'l' }, 'Respondidas')
    ),
    el('div', { class: 'stat' },
      el('div', { class: 'n' }, st.total ? st.taxa + '%' : '—'),
      el('div', { class: 'l' }, 'Taxa de acerto')
    ),
    el('div', { class: 'stat' },
      el('div', { class: 'n' }, String(st.sessoes)),
      el('div', { class: 'l' }, 'Simulados')
    )
  ));

  app.appendChild(el('h2', { class: 'section-title' },
    'Modos de simulado',
    el('span', { class: 'count' }, `${totalQ} questões no banco`)
  ));

  const modes = el('div', { class: 'modes' });

  const canComplete = totalQ >= 120;
  const btnCompleto = el('button', {
    class: 'mode-btn',
    disabled: canComplete ? null : '',
    onclick: () => iniciarSimulado({ tipo: 'completo', duracao: 240 })
  },
    el('span', { class: 't' }, 'Simulado completo'),
    el('span', { class: 'd' }, canComplete ? '120 questões · 4h · todas as áreas' : `bloqueado (precisa de 120, você tem ${totalQ})`)
  );
  modes.appendChild(btnCompleto);

  modes.appendChild(el('button', {
    class: 'mode-btn',
    onclick: () => { state.tela = 'modo-area'; render(); }
  },
    el('span', { class: 't' }, 'Simulado por área'),
    el('span', { class: 'd' }, '30 questões de uma das 4 áreas · 1h')
  ));

  modes.appendChild(el('button', {
    class: 'mode-btn',
    onclick: () => { state.tela = 'modo-capitulo'; render(); }
  },
    el('span', { class: 't' }, 'Simulado por capítulo'),
    el('span', { class: 'd' }, 'Treino focado em 1 capítulo específico')
  ));

  const errosDisp = loadRespostas().filter(r => !r.correta).length;
  modes.appendChild(el('button', {
    class: 'mode-btn',
    disabled: errosDisp > 0 ? null : '',
    onclick: () => iniciarRevisaoErros()
  },
    el('span', { class: 't' }, 'Revisão de erros'),
    el('span', { class: 'd' }, errosDisp > 0 ? `${errosDisp} questões erradas pra revisar` : 'sem erros acumulados (ou sem respostas ainda)')
  ));

  modes.appendChild(el('button', {
    class: 'mode-btn',
    disabled: st.total > 0 ? null : '',
    onclick: () => { state.tela = 'relatorio'; render(); }
  },
    el('span', { class: 't' }, 'Relatório de desempenho'),
    el('span', { class: 'd' }, 'Evolução por área, capítulo e tempo')
  ));

  app.appendChild(modes);

  app.appendChild(el('div', { class: 'quote' },
    frase.t,
    el('cite', {}, '— ' + frase.a)
  ));
}

// -------- SELECIONAR ÁREA --------
function renderModoArea(app) {
  app.appendChild(el('header', { class: 'brand' },
    el('h1', {}, 'Simulado ', el('em', {}, 'por área')),
    el('div', { class: 'sub' }, 'Escolha uma área · 30 questões · 1h')
  ));

  const modes = el('div', { class: 'modes' });
  Object.keys(AREAS).forEach(area => {
    const disp = state.questoes.filter(q => q.area === area).length;
    const ok = disp >= 30;
    modes.appendChild(el('button', {
      class: 'mode-btn',
      disabled: ok ? null : '',
      onclick: () => iniciarSimulado({ tipo: 'area', filtro: { area }, duracao: 60 })
    },
      el('span', { class: 't' }, AREAS[area].nome),
      el('span', { class: 'd' }, ok ? `${disp} questões disponíveis no banco` : `bloqueado (${disp}/30 questões)`)
    ));
  });

  app.appendChild(modes);
  app.appendChild(el('button', {
    class: 'btn', style: 'margin-top: 1.5rem;',
    onclick: () => { state.tela = 'home'; render(); }
  }, '← Voltar'));
}

// -------- SELECIONAR CAPÍTULO: primeiro área --------
function renderModoCapitulo(app) {
  app.appendChild(el('header', { class: 'brand' },
    el('h1', {}, 'Simulado ', el('em', {}, 'por capítulo')),
    el('div', { class: 'sub' }, 'Escolha a área primeiro')
  ));

  const modes = el('div', { class: 'modes' });
  Object.keys(AREAS).forEach(area => {
    const disp = state.questoes.filter(q => q.area === area).length;
    modes.appendChild(el('button', {
      class: 'mode-btn',
      disabled: disp > 0 ? null : '',
      onclick: () => { state.areaEscolhida = area; state.tela = 'modo-capitulo-lista'; render(); }
    },
      el('span', { class: 't' }, AREAS[area].nome),
      el('span', { class: 'd' }, `${disp} questões no total`)
    ));
  });

  app.appendChild(modes);
  app.appendChild(el('button', {
    class: 'btn', style: 'margin-top: 1.5rem;',
    onclick: () => { state.tela = 'home'; render(); }
  }, '← Voltar'));
}

// -------- LISTA DE CAPÍTULOS --------
function renderModoCapituloLista(app) {
  const area = state.areaEscolhida;
  app.appendChild(el('header', { class: 'brand' },
    el('h1', {}, AREAS[area].nome),
    el('div', { class: 'sub' }, '9 capítulos · mínimo 10 questões por simulado')
  ));

  const list = el('div', { class: 'cap-picker' });
  CAPITULOS[area].forEach(cap => {
    const disp = state.questoes.filter(q => q.area === area && q.capitulo === cap).length;
    const ok = disp >= 5;
    const qtd = Math.min(disp, 15);
    list.appendChild(el('button', {
      class: 'cap-item',
      disabled: ok ? null : '',
      style: ok ? '' : 'opacity: 0.4; cursor: not-allowed;',
      onclick: () => ok && iniciarSimulado({
        tipo: 'capitulo',
        filtro: { area, capitulo: cap },
        duracao: Math.max(15, qtd * 3)
      })
    },
      LABELS_CAP[cap] || cap,
      el('span', { class: 'tag' }, ok ? `${qtd}q · ${Math.max(15, qtd * 3)}min` : `${disp}/5`)
    ));
  });

  app.appendChild(list);
  app.appendChild(el('button', {
    class: 'btn', style: 'margin-top: 1.5rem;',
    onclick: () => { state.tela = 'modo-capitulo'; render(); }
  }, '← Voltar'));
}

// ============ SIMULADO ============
function iniciarSimulado({ tipo, filtro = {}, duracao }) {
  let pool = state.questoes;
  if (filtro.area) pool = pool.filter(q => q.area === filtro.area);
  if (filtro.capitulo) pool = pool.filter(q => q.capitulo === filtro.capitulo);

  let qtd = tipo === 'completo' ? 120 : tipo === 'area' ? 30 : Math.min(pool.length, 15);

  if (pool.length < qtd) {
    toast(`Banco tem só ${pool.length} questões. Iniciando com todas.`);
    qtd = pool.length;
  }

  const selecionadas = shuffle(pool).slice(0, qtd);

  state.sessao = {
    id: 'ses_' + Date.now(),
    tipo,
    filtro,
    questoes: selecionadas,
    respostas: new Array(selecionadas.length).fill(null),
    indiceAtual: 0,
    iniciadoEm: Date.now(),
    duracaoMin: duracao,
    segundosRestantes: duracao * 60,
    finalizado: false
  };

  iniciarTimer();
  state.tela = 'simulado';
  render();
}

function iniciarRevisaoErros() {
  const resp = loadRespostas();
  const erradas = resp.filter(r => !r.correta).map(r => r.id_questao);
  const unicas = [...new Set(erradas)];
  const pool = state.questoes.filter(q => unicas.includes(q.id));

  if (pool.length === 0) { toast('Nenhuma questão errada pra revisar.'); return; }

  state.sessao = {
    id: 'ses_' + Date.now(),
    tipo: 'revisao',
    filtro: {},
    questoes: shuffle(pool),
    respostas: new Array(pool.length).fill(null),
    indiceAtual: 0,
    iniciadoEm: Date.now(),
    duracaoMin: Math.max(15, pool.length * 2),
    segundosRestantes: Math.max(15, pool.length * 2) * 60,
    finalizado: false
  };

  iniciarTimer();
  state.tela = 'simulado';
  render();
}

function iniciarTimer() {
  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(() => {
    if (!state.sessao || state.sessao.finalizado) {
      clearInterval(state.timer); state.timer = null; return;
    }
    state.sessao.segundosRestantes--;
    if (state.sessao.segundosRestantes <= 0) {
      toast('Tempo esgotado!');
      finalizarSimulado();
      return;
    }
    atualizarTimer();
  }, 1000);
}

function atualizarTimer() {
  const elTimer = document.querySelector('[data-timer]');
  if (elTimer && state.sessao) {
    elTimer.textContent = formatTime(state.sessao.segundosRestantes);
    if (state.sessao.segundosRestantes < 300) elTimer.classList.add('warn');
  }
}

// -------- TELA SIMULADO --------
function renderSimulado(app) {
  const s = state.sessao;
  const q = s.questoes[s.indiceAtual];
  const resp = s.respostas[s.indiceAtual];
  const finalizadoQ = resp && resp.confirmada;

  // Header com timer e progresso
  app.appendChild(el('div', { class: 'q-header' },
    el('span', {}, `Questão ${s.indiceAtual + 1} / ${s.questoes.length}`),
    el('span', { class: 'timer', 'data-timer': '' }, formatTime(s.segundosRestantes))
  ));

  // Meta (área / disciplina / capítulo / habilidade)
  const metaPartes = [AREAS[q.area]?.nome || q.area];
  if (q.disciplina && DISCIPLINAS[q.disciplina]) metaPartes.push(DISCIPLINAS[q.disciplina]);
  metaPartes.push(LABELS_CAP[q.capitulo] || q.capitulo);
  app.appendChild(el('div', { class: 'q-meta' }, metaPartes.join(' · ')));
  if (q.habilidade_inep) {
    app.appendChild(el('div', { class: 'q-meta', style: 'color: var(--gold-dim); margin-top: -0.3rem;' },
      q.habilidade_inep
    ));
  }

  // Texto-base
  if (q.texto_base && q.texto_base.conteudo) {
    app.appendChild(el('div', { class: 'q-base' },
      q.texto_base.conteudo,
      q.texto_base.fonte ? el('span', { class: 'fonte' }, q.texto_base.fonte) : null
    ));
  }

  // Enunciado
  app.appendChild(el('div', { class: 'q-enunciado' }, q.enunciado));

  // Alternativas
  const altBox = el('div', { class: 'alternativas' });
  ['A','B','C','D'].forEach(letra => {
    const texto = q.alternativas[letra];
    if (!texto) return;
    let classe = 'alt';
    if (finalizadoQ) {
      if (letra === q.gabarito) classe += ' correta';
      else if (letra === resp.alternativa) classe += ' errada';
    } else if (resp && resp.alternativa === letra) {
      classe += ' selected';
    }
    altBox.appendChild(el('button', {
      class: classe,
      disabled: finalizadoQ ? '' : null,
      onclick: () => !finalizadoQ && selecionarAlternativa(letra)
    },
      el('span', { class: 'letra' }, letra),
      el('span', {}, texto)
    ));
  });
  app.appendChild(altBox);

  // Comentário se já confirmada
  if (finalizadoQ) {
    app.appendChild(el('div', {
      class: 'q-base',
      style: 'font-style: normal; border-left-color: var(--gold);'
    },
      el('strong', { style: 'color: var(--gold); font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em;' }, 'Comentário'),
      el('p', { style: 'margin-top: 0.5rem;' }, q.comentario)
    ));
  }

  // Nav
  const nav = el('div', { class: 'nav' });
  nav.appendChild(el('button', {
    class: 'btn',
    disabled: s.indiceAtual === 0 ? '' : null,
    onclick: () => { s.indiceAtual--; render(); }
  }, '← Anterior'));

  if (!finalizadoQ && resp) {
    nav.appendChild(el('button', {
      class: 'btn primary',
      onclick: () => confirmarResposta()
    }, 'Confirmar'));
  }

  nav.appendChild(el('button', {
    class: 'btn',
    disabled: s.indiceAtual === s.questoes.length - 1 ? '' : null,
    onclick: () => { s.indiceAtual++; render(); }
  }, 'Próxima →'));

  app.appendChild(nav);

  // Grid
  const grid = el('div', { class: 'q-grid' });
  s.questoes.forEach((_, i) => {
    let cls = '';
    if (s.respostas[i] && s.respostas[i].confirmada) cls += ' answered';
    if (i === s.indiceAtual) cls += ' current';
    grid.appendChild(el('button', {
      class: cls.trim(),
      onclick: () => { s.indiceAtual = i; render(); }
    }, String(i + 1)));
  });
  app.appendChild(grid);

  // Finalizar
  const totalResp = s.respostas.filter(r => r && r.confirmada).length;
  app.appendChild(el('button', {
    class: 'btn danger', style: 'width: 100%; margin-top: 0.5rem;',
    onclick: () => {
      if (confirm(`Finalizar simulado? ${totalResp}/${s.questoes.length} respondidas.`)) finalizarSimulado();
    }
  }, 'Finalizar simulado'));
}

function selecionarAlternativa(letra) {
  const s = state.sessao;
  s.respostas[s.indiceAtual] = { alternativa: letra, confirmada: false };
  render();
}

function confirmarResposta() {
  const s = state.sessao;
  const i = s.indiceAtual;
  const q = s.questoes[i];
  const r = s.respostas[i];
  if (!r) return;
  r.confirmada = true;
  r.correta = r.alternativa === q.gabarito;
  r.timestamp = Date.now();

  saveResposta({
    id_sessao: s.id,
    id_questao: q.id,
    area: q.area,
    capitulo: q.capitulo,
    alternativa: r.alternativa,
    gabarito: q.gabarito,
    correta: r.correta,
    timestamp: r.timestamp
  });

  // Auto-avança se não for última
  setTimeout(() => {
    if (i < s.questoes.length - 1) {
      s.indiceAtual = i + 1;
    }
    render();
  }, 1200);
  render();
}

function finalizarSimulado() {
  const s = state.sessao;
  if (!s) return;
  s.finalizado = true;
  if (state.timer) { clearInterval(state.timer); state.timer = null; }

  const acertos = s.respostas.filter((r, i) => r && r.confirmada && r.alternativa === s.questoes[i].gabarito).length;
  const total = s.questoes.length;
  const respondidas = s.respostas.filter(r => r && r.confirmada).length;

  saveSessao({
    id: s.id,
    tipo: s.tipo,
    filtro: s.filtro,
    total,
    respondidas,
    acertos,
    iniciadoEm: s.iniciadoEm,
    finalizadoEm: Date.now(),
    duracaoSeg: Math.floor((Date.now() - s.iniciadoEm) / 1000)
  });

  state.tela = 'resultado';
  render();
}

// -------- RESULTADO --------
function renderResultado(app) {
  const s = state.sessao;
  const acertos = s.respostas.filter((r, i) => r && r.confirmada && r.alternativa === s.questoes[i].gabarito).length;
  const total = s.questoes.length;
  const pct = total ? Math.round(acertos / total * 100) : 0;
  const classe = pct >= 70 ? 'high' : pct < 50 ? 'low' : '';

  app.appendChild(el('header', { class: 'brand' },
    el('h1', {}, 'Resultado'),
    el('div', { class: 'sub' }, s.tipo === 'completo' ? 'Simulado completo' : s.tipo === 'area' ? `Área: ${AREAS[s.filtro.area].nome}` : s.tipo === 'revisao' ? 'Revisão de erros' : `Capítulo: ${LABELS_CAP[s.filtro.capitulo]}`)
  ));

  app.appendChild(el('div', { class: 'result-score' },
    el('div', { class: 'big ' + classe }, pct + '%'),
    el('div', { class: 'frac' }, `${acertos} de ${total} acertos`)
  ));

  // Breakdown por capítulo
  const porCap = {};
  s.questoes.forEach((q, i) => {
    const r = s.respostas[i];
    if (!porCap[q.capitulo]) porCap[q.capitulo] = { total: 0, acertos: 0 };
    porCap[q.capitulo].total++;
    if (r && r.confirmada && r.alternativa === q.gabarito) porCap[q.capitulo].acertos++;
  });

  app.appendChild(el('h2', { class: 'section-title' }, 'Desempenho por capítulo'));
  const bk = el('div', { class: 'breakdown' });
  Object.entries(porCap).forEach(([cap, d]) => {
    const p = Math.round(d.acertos / d.total * 100);
    bk.appendChild(el('div', { class: 'bar-row' },
      el('div', { class: 'cap' }, LABELS_CAP[cap] || cap),
      el('div', { class: 'bar' }, el('div', { class: 'fill', style: `width: ${p}%;` })),
      el('div', { class: 'pct' }, `${d.acertos}/${d.total}`)
    ));
  });
  app.appendChild(bk);

  // Revisão
  app.appendChild(el('h2', { class: 'section-title' }, 'Revisão das questões'));
  s.questoes.forEach((q, i) => {
    const r = s.respostas[i];
    const acertou = r && r.confirmada && r.alternativa === q.gabarito;
    const item = el('div', { class: 'review-item' });
    item.appendChild(el('div', { class: 'head' },
      el('span', {}, `Q${i+1} · ${LABELS_CAP[q.capitulo] || q.capitulo}`),
      el('span', { class: acertou ? 'ok' : 'err' },
        acertou ? '✓ acertou' : r && r.confirmada ? `✗ marcou ${r.alternativa} · gabarito ${q.gabarito}` : '— sem resposta'
      )
    ));
    item.appendChild(el('div', { class: 'q' }, q.enunciado));
    item.appendChild(el('details', {},
      el('summary', {}, 'Ver comentário'),
      el('p', {}, q.comentario || 'Sem comentário cadastrado.')
    ));
    app.appendChild(item);
  });

  app.appendChild(el('button', {
    class: 'btn primary', style: 'width: 100%; margin-top: 1.5rem;',
    onclick: () => { state.sessao = null; state.tela = 'home'; render(); }
  }, 'Voltar ao início'));
}

// -------- RELATÓRIO --------
function renderRelatorio(app) {
  app.appendChild(el('header', { class: 'brand' },
    el('h1', {}, 'Relatório de ', el('em', {}, 'desempenho')),
    el('div', { class: 'sub' }, 'Análise histórica por área e capítulo')
  ));

  const st = statsGerais();
  app.appendChild(el('div', { class: 'stats' },
    el('div', { class: 'stat' }, el('div', { class: 'n' }, String(st.total)), el('div', { class: 'l' }, 'Respostas totais')),
    el('div', { class: 'stat' }, el('div', { class: 'n' }, st.taxa + '%'), el('div', { class: 'l' }, 'Acerto global')),
    el('div', { class: 'stat' }, el('div', { class: 'n' }, String(st.sessoes)), el('div', { class: 'l' }, 'Simulados'))
  ));

  // Por área
  app.appendChild(el('h2', { class: 'section-title' }, 'Por área'));
  const porArea = statsPorArea();
  const bkA = el('div', { class: 'breakdown' });
  Object.entries(porArea).forEach(([a, d]) => {
    const p = d.total ? Math.round(d.acertos / d.total * 100) : 0;
    bkA.appendChild(el('div', { class: 'bar-row' },
      el('div', { class: 'cap' }, AREAS[a].nome),
      el('div', { class: 'bar' }, el('div', { class: 'fill', style: `width: ${p}%;` })),
      el('div', { class: 'pct' }, d.total ? `${d.acertos}/${d.total}` : '—')
    ));
  });
  app.appendChild(bkA);

  // Por capítulo (tabs por área)
  app.appendChild(el('h2', { class: 'section-title' }, 'Por capítulo'));
  const areaSel = state.relatorioArea || 'humanas';
  const tabs = el('div', { class: 'tabs' });
  Object.keys(AREAS).forEach(a => {
    tabs.appendChild(el('button', {
      class: 'tab' + (a === areaSel ? ' active' : ''),
      onclick: () => { state.relatorioArea = a; render(); }
    }, AREAS[a].nome.split(' ').slice(-1)[0]));
  });
  app.appendChild(tabs);

  const porCap = statsPorCapitulo(areaSel);
  const bkC = el('div', { class: 'breakdown' });
  CAPITULOS[areaSel].forEach(cap => {
    const d = porCap[cap];
    const p = d.total ? Math.round(d.acertos / d.total * 100) : 0;
    bkC.appendChild(el('div', { class: 'bar-row' },
      el('div', { class: 'cap' }, LABELS_CAP[cap]),
      el('div', { class: 'bar' }, el('div', { class: 'fill', style: `width: ${p}%;` })),
      el('div', { class: 'pct' }, d.total ? `${d.acertos}/${d.total}` : `0/${d.disponiveis}`)
    ));
  });
  app.appendChild(bkC);

  // Histórico de sessões
  app.appendChild(el('h2', { class: 'section-title' }, 'Últimos simulados'));
  const sessoes = loadSessoes().slice(-10).reverse();
  if (sessoes.length === 0) {
    app.appendChild(el('div', { class: 'empty' }, 'Nenhum simulado realizado ainda.'));
  } else {
    sessoes.forEach(ss => {
      const data = new Date(ss.iniciadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const p = ss.total ? Math.round(ss.acertos / ss.total * 100) : 0;
      app.appendChild(el('div', { class: 'review-item' },
        el('div', { class: 'head' },
          el('span', {}, data + ' · ' + ss.tipo),
          el('span', { class: p >= 70 ? 'ok' : p < 50 ? 'err' : '' }, `${ss.acertos}/${ss.total} (${p}%)`)
        )
      ));
    });
  }

  // Reset
  app.appendChild(el('button', {
    class: 'btn danger', style: 'width: 100%; margin-top: 2rem;',
    onclick: () => {
      if (confirm('Apagar TODO o histórico de respostas e sessões? Isso não pode ser desfeito.')) {
        localStorage.removeItem(LS.RESP);
        localStorage.removeItem(LS.SES);
        toast('Histórico apagado.');
        state.tela = 'home'; render();
      }
    }
  }, 'Apagar histórico'));

  app.appendChild(el('button', {
    class: 'btn', style: 'width: 100%; margin-top: 0.5rem;',
    onclick: () => { state.tela = 'home'; render(); }
  }, '← Voltar'));
}

// ============ INIT ============
async function init() {
  const ok = await carregarBanco();
  if (!ok) {
    document.getElementById('app').innerHTML = '<div class="empty">Erro ao carregar banco de questões. Verifique se <code>questoes.json</code> está acessível.</div>';
    return;
  }
  state.tela = 'home';
  render();
}

init();
