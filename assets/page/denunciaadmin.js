
// ---------------------------- Variáveis Globais ----------------------------
window.denunciasCache = [];
window.locationCache = {};
window.especiesCache = [];

// ---------------------------- Fetch Denúncias ----------------------------
async function fetchDenuncias() {
    try {
        const resp = await fetch("http://localhost:8080/api/denuncias");
        if (!resp.ok) throw new Error("Erro ao buscar denúncias");
        const denuncias = await resp.json();
        window.denunciasCache = denuncias;
        renderizarDenunciasPage();
        mostrarDenuncias(denuncias);
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar denúncias.");
    }
}

// ---------------------------- Renderização ----------------------------
function renderizarDenunciasPage() {
    const html = `
        <h2>Denúncias</h2>
        <div style="margin-bottom:10px; display:flex; align-items:center; gap:10px;">
            <input type="text" id="search-input" placeholder="Buscar por título ou descrição" style="padding:5px; width:300px;">
            <button onclick="filtrarDenuncias()" style="padding:5px 10px;">Buscar</button>
        </div>
        <div id="denuncias-container" style="overflow-x:auto;"></div>
        <div id="modal-container"></div>
    `;
    document.getElementById("main-content").innerHTML = html;
}

function filtrarDenuncias() {
    const termo = document.getElementById("search-input").value.toLowerCase();
    const filtradas = window.denunciasCache.filter(d =>
        d.titulo.toLowerCase().includes(termo) || d.descricao.toLowerCase().includes(termo)
    );
    mostrarDenuncias(filtradas);
}

