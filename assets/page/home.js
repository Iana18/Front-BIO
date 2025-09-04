// Função para carregar a Home
function loadHome() {
    const content = document.getElementById("main-content");
    const breadcrumb = document.getElementById("breadcrumb");

    // Atualiza breadcrumb
    breadcrumb.textContent = "Home";

    // Conteúdo da Home
    content.innerHTML = `
    <div class="home-dashboard">
        <div class="stats-cards">
            <div class="card">
                <i class="fas fa-users"></i>
                <h3>Usuários</h3>
                <p id="total-usuarios">0</p>
            </div>
            <div class="card">
                <i class="fas fa-paw"></i>
                <h3>Espécies</h3>
                <p id="total-especies">0</p>
            </div>
            <div class="card">
                <i class="fas fa-list"></i>
                <h3>Categorias</h3>
                <p id="total-categorias">0</p>
            </div>
            <div class="card">
                <i class="fas fa-question-circle"></i>
                <h3>Perguntas</h3>
                <p id="total-perguntas">0</p>
            </div>
        </div>

        <div class="charts">
            <div class="chart">
                <h4>Usuários por Região</h4>
                <canvas id="usuariosChart"></canvas>
            </div>
            <div class="chart">
                <h4>Atividades Recentes</h4>
                <ul id="atividadesRecentes"></ul>
            </div>
        </div>
    </div>
    `;

    // Injeta CSS da Home (cards, grids, etc)
    const style = document.createElement("style");
    style.innerHTML = `
    .home-dashboard {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }

    .card {
        background: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
    }

    .card i {
        font-size: 2rem;
        color: #4CAF50;
    }

    .card h3 {
        margin: 10px 0;
        font-size: 1.2rem;
    }

    .card p {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }

    .chart {
        background: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .chart h4 {
        margin-bottom: 15px;
    }

    #atividadesRecentes {
        list-style: none;
        padding-left: 0;
    }

    #atividadesRecentes li {
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }
    `;
    document.head.appendChild(style);

    // Carregar dados (exemplo XHR/Fetch)
    fetchHomeData();
}

// Simula requisições para popular a Home
function fetchHomeData() {
    // Exemplo de totals
    document.getElementById("total-usuarios").textContent = 1250;
    document.getElementById("total-especies").textContent = 320;
    document.getElementById("total-categorias").textContent = 50;
    document.getElementById("total-perguntas").textContent = 1200;

    // Atividades recentes
    const atividades = [
        "Usuário João comentou em 'Seres em extinção'",
        "Nova espécie 'Dragão Azul' cadastrada",
        "Categoria 'Ameaçados' atualizada",
        "Pergunta 'Qual é o habitat do Dragão Azul?' cadastrada"
    ];

    const ul = document.getElementById("atividadesRecentes");
    atividades.forEach(a => {
        const li = document.createElement("li");
        li.textContent = a;
        ul.appendChild(li);
    });

    // Gráfico de usuários por região usando Chart.js
    const canvas = document.getElementById("usuariosChart");
    if (canvas) {
        // Carrega Chart.js via CDN dinamicamente
        if (!window.Chart) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = () => drawChart(canvas);
            document.body.appendChild(script);
        } else {
            drawChart(canvas);
        }
    }
}

function drawChart(canvas) {
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ["Norte", "Sul", "Leste", "Oeste"],
            datasets: [{
                label: 'Usuários',
                data: [300, 250, 400, 300],
                backgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Expor a função para ser chamada via menu
window.loadHome = loadHome;
