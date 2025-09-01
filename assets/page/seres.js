// ========================== INICIO SERES ==================================================================================================================

// ---------------------------- Cache global ----------------------------
window.seresCache = [];
window.denunciasCache = [];
window.especiesCache = [];
window.locationCache = JSON.parse(localStorage.getItem("locationCache") || "{}");

// ---------------------------- Usuário logado (admin) ----------------------------
function getUsuarioLogado() {
    return {
        login: localStorage.getItem("usuarioLogin") || "admin",
        email: localStorage.getItem("usuarioEmail") || "admin@example.com"
    };
}

// ---------------------------- Modal genérico ----------------------------
function abrirDetalhesGenerico(titulo, infoArray, imagemBase64 = null) {
    const modalContainer = document.getElementById("modal-container");
    if (!modalContainer) return console.error("Elemento #modal-container não encontrado!");
    modalContainer.innerHTML = ""; 

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.5)", zIndex: 999
    });
    overlay.onclick = () => modalContainer.innerHTML = "";

    const modal = document.createElement("div");
    Object.assign(modal.style, {
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "#fefefe", padding: "25px", borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)", zIndex: 1000,
        width: "650px", maxHeight: "90%", overflowY: "auto"
    });

    const h3 = document.createElement("h3");
    h3.textContent = titulo;
    modal.appendChild(h3);

    const contentWrapper = document.createElement("div");
    Object.assign(contentWrapper.style, { display: "flex", gap: "20px" });

    const imgDiv = document.createElement("div");
    imgDiv.style.flex = "0 0 300px";
    imgDiv.innerHTML = imagemBase64
        ? `<img src="data:image/jpeg;base64,${imagemBase64}" style="width:100%;border-radius:8px;object-fit:cover;">`
        : "Sem imagem";

    const detailsDiv = document.createElement("div");
    Object.assign(detailsDiv.style, { flex: "1", display: "flex", flexDirection: "column", gap: "8px" });
    infoArray.forEach(([label, value]) => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${label}:</strong> ${value ?? "—"}`;
        detailsDiv.appendChild(p);
    });

    contentWrapper.appendChild(imgDiv);
    contentWrapper.appendChild(detailsDiv);
    modal.appendChild(contentWrapper);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Fechar";
    Object.assign(closeBtn.style, {
        padding: "8px 15px", border: "none", borderRadius: "6px",
        background: "#4CAF50", color: "#fff", cursor: "pointer", marginTop: "15px"
    });
    closeBtn.onclick = () => modalContainer.innerHTML = "";
    modal.appendChild(closeBtn);

    modalContainer.appendChild(overlay);
    modalContainer.appendChild(modal);
}

// ---------------------------- Buscar espécies ----------------------------
async function fetchEspecies() {
    try {
        const resp = await fetch("http://localhost:8080/api/especies");
        if (!resp.ok) throw new Error("Erro ao buscar espécies");
        window.especiesCache = await resp.json();
    } catch (err) {
        console.error(err);
        window.especiesCache = [];
    }
}

// ---------------------------- Seres ----------------------------
async function fetchSeres() {
    try {
        const res = await fetch("http://localhost:8080/api/seres");
        const seres = await res.json();
        window.seresCache = seres;
        renderCardsSeres(seres);
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar seres");
    }
}

function renderCardsSeres(seres) {
    const content = document.getElementById("main-content");
    content.innerHTML = `
        <h2 style="margin-bottom:15px;">Seres</h2>
        <div style="margin-bottom:15px; display:flex; flex-wrap:wrap; align-items:center; gap:10px;">
            <input type="text" id="search-nome" placeholder="Nome comum ou científico" style="padding:5px; width:200px;">
            <select id="search-especie" style="padding:5px; width:150px;">
                <option value="">Espécie</option>
                ${window.especiesCache.map(es => `<option value="${es.nome}">${es.nome}</option>`).join('')}
            </select>
            <select id="search-status-aprovacao" style="padding:5px;">
                <option value="">Status Aprovação</option>
                <option value="PENDENTE">Pendente</option>
                <option value="APROVADO">Aprovado</option>
                <option value="REJEITADA">Rejeitada</option>
                <option value="RESOLVIDA">Resolvida</option>
                <option value="NAO_RESOLVIDA">Não resolvida</option>
            </select>
            <select id="search-status-conservacao" style="padding:5px;">
                <option value="">Status Conservação</option>
                <option value="CRITICAMENTE_EM_PERIGO">Criticamente em perigo</option>
                <option value="EM_PERIGO">Em perigo</option>
                <option value="VULNERAVEL">Vulnerável</option>
                <option value="QUASE_AMEAÇADO">Quase ameaçado</option>
                <option value="LEAST_CONCERN">Menor preocupação</option>
            </select>
        </div>
        <div id="cards-seres" style="display:grid; grid-template-columns: repeat(auto-fill,minmax(250px,1fr)); gap:15px;"></div>
        <div id="modal-container"></div>
    `;
    document.getElementById("search-nome").oninput = filtrarSeres;
    document.getElementById("search-especie").onchange = filtrarSeres;
    document.getElementById("search-status-aprovacao").onchange = filtrarSeres;
    document.getElementById("search-status-conservacao").onchange = filtrarSeres;

    mostrarSeres(seres);
}

async function mostrarSeres(seres) {
    const container = document.getElementById("cards-seres");
    container.innerHTML = "";

    seres.forEach((e) => {
        // ---------- Card base ----------
        const card = document.createElement("div");
        Object.assign(card.style, {
            background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden", display: "flex", flexDirection: "column"
        });

        // Imagem inicial (placeholder)
        const img = document.createElement("img");
        img.src = "assets/images/default.png";
        Object.assign(img.style, { width: "100%", height: "180px", objectFit: "cover" });
        card.appendChild(img);

        const body = document.createElement("div");
        Object.assign(body.style, { padding: "12px", display: "flex", flexDirection: "column", gap: "6px" });

        const titulo = document.createElement("h4");
        titulo.textContent = e.nomeComum ?? "—";

        const subtitulo = document.createElement("p");
        subtitulo.style.margin = 0;
        subtitulo.style.fontSize = "14px";
        subtitulo.style.color = "#555";
        subtitulo.textContent = e.nomeCientifico ? `(${e.nomeCientifico})` : "";

        const info = document.createElement("p");
        info.style.fontSize = "13px";
        info.style.color = "#444";
        info.innerHTML = `
            <strong>Espécie:</strong> ${e.especie?.nome ?? "—"} <br>
            <strong>Tipo:</strong> ${e.tipo?.nome ?? "—"} <br>
            <strong>Localização:</strong> <span id="loc-${e.id}">Carregando...</span> <br>
            <strong>Denunciado por:</strong> ${e.registradoPor?.login ?? "—"} <br>
            <strong>Status Aprovação:</strong> ${e.statusAprovacao ?? "—"}
        `;

        body.appendChild(titulo);
        body.appendChild(subtitulo);
        body.appendChild(info);

        const actions = document.createElement("div");
        Object.assign(actions.style, { display: "flex", justifyContent: "space-between", marginTop: "10px" });

        const criarBotao = (iconClass, cor, acao) => {
            const btn = document.createElement("button");
            Object.assign(btn.style, { background: cor, border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer", padding: "6px 10px" });
            btn.innerHTML = `<i class="${iconClass}"></i>`;
            btn.onclick = acao;
            return btn;
        };

        actions.appendChild(criarBotao("fas fa-check", "#28a745", () => aprovarSer(e.id)));
        actions.appendChild(criarBotao("fas fa-trash", "#f44336", () => deletarSer(e.id)));
        actions.appendChild(criarBotao("fas fa-edit", "#2196F3", () => abrirModalAtualizar(e, "ser")));
        actions.appendChild(criarBotao("fas fa-eye", "#6c757d", () => abrirModalCompleto(e)));

        body.appendChild(actions);
        card.appendChild(body);
        container.appendChild(card);

        // ---------- Carregar imagem em paralelo ----------
        (async () => {
            try {
                const imgRes = await fetch(`http://localhost:8080/api/seres/${e.id}/imagem`);
                if (imgRes.ok) {
                    const base64 = await imgRes.text();
                    if (base64) img.src = `data:image/jpeg;base64,${base64}`;
                }
            } catch {}
        })();

        // ---------- Resolver localização em paralelo ----------
        (async () => {
            let locationName = "Localização não encontrada";
            if (window.locationCache[e.id]) {
                locationName = window.locationCache[e.id];
            } else if (e.latitude != null && e.longitude != null) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latitude}&lon=${e.longitude}&format=json`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.display_name) locationName = data.display_name;
                    }
                    window.locationCache[e.id] = locationName;
                    localStorage.setItem("locationCache", JSON.stringify(window.locationCache));
                } catch {}
            }
            const locEl = document.getElementById(`loc-${e.id}`);
            if (locEl) locEl.textContent = locationName;
        })();
    });
}


async function filtrarSeres() {
    try {
        const resp = await fetch("http://localhost:8080/api/seres");
        if (!resp.ok) throw new Error("Erro ao buscar seres");
        const seres = await resp.json();
        window.seresCache = seres; // atualiza o cache

        const nome = document.getElementById("search-nome").value.toLowerCase();
        const especie = document.getElementById("search-especie").value;
        const statusAprovacao = document.getElementById("search-status-aprovacao").value;
        const statusConservacao = document.getElementById("search-status-conservacao").value;

        const filtrados = seres.filter(s =>
            (!nome || s.nomeComum?.toLowerCase().includes(nome) || s.nomeCientifico?.toLowerCase().includes(nome)) &&
            (!especie || s.especie?.nome === especie) &&
            (!statusAprovacao || s.statusAprovacao === statusAprovacao) &&
            (!statusConservacao || s.statusConservacao === statusConservacao)
        );

        mostrarSeres(filtrados);

    } catch (err) {
        console.error(err);
        alert("Erro ao buscar seres atualizados");
    }
}


function aprovarSer(id) {
    const u = getUsuarioLogado();
    fetch(`http://localhost:8080/api/seres/${id}/aprovar?usuarioLogin=${u.login}&usuarioEmail=${u.email}`, { method: "POST" })
        .then(r => r.ok ? filtrarSeres() : Promise.reject("Erro ao aprovar"))
        .catch(console.error);
}

