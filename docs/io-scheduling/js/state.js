import { CONFIGURACOES, STORAGE_KEY } from './config.js';

const estado = {
  tamanho: CONFIGURACOES.TAMANHO_PADRAO,
  posicaoInicial: CONFIGURACOES.POSICAO_INICIAL_PADRAO,
  requisicoes: [],
  animacaoAtiva: false
};

function getEstado() {
  return estado;
}

function setAnimacaoAtiva(valor) {
  estado.animacaoAtiva = Boolean(valor);
}

function setTamanho(valor) {
  estado.tamanho = valor;
}

function setPosicaoInicial(valor) {
  estado.posicaoInicial = valor;
}

function setRequisicoes(novas) {
  estado.requisicoes = Array.isArray(novas) ? [...novas] : [];
}

function adicionarRequisicao(valor) {
  estado.requisicoes.push(valor);
}

function removerRequisicao(valor) {
  estado.requisicoes = estado.requisicoes.filter(req => req !== valor);
}

function salvarEstado() {
  if (!window.localStorage) return;
  const payload = {
    tamanho: estado.tamanho,
    posicaoInicial: estado.posicaoInicial,
    requisicoes: estado.requisicoes
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Não foi possível salvar o estado:', error);
  }
}

function carregarEstado() {
  if (!window.localStorage) return;
  try {
    const bruto = window.localStorage.getItem(STORAGE_KEY);
    if (!bruto) return;

    const salvo = JSON.parse(bruto);
    if (typeof salvo.tamanho === 'number') estado.tamanho = salvo.tamanho;
    if (typeof salvo.posicaoInicial === 'number') estado.posicaoInicial = salvo.posicaoInicial;
    if (Array.isArray(salvo.requisicoes)) estado.requisicoes = salvo.requisicoes;
  } catch (error) {
    console.warn('Não foi possível carregar o estado salvo:', error);
  }
}

export {
  estado,
  getEstado,
  setAnimacaoAtiva,
  setTamanho,
  setPosicaoInicial,
  setRequisicoes,
  adicionarRequisicao,
  removerRequisicao,
  salvarEstado,
  carregarEstado
};
