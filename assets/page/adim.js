// ============ REQUISIÇÕES XHR ============

// Toggle menu lateral
function toggleMenu() {
  document.getElementById('sider').classList.toggle('collapsed');
}

// Toggle submenu
function toggleSubmenu(element) {
  const li = element.parentElement;
  li.classList.toggle('open');
  li.querySelector('.submenu').classList.toggle('open');
}

// Função principal de navegação
function loadContent(name, el = null) {
  const content = document.getElementById('main-content');
  const breadcrumb = document.getElementById('breadcrumb');

  // Reset menus ativos
  document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));

  if (el && !el.classList.contains('logout')) {
    el.classList.add('active');
    const parentMenu = el.closest(".has-submenu");
    if (parentMenu) parentMenu.classList.add("active");
  }

  breadcrumb.textContent = name;
  content.innerHTML = `<p>Carregando ${name}...</p>`;

  // Home
  if (name === "Home") {
    content.innerHTML = `
      <h2>Bem-vindo ao Painel</h2>
      <p>Selecione uma opção no menu lateral para começar.</p>
    `;
    return;
  }

  // Perfil
  if (name === "Perfil") {
    const login = localStorage.getItem("login") || "—";
    const email = localStorage.getItem("email") || "—";

    const perfilTemplate = document.getElementById("perfil-template");
    const perfilClone = perfilTemplate.cloneNode(true);
    perfilClone.style.display = "block";
    perfilClone.querySelector(".user-login").textContent = login;
    perfilClone.querySelector(".user-email").textContent = email;

    content.innerHTML = "";
    content.appendChild(perfilClone);
    return;
  }

  window.fetchCategorias = fetchCategoriasModule;

// categoria.js
// Submenus → chama funções globais expostas
if (name === "Usuários" && window.fetchUsuarios) window.fetchUsuarios();
else if (name === "Seres" && window.fetchSeres) window.fetchSeres();
else if (name === "Denúncias" && window.fetchDenuncias) window.fetchDenuncias();
else if (name === "Categorias" && window.fetchCategoriasModule) window.fetchCategoriasModule();
else if (name === "Espécies" && window.fetchEspecies) window.fetchEspecies();
else if (name === "Tipos" && window.fetchTipos) window.fetchTipos();
else if (name === "Quiz" && window.fetchQuiz) window.fetchQuiz();
else if (name === "Perguntas" && window.fetchPerguntas) window.fetchPerguntas();
else if (name === "Comentários" && window.fetchComentarios) window.fetchComentarios();
else {
  content.innerHTML = `<h2>${name}</h2><p>Conteúdo em construção...</p>`;
}
}



// ========================== INICIO SERES ==================================================================================================================
// ============================ Variáveis Globais ============================

















// ========================== INICIO QUIZ ==================================================================================================================

function fetchQuiz() {
    const content = document.getElementById("main-content");
    content.innerHTML = `
        <h2>Quizzes Cadastrados</h2>
        <button id="btn-novo-quiz" class="btn">Cadastrar Quiz</button>
        <div id="quiz-result"></div>
        <table id="quiz-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Nível</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <!-- Formulário flutuante -->
        <div id="quiz-form-container" class="modal" style="display:none;">
            <div class="modal-content">
                <span id="close-quiz-form" class="close">&times;</span>
                <h3>Cadastrar Novo Quiz</h3>
                <form id="quiz-form">
                    <div class="form-group">
                        <label for="titulo">Título do Quiz:</label>
                        <input type="text" id="titulo" name="titulo" placeholder="Digite o título" required>
                    </div>
                    <div class="form-group">
                        <label for="nivel">Nível do Quiz:</label>
                        <select id="nivel" name="nivel" required>
                            <option value="1">1 - Básico</option>
                            <option value="2">2 - Intermediário</option>
                            <option value="3">3 - Avançado</option>
                        </select>
                    </div>
                    <button type="submit" class="btn">Cadastrar Quiz</button>
                </form>
            </div>
        </div>
    `;

    // 🔹 Injeta CSS diretamente
    const style = document.createElement("style");
    style.innerHTML = `
        .modal {
            position: fixed; top:0; left:0; right:0; bottom:0;
            background-color: rgba(0,0,0,0.5);
            display: flex; justify-content: center; align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background-color: #fff; padding: 20px; border-radius: 8px;
            width: 90%; max-width: 400px; position: relative;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
        .close {
            position: absolute; top: 10px; right: 15px;
            font-size: 25px; cursor: pointer;
        }
        .modal-content h3 { margin-top:0; }
        .btn {
            padding: 10px 20px; background-color: #4CAF50;
            color: white; border: none; border-radius: 5px; cursor: pointer;
            margin-top: 10px;
        }
        .btn:hover { background-color: #45a049; }
        #quiz-table {
            width: 100%; border-collapse: collapse; margin-top: 20px;
        }
        #quiz-table th, #quiz-table td {
            border: 1px solid #ddd; padding: 10px; text-align: left;
        }
        #quiz-table th { background-color: #2c2c2cff; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select { width: 100%; padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc; }
        .success { color: green; }
        .error { color: red; }
        @media (max-width: 600px) {
            .modal-content { padding: 10px; }
            #quiz-table th, #quiz-table td { padding: 6px; }
        }
    `;
    document.head.appendChild(style);

    // Abrir formulário
    document.getElementById("btn-novo-quiz").addEventListener("click", () => {
        document.getElementById("quiz-form-container").style.display = "flex";
    });

    // Fechar formulário
    document.getElementById("close-quiz-form").addEventListener("click", () => {
        document.getElementById("quiz-form-container").style.display = "none";
    });

    // Submit do formulário
    document.getElementById("quiz-form").addEventListener("submit", function(e) {
        e.preventDefault();
        cadastrarQuiz();
    });

    // Carrega tabela inicial
    listarQuizzes();
}

