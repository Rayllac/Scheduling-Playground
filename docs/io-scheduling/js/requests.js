import { CONFIGURACOES } from './config.js';
import { estado, salvarEstado } from './state.js';
import { criarReguaDisco, calcularDimensoesLinha, calcularPosicaoPixels } from './visualization.js';

function sincronizarInputs() {
  const diskInput = document.getElementById('diskSize');
  if (diskInput) diskInput.value = estado.tamanho;

  const posInput = document.getElementById('initialPosition');
  if (posInput) posInput.value = estado.posicaoInicial;
}

function getTamanho() {
  const input = document.getElementById('diskSize');
  if (!input) return estado.tamanho || CONFIGURACOES.TAMANHO_PADRAO;

  const valor = parseInt(input.value);
  return Number.isNaN(valor) ? CONFIGURACOES.TAMANHO_PADRAO : Math.max(1, valor);
}

function validarEntrada(valor, tamanho) {
  if (Number.isNaN(valor)) {
    return { valido: false, erro: 'Digite um número válido!' };
  }
  if (valor < 0 || valor >= tamanho) {
    return { valido: false, erro: `O número deve estar entre 0 e ${tamanho - 1}!` };
  }
  if (estado.requisicoes.includes(valor)) {
    return { valido: false, erro: 'Esta posição já existe na lista!' };
  }
  return { valido: true };
}

function addRequisicao() {
  if (estado.animacaoAtiva) {
    alert('Aguarde o término da animação atual!');
    return;
  }

  const input = document.getElementById('newRequest');
  if (!input) return;

  const valor = parseInt(input.value);
  const tamanho = getTamanho();

  const validacao = validarEntrada(valor, tamanho);
  if (!validacao.valido) {
    alert(validacao.erro);
    return;
  }

  estado.requisicoes.push(valor);
  input.value = '';
  atualizarRequisicoes();
  salvarEstado();
  animarAdicaoRequisicao();
}

function exemploAutomatico() {
  if (estado.animacaoAtiva) {
    alert('Aguarde o término da animação atual!');
    return;
  }

  const tamanho = getTamanho();
  const quantidade = Math.min(5, Math.max(5, Math.floor(tamanho / 10)));
  const numeros = new Set();

  while (numeros.size < quantidade) {
    numeros.add(Math.floor(Math.random() * tamanho));
  }

  estado.requisicoes = Array.from(numeros);
  atualizarRequisicoes();
  salvarEstado();
  animarCarregamentoAutomatico();
}

function limparRequisicoes() {
  if (estado.animacaoAtiva) {
    alert('Aguarde o término da animação atual!');
    return;
  }

  estado.requisicoes = [];
  estado.animacaoAtiva = false;
  
  atualizarRequisicoes();
  resetarVisualizacao();
  ocultarResultados();
  salvarEstado();
  
  const inputFile = document.getElementById('fileInput');
  if (inputFile) inputFile.value = '';
}

function atualizarRequisicoes() {
  const display = document.getElementById('requestsDisplay');

  if (display) {
    if (estado.requisicoes.length === 0) {
      display.innerHTML = '<strong>Requisições:</strong> <em>Nenhuma ainda. Adicione algumas!</em>';
    } else {
      const tags = estado.requisicoes.map(req => 
        `<span class='request-tag' data-value='${req}'>${req}</span>`
      );
      display.innerHTML = "<strong>Requisições:</strong> " + tags.join(" ");
    }
  }

  const resumoTamanho = document.getElementById('resumoTamanho');
  if (resumoTamanho) resumoTamanho.textContent = estado.tamanho;

  const resumoCabeca = document.getElementById('resumoCabeca');
  if (resumoCabeca) resumoCabeca.textContent = estado.posicaoInicial;

  const resumoRequisicoes = document.getElementById('resumoRequisicoes');
  if (resumoRequisicoes) resumoRequisicoes.textContent = estado.requisicoes.length;
}

function animarAdicaoRequisicao() {
  const tags = document.querySelectorAll('.request-tag');
  const ultimaTag = tags[tags.length - 1];
  
  if (ultimaTag) {
    ultimaTag.style.transform = 'scale(0)';
    ultimaTag.style.opacity = '0';
    
    setTimeout(() => {
      ultimaTag.style.transition = `all ${CONFIGURACOES.DURACAO_TRANSICAO}ms ease-out`;
      ultimaTag.style.transform = 'scale(1.1)';
      ultimaTag.style.opacity = '1';
      
      setTimeout(() => {
        ultimaTag.style.transform = 'scale(1)';
      }, CONFIGURACOES.DURACAO_TRANSICAO / 2);
    }, 50);
  }
}

