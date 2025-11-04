function algoritmoSSTF(requisicoes, posicaoInicial) {
  let pendentes = [...requisicoes];
  let posicaoAtual = posicaoInicial;
  const ordemAtendimento = [];
  let movimentoTotal = 0;
  const passos = [];

  while (pendentes.length > 0) {
    let maisProxima = pendentes[0];

    for (const p of pendentes) {
      if (Math.abs(p - posicaoAtual) < Math.abs(maisProxima - posicaoAtual)) {
        maisProxima = p;
      }
    }

    const deslocamento = Math.abs(maisProxima - posicaoAtual);
    movimentoTotal += deslocamento;

    passos.push({
      de: posicaoAtual,
      para: maisProxima,
      distancia: deslocamento,
      pendentesAntes: [...pendentes],
      pendentesDepois: pendentes.filter(r => r !== maisProxima),
      tipo: 'requisicao'
    });

    posicaoAtual = maisProxima;
    ordemAtendimento.push(maisProxima);
    pendentes = pendentes.filter(r => r !== maisProxima);
  }

  return {
    nome: 'SSTF (Mais Próximo)',
    explicacao: 'O algoritmo SSTF sempre seleciona, dentre as requisições pendentes, a que está mais próxima da posição atual da cabeça de leitura. Isso reduz o tempo de deslocamento em cada movimento, tornando-o eficiente em termos de busca individual.',
    sequencia: ordemAtendimento,
    movimentoTotal,
    passos
  };
}

function algoritmoSCAN(requisicoes, posicaoInicial, tamanho) {
  let pendentes = [...requisicoes].sort((a, b) => a - b);
  let posicaoAtual = posicaoInicial;
  const ordemAtendimento = [];
  let movimentoTotal = 0;
  const passos = [];

  const menores = pendentes.filter(r => r < posicaoAtual).sort((a, b) => b - a);
  const maiores = pendentes.filter(r => r >= posicaoAtual).sort((a, b) => a - b);
  const fila = [...maiores, ...menores];

  for (const req of fila) {
    const deslocamento = Math.abs(req - posicaoAtual);
    movimentoTotal += deslocamento;

    passos.push({
      de: posicaoAtual,
      para: req,
      distancia: deslocamento,
      pendentesAntes: [...pendentes],
      pendentesDepois: pendentes.filter(r => r !== req),
      tipo: 'requisicao'
    });

    posicaoAtual = req;
    ordemAtendimento.push(req);
    pendentes = pendentes.filter(r => r !== req);
  }

  return {
    nome: 'SCAN (Elevador)',
    explicacao: 'O SCAN é conhecido como algoritmo do elevador porque a cabeça do disco se movimenta em uma direção até atingir o final (ou a última requisição nesse sentido) e, em seguida, inverte o movimento. Durante a varredura, todas as requisições encontradas no caminho são atendidas na ordem em que aparecem.',
    sequencia: ordemAtendimento,
    movimentoTotal,
    passos
  };
}

function algoritmoCSCAN(requisicoes, posicaoInicial, tamanho) {
  let pendentes = [...requisicoes].sort((a, b) => a - b);
  let posicaoAtual = posicaoInicial;
  const ordemAtendimento = [];
  let movimentoTotal = 0;
  const passos = [];

  const maiores = pendentes.filter(r => r >= posicaoAtual).sort((a, b) => a - b);
  const menores = pendentes.filter(r => r < posicaoAtual).sort((a, b) => a - b);

  for (const req of maiores) {
    const deslocamento = Math.abs(req - posicaoAtual);
    movimentoTotal += deslocamento;

    passos.push({
      de: posicaoAtual,
      para: req,
      distancia: deslocamento,
      pendentesAntes: [...pendentes],
      pendentesDepois: pendentes.filter(r => r !== req),
      tipo: 'requisicao'
    });

    posicaoAtual = req;
    ordemAtendimento.push(req);
    pendentes = pendentes.filter(r => r !== req);
  }

  if (menores.length > 0) {
    if (posicaoAtual !== tamanho - 1) {
      const deslocamento = tamanho - 1 - posicaoAtual;
      movimentoTotal += deslocamento;

      passos.push({
        de: posicaoAtual,
        para: tamanho - 1,
        distancia: deslocamento,
        pendentesAntes: [...pendentes],
        pendentesDepois: [...pendentes],
        tipo: 'movimento'
      });

      posicaoAtual = tamanho - 1;
    }

    const deslocamento = tamanho - 1;
    movimentoTotal += deslocamento;

    passos.push({
      de: posicaoAtual,
      para: 0,
      distancia: deslocamento,
      pendentesAntes: [...pendentes],
      pendentesDepois: [...pendentes],
      tipo: 'movimento'
    });

    posicaoAtual = 0;

    for (const req of menores) {
      const deslocamentoMenor = Math.abs(req - posicaoAtual);
      movimentoTotal += deslocamentoMenor;

      passos.push({
        de: posicaoAtual,
        para: req,
        distancia: deslocamentoMenor,
        pendentesAntes: [...pendentes],
        pendentesDepois: pendentes.filter(r => r !== req),
        tipo: 'requisicao'
      });

      posicaoAtual = req;
      ordemAtendimento.push(req);
      pendentes = pendentes.filter(r => r !== req);
    }
  }

  return {
    nome: 'C-SCAN (Circular SCAN)',
    explicacao: 'O C-SCAN é uma variação do SCAN. Ele percorre as requisições em apenas um sentido. Ao chegar ao final do disco, a cabeça retorna diretamente ao início e continua no mesmo sentido.',
    sequencia: ordemAtendimento,
    movimentoTotal,
    passos
  };
}

function gerarComparacao(requisicoes, posicaoInicial, tamanho) {
  const resultados = {
    sstf: algoritmoSSTF(requisicoes, posicaoInicial),
    scan: algoritmoSCAN(requisicoes, posicaoInicial, tamanho),
    cscan: algoritmoCSCAN(requisicoes, posicaoInicial, tamanho)
  };

  let melhor = resultados.sstf;
  let melhores = [melhor];

  for (const chave in resultados) {
    const algoritmo = resultados[chave];

    if (algoritmo.movimentoTotal < melhor.movimentoTotal) {
      melhor = algoritmo;
      melhores = [algoritmo];
    } else if (algoritmo.movimentoTotal === melhor.movimentoTotal && algoritmo !== melhor) {
      melhores.push(algoritmo);
    }
  }

  return { resultados, melhores };
}

export {
  algoritmoSSTF,
  algoritmoSCAN,
  algoritmoCSCAN,
  gerarComparacao
};
