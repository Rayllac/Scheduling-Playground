// Funções com algoritmos de escalonamento de processos

function fifo(processes) {
    let time = 0; // Relógio do sistema: controla o tempo atual
    let gantt = []; // Array que guarda os intervalos de execução (para o diagrama de Gantt)
    let results = []; // Array que guarda métricas de desempenho (waiting, turnaround, response)

    // Ordena os processos pelo tempo de chegada (primeiro a chegar, primeiro a executar)
    processes.sort((a, b) => a.arrival - b.arrival);

    // Itera sobre cada processo na ordem de chegada
    processes.forEach(p => {
        let start = Math.max(time, p.arrival); // O início é o maior entre tempo atual e tempo de chegada
        let end = start + p.burst; // O fim é início + tempo de execução (burst)
        time = end; // Atualiza o relógio para o fim do processo
        gantt.push({id: p.id, start, end}); // Adiciona execução ao Gantt

        // Calcula métricas para o processo
        let turnaround = end - p.arrival; // Tempo total que ficou no sistema
        let waiting = turnaround - p.burst; // Quanto tempo ficou esperando
        let response = start - p.arrival; // Quanto tempo esperou para começar

        results.push({id: p.id, waiting, turnaround, response}); // Salva métricas
    });

    return {gantt, results}; // Retorna dados para visualização
}

function sjf(processes) {
    let time = 0; // Relógio do sistema
    let gantt = []; // Gantt chart
    let results = []; // Métricas
    let ready = []; // Fila de prontos
    let pending = [...processes].sort((a,b) => a.arrival - b.arrival); // Ordena processos pela chegada

    // Continua até que todos os processos tenham sido executados
    while (pending.length || ready.length) {
        // Move para a fila de prontos os processos que já chegaram
        ready.push(...pending.filter(p => p.arrival <= time));
        pending = pending.filter(p => p.arrival > time);

        if (ready.length) {
            // Escolhe o processo com menor tempo de burst
            ready.sort((a, b) => a.burst - b.burst);
            let p = ready.shift(); // Remove da fila e executa
            let start = Math.max(time, p.arrival); // Começa na hora certa
            let end = start + p.burst;
            time = end; // Atualiza tempo
            gantt.push({id: p.id, start, end}); // Adiciona ao Gantt

            // Calcula métricas
            let turnaround = end - p.arrival;
            let waiting = turnaround - p.burst;
            let response = start - p.arrival;

            results.push({id: p.id, waiting, turnaround, response});
        } else {
            time++; // Se não há processo pronto, avança o tempo
        }
    }

    return {gantt, results};
}

function roundRobin(processes, quantum) {
    let time = 0; // Relógio do sistema
    let gantt = []; // Gantt chart
    let results = []; // Métricas
    let queue = []; // Fila de execução
    let remaining = {}; // Guarda o tempo de execução restante para cada processo
    let firstResponse = {}; // Guarda o momento em que o processo executou pela primeira vez

    // Ordena processos por chegada e inicializa o tempo restante
    processes.sort((a,b) => a.arrival - b.arrival);
    processes.forEach(p => remaining[p.id] = p.burst);
    let pending = [...processes]; // Processos que ainda não entraram na fila

    // Continua até que todos os processos tenham terminado
    while (pending.length || queue.length) {
        // Adiciona à fila os processos que já chegaram
        queue.push(...pending.filter(p => p.arrival <= time));
        pending = pending.filter(p => p.arrival > time);

        if (queue.length) {
            let p = queue.shift(); // Remove o primeiro da fila

            // Se é a primeira execução do processo, registra para calcular response time
            if (!(p.id in firstResponse)) firstResponse[p.id] = time;

            // Define o quanto será executado (mínimo entre quantum e restante)
            let exec = Math.min(quantum, remaining[p.id]);
            let start = time;
            let end = time + exec;
            gantt.push({id: p.id, start, end}); // Adiciona ao Gantt
            time = end; // Atualiza o relógio
            remaining[p.id] -= exec; // Atualiza tempo restante

            if (remaining[p.id] === 0) {
                // Processo terminou -> calcula métricas
                let turnaround = end - p.arrival;
                let waiting = turnaround - p.burst;
                let response = firstResponse[p.id] - p.arrival;
                results.push({id: p.id, waiting, turnaround, response});
            } else {
                // Se ainda falta executar, coloca o processo de volta no fim da fila
                queue.push(...pending.filter(q => q.arrival <= time));
                pending = pending.filter(q => q.arrival > time);
                queue.push(p);
            }
        } else {
            time++; // Avança o tempo se não há processo pronto
        }
    }

    return {gantt, results};
}

function prioridade(processes) {
    let time = 0; // Relógio do sistema
    let gantt = []; // Gantt chart
    let results = []; // Métricas
    let ready = []; // Fila de prontos
    let pending = [...processes].sort((a,b) => a.arrival - b.arrival); // Ordena por chegada

    // Continua até que todos os processos tenham sido executados
    while (pending.length || ready.length) {
        // Adiciona processos que já chegaram à fila de prontos
        ready.push(...pending.filter(p => p.arrival <= time));
        pending = pending.filter(p => p.arrival > time);

        if (ready.length) {
            // Ordena os processos pela prioridade (menor número = maior prioridade)
            ready.sort((a, b) => a.priority - b.priority);
            let p = ready.shift(); // Escolhe o processo de maior prioridade
            let start = Math.max(time, p.arrival);
            let end = start + p.burst;
            time = end; // Atualiza o tempo
            gantt.push({id: p.id, start, end});

            // Calcula métricas
            let turnaround = end - p.arrival;
            let waiting = turnaround - p.burst;
            let response = start - p.arrival;

            results.push({id: p.id, waiting, turnaround, response});
        } else {
            time++; // Avança o tempo se nenhum processo está pronto
        }
    }

    return {gantt, results};
}
