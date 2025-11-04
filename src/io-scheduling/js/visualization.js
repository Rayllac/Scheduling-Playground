function criarReguaDisco({ container, titulo, tamanho, headId, modo = 'single' }) {
  if (!container) {
    return { wrapper: null, head: null, diskLine: null };
  }

  container.innerHTML = '';

  const layout = document.createElement('div');
  layout.classList.add('disk-ruler-layout', modo === 'compare' ? 'layout-compare' : 'layout-single');

  if (titulo) {
    const infoCard = document.createElement('div');
    infoCard.classList.add('disk-info-card');
    if (modo === 'compare') {
      infoCard.classList.add('compact');
    }

    const title = document.createElement('div');
    title.className = 'disk-ruler-title';
    title.textContent = titulo;

    infoCard.appendChild(title);
    layout.appendChild(infoCard);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'diskLineWrapper';

  const diskLine = document.createElement('div');
  diskLine.className = 'diskLine';
  diskLine.setAttribute('data-max', Math.max((tamanho ?? 1) - 1, 0));
  wrapper.appendChild(diskLine);

  const head = document.createElement('div');
  head.className = 'head';
  if (headId) {
    head.id = headId;
  }
  wrapper.appendChild(head);

  layout.appendChild(wrapper);
  container.appendChild(layout);

  return { wrapper, head, diskLine };
}

function calcularDimensoesLinha(wrapper, diskLine) {
  if (!wrapper || !diskLine) {
    return { largura: 0, offset: 0 };
  }

  const wrapperRect = wrapper.getBoundingClientRect();
  const linhaRect = diskLine.getBoundingClientRect();

  const largura = linhaRect.width || wrapperRect.width || 0;
  const offset = linhaRect.left - wrapperRect.left;

  return { largura, offset };
}

function calcularPosicaoPixels(posicao, tamanho, larguraLinha, offset = 0) {
  if (larguraLinha <= 0) {
    return offset;
  }

  const baseMax = Math.max((tamanho ?? 1) - 1, 1);
  const clamped = Math.max(0, Math.min(posicao, baseMax));
  return offset + (clamped / baseMax) * larguraLinha;
}

export { criarReguaDisco, calcularDimensoesLinha, calcularPosicaoPixels };
