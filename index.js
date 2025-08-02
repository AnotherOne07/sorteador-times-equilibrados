
let jogadores = [];

// Função para carregar o JSON local
async function carregarJogadoresPadrao() {
    try {
        // Supondo que o arquivo está na raiz do projeto com o nome 'jogadores.json'
        const response = await fetch('jogadores.json');
        
        if (!response.ok) {
            throw new Error('Arquivo não encontrado');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            jogadores = data.map(jogador => ({
                nome: jogador.nome || 'Sem nome',
                estrelas: parseFloat(jogador.estrelas),
                selecionado: true
            }));
            
            atualizarTabelaJogadores();
            atualizarTotalJogadores();
            alert(`Lista de jogadores carregada com sucesso! ${jogadores.length} jogadores adicionados.`);
        } else {
            throw new Error('O arquivo JSON deve conter um array de jogadores');
        }
    } catch (error) {
        alert('Erro ao carregar jogadores: ' + error.message);
        console.error(error);
        
        // Caso o arquivo não exista, carrega os jogadores de teste
        gerarJogadoresTeste();
    }
}

function atualizarTotalJogadores() {
    document.getElementById('totalJogadores').textContent = jogadores.length;
}

function adicionarJogador() {
    const nome = document.getElementById('nome').value.trim();
    const estrelas = parseFloat(document.getElementById('estrelas').value);

    if (!nome || isNaN(estrelas) || estrelas < 1 || estrelas > 5) {
        alert('Preencha o nome e as estrelas (1.0 a 5.0) corretamente!');
        return;
    }

    jogadores.push({ nome, estrelas, selecionado: true });
    atualizarTabelaJogadores();
    document.getElementById('nome').value = '';
    document.getElementById('estrelas').value = '';
    atualizarTotalJogadores();
}

function gerarJogadoresTeste() {
    const nomesTeste = [
        "João", "Maria", "Pedro", "Ana", "Lucas", "Carla", "Marcos", "Julia", 
        "Rafael", "Fernanda", "Gustavo", "Beatriz", "Daniel", "Amanda", 
        "Roberto", "Patricia", "Felipe", "Larissa", "Eduardo", "Camila"
    ];
    const estrelasTeste = [1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 1, 2, 3, 4];

    for (let i = 0; i < 20; i++) {
        jogadores.push({
            nome: nomesTeste[i],
            estrelas: estrelasTeste[i],
            selecionado: true
        });
    }

    atualizarTabelaJogadores();
    atualizarTotalJogadores();
}

// Restante das funções permanecem iguais, exceto pela remoção da função carregarJogadoresJSON()
function atualizarTabelaJogadores() {
    const tbody = document.getElementById('jogadoresBody');
    tbody.innerHTML = '';
    jogadores.forEach((jogador, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" ${jogador.selecionado ? 'checked' : ''} onchange="toggleSelecionado(${index})"></td>
            <td>${jogador.nome}</td>
            <td>${jogador.estrelas.toFixed(1)}★</td> <!-- Alterado para mostrar o valor float -->
            <td><button onclick="removerJogador(${index})" class="danger" style="padding: 5px;">Remover</button></td>
        `;
        tbody.appendChild(row);
    });
}

function toggleSelecionado(index) {
    jogadores[index].selecionado = !jogadores[index].selecionado;
}


function removerJogador(index) {
    jogadores.splice(index, 1);
    atualizarTabelaJogadores();
    atualizarTotalJogadores();
}

function limparJogadores() {
    jogadores = [];
    atualizarTabelaJogadores();
    atualizarTotalJogadores();
    document.getElementById('timesContainer').innerHTML = '';
}

function sortearTimes() {
    const quantidadeTimes = parseInt(document.getElementById('quantidadeTimes').value);
    const jogadoresSelecionados = jogadores.filter(j => j.selecionado);
    const totalJogadores = jogadoresSelecionados.length;

    // Validação
    if (totalJogadores < quantidadeTimes) {
        alert(`Número insuficiente de jogadores selecionados (${totalJogadores}) para ${quantidadeTimes} times!`);
        return;
    }

    // Cálculo de distribuição
    const jogadoresPorTime = Math.floor(totalJogadores / quantidadeTimes);
    const timesComExtra = totalJogadores % quantidadeTimes;

    // Classificação por faixa de habilidade (CORREÇÃO AQUI)
    const faixasHabilidade = [
        { min: 4.5, max: 5.0, jogadores: [] },   // Elite
        { min: 3.5, max: 4.49, jogadores: [] },  // Avançado
        { min: 2.5, max: 3.49, jogadores: [] },  // Intermediário
        { min: 1.5, max: 2.49, jogadores: [] },  // Iniciante
        { min: 1.0, max: 1.49, jogadores: [] }   // Novato
    ];

    // Preencher faixas (CORREÇÃO CRÍTICA)
    jogadoresSelecionados.forEach(jogador => {
        for (const faixa of faixasHabilidade) {
            if (jogador.estrelas >= faixa.min && jogador.estrelas <= faixa.max) {
                faixa.jogadores.push(jogador);
                break;
            }
        }
    });

    // Criar times
    const times = Array.from({ length: quantidadeTimes }, (_, i) => ({
        id: i + 1,
        jogadores: [],
        maxJogadores: jogadoresPorTime + (i < timesComExtra ? 1 : 0),
        totalEstrelas: 0,
        mediaEstrelas: 0
    }));

    // Distribuição por faixa (snake draft)
    for (const faixa of faixasHabilidade) {
        const jogadoresEmbaralhados = embaralharArray([...faixa.jogadores]);
        let currentTeam = 0;
        let direction = 1;

        for (const jogador of jogadoresEmbaralhados) {
            // Pular times cheios
            while (times[currentTeam].jogadores.length >= times[currentTeam].maxJogadores) {
                currentTeam += direction;
                if (currentTeam === quantidadeTimes || currentTeam === -1) {
                    direction *= -1;
                    currentTeam += direction;
                }
            }

            // Adicionar jogador
            times[currentTeam].jogadores.push(jogador);
            times[currentTeam].totalEstrelas += jogador.estrelas;
            times[currentTeam].mediaEstrelas = times[currentTeam].totalEstrelas / times[currentTeam].jogadores.length;

            // Próximo time (snake)
            currentTeam += direction;
            if (currentTeam === quantidadeTimes || currentTeam === -1) {
                direction *= -1;
                currentTeam += direction;
            }
        }
    }

    balancearTimesAvancado(times);
    exibirTimes(times);
}

// Função de embaralhamento melhorada (Fisher-Yates)
function embaralharArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Adicione estas funções para seleção em massa
function selecionarTodos() {
    jogadores.forEach(j => j.selecionado = true);
    atualizarTabelaJogadores();
}

function deselecionarTodos() {
    jogadores.forEach(j => j.selecionado = false);
    atualizarTabelaJogadores();
}

function balancearTimesAvancado(times) {
    const MAX_ITERATIONS = 100;
    let iterations = 0;
    let balanced = false;
    
    while (!balanced && iterations < MAX_ITERATIONS) {
        balanced = true;
        
        times.sort((a, b) => a.mediaEstrelas - b.mediaEstrelas);
        
        for (let i = 0; i < times.length - 1; i++) {
            for (let j = i + 1; j < times.length; j++) {
                const diff = times[j].mediaEstrelas - times[i].mediaEstrelas;
                
                // Limiar mais sensível para números decimais
                if (diff > 0.2) {  // Reduzido de 0.3 para 0.2
                    const melhorTroca = encontrarMelhorTrocaAvancada(times[i], times[j]);
                    if (melhorTroca) {
                        realizarTroca(times[i], times[j], melhorTroca.jogadorI, melhorTroca.jogadorJ);
                        balanced = false;
                    }
                }
            }
        }
        iterations++;
    }
}

function encontrarMelhorTrocaAvancada(timeA, timeB) {
    let melhorTroca = null;
    let melhorMelhoria = 0;
    
    // Ordenar jogadores por diferença de estrelas (otimiza busca)
    const jogadoresA = [...timeA.jogadores].sort((a, b) => a.estrelas - b.estrelas);
    const jogadoresB = [...timeB.jogadores].sort((a, b) => a.estrelas - b.estrelas);
    
    const diffAtual = timeB.mediaEstrelas - timeA.mediaEstrelas;
    
    // Busca por pares mais promissores (jogadorA mais fraco x jogadorB mais forte)
    for (const jogadorA of jogadoresA) {
        for (const jogadorB of jogadoresB) {
            const deltaTroca = jogadorB.estrelas - jogadorA.estrelas;
            
            // Nova diferença após troca (simplificado)
            const novaDiff = diffAtual - (2 * deltaTroca / timeA.jogadores.length);
            const melhoria = Math.abs(diffAtual) - Math.abs(novaDiff);
            
            if (melhoria > melhorMelhoria) {
                melhorMelhoria = melhoria;
                melhorTroca = { jogadorI: jogadorA, jogadorJ: jogadorB };
            }
            
            // Early exit se encontrar uma troca ideal
            if (melhorMelhoria >= Math.abs(diffAtual) * 0.9) break;
        }
    }
    return melhorTroca;
}

function realizarTroca(timeA, timeB, jogadorA, jogadorB) {
    // Remover jogadores dos times originais
    timeA.jogadores = timeA.jogadores.filter(j => j !== jogadorA);
    timeB.jogadores = timeB.jogadores.filter(j => j !== jogadorB);
    
    // Adicionar jogadores trocados
    timeA.jogadores.push(jogadorB);
    timeB.jogadores.push(jogadorA);
    
    // Atualizar totais e médias
    timeA.totalEstrelas = timeA.totalEstrelas - jogadorA.estrelas + jogadorB.estrelas;
    timeB.totalEstrelas = timeB.totalEstrelas - jogadorB.estrelas + jogadorA.estrelas;
    
    timeA.mediaEstrelas = timeA.totalEstrelas / timeA.jogadores.length;
    timeB.mediaEstrelas = timeB.totalEstrelas / timeB.jogadores.length;
}

function exibirTimes(times) {
    const container = document.getElementById('timesContainer');
    container.innerHTML = '';
    
    // Estatísticas gerais
    const totalJogadores = times.reduce((sum, time) => sum + time.jogadores.length, 0);
    const mediaGeral = times.reduce((sum, time) => sum + time.totalEstrelas, 0) / totalJogadores;
    
    // Ordenar times por média
    times.sort((a, b) => a.mediaEstrelas - b.mediaEstrelas);

    // Cabeçalho com estatísticas
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats';
    statsDiv.innerHTML = `
        <strong>Estatísticas Gerais:</strong> 
        ${times.length} times | ${totalJogadores} jogadores | 
        Média geral: ${mediaGeral.toFixed(2)} estrelas
    `;
    container.appendChild(statsDiv);

    // Exibir cada time
    times.forEach(time => {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';
        
        // Lista de jogadores formatada
        const listaJogadores = time.jogadores.map(j => {
            const estaPresente = jogadores.find(p => p.nome === j.nome)?.selecionado;
            return `
                <li>
                    ${j.nome}${estaPresente ? '' : ' <span class="ausente">(A)</span>'} 
                    - <strong>${j.estrelas.toFixed(1)}</strong> ★
                </li>
            `;
        }).join('');

        teamDiv.innerHTML = `
            <h3>Time ${time.id}</h3>
            <p class="team-stats">
                ${time.jogadores.length} jogadores | 
                Total: ${time.totalEstrelas.toFixed(1)} estrelas | 
                Média: ${time.mediaEstrelas.toFixed(2)}
            </p>
            <ul>${listaJogadores}</ul>
        `;
        
        container.appendChild(teamDiv);
    });
}
// Inicializa o total de jogadores
atualizarTotalJogadores();