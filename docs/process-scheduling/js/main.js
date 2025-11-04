// Número máximo permitido de processos no sistema
const MAX_PROCESSES = 10;

// Soma total máxima permitida dos tempos de burst de todos os processos
const TOTAL_BURST_CAPACITY = 100;

// Quantidade de processos pré-cadastrados que serão gerados automaticamente
const PRE_REGISTERED_COUNT = 5;

// Soma total de bursts dos processos pré-cadastrados
const PRE_REGISTERED_BURST = 50;

// Retorna um número inteiro aleatório entre 'min' e 'max'
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Gera uma lista de números inteiros positivos cuja soma total é 'total'
function generateBurstsSum(count, total) {
  const bursts = []; // Lista que armazena os valores gerados
  let remaining = total; // Total restante que ainda precisa ser distribuído

  for (let i = 0; i < count; i++) {
    // Se for o último elemento, ele recebe todo o restante
    if (i === count - 1) {
      bursts.push(remaining);
    } else {
      // Garante que sempre sobra pelo menos 1 para cada processo restante
      const maxAllowed = remaining - (count - i - 1);

      // Escolhe aleatoriamente um valor entre 1 e o máximo permitido
      const value = randInt(1, Math.max(1, maxAllowed));

      bursts.push(value);
      remaining -= value; // Subtrai o valor sorteado do total restante
    }
  }
  return bursts; // Retorna o vetor de bursts gerado
}

// Gera 'PRE_REGISTERED_COUNT' processos com valores aleatórios
function generatePreRegisteredProcesses() {
  // Gera tempos de burst que somam a PRE_REGISTERED_BURST
  const bursts = generateBurstsSum(PRE_REGISTERED_COUNT, PRE_REGISTERED_BURST);
  const procs = [];

  // Cria objetos de processo com dados aleatórios
  for (let i = 0; i < PRE_REGISTERED_COUNT; i++) {
    procs.push({
      id: `P${i + 1}`,           // Identificador do processo
      arrival: randInt(0, 9),    // Tempo de chegada aleatório entre 0 e 9
      burst: bursts[i],          // Tempo de execução (burst)
      priority: randInt(1, 10),  // Prioridade aleatória entre 1 e 10
    });
  }
  return procs; // Retorna a lista de processos criados
}

// Retorna o maior número encontrado nos IDs
function getMaxProcessIndex(arr) {
  if (!arr || !arr.length) return 0;
  let max = 0;
  arr.forEach((p) => {
    // Extrai os dígitos do ID (remove letras)
    const digits = (p.id || "").replace(/\D/g, "");
    const n = parseInt(digits, 10);
    if (!isNaN(n) && n > max) max = n; // Atualiza o maior número encontrado
  });
  return max;
}

// Tenta carregar os processos salvos no localStorage
let processes = JSON.parse(localStorage.getItem("processes") || "null");

// Verifica se o sistema já foi inicializado anteriormente
const wasInitialized = localStorage.getItem("processes_initialized") === "true";

// Se ainda não foi inicializado, cria processos pré-cadastrados
if (!wasInitialized) {
  processes = generatePreRegisteredProcesses();
  localStorage.setItem("processes", JSON.stringify(processes));
  localStorage.setItem("processes_initialized", "true");
} else {
  // Se foi inicializado mas está vazio, cria um array vazio
  if (!processes) processes = [];
}

// Guarda o número atual do último processo cadastrado
let processCount = getMaxProcessIndex(processes);

// Atualiza a tabela HTML com os dados dos processos atuais
function updateTable() {
  const tbody = document.querySelector("#process-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  processes.forEach((p) => {
    tbody.innerHTML += `<tr>
            <td>${p.id}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            <td>${p.priority}</td>
        </tr>`;
  });
}
updateTable(); // Atualiza a tabela ao carregar a página

// Calcula a soma total dos tempos de burst
function totalBurstSum() {
  return processes.reduce((s, p) => s + (p.burst || 0), 0);
}