function cadastrarQuiz() {
    const titulo = document.getElementById("titulo").value;
    const nivel = parseInt(document.getElementById("nivel").value);

    fetch("http://localhost:8080/api/quizzes/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titulo, nivel: nivel })
    })
    .then(res => {
        if (!res.ok) throw new Error("Erro ao cadastrar quiz");
        return res.json();
    })
    .then(data => {
        document.getElementById("quiz-result").innerHTML = `<p class="success">Quiz "${data.titulo}" cadastrado com sucesso!</p>`;
        document.getElementById("quiz-form").reset();
        document.getElementById("quiz-form-container").style.display = "none"; // Fecha formulário
        listarQuizzes();
    })
    .catch(err => {
        document.getElementById("quiz-result").innerHTML = `<p class="error">${err.message}</p>`;
    });
}

function listarQuizzes() {
    fetch("http://localhost:8080/api/quizzes")
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#quiz-table tbody");
            tbody.innerHTML = "";
            data.forEach(quiz => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${quiz.id}</td>
                    <td>${quiz.titulo}</td>
                    <td>${quiz.nivel}</td>
                `;
                tbody.appendChild(tr);
            });
        });
}

// ========================== FIM QUIZ  ==================================================================================================================


// ========================== INICIO PERGUNTAS  ==================================================================================================================

function fetchPerguntas() {
    const content = document.getElementById("main-content");
    content.innerHTML = `
        <h2>Perguntas Cadastradas</h2>
        <button id="btn-nova-pergunta" class="btn">Cadastrar Pergunta</button>
        <div id="pergunta-result"></div>
        <table id="pergunta-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Quiz</th>
                    <th>Pergunta</th>
                    <th>Alternativas</th>
                    <th>Resposta Correta</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <!-- Formulário flutuante -->
        <div id="pergunta-form-container" class="modal" style="display:none;">
            <div class="modal-content">
                <span id="close-pergunta-form" class="close">&times;</span>
                <h3>Cadastrar Nova Pergunta</h3>
                <form id="pergunta-form">
                    <div class="form-group">
                        <label for="quizId">Quiz:</label>
                        <select id="quizId" name="quizId" required>
                            <option value="">Carregando quizzes...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="texto">Texto da Pergunta:</label>
                        <input type="text" id="texto" name="texto" placeholder="Digite a pergunta" required>
                    </div>
                    <div class="form-group">
                        <label>Alternativas:</label>
                        <input type="text" id="alt1" placeholder="Alternativa 1" required>
                        <input type="text" id="alt2" placeholder="Alternativa 2" required>
                        <input type="text" id="alt3" placeholder="Alternativa 3" required>
                        <input type="text" id="alt4" placeholder="Alternativa 4" required>
                    </div>
                    <div class="form-group">
                        <label for="respostaCorreta">Digite a alternativa correta exatamente como está acima:</label>
                        <input type="text" id="respostaCorreta" name="respostaCorreta" placeholder="Ex: Alternativa 1" required>
                    </div>
                    <button type="submit" class="btn">Cadastrar Pergunta</button>
                </form>
            </div>
        </div>
    `;

    // 🔹 CSS injetado
    const style = document.createElement("style");
    style.innerHTML = `
        .modal { position: fixed; top:0; left:0; right:0; bottom:0; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background-color: #fff; padding: 20px; border-radius: 8px; width: 90%; max-width: 400px; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.3); }
        .close { position: absolute; top: 10px; right: 15px; font-size: 25px; cursor: pointer; }
        .btn { padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; }
        .btn:hover { background-color: #45a049; }
        #pergunta-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        #pergunta-table th, #pergunta-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        #pergunta-table th { background-color: #2c2c2c; color: #fff; }
        .form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .form-group input, .form-group select { margin-bottom: 8px; padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc; }
        .success { color: green; }
        .error { color: red; }
        @media (max-width: 600px) { .modal-content { padding: 10px; } #pergunta-table th, #pergunta-table td { padding: 6px; } }
    `;
    document.head.appendChild(style);

    // Abrir e fechar modal
    document.getElementById("btn-nova-pergunta").addEventListener("click", () => {
        document.getElementById("pergunta-form-container").style.display = "flex";
    });
    document.getElementById("close-pergunta-form").addEventListener("click", () => {
        document.getElementById("pergunta-form-container").style.display = "none";
    });

    // Carregar quizzes no select
    fetch("http://localhost:8080/api/quizzes")
        .then(res => res.json())
        .then(quizzes => {
            const select = document.getElementById("quizId");
            select.innerHTML = "<option value=''>Selecione um Quiz</option>";
            quizzes.forEach(q => {
                const option = document.createElement("option");
                option.value = q.id;
                option.textContent = `${q.titulo} (Nível ${q.nivel})`;
                select.appendChild(option);
            });
        });

    // Submit do formulário
    document.getElementById("pergunta-form").addEventListener("submit", function(e) {
        e.preventDefault();
        cadastrarPergunta();
    });

    listarPerguntas();
}

// Cadastrar pergunta com alternativas separadas
function cadastrarPergunta() {
    const quizId = parseInt(document.getElementById("quizId").value);
    const texto = document.getElementById("texto").value;
    const alternativas = [
        document.getElementById("alt1").value,
        document.getElementById("alt2").value,
        document.getElementById("alt3").value,
        document.getElementById("alt4").value
    ];
    const respostaCorreta = document.getElementById("respostaCorreta").value;

    const respostasDTO = alternativas.map(a => ({
        texto: a.trim(),
        correta: a.trim() === respostaCorreta.trim()
    }));

    fetch("http://localhost:8080/api/perguntas/criar-com-respostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, texto, respostas: respostasDTO })
    })
    .then(res => {
        if(!res.ok) throw new Error("Erro ao cadastrar pergunta");
        return res.json();
    })
    .then(data => {
        document.getElementById("pergunta-result").innerHTML = alert(`<p class="success">Pergunta cadastrada com sucesso!</p>`);
        document.getElementById("pergunta-form").reset();
        document.getElementById("pergunta-form-container").style.display = "none";
        listarPerguntas();
    })
    .catch(err => {
        document.getElementById("pergunta-result").innerHTML = `<p class="error">${err.message}</p>`;
    });
}

function listarPerguntas() {
    fetch("http://localhost:8080/api/perguntas")
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#pergunta-table tbody");
            tbody.innerHTML = "";

            data.forEach(p => {
                // Obtem o título do quiz ou texto padrão
                const quizTitulo = p.quiz?.titulo || "Sem Quiz";

                // Obtem alternativas (array de textos)
                const alternativas = (p.respostas || []).map(r => r.texto);

                // Encontra a resposta correta
                const respostaCorreta = (p.respostas || []).find(r => r.correta)?.texto || "";

                // Cria a linha da tabela
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${p.id}</td>
                    <td>${quizTitulo}</td>
                    <td>${p.texto}</td>
                    <td>${alternativas.join(", ")}</td>
                    <td>${respostaCorreta}</td>
                `;
                tbody.appendChild(tr);
            });

            // CSS básico da tabela via JS (opcional)
            const table = document.getElementById("pergunta-table");
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";
            table.querySelectorAll("th, td").forEach(cell => {
                cell.style.border = "1px solid #ddd";
                cell.style.padding = "8px";
            });
            table.querySelectorAll("th").forEach(th => {
                th.style.backgroundColor = "#2c2c2cff";
                th.style.color = "white";
            });
        })
        .catch(err => console.error("Erro ao listar perguntas:", err));
}

// ========================== FIM PERGUNTAS  ==================================================================================================================

// ========================== Inicio COMENTARIOS ==================================================================================================================

// ========================== FIM COMENTARIOS ==================================================================================================================





// ========================== Inicio NOTIFICAÇÃO ==================================================================================================================

// ========================== FIM NOTIFICAÇÃO==================================================================================================================















// ============ LOAD CONTENT ============
/*function loadContent(name, el = null) {
  const content = document.getElementById("main-content");
  const breadcrumb = document.getElementById("breadcrumb");
*/
  // marca ativo
/* document.querySelectorAll(".menu li").forEach(li => li.classList.remove("active"));
  if (el && !el.classList.contains("logout")) el.parentElement.classList.add("active");

  breadcrumb.textContent = name;

  if (name === "Usuários") {
    fetchUsuarios();
  } else if (name === "Seres") {
    fetchSeres();
  } else if (name === "Denúncias") {
    fetchDenuncias();
  } else {
    content.innerHTML = `<h2>${name}</h2><p>Conteúdo em construção...</p>`;
  }
}
*/