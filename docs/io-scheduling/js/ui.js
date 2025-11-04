import { CONFIGURACOES } from './config.js';
import { estado, salvarEstado, carregarEstado } from './state.js';
import {
  sincronizarInputs,
  getTamanho,
  addRequisicao,
  exemploAutomatico,
  limparRequisicoes,
  atualizarRequisicoes,
  resetarVisualizacao,
  ocultarResultados,
  carregarDeArquivo
} from './requests.js';
import {
  runAlgoritmo,
  compararAlgoritmos,
  equalizarAlturasSimulacao,
  agendarEqualizacao
} from './simulation.js';

function otimizarAnimacoes() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    CONFIGURACOES.VELOCIDADE_ANIMACAO = 200;
    CONFIGURACOES.DURACAO_TRANSICAO = 100;
  }
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    CONFIGURACOES.VELOCIDADE_ANIMACAO = Math.min(CONFIGURACOES.VELOCIDADE_ANIMACAO * 1.5, 1200);
  }
}

function adicionarAcessibilidade() {
  const elementos = {
    diskSize: 'Tamanho do disco em setores',
    initialPosition: 'Posição inicial da cabeça do disco',
    newRequest: 'Nova requisição para adicionar à fila'
  };

  Object.entries(elementos).forEach(([id, label]) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.setAttribute('aria-label', label);
    }
  });

  const statusDiv = document.createElement('div');
  statusDiv.id = 'statusAria';
  statusDiv.setAttribute('aria-live', 'polite');
  statusDiv.style.position = 'absolute';
  statusDiv.style.left = '-9999px';
  document.body.appendChild(statusDiv);
}

function anunciarStatus(mensagem) {
  const statusDiv = document.getElementById('statusAria');
  if (statusDiv) {
    statusDiv.textContent = mensagem;
  }
}

function tratarErro(erro, contexto = 'Operação') {
  console.error(`Erro em ${contexto}:`, erro);
  alert(`${contexto} falhou: ${erro.message || 'Erro desconhecido'}`);
  if (contexto.includes('Animação')) {
    estado.animacaoAtiva = false;
  }
}

function configurarPaginaEntrada() {
  const goToSimulation = document.getElementById('goToSimulation');
  if (goToSimulation) {
    goToSimulation.addEventListener('click', () => {
      salvarEstado();
      window.location.href = 'simulacao.html';
    });
  }
}

function configurarPaginaSimulacao() {
  const botaoVoltar = document.getElementById('backToEntrada');
  if (botaoVoltar) {
    botaoVoltar.addEventListener('click', () => {
      salvarEstado();
      window.location.href = 'entrada.html';
    });
  }

  const aviso = document.getElementById('alertaSemDados');
  if (aviso) {
    aviso.style.display = estado.requisicoes.length > 0 ? 'none' : 'block';
  }
}

function registrarEventosComuns() {
  const inputReq = document.getElementById('newRequest');
  if (inputReq) {
    inputReq.addEventListener('keypress', e => {
      if (e.key === 'Enter') addRequisicao();
    });

    inputReq.addEventListener('input', e => {
      const valor = parseInt(e.target.value);
      const tamanho = getTamanho();
      e.target.style.borderColor = (!Number.isNaN(valor) && (valor < 0 || valor >= tamanho))
        ? '#dc3545'
        : '';
    });
  }

  const inputTamanho = document.getElementById('diskSize');
  if (inputTamanho) {
    inputTamanho.addEventListener('change', () => {
      estado.tamanho = getTamanho();
      estado.requisicoes = estado.requisicoes.filter(req => req < estado.tamanho);
      atualizarRequisicoes();
      resetarVisualizacao();
      salvarEstado();
    });
  }

  const inputPosicao = document.getElementById('initialPosition');
  if (inputPosicao) {
    inputPosicao.addEventListener('change', e => {
      const valor = parseInt(e.target.value);
      estado.posicaoInicial = Number.isNaN(valor) ? 0 : Math.max(0, Math.min(valor, estado.tamanho - 1));
      e.target.value = estado.posicaoInicial;
      atualizarRequisicoes();
      resetarVisualizacao();
      salvarEstado();
    });
  }

  const inputFile = document.getElementById('fileInput');
  if (inputFile) {
    inputFile.addEventListener('change', carregarDeArquivo);
  }

  const btnAdd = document.getElementById('btnAddRequest');
  if (btnAdd) btnAdd.addEventListener('click', addRequisicao);

  const btnExample = document.getElementById('btnExampleRequests');
  if (btnExample) btnExample.addEventListener('click', exemploAutomatico);

  const btnClear = document.getElementById('btnClearRequests');
  if (btnClear) btnClear.addEventListener('click', limparRequisicoes);

  const btnSSTF = document.getElementById('btnRunSSTF');
  if (btnSSTF) btnSSTF.addEventListener('click', () => runAlgoritmo('sstf'));

  const btnSCAN = document.getElementById('btnRunSCAN');
  if (btnSCAN) btnSCAN.addEventListener('click', () => runAlgoritmo('scan'));

  const btnCSCAN = document.getElementById('btnRunCSCAN');
  if (btnCSCAN) btnCSCAN.addEventListener('click', () => runAlgoritmo('cscan'));

  const btnCompare = document.getElementById('btnCompareAll');
  if (btnCompare) btnCompare.addEventListener('click', compararAlgoritmos);
}

function inicializar() {
  try {
    estado.animacaoAtiva = false;

    otimizarAnimacoes();
    adicionarAcessibilidade();
    carregarEstado();
    sincronizarInputs();
    registrarEventosComuns();
    atualizarRequisicoes();
    resetarVisualizacao();

    const pagina = document.body.dataset.page || 'entrada';
    if (pagina === 'simulacao') {
      configurarPaginaSimulacao();
      equalizarAlturasSimulacao();
    } else {
      configurarPaginaEntrada();
    }

    anunciarStatus('Simulador de algoritmos de disco carregado e pronto para uso');

    window.addEventListener('resize', agendarEqualizacao);
  } catch (error) {
    tratarErro(error, 'Inicialização');
  }
}

export function inicializarAplicacao() {
  inicializar();
}