// Manipula o formulário HTML de cadastro de processos
const form = document.getElementById("process-form");
if (form) {
  // Evento de envio do formulário
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Evita recarregar a página

    // Impede que ultrapasse o limite de processos
    if (processes.length >= MAX_PROCESSES) {
      alert(`Número máximo de processos atingido (${MAX_PROCESSES}).`);
      return;
    }

    // Obtém os campos do formulário
    const arrivalInput = document.getElementById("arrival");
    const burstInput = document.getElementById("burst");
    const priorityInput = document.getElementById("priority");
    if (!arrivalInput || !burstInput || !priorityInput) return;

    // Converte os valores digitados
    const arrival = parseInt(arrivalInput.value, 10);
    const burst = parseInt(burstInput.value, 10);
    const priority = parseInt(priorityInput.value, 10);

    // Validação do burst
    if (isNaN(burst) || burst <= 0) {
      alert("Informe um valor de duração (burst) válido (> 0).");
      return;
    }

    // Verifica se a soma total dos bursts não ultrapassa o limite
    const currentTotalBurst = totalBurstSum();
    if (currentTotalBurst + burst > TOTAL_BURST_CAPACITY) {
      alert(
        `Não é possível adicionar: soma de bursts ultrapassaria ${TOTAL_BURST_CAPACITY} (atual: ${currentTotalBurst}).`
      );
      return;
    }

    // Gera um novo ID automaticamente
    const pidField = document.getElementById("pid");
    const pid =
      pidField && pidField.value ? pidField.value : `P${++processCount}`;

    // Adiciona o novo processo à lista
    processes.push({
      id: pid,
      arrival: isNaN(arrival) ? 0 : arrival,
      burst,
      priority: isNaN(priority) ? 1 : priority,
    });

    // Atualiza o armazenamento e a tabela
    localStorage.setItem("processes", JSON.stringify(processes));
    updateTable();
    e.target.reset(); // Limpa o formulário
  });

  // Botão para limpar todos os processos
  const clearBtn = document.getElementById("clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!confirm("Remover TODOS os processos?")) return;
      processes = [];
      localStorage.setItem("processes", JSON.stringify(processes));
      updateTable();
    });
  }

  // Botão para recarregar processos pré-cadastrados
  const reloadBtn = document.getElementById("reload-btn");
  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      if (
        !confirm(
          "Recarregar processos pré-cadastrados aleatórios? Isso substituirá a lista atual."
        )
      )
        return;
      processes = generatePreRegisteredProcesses();
      processCount = getMaxProcessIndex(processes);
      localStorage.setItem("processes_initialized", "true");
      localStorage.setItem("processes", JSON.stringify(processes));
      updateTable();
    });
  }

  // Botão para ir à página de simulações
  const goSimBtn = document.getElementById("go-simulations-btn");
  if (goSimBtn) {
    goSimBtn.addEventListener("click", () => {
      localStorage.setItem("processes", JSON.stringify(processes));
      window.location.href = "simulation.html";
    });
  }
}

// Executa a simulação do algoritmo selecionado e exibe os resultados
function runSimulation(algoSelectId, quantumInputId, canvasId, resultsDivId) {
  // Carrega processos armazenados
  const stored = JSON.parse(localStorage.getItem("processes") || "null");
  if (stored && stored.length) processes = stored;

  // Garante que há processos cadastrados
  if (!processes || !processes.length) {
    alert(
      "Não é possível executar a simulação: não existem processos cadastrados. Cadastre processos na página de entrada antes de simular."
    );
    return;
  }

  // Obtém elementos de seleção e quantum
  const algoSelect = document.getElementById(algoSelectId);
  const quantumInput = document.getElementById(quantumInputId);
  if (!algoSelect) return;

  const algo = algoSelect.value; // Nome do algoritmo escolhido
  const quantum = quantumInput ? parseInt(quantumInput.value, 10) : undefined;

  // Executa o algoritmo de escalonamento apropriado
  let gantt, results;
  if (algo === "FIFO") ({ gantt, results } = fifo(processes));
  else if (algo === "SJF") ({ gantt, results } = sjf(processes));
  else if (algo === "RoundRobin") {
    if (!quantum || quantum <= 0) {
      alert("Defina um quantum válido (>0).");
      return;
    }
    ({ gantt, results } = roundRobin(processes, quantum));
  } else if (algo === "Prioridade")
    ({ gantt, results } = prioridade(processes));
  else {
    alert("Algoritmo desconhecido.");
    return;
  }

  // Normaliza tempos no diagrama de Gantt
  if (gantt && gantt.length) {
    const minStart = gantt.reduce((min, b) => Math.min(min, b.start), Infinity);
    if (minStart > 0 && isFinite(minStart)) {
      gantt = gantt.map((block) => ({
        id: block.id,
        start: block.start - minStart,
        end: block.end - minStart,
      }));
    }

    // Ordena e corrige possíveis lacunas no Gantt
    gantt.sort((a, b) => a.start - b.start);
    for (let i = 1; i < gantt.length; i++) {
      if (gantt[i].start > gantt[i - 1].end) {
        const dur = gantt[i].end - gantt[i].start;
        gantt[i].start = gantt[i - 1].end;
        gantt[i].end = gantt[i].start + dur;
      }
    }
  }

  // Desenha o gráfico de Gantt na tela
  drawGantt(gantt, `Diagrama de Gannt (${algo})`, canvasId, 500);

  // Monta tabela de métricas
  let html = `<h3>Métricas</h3><table>
        <tr>
            <th>ID</th>
            <th>Espera</th>
            <th>Turnaround</th>
            <th>Resposta</th>
        </tr>`;
  results.forEach((r) => {
    html += `<tr><td>${r.id}</td><td>${r.waiting}</td><td>${r.turnaround}</td><td>${r.response}</td></tr>`;
  });
  html += `</table>`;

  // Calcula médias das métricas
  const avg = {
    waiting: (
      results.reduce((s, r) => s + r.waiting, 0) / results.length
    ).toFixed(2),
    turnaround: (
      results.reduce((s, r) => s + r.turnaround, 0) / results.length
    ).toFixed(2),
    response: (
      results.reduce((s, r) => s + r.response, 0) / results.length
    ).toFixed(2),
  };
  html += `<p><strong>Médias:</strong> Espera = ${avg.waiting}, Turnaround = ${avg.turnaround}, Resposta = ${avg.response}</p>`;

  // Exibe o resultado na página
  const resultsDiv = document.getElementById(resultsDivId);
  if (resultsDiv) resultsDiv.innerHTML = html;
}