function deletarSer(id) {
    const u = getUsuarioLogado();
    fetch(`http://localhost:8080/api/seres/${id}?usuarioLogin=${u.login}&usuarioEmail=${u.email}`, { method: "DELETE" })
        .then(r => r.ok ? filtrarSeres() : Promise.reject("Erro ao deletar"))
        .catch(console.error);
}

function abrirModalCompleto(ser) {
    fetch(`http://localhost:8080/api/seres/${ser.id}/detalhes`)
        .then(r => r.json())
        .then(data => {
            const info = [
                ["Nome comum", data.nomeComum],
                ["Nome científico", data.nomeCientifico],
                ["Descrição", data.descricao],
                ["Espécie", data.especie?.nome ?? "Desconhecida"],
                ["Tipo", data.tipo?.nome ?? "—"],
                ["Latitude", data.latitude ?? "—"],
                ["Longitude", data.longitude ?? "—"],
                ["Localização", data.latitude && data.longitude ? window.locationCache[ser.id] || "—" : "—"],
                ["Registrado por", data.registradoPor?.login ?? "—"],
                ["Data de registro", data.dataRegistro ? new Date(data.dataRegistro).toLocaleString() : "—"],
                ["Status Aprovação", data.statusAprovacao ?? "—"],
                ["Data de aprovação", data.dataAprovacao ? new Date(data.dataAprovacao).toLocaleString() : "—"],
                ["Status Conservação", data.statusConservacao ?? "—"]
            ];
            abrirDetalhesGenerico(`Detalhes do Ser #${ser.id}`, info, data.imagem);
        })
        .catch(console.error);
}
async function abrirModalAtualizar(item, tipo) {
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

    const h3 = document.createElement("h3");
    h3.textContent = `Atualizar ${tipo} #${item.id}`;
    modal.appendChild(h3);

    // Form
    const form = document.createElement("form");
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "10px";

    if (tipo === "ser") {
        // Campos básicos
        const campos = [
            { label: "Nome comum", value: item.nomeComum, name: "nomeComum" },
            { label: "Nome científico", value: item.nomeCientifico, name: "nomeCientifico" },
            { label: "Descrição", value: item.descricao, name: "descricao" },
            { label: "Latitude", value: item.latitude, name: "latitude", type: "number", step: "any" },
            { label: "Longitude", value: item.longitude, name: "longitude", type: "number", step: "any" }
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
            input.type = c.type || "text";
            input.step = c.step || undefined;
            input.value = c.value ?? "";
            input.name = c.name;
            input.style.width = "100%";
            input.style.padding = "5px";
            label.appendChild(input);

            form.appendChild(label);
        });

        // Carregar tipos do backend
        if (!window.tiposCache || window.tiposCache.length === 0) {
            try {
                const resp = await fetch("http://localhost:8080/api/tipos");
                if (!resp.ok) throw new Error("Erro ao buscar tipos");
                window.tiposCache = await resp.json();
            } catch (err) {
                console.error(err);
                window.tiposCache = [];
            }
        }

        // Dropdown Tipo
        const labelTipo = document.createElement("label");
        labelTipo.style.display = "flex";
        labelTipo.style.flexDirection = "column";
        labelTipo.style.gap = "4px";
        const spanTipo = document.createElement("span");
        spanTipo.textContent = "Tipo";
        labelTipo.appendChild(spanTipo);

        const selectTipo = document.createElement("select");
        selectTipo.name = "tipoNome";
        selectTipo.style.width = "100%";
        selectTipo.style.padding = "5px";

        window.tiposCache.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.nome; // string simples
            opt.textContent = t.nome;
            if (item.tipo?.nome === t.nome) opt.selected = true;
            selectTipo.appendChild(opt);
        });

        labelTipo.appendChild(selectTipo);
        form.appendChild(labelTipo);


         // Carregar tipos do backend
        if (!window.tiposCache || window.tiposCache.length === 0) {
            try {
                const resp = await fetch("http://localhost:8080/api/especies");
                if (!resp.ok) throw new Error("Erro ao buscar especies");
                window.especieCache = await resp.json();
            } catch (err) {
                console.error(err);
                window.especieCache = [];
            }
        }

        // Dropdown Espécie
        const labelEspecie = document.createElement("label");
        labelEspecie.style.display = "flex";
        labelEspecie.style.flexDirection = "column";
        labelEspecie.style.gap = "4px";
        const spanEspecie = document.createElement("span");
        spanEspecie.textContent = "Espécie";
        labelEspecie.appendChild(spanEspecie);

        const selectEspecie = document.createElement("select");
        selectEspecie.name = "especieNome";
        selectEspecie.style.width = "100%";
        selectEspecie.style.padding = "5px";

        window.especiesCache.forEach(e => {
            const opt = document.createElement("option");
            opt.value = e.nome; // string simples
            opt.textContent = e.nome;
            if (item.especie?.nome === e.nome) opt.selected = true;
            selectEspecie.appendChild(opt);
        });

        labelEspecie.appendChild(selectEspecie);
        form.appendChild(labelEspecie);

        // Status conservação
        const labelStatus = document.createElement("label");
        labelStatus.style.display = "flex";
        labelStatus.style.flexDirection = "column";
        labelStatus.style.gap = "4px";
        const spanStatus = document.createElement("span");
        spanStatus.textContent = "Status Conservação";
        labelStatus.appendChild(spanStatus);

        const selectStatus = document.createElement("select");
        selectStatus.name = "statusConservacao";
        selectStatus.style.width = "100%";
        selectStatus.style.padding = "5px";

        ["CRITICAMENTE_EM_PERIGO","EM_PERIGO","VULNERAVEL","QUASE_AMEACADO","LEAST_CONCERN"]
            .forEach(s => {
                const opt = document.createElement("option");
                opt.value = s;
                opt.textContent = s.replaceAll("_"," ").toLowerCase();
                if (item.statusConservacao === s) opt.selected = true;
                selectStatus.appendChild(opt);
            });

        labelStatus.appendChild(selectStatus);
        form.appendChild(labelStatus);

        // Campo Imagem
        const labelImg = document.createElement("label");
        labelImg.style.display = "flex";
        labelImg.style.flexDirection = "column";
        labelImg.style.gap = "4px";
        const spanImg = document.createElement("span");
        spanImg.textContent = "Imagem (opcional)";
        labelImg.appendChild(spanImg);

        const inputImg = document.createElement("input");
        inputImg.type = "file";
        inputImg.name = "imagemFile";
        inputImg.accept = "image/*";
        labelImg.appendChild(inputImg);
        form.appendChild(labelImg);

        // Botão salvar
        const salvarBtn = document.createElement("button");
        salvarBtn.type = "submit";
        salvarBtn.textContent = "Salvar";
        Object.assign(salvarBtn.style, {
            padding: "8px 15px", border: "none", borderRadius: "6px",
            background: "#2196F3", color: "#fff", cursor: "pointer"
        });
        form.appendChild(salvarBtn);

        // Submit
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(form);

                // Enviar exatamente o que o backend espera
                formData.set("tipoNome", selectTipo.value);
                formData.set("especieNome", selectEspecie.value);
                formData.set("latitude", parseFloat(form.latitude.value));
                formData.set("longitude", parseFloat(form.longitude.value));

                const u = getUsuarioLogado();
                formData.set("usuarioLogin", u.login);
                formData.set("usuarioEmail", u.email);

                const resp = await fetch(`http://localhost:8080/api/seres/${item.id}/atualizar-multipart`, {
                    method: "PUT",
                    body: formData
                });

                if (!resp.ok) throw new Error("Erro ao atualizar ser");
                alert("Ser atualizado com sucesso!");
                modalContainer.innerHTML = "";
                filtrarSeres();
            } catch(err) {
                console.error(err);
                alert("Erro ao atualizar. Verifique o console para detalhes.");
            }
        };
    }
    modal.appendChild(form);
    modalContainer.appendChild(overlay);
    modalContainer.appendChild(modal);
}