async function mostrarDenuncias(denuncias) {
    const container = document.getElementById("denuncias-container");
    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
    container.style.gap = "20px";
    container.style.padding = "10px";

    const cardsPromises = denuncias.map(async (d) => {
        // Localização
        let locationName = "Localização não encontrada";
        if (window.locationCache[d.id]) {
            locationName = window.locationCache[d.id];
        } else if (d.latitude != null && d.longitude != null) {
            try {
                const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${d.latitude}&lon=${d.longitude}&format=json`);
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.display_name) locationName = data.display_name;
                    window.locationCache[d.id] = locationName;
                }
            } catch {}
        }

        // Imagem
        let imagemSrc = "assets/images/default.png";
        if (d.imagem) {
            imagemSrc = `data:image/jpeg;base64,${d.imagem}`;
        }

        // Card container
        const card = document.createElement("div");
        Object.assign(card.style, {
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        });

        const img = document.createElement("img");
        img.src = imagemSrc;
        Object.assign(img.style, { width: "100%", height: "180px", objectFit: "cover" });
        card.appendChild(img);

        // Corpo do card
        const body = document.createElement("div");
        Object.assign(body.style, { padding: "12px", display: "flex", flexDirection: "column", gap: "6px" });

        const titulo = document.createElement("h4");
        titulo.textContent = d.titulo ?? "—";
        titulo.style.margin = 0;

        const descricao = document.createElement("p");
        descricao.style.margin = 0;
        descricao.style.fontSize = "13px";
        descricao.style.color = "#555";
        descricao.textContent = d.descricao ?? "";

        const info = document.createElement("p");
        info.style.fontSize = "12px";
        info.style.color = "#444";
        info.innerHTML = `
            <strong>ID:</strong> ${d.id} <br>
            <strong>Espécie:</strong> ${d.especie?.nome ?? "Desconhecida"} <br>
            <strong>Status:</strong> ${d.statusAprovacao ?? "—"} <br>
            <strong>Data:</strong> ${d.dataDenuncia ? new Date(d.dataDenuncia).toLocaleDateString() : "—"} <br>
            <strong>Localização:</strong> ${locationName} <br>
            <strong>Denunciado Por:</strong> ${d.denunciadoPor?.login ?? "—"}
        `;

        body.appendChild(titulo);
        body.appendChild(descricao);
        body.appendChild(info);

        // Botões de ação
        const actions = document.createElement("div");
        Object.assign(actions.style, { display: "flex", justifyContent: "space-between", marginTop: "10px" });

        const criarBotao = (icon, cor, acao, title) => {
            const btn = document.createElement("button");
            Object.assign(btn.style, { background: cor, border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", padding: "6px 10px" });
            btn.innerHTML = icon;
            btn.title = title;
            btn.onclick = acao;
            return btn;
        };

            actions.appendChild(criarBotao('<i class="fas fa-eye"></i>', "#6c757d", () => abrirDetalhesDenuncia(d.id), "Ver detalhes"));
            actions.appendChild(criarBotao('<i class="fas fa-edit"></i>', "#2196F3", () => abrirModalAtualizarDenuncia(d), "Editar denúncia"));
            actions.appendChild(criarBotao('<i class="fas fa-trash-alt"></i>', "#f44336", () => deletarDenuncia(d.id), "Deletar denúncia"));
    actions.appendChild(criarBotao('<i class="fas fa-check"></i>', "#28a745", () => aprovarDenuncia(d.id), "Aprovar denúncia"));


        body.appendChild(actions);
        card.appendChild(body);
        container.appendChild(card);
    });

    await Promise.all(cardsPromises);
}

// ---------------------------- Funções de Ação ----------------------------
async function aprovarDenuncia(id) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/denuncias/${id}/aprovar`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erro ao aprovar denúncia: ${text}`);
        }

        alert(`Denúncia #${id} aprovada com sucesso!`);
        fetchDenuncias();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

async function deletarDenuncia(id) {
    if (!confirm(`Deseja realmente deletar a denúncia #${id}?`)) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/denuncias/${id}`, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erro ao deletar denúncia: ${text}`);
        }

        alert(`Denúncia #${id} deletada com sucesso!`);
        fetchDenuncias();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function abrirDetalhesDenuncia(id) {
    const denuncia = window.denunciasCache.find(d => d.id === id);
    if (!denuncia) return alert("Denúncia não encontrada.");

    const info = [
        ["Título", denuncia.titulo],
        ["Descrição", denuncia.descricao],
        ["Status Aprovação", denuncia.statusAprovacao],
        ["Data Denúncia", denuncia.dataDenuncia ? new Date(denuncia.dataDenuncia).toLocaleString() : "—"],
        ["Espécie", denuncia.especie?.nome ?? "Desconhecida"],
        ["Denunciado por", denuncia.denunciadoPor?.login ?? "—"]
    ];

    abrirDetalhesGenerico(`Detalhes Denúncia #${denuncia.id}`, info, denuncia.imagem);
}

// ---------------------------- Modal de Atualização ----------------------------
async function abrirModalAtualizarDenuncia(denuncia) {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return;
    modalContainer.innerHTML = "";

    // Overlay
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.5)", zIndex: 999
    });
    overlay.onclick = () => modalContainer.innerHTML = "";

    // Modal
    const modal = document.createElement("div");
    Object.assign(modal.style, {
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "#fefefe", padding: "25px", borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: 1000,
        width: "500px", maxHeight: "90%", overflowY: "auto"
    });

    // Título
    const h3 = document.createElement("h3");
    h3.textContent = `Atualizar Denúncia #${denuncia.id}`;
    modal.appendChild(h3);

    // Formulário
    const form = document.createElement("form");
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "10px";

    // Campos editáveis
    const campos = [
        { label: "Título", name: "titulo", value: denuncia.titulo },
        { label: "Descrição", name: "descricao", value: denuncia.descricao }
    ];

    campos.forEach(c => {
        const label = document.createElement("label");
        label.style.display = "flex";
        label.style.flexDirection = "column";
        label.style.gap = "4px";

        const span = document.createElement("span");
        span.textContent = c.label;
        label.appendChild(span);

        const input = document.createElement("input");
        input.type = "text";
        input.value = c.value ?? "";
        input.name = c.name;
        input.style.width = "100%";
        input.style.padding = "5px";
        label.appendChild(input);

        form.appendChild(label);
    });

    // Select para Espécie
    const labelEspecie = document.createElement("label");
    labelEspecie.style.display = "flex";
    labelEspecie.style.flexDirection = "column";
    labelEspecie.style.gap = "4px";

    const spanEspecie = document.createElement("span");
    spanEspecie.textContent = "Espécie";
    labelEspecie.appendChild(spanEspecie);

    const selectEspecie = document.createElement("select");
    selectEspecie.name = "especieId";
    selectEspecie.style.width = "100%";
    selectEspecie.style.padding = "5px";

    if (!window.especiesCache || window.especiesCache.length === 0) {
        try {
            const resp = await fetch("http://localhost:8080/api/especies");
            if (!resp.ok) throw new Error("Erro ao buscar espécies");
            window.especiesCache = await resp.json();
        } catch (err) {
            console.error(err);
            window.especiesCache = [];
        }
    }

    window.especiesCache.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.id;
        opt.textContent = e.nome;
        if (denuncia.especie?.id === e.id) opt.selected = true;
        selectEspecie.appendChild(opt);
    });

    labelEspecie.appendChild(selectEspecie);
    form.appendChild(labelEspecie);

    // Botão de salvar
    const salvarBtn = document.createElement("button");
    salvarBtn.type = "submit";
    salvarBtn.textContent = "Salvar";
    Object.assign(salvarBtn.style, {
        padding: "8px 15px", background: "#2196F3", color: "#fff",
        border: "none", borderRadius: "6px", cursor: "pointer"
    });
    form.appendChild(salvarBtn);

    // Envio do formulário
    form.onsubmit = async (e) => {
        e.preventDefault();

        const u = {
            login: localStorage.getItem("login"),
            email: localStorage.getItem("email"),
            token: localStorage.getItem("token")
        };

        const isAdmin = u.login === "admin" || u.email === "admin@sistema.com";
        if (!isAdmin) {
            alert("Apenas administradores podem atualizar denúncias.");
            return;
        }

        const especieSelecionada = window.especiesCache.find(
            e => e.id == form.especieId.value
        );

        const payload = {
            titulo: form.titulo.value,
            descricao: form.descricao.value,
            especie: { id: especieSelecionada.id, nome: especieSelecionada.nome },
            usuarioLogin: u.login,
            usuarioEmail: u.email
        };

        try {
            const resp = await fetch(`http://localhost:8080/api/denuncias/${denuncia.id}/atualizar-por-nome`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${u.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) throw new Error("Erro ao atualizar denúncia");

            alert("Denúncia atualizada com sucesso!");
            modalContainer.innerHTML = "";
            fetchDenuncias();
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar denúncia");
        }
    };

    modal.appendChild(form);
    modalContainer.appendChild(overlay);
    modalContainer.appendChild(modal);
}

// ---------------------------- Inicialização ----------------------------
async function init() {
    await fetchEspecies();
    fetchSeres();
    fetchDenuncias();
}

init();
