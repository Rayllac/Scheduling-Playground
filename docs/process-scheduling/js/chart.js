// Função para desenhar o diagrama de Gantt

function drawGantt(ganttData, title = "Diagrama de Gantt", canvasId = "gantt", speed = 500) {
    let canvas = document.getElementById(canvasId); // Obtém o elemento <canvas> pelo ID informado
    let ctx = canvas.getContext("2d"); // Pega o contexto 2D do canvas

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa toda a área antes de desenhar o novo gráfico

    let margin = 50; // Define margens laterais para o gráfico
    let barHeight = 40; // Define a altura de cada barra do gráfico
    let barY = 60; // Define a posição vertical (Y) inicial da barra
    let totalTime = ganttData[ganttData.length - 1].end; // Pega o tempo total do diagrama (fim do último bloco)
    let scale = (canvas.width - margin - 20) / totalTime; // Calcula a escala horizontal (pixels por unidade de tempo)
    let palette = [
        "#4CAF50",  // P1
        "#2196F3",  // P2
        "#FFC107",  // P3
        "#E91E63",  // P4
        "#9C27B0",  // P5
        "#FF5722",  // P6
        "#795548",  // P7
        "#00BCD4",  // P8
        "#607D8B",  // P9
        "#8BC34A"   // P10
    ];

     // Função para pegar a cor fixa pelo ID
    function getColorForProcess(pid) {
        let num = parseInt(pid.replace("P", ""), 10); // extrai o número do processo
        return palette[(num - 1) % palette.length];   // atribui cor ao processo
    }

    ctx.fillStyle = "black"; // Configura cor do texto para preto
    ctx.font = "16px Arial"; // Define fonte padrão para o título
    ctx.textAlign = "center"; // Alinha o texto ao centro
    ctx.fillText(title, canvas.width / 2, 20); // Escreve o título do diagrama no topo centralizado

    let currentTime = 0; // tempo inicial da animação

    let timer = setInterval(() => {
        ctx.clearRect(0, 40, canvas.width, canvas.height - 40); // limpa apenas a área do gráfico

        // Percorre os blocos de dados do gráfico
        ganttData.forEach(block => {
            if (block.start < currentTime) {
                let blockEnd = Math.min(block.end, currentTime); // limita até o tempo atual
                let x = margin + block.start * scale; // Calcula posição X da barra com base no tempo inicial
                let width = (blockEnd - block.start) * scale; // Calcula largura da barra (duração da tarefa)

                // Desenha a barra da tarefa com a cor atribuída
                ctx.fillStyle = getColorForProcess(block.id);
                ctx.fillRect(x, barY, width, barHeight);

                // Escreve o identificador da tarefa dentro da barra
                ctx.fillStyle = "white";
                ctx.font = "14px Arial";
                ctx.textAlign = "center";
                ctx.fillText(block.id, x + width / 2, barY + barHeight / 2 + 5);
            }
        });

        ctx.strokeStyle = "black"; // Configura cor da linha para preto
        ctx.beginPath(); // Inicia desenho de uma linha horizontal (eixo do tempo)
        ctx.moveTo(margin, barY + barHeight); // ponto inicial da linha
        ctx.lineTo(margin + totalTime * scale, barY + barHeight); // ponto final da linha
        ctx.stroke();

        // Configura estilo de texto para as marcações do tempo
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";

        // Desenha divisões no eixo do tempo
        for (let t = 0; t <= totalTime; t++) {
            let x = margin + t * scale;

            // Pequena linha vertical indicando divisão do tempo
            ctx.beginPath();
            ctx.moveTo(x, barY + barHeight);
            ctx.lineTo(x, barY + barHeight + 5);
            ctx.stroke();

            // A cada fração do tempo (ou no final), escreve o número no eixo
            if (t % Math.ceil(totalTime / 10) === 0 || t === totalTime) {
                ctx.fillText(t, x, barY + barHeight + 20);
            }
        }

        // Avança tempo
        currentTime++;

        // Para quando chegar no final
        if (currentTime > totalTime) {
            clearInterval(timer);
        }
    }, speed); // speed = intervalo em ms (500 ms = meio segundo por unidade de tempo)
}