function animarCarregamentoAutomatico() {
  const tags = document.querySelectorAll('.request-tag');
  tags.forEach((tag, index) => {
    tag.style.transform = 'scale(0)';
    tag.style.opacity = '0';
    
    setTimeout(() => {
      tag.style.transition = `all ${CONFIGURACOES.DURACAO_TRANSICAO}ms ease-out`;
      tag.style.transform = 'scale(1)';
      tag.style.opacity = '1';
    }, index * 100);
  });
}

function resetarVisualizacao() {
  const viz = document.querySelector('.disk-visualization');
  if (!viz) return;

  viz.classList.add('single-view');
  viz.classList.remove('comparison-view');

  const tamanho = estado.tamanho || CONFIGURACOES.TAMANHO_PADRAO;
  const { wrapper, head, diskLine } = criarReguaDisco({
    container: viz,
    titulo: 'Visualização do Disco',
    tamanho,
    headId: 'head',
    modo: 'single'
  });

  if (!wrapper || !head || !diskLine) return;

  const { largura, offset } = calcularDimensoesLinha(wrapper, diskLine);
  head.style.transition = `left ${CONFIGURACOES.DURACAO_TRANSICAO}ms ease-in-out`;

  if (largura > 0) {
    const posicaoInicial = calcularPosicaoPixels(estado.posicaoInicial, tamanho, largura, offset);
    head.style.left = `${posicaoInicial}px`;
  }

  const currentDiv = document.getElementById('currentRequest');
  if (currentDiv) {
    const badge = document.createElement('span');
    badge.className = 'pill current status-badge';
    badge.textContent = estado.posicaoInicial;
    currentDiv.innerHTML = '';
    currentDiv.appendChild(badge);
  }
}

function ocultarResultados() {
  const results = document.getElementById('results');
  if (!results) return;

  results.style.transition = `opacity ${CONFIGURACOES.DURACAO_TRANSICAO}ms ease-out`;
  results.style.opacity = '0';
  
  setTimeout(() => {
    results.style.display = 'none';
    results.style.opacity = '1';
    resetarAlturaCardsSimulacao();
  }, CONFIGURACOES.DURACAO_TRANSICAO);
}

function resetarAlturaCardsSimulacao() {
  document.querySelectorAll('.simulacao-card').forEach(card => {
    card.style.minHeight = '';
  });
}

function carregarDeArquivo(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dados = processarArquivo(e.target.result);
      aplicarDadosCarregados(dados);
      alert('Arquivo carregado com sucesso!');
    } catch (error) {
      alert('Erro ao carregar arquivo: ' + error.message);
    }
  };
  reader.readAsText(file);
}

function processarArquivo(conteudo) {
  const linhas = conteudo.split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  const dados = { tamanho: null, cabeca: null, requisicoes: [] };

  for (const linha of linhas) {
    if (linha.startsWith('tamanho=')) {
      dados.tamanho = parseInt(linha.split('=')[1]);
    } else if (linha.startsWith('cabeca=')) {
      dados.cabeca = parseInt(linha.split('=')[1]);
    } else if (linha.startsWith('requisicoes=')) {
      dados.requisicoes = linha.split('=')[1]
        .split(',')
        .map(v => parseInt(v.trim()))
        .filter(v => !Number.isNaN(v));
    }
  }

  return dados;
}

function aplicarDadosCarregados(dados) {
  if (dados.tamanho !== null && dados.tamanho > 0) {
    estado.tamanho = dados.tamanho;
    const diskInput = document.getElementById('diskSize');
    if (diskInput) diskInput.value = dados.tamanho;
  }

  if (dados.cabeca !== null && dados.cabeca >= 0) {
    estado.posicaoInicial = Math.min(dados.cabeca, estado.tamanho - 1);
    const headInput = document.getElementById('initialPosition');
    if (headInput) headInput.value = estado.posicaoInicial;
  }

  if (dados.requisicoes.length > 0) {
    estado.requisicoes = dados.requisicoes.filter(req => 
      req >= 0 && req < estado.tamanho
    );
  }

  atualizarRequisicoes();
  resetarVisualizacao();
  salvarEstado();
}

export {
  sincronizarInputs,
  getTamanho,
  addRequisicao,
  exemploAutomatico,
  limparRequisicoes,
  atualizarRequisicoes,
  resetarVisualizacao,
  ocultarResultados,
  carregarDeArquivo,
  aplicarDadosCarregados,
  resetarAlturaCardsSimulacao
};