// Botões para simular em duas seções diferentes
if (document.getElementById("simulate-btn-1")) {
  document.getElementById("simulate-btn-1").addEventListener("click", () => {
    runSimulation("algorithm1", "quantum1", "gantt1", "results1");
  });
}
if (document.getElementById("simulate-btn-2")) {
  document.getElementById("simulate-btn-2").addEventListener("click", () => {
    runSimulation("algorithm2", "quantum2", "gantt2", "results2");
  });
}

// Botão para comparar resultados entre algoritmos
if (document.getElementById("compare-btn")) {
  document.getElementById("compare-btn").addEventListener("click", () => {
    const stored = JSON.parse(localStorage.getItem("processes") || "null");
    if (stored && stored.length) processes = stored;

    if (!processes || !processes.length) {
      alert(
        "Não é possível executar a comparação: não existem processos cadastrados. Cadastre processos na página de entrada antes de comparar."
      );
      return;
    }

    // Executa todos os algoritmos e guarda seus resultados
    const comparisons = {
      FIFO: fifo(processes).results,
      SJF: sjf(processes).results,
      Prioridade: prioridade(processes).results,
    };

    // Adiciona Round Robin se o quantum for válido
    const qInput = document.getElementById("quantum1");
    const q = qInput ? parseInt(qInput.value, 10) : NaN;
    if (!isNaN(q) && q > 0)
      comparisons["RoundRobin"] = roundRobin(processes, q).results;

    // Descrições para tooltip da tabela comparativa
    const algoDescriptions = {
      FIFO: "First In, First Out: executa na ordem de chegada, sem preempção",
      SJF: "Shortest Job First: executa o processo com menor burst, sem preempção",
      RoundRobin: "Executa por fatias de tempo (quantum), alternando processos (preemptivo)",
      Prioridade: "Executa primeiro processos com maior prioridade (menor valor numérico), sem preempção",
    };

    // Monta tabela de comparação entre algoritmos
    let html = `<h3>Resumo comparativo com todas as métricas dos algoritmos</h3>
        <table>
            <tr>
                <th title="Escalonador de processos">Algoritmo</th>
                <th title="Tempo médio que os processos esperaram antes de serem executados (turnaround - burst)">Espera Média</th>
                <th title="Tempo total médio entre a chegada e a finalização dos processos (burst - chegada)">Turnaround Médio</th>
                <th title="Tempo médio até a primeira resposta dos processos (primeira execução - chegada)">Resposta Média</th>
            </tr>`;
    
    for (let algo in comparisons) {
      let arr = comparisons[algo];
      let avgWait = (arr.reduce((s, r) => s + r.waiting, 0) / arr.length).toFixed(2);
      let avgTurn = (arr.reduce((s, r) => s + r.turnaround, 0) / arr.length).toFixed(2);
      let avgResp = (arr.reduce((s, r) => s + r.response, 0) / arr.length).toFixed(2);
      html += `<tr><td title="${algoDescriptions[algo]}">${algo}</td><td>${avgWait}</td><td>${avgTurn}</td><td>${avgResp}</td></tr>`;
    }
    html += "</table>";
    document.getElementById("comparison").innerHTML = html;
  });
}

// Botões para editar processos (redireciona para o cadastro)
const editBtn1 = document.getElementById("edit-btn1");
if (editBtn1) {
  editBtn1.addEventListener("click", () => {
    window.location.href = "input.html";
  });
}
const editBtn2 = document.getElementById("edit-btn2");
if (editBtn2) {
  editBtn2.addEventListener("click", () => {
    window.location.href = "input.html";
  });
}
