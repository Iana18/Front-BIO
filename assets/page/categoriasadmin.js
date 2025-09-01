// ============================ VARIÁVEIS GLOBAIS ============================
window.categoriasCacheModule = [];
let categoriaEditandoModule = null;

// ============================ FETCH ============================
async function fetchCategoriasModule() {
    try {
        const resp = await fetch("http://localhost:8080/api/categorias"); // Corrigida a URL
        if (!resp.ok) throw new Error("Erro ao buscar categorias");
        window.categoriasCacheModule = await resp.json();
        renderizarCategoriasModule();
        mostrarCategoriasModule(window.categoriasCacheModule);
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar categorias.");
    }
}

// ============================ RENDER ============================
function renderizarCategoriasModule() {
    const html = `
        <h2>Categorias</h2>
        <div style="margin-bottom:15px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <button id="btn-nova-categoria-module" style="padding:6px 12px; border:none; border-radius:6px; background:#4CAF50; color:#fff; cursor:pointer;">
                <i class="fas fa-plus"></i> Nova Categoria
            </button>
        </div>
        <div id="categorias-container-module" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); gap:20px;"></div>
    `;
    document.getElementById("main-content").innerHTML = html;
    document.getElementById("btn-nova-categoria-module").onclick = abrirFormularioNovaCategoriaModule;
}

// ============================ MOSTRAR ============================
function mostrarCategoriasModule(categorias) {
    const container = document.getElementById("categorias-container-module");
    container.innerHTML = "";

    categorias.forEach(c => {
        const card = document.createElement("div");
        Object.assign(card.style, {
            background:"#fff",
            borderRadius:"12px",
            boxShadow:"0 6px 15px rgba(0,0,0,0.1)",
            padding:"15px",
            display:"flex",
            flexDirection:"column",
            gap:"8px"
        });

        const title = document.createElement("h4");
        title.textContent = c.nome;

        const desc = document.createElement("p");
        desc.textContent = c.descricao || "Sem descrição.";
        desc.style.color = "#555";

        const actions = document.createElement("div");
        Object.assign(actions.style, {display:"flex", gap:"8px", marginTop:"auto"});

        const btnEditar = document.createElement("button");
        btnEditar.innerHTML = `<i class="fas fa-edit"></i>`;
        Object.assign(btnEditar.style, {padding:"6px 10px", background:"#2196F3", color:"#fff", border:"none", borderRadius:"6px", cursor:"pointer"});
        btnEditar.onclick = () => abrirFormularioEditarCategoriaModule(c);

        const btnDeletar = document.createElement("button");
        btnDeletar.innerHTML = `<i class="fas fa-trash"></i>`;
        Object.assign(btnDeletar.style, {padding:"6px 10px", background:"#f44336", color:"#fff", border:"none", borderRadius:"6px", cursor:"pointer"});
        btnDeletar.onclick = () => deletarCategoriaModule(c.id);

        actions.appendChild(btnEditar);
        actions.appendChild(btnDeletar);

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

// ============================ MODAL ============================
function abrirFormularioNovaCategoriaModule() {
    categoriaEditandoModule = null;
    abrirModalCategoriaModule({nome:"", descricao:""});
}

function abrirFormularioEditarCategoriaModule(categoria) {
    categoriaEditandoModule = categoria;
    abrirModalCategoriaModule(categoria);
}

function abrirModalCategoriaModule(categoria) {
    let modal = document.getElementById("modal-categoria-module");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-categoria-module";
        Object.assign(modal.style, {
            display:"flex", position:"fixed", top:"0", left:"0", width:"100%", height:"100%",
            background:"rgba(0,0,0,0.5)", justifyContent:"center", alignItems:"center", zIndex:"1000"
        });

        modal.innerHTML = `
            <div style="background:#fff; padding:25px; border-radius:12px; width:400px; max-width:90%; box-shadow:0 10px 25px rgba(0,0,0,0.2); display:flex; flex-direction:column; gap:12px;">
                <h3 id="modal-titulo-categoria-module" style="margin:0; font-size:20px; color:#333;"></h3>
                <input type="text" id="modal-nome-categoria-module" placeholder="Nome">
                <textarea id="modal-descricao-categoria-module" placeholder="Descrição"></textarea>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button id="modal-salvar-categoria-module"><i class="fas fa-save"></i> Salvar</button>
                    <button id="modal-cancelar-categoria-module"><i class="fas fa-times"></i> Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById("modal-cancelar-categoria-module").onclick = () => modal.style.display = "none";
        document.getElementById("modal-salvar-categoria-module").onclick = salvarOuAtualizarCategoriaModule;
    }

    document.getElementById("modal-titulo-categoria-module").textContent = categoriaEditandoModule ? "Editar Categoria" : "Nova Categoria";
    document.getElementById("modal-nome-categoria-module").value = categoria.nome ?? "";
    document.getElementById("modal-descricao-categoria-module").value = categoria.descricao ?? "";

    modal.style.display = "flex";
}

// ============================ SALVAR ============================
async function salvarOuAtualizarCategoriaModule() {
    const nome = document.getElementById("modal-nome-categoria-module").value.trim();
    const descricao = document.getElementById("modal-descricao-categoria-module").value.trim();

    if (!nome) return alert("Informe o nome da categoria.");

    try {
        if (categoriaEditandoModule) {
            const resp = await fetch(`http://localhost:8080/api/categorias/${categoriaEditandoModule.id}`, {
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({nome, descricao})
            });
            if(!resp.ok) throw new Error("Erro ao atualizar categoria");
            const atualizada = await resp.json();
            window.categoriasCacheModule = window.categoriasCacheModule.map(c => c.id === categoriaEditandoModule.id ? atualizada : c);
            alert("Categoria atualizada!");
        } else {
            const resp = await fetch("http://localhost:8080/api/categorias/criar", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({nome, descricao})
            });
            if(!resp.ok) throw new Error("Erro ao criar categoria");
            const nova = await resp.json();
            window.categoriasCacheModule.push(nova);
            alert("Categoria cadastrada!");
        }
        document.getElementById("modal-categoria-module").style.display = "none";
        mostrarCategoriasModule(window.categoriasCacheModule);
    } catch(err) {
        console.error(err);
        alert("Erro ao salvar categoria.");
    }
}

// ============================ DELETAR ============================
async function deletarCategoriaModule(id) {
    if(!confirm("Deseja realmente deletar esta categoria?")) return;
    try {
        const resp = await fetch(`http://localhost:8080/api/categorias/${id}`, {method:"DELETE"});
        if(!resp.ok) throw new Error("Erro ao deletar categoria");
        window.categoriasCacheModule = window.categoriasCacheModule.filter(c => c.id !== id);
        mostrarCategoriasModule(window.categoriasCacheModule);
        alert("Categoria deletada com sucesso!");
    } catch(err) {
        console.error(err);
        alert("Erro ao deletar categoria.");
    }
}

// ============================ EXPOR FUNÇÃO ============================
window.fetchCategorias = fetchCategoriasModule;

// NÃO chamar fetchCategoriasModule aqui; será chamado pelo adim.js
