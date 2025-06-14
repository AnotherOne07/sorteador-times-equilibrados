
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
                estrelas: Math.min(5, Math.max(1, parseInt(jogador.estrelas) || 3)),
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
    const estrelas = parseInt(document.getElementById('estrelas').value);

    if (!nome || isNaN(estrelas) || estrelas < 1 || estrelas > 5) {
        alert('Preencha o nome e as estrelas (1-5) corretamente!');
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
            <td>${'★'.repeat(jogador.estrelas)}${'☆'.repeat(5 - jogador.estrelas)}</td>
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
    
    // Pegar TODOS os jogadores, não filtrar por selecionados
    if (jogadores.length < quantidadeTimes) {
        alert(`É necessário ter pelo menos ${quantidadeTimes} jogadores para formar ${quantidadeTimes} times!`);
        return;
    }

    // 1. Embaralhar TODOS os jogadores
    const jogadoresEmbaralhados = embaralharArray([...jogadores]);
    
    // 2. Ordenar por estrelas (decrescente) após embaralhar
    const jogadoresOrdenados = [...jogadoresEmbaralhados].sort((a, b) => b.estrelas - a.estrelas);
    
    // 3. Criar times vazios conforme a quantidade selecionada
    const times = Array.from({ length: quantidadeTimes }, (_, i) => ({
        id: i + 1,
        jogadores: [],
        totalEstrelas: 0,
        mediaEstrelas: 0
    }));

    // 4. Distribuição balanceada com snake draft
    let currentTeam = 0;
    let direction = 1; // 1 para frente, -1 para trás
    
    for (const jogador of jogadoresOrdenados) {
        times[currentTeam].jogadores.push(jogador);
        times[currentTeam].totalEstrelas += jogador.estrelas;
        times[currentTeam].mediaEstrelas = times[currentTeam].totalEstrelas / times[currentTeam].jogadores.length;
        
        // Alternar direção
        if (currentTeam === quantidadeTimes - 1 && direction === 1) {
            direction = -1;
        } else if (currentTeam === 0 && direction === -1) {
            direction = 1;
        } else {
            currentTeam += direction;
        }
    }

    // 5. Balanceamento final
    balancearTimes(times);

    // Exibir os times
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

function balancearTimes(times) {
    // Ordenar times por média (crescente)
    times.sort((a, b) => a.mediaEstrelas - b.mediaEstrelas);
    
    const MAX_ITERATIONS = 100;
    let iterations = 0;
    let balanced = false;
    
    while (!balanced && iterations < MAX_ITERATIONS) {
        balanced = true;
        
        // Para cada par de times (menor e maior média)
        for (let i = 0; i < times.length - 1; i++) {
            for (let j = i + 1; j < times.length; j++) {
                const diff = times[j].mediaEstrelas - times[i].mediaEstrelas;
                
                // Se a diferença for significativa (> 0.5)
                if (diff > 0.5) {
                    // Tentar encontrar um jogador para trocar
                    const melhorTroca = encontrarMelhorTroca(times[i], times[j]);
                    
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

function encontrarMelhorTroca(timeA, timeB) {
    let melhorTroca = null;
    let melhorMelhoria = 0;
    
    // Procurar a melhor troca entre os jogadores dos dois times
    for (const jogadorA of timeA.jogadores) {
        for (const jogadorB of timeB.jogadores) {
            const diffAtual = timeB.mediaEstrelas - timeA.mediaEstrelas;
            
            // Calcular novas médias se trocássemos esses jogadores
            const novaMediaA = (timeA.totalEstrelas - jogadorA.estrelas + jogadorB.estrelas) / timeA.jogadores.length;
            const novaMediaB = (timeB.totalEstrelas - jogadorB.estrelas + jogadorA.estrelas) / timeB.jogadores.length;
            const novaDiff = novaMediaB - novaMediaA;
            
            // Verificar se a troca melhora o equilíbrio
            const melhoria = Math.abs(diffAtual) - Math.abs(novaDiff);
            
            if (melhoria > melhorMelhoria) {
                melhorMelhoria = melhoria;
                melhorTroca = {
                    jogadorI: jogadorA,
                    jogadorJ: jogadorB,
                    melhoria: melhoria
                };
            }
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
    
    // Calcular estatísticas gerais
    const totalJogadores = times.reduce((sum, time) => sum + time.jogadores.length, 0);
    const mediaGeral = times.reduce((sum, time) => sum + time.totalEstrelas, 0) / totalJogadores;
    
    // Ordenar times por média (para exibição)
    times.sort((a, b) => a.mediaEstrelas - b.mediaEstrelas);

    // Exibir estatísticas
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
        teamDiv.innerHTML = `
            <h3>Time ${time.id} (${time.jogadores.length} jogadores | Total: ${time.totalEstrelas} estrelas | Média: ${time.mediaEstrelas.toFixed(2)} ${'★'.repeat(Math.round(time.mediaEstrelas))})</h3>
            <ul>
                ${time.jogadores.map(j => {
                    // Verifica se o jogador está marcado como presente
                    const estaPresente = jogadores.find(p => p.nome === j.nome)?.selecionado;
                    return `<li>${j.nome}${estaPresente ? '' : ' <span class="ausente">(A)</span>'} - ${'★'.repeat(j.estrelas)}${'☆'.repeat(5 - j.estrelas)}</li>`;
                }).join('')}
            </ul>
        `;
        container.appendChild(teamDiv);
    });
}
// Inicializa o total de jogadores
atualizarTotalJogadores();