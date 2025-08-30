// ============ REQUISIÇÕES XHR ============

// ---- Usuários ----
function fetchUsuarios() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:8080/api/usuarios", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const usuarios = JSON.parse(xhr.responseText);

      let html = `
        <h2>Usuários</h2>
        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome Completo</th>
              <th>Email</th>
              <th>Login</th>
              <th>Password</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody id="usuarios-body"></tbody>
        </table>
      `;

      document.getElementById("main-content").innerHTML = html;

      const tbody = document.getElementById("usuarios-body");

      usuarios.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${u.nomeCompleto}</td>
          <td>${u.email}</td>
          <td>${u.login}</td>
          <td>${u.password}</td>
          <td>${u.role}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  };
  xhr.send();
}



// ========================== INICIO SERES ==================================================================================================================
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

    const cardsPromises = seres.map(async (e) => {
        let imagemSrc = "assets/images/default.png";
        try {
            const imgRes = await fetch(`http://localhost:8080/api/seres/${e.id}/imagem`);
            if (imgRes.ok) {
                const base64 = await imgRes.text();
                if (base64) imagemSrc = `data:image/jpeg;base64,${base64}`;
            }
        } catch {}

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

        const card = document.createElement("div");
        Object.assign(card.style, {
            background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden", display: "flex", flexDirection: "column"
        });

        const img = document.createElement("img");
        img.src = imagemSrc;
        Object.assign(img.style, { width: "100%", height: "180px", objectFit: "cover" });
        card.appendChild(img);

        const body = document.createElement("div");
        Object.assign(body.style, { padding: "12px", display: "flex", flexDirection: "column", gap: "6px" });

        const titulo = document.createElement("h4");
        titulo.textContent = e.nomeComum ?? "—";
        const subtitulo = document.createElement("p");
        subtitulo.style.margin = 0; subtitulo.style.fontSize = "14px"; subtitulo.style.color = "#555";
        subtitulo.textContent = e.nomeCientifico ? `(${e.nomeCientifico})` : "";

        const info = document.createElement("p");
        info.style.fontSize = "13px"; info.style.color = "#444";
        info.innerHTML = `
            <strong>Espécie:</strong> ${e.especie?.nome ?? "—"} <br>
            <strong>Tipo:</strong> ${e.tipo?.nome ?? "—"} <br>
            <strong>Localização:</strong> ${locationName} <br>
            <strong>Denunciado por:</strong> ${e.registradoPor?.login ?? "—"} <br>
            <strong>Status Aprovação:</strong> ${e.statusAprovacao ?? "—"}
        `;

        body.appendChild(titulo); body.appendChild(subtitulo); body.appendChild(info);

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
    });

    await Promise.all(cardsPromises);
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

// ========================== FIM DENUNCIA ==================================================================================================================

// ========================== INICIO DE CATEGORIA ==================================================================================================================
window.categoriasCache = [];
let categoriaEditando = null; // Se não for null, estamos editando

async function fetchCategorias() {
    try {
        const resp = await fetch("http://localhost:8080/api/categorias");
        if (!resp.ok) throw new Error("Erro ao buscar categorias");
        const categorias = await resp.json();
        window.categoriasCache = categorias;

        const main = document.getElementById("main-content");
        main.innerHTML = `
            <h2>Categorias</h2>
            <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <button id="btn-cadastrar-categoria" style="padding:8px 15px; cursor:pointer; background:#2196F3; border:none; color:#fff; border-radius:6px;">+ Nova Categoria</button>
            </div>
            <div id="categorias-container" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:15px;"></div>

            <!-- Modal -->
            <div id="modal-categoria" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); 
                justify-content:center; align-items:center; z-index:1000;">
                
                <div style="background:#fff; padding:20px; border-radius:10px; width:400px; max-width:90%; box-shadow:0 5px 20px rgba(0,0,0,0.3);">
                    <h3 id="form-titulo">Cadastrar Nova Categoria</h3>
                    <input type="text" id="categoria-nome" placeholder="Nome da categoria" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px;">
                    <textarea id="categoria-descricao" placeholder="Descrição da categoria" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px;"></textarea>
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button id="btn-salvar-categoria" style="padding:8px 12px; cursor:pointer; background:#28a745; border:none; color:#fff; border-radius:6px;">Salvar</button>
                        <button id="btn-cancelar-categoria" style="padding:8px 12px; cursor:pointer; background:#dc3545; border:none; color:#fff; border-radius:6px;">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        mostrarCategorias(categorias);

        // Eventos do formulário
        document.getElementById("btn-cadastrar-categoria").onclick = abrirFormularioNovo;
        document.getElementById("btn-cancelar-categoria").onclick = fecharFormulario;
        document.getElementById("btn-salvar-categoria").onclick = salvarOuAtualizarCategoria;

        // Fechar modal ao clicar fora da caixa
        document.getElementById("modal-categoria").onclick = (e) => {
            if (e.target.id === "modal-categoria") fecharFormulario();
        };

    } catch (err) {
        console.error(err);
        alert("Erro ao buscar categorias.");
    }
}

// ---------------- Mostrar categorias em cards ----------------
function mostrarCategorias(categorias) {
    const container = document.getElementById("categorias-container");
    container.innerHTML = "";

    categorias.forEach(c => {
        const card = document.createElement("div");
        Object.assign(card.style, {
            background:"#fff",
            borderRadius:"12px",
            padding:"15px",
            boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
            display:"flex",
            flexDirection:"column",
            justifyContent:"space-between"
        });

        const title = document.createElement("h4");
        title.textContent = c.nome;

        const desc = document.createElement("p");
        desc.textContent = c.descricao || "Sem descrição.";
        desc.style.color = "#555";
        desc.style.fontSize = "14px";

        const actions = document.createElement("div");
        Object.assign(actions.style, {display:"flex", gap:"8px", marginTop:"10px"});

        // Botão editar
        const btnEdit = document.createElement("button");
        btnEdit.innerHTML = `<i class="fas fa-edit"></i>`;
        Object.assign(btnEdit.style, {background:"#2196F3", border:"none", color:"#fff", borderRadius:"6px", padding:"6px 10px", cursor:"pointer"});
        btnEdit.onclick = () => abrirEditarCategoria(c);

        // Botão deletar
        const btnDelete = document.createElement("button");
        btnDelete.innerHTML = `<i class="fas fa-trash"></i>`;
        Object.assign(btnDelete.style, {background:"#dc3545", border:"none", color:"#fff", borderRadius:"6px", padding:"6px 10px", cursor:"pointer"});
        btnDelete.onclick = () => deletarCategoria(c.id);

        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

// ---------------- Abrir modal para NOVA categoria ----------------
function abrirFormularioNovo() {
    categoriaEditando = null;
    document.getElementById("form-titulo").textContent = "Cadastrar Nova Categoria";
    document.getElementById("categoria-nome").value = "";
    document.getElementById("categoria-descricao").value = "";
    document.getElementById("modal-categoria").style.display = "flex";
}

// ---------------- Abrir modal para EDITAR categoria ----------------
function abrirEditarCategoria(categoria) {
    categoriaEditando = categoria;
    document.getElementById("form-titulo").textContent = "Editar Categoria";
    document.getElementById("categoria-nome").value = categoria.nome;
    document.getElementById("categoria-descricao").value = categoria.descricao || "";
    document.getElementById("modal-categoria").style.display = "flex";
}

// ---------------- Fechar modal ----------------
function fecharFormulario() {
    document.getElementById("modal-categoria").style.display = "none";
    categoriaEditando = null;
}

// ---------------- Salvar ou Atualizar ----------------
async function salvarOuAtualizarCategoria() {
    const nome = document.getElementById("categoria-nome").value.trim();
    const descricao = document.getElementById("categoria-descricao").value.trim();
    if (!nome) return alert("Informe o nome da categoria.");

    try {
        if (categoriaEditando) {
            // Atualizar
            const resp = await fetch(`http://localhost:8080/api/categorias/${categoriaEditando.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, descricao })
            });
            if (!resp.ok) throw new Error("Erro ao atualizar categoria");

            const atualizada = await resp.json();
            window.categoriasCache = window.categoriasCache.map(c => c.id === categoriaEditando.id ? atualizada : c);
            alert("Categoria atualizada!");
        } else {
            // Criar nova
            const resp = await fetch("http://localhost:8080/api/categorias/criar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, descricao })
            });
            if (!resp.ok) throw new Error("Erro ao cadastrar categoria");

            const novaCategoria = await resp.json();
            window.categoriasCache.push(novaCategoria);
            alert("Categoria cadastrada com sucesso!");
        }

        mostrarCategorias(window.categoriasCache);
        fecharFormulario();

    } catch (err) {
        console.error(err);
        alert("Erro ao salvar categoria.");
    }
}

// ---------------- Deletar categoria ----------------
async function deletarCategoria(id) {
    if (!confirm("Deseja realmente deletar esta categoria?")) return;
    try {
        const resp = await fetch(`http://localhost:8080/api/categorias/${id}`, {
            method: "DELETE"
        });
        if (!resp.ok) throw new Error("Erro ao deletar categoria");

        window.categoriasCache = window.categoriasCache.filter(c => c.id !== id);
        mostrarCategorias(window.categoriasCache);
        alert("Categoria deletada com sucesso!");
    } catch (err) {
        console.error(err);
        alert("Erro ao deletar categoria.");
    }
}
// ========================== FIM CATEGORIA ==================================================================================================================


// ========================== INICIO TIPO ==================================================================================================================
window.tiposCache = [];
window.especiesCache = [];
let tipoEditando = null;

// ---------------- Buscar Tipos ----------------
async function fetchTipos() {
    try {
        const resp = await fetch("http://localhost:8080/api/tipos");
        if (!resp.ok) throw new Error("Erro ao buscar tipos");
        const tipos = await resp.json(); 
        window.tiposCache = tipos;

        renderizarTiposPage();
        mostrarTipos(tipos);
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar tipos.");
    }
}

// ---------------- Renderizar página de tipos ----------------
function renderizarTiposPage() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
        <h2>Tipos</h2>
        <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <input id="buscar-tipo" placeholder="Buscar por nome..." style="padding:5px; width:200px;">
            <button id="btn-cadastrar-tipo" style="padding:5px 10px; cursor:pointer; background:#2196F3; color:#fff; border:none; border-radius:6px;">+ Novo Tipo</button>
        </div>
        <div id="tipos-container" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:15px;"></div>

        <!-- Modal -->
        <div id="modal-tipo" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); 
            justify-content:center; align-items:center; z-index:1000;">
            <div style="background:#fff; padding:20px; border-radius:10px; width:400px; max-width:90%; box-shadow:0 5px 20px rgba(0,0,0,0.3);">
                <h3 id="form-tipo-titulo">Cadastrar Novo Tipo</h3>
                <input type="text" id="tipo-nome" placeholder="Nome do tipo" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px;">
                <textarea id="tipo-descricao" placeholder="Descrição do tipo" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px;"></textarea>
                <select id="tipo-especie" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px;">
                    <option value="">Selecione a espécie</option>
                </select>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button id="btn-salvar-tipo" style="padding:8px 12px; cursor:pointer; background:#28a745; border:none; color:#fff; border-radius:6px;">Salvar</button>
                    <button id="btn-cancelar-tipo" style="padding:8px 12px; cursor:pointer; background:#dc3545; border:none; color:#fff; border-radius:6px;">Cancelar</button>
                </div>
            </div>
        </div>
    `;

    // Preencher select com espécies
    const selectEspecie = document.getElementById("tipo-especie");
    window.especiesCache.forEach(e => {
        const option = document.createElement("option");
        option.value = e.id;
        option.textContent = e.nome;
        selectEspecie.appendChild(option);
    });

    // Eventos
    document.getElementById("btn-cadastrar-tipo").onclick = abrirFormularioNovoTipo;
    document.getElementById("btn-cancelar-tipo").onclick = fecharFormularioTipo;
    document.getElementById("btn-salvar-tipo").onclick = salvarOuAtualizarTipo;

    // Fechar modal ao clicar fora
    document.getElementById("modal-tipo").onclick = (e) => {
        if (e.target.id === "modal-tipo") fecharFormularioTipo();
    };

    // Busca por nome
    document.getElementById("buscar-tipo").oninput = () => {
        const filtro = document.getElementById("buscar-tipo").value.toLowerCase();
        const filtrados = window.tiposCache.filter(t => t.nome.toLowerCase().includes(filtro));
        mostrarTipos(filtrados);
    };
}

// ---------------- Mostrar tipos em cards ----------------
function mostrarTipos(tipos) {
    const container = document.getElementById("tipos-container");
    container.innerHTML = "";

    tipos.forEach(t => {
        const card = document.createElement("div");
        Object.assign(card.style, {
            background:"#fff",
            borderRadius:"12px",
            padding:"15px",
            boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
            display:"flex",
            flexDirection:"column",
            justifyContent:"space-between"
        });

        const title = document.createElement("h4");
        title.textContent = t.nome;

        const desc = document.createElement("p");
        desc.textContent = t.descricao || "Sem descrição.";
        desc.style.color = "#555";
        desc.style.fontSize = "14px";

        const especie = document.createElement("p");
        especie.textContent = t.especieNome || "Sem espécie";
        especie.style.color = "#888";
        especie.style.fontSize = "12px";

        const actions = document.createElement("div");
        Object.assign(actions.style, {display:"flex", gap:"8px", marginTop:"10px"});

        // Botão editar
        const btnEdit = document.createElement("button");
        btnEdit.innerHTML = `<i class="fas fa-edit"></i>`;
        Object.assign(btnEdit.style, {background:"#2196F3", border:"none", color:"#fff", borderRadius:"6px", padding:"6px 10px", cursor:"pointer"});
        btnEdit.onclick = () => abrirEditarTipo(t);

        // Botão deletar
        const btnDelete = document.createElement("button");
        btnDelete.innerHTML = `<i class="fas fa-trash"></i>`;
        Object.assign(btnDelete.style, {background:"#dc3545", border:"none", color:"#fff", borderRadius:"6px", padding:"6px 10px", cursor:"pointer"});
        btnDelete.onclick = () => deletarTipo(t.id);

        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(especie);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

// ---------------- Abrir modal NOVO tipo ----------------
function abrirFormularioNovoTipo() {
    tipoEditando = null;
    document.getElementById("form-tipo-titulo").textContent = "Cadastrar Novo Tipo";
    document.getElementById("tipo-nome").value = "";
    document.getElementById("tipo-descricao").value = "";
    document.getElementById("tipo-especie").value = "";
    document.getElementById("modal-tipo").style.display = "flex";
}

// ---------------- Abrir modal EDITAR tipo ----------------
function abrirEditarTipo(tipo) {
    tipoEditando = tipo;
    document.getElementById("form-tipo-titulo").textContent = "Editar Tipo";
    document.getElementById("tipo-nome").value = tipo.nome;
    document.getElementById("tipo-descricao").value = tipo.descricao || "";
    document.getElementById("tipo-especie").value = tipo.especieId;
    document.getElementById("modal-tipo").style.display = "flex";
}

// ---------------- Fechar modal ----------------
function fecharFormularioTipo() {
    document.getElementById("modal-tipo").style.display = "none";
    tipoEditando = null;
}

// ---------------- Salvar ou Atualizar ----------------
async function salvarOuAtualizarTipo() {
    const nome = document.getElementById("tipo-nome").value.trim();
    const descricao = document.getElementById("tipo-descricao").value.trim();
    const especieId = document.getElementById("tipo-especie").value;

    if (!nome) return alert("Informe o nome do tipo.");
    if (!especieId) return alert("Selecione a espécie.");

    try {
        if (tipoEditando) {
            // Atualizar
            const resp = await fetch(`http://localhost:8080/api/tipos/${tipoEditando.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, descricao, especieId: parseInt(especieId) })
            });
            if (!resp.ok) throw new Error("Erro ao atualizar tipo");

            const atualizado = await resp.json();
            window.tiposCache = window.tiposCache.map(t => t.id === tipoEditando.id ? atualizado : t);
            alert("Tipo atualizado!");
        } else {
            // Criar novo
            const resp = await fetch("http://localhost:8080/api/tipos/criar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([{ nome, descricao, especieId: parseInt(especieId) }])
            });
            if (!resp.ok) throw new Error("Erro ao cadastrar tipo");

            const novosTipos = await resp.json();
            window.tiposCache.push(...novosTipos);
            alert("Tipo cadastrado com sucesso!");
        }

        mostrarTipos(window.tiposCache);
        fecharFormularioTipo();

    } catch (err) {
        console.error(err);
        alert("Erro ao salvar tipo.");
    }
}

// ---------------- Deletar tipo ----------------
async function deletarTipo(id) {
    if (!confirm("Deseja realmente deletar este tipo?")) return;
    try {
        const resp = await fetch(`http://localhost:8080/api/tipos/${id}`, { method: "DELETE" });
        if (!resp.ok) throw new Error("Erro ao deletar tipo");

        window.tiposCache = window.tiposCache.filter(t => t.id !== id);
        mostrarTipos(window.tiposCache);
        alert("Tipo deletado com sucesso!");
    } catch (err) {
        console.error(err);
        alert("Erro ao deletar tipo.");
    }
}
// ========================== FIM TIPO ==================================================================================================================


// ========================== INICIO ESPECIE ==================================================================================================================
window.especiesCache = [];   // cache global de espécies
window.categoriasCache = []; // cache global de categorias
let especieEditando = null;  // se não for null, estamos editando

// ---------------- Buscar Espécies ----------------
async function fetchEspecies() {
    try {
        // Buscar categorias se ainda não foram carregadas
        if (window.categoriasCache.length === 0) {
            const respCat = await fetch("http://localhost:8080/api/categorias");
            if (!respCat.ok) throw new Error("Erro ao buscar categorias");
            window.categoriasCache = await respCat.json();
        }

        // Buscar espécies
        const resp = await fetch("http://localhost:8080/api/especies");
        if (!resp.ok) throw new Error("Erro ao buscar espécies");
        const especies = await resp.json();
        window.especiesCache = especies;

        renderizarEspeciesPage();
        mostrarEspecies(especies);

    } catch (err) {
        console.error(err);
        alert("Erro ao buscar espécies ou categorias.");
    }
}

// ---------------- Renderizar página de espécies ----------------
function renderizarEspeciesPage() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
        <h2>Espécies</h2>
        <div style="margin-bottom:10px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <button id="btn-cadastrar-especie" style="padding:8px 15px; cursor:pointer; background:#2196F3; border:none; color:#fff; border-radius:6px;">+ Nova Espécie</button>
            <input type="text" id="input-buscar-especie" placeholder="Buscar por nome..." style="padding:5px; flex:1; min-width:150px;">
            <select id="select-filtro-categoria" style="padding:5px;">
                <option value="">Todas as categorias</option>
            </select>
        </div>
        <div id="especies-container" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:15px;"></div>

        <div id="form-especie" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#fff; padding:20px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.2); z-index:1000; max-width:400px; width:90%;">
            <h3 id="form-titulo">Cadastrar Nova Espécie</h3>
            <input type="text" id="especie-nome" placeholder="Nome da espécie" style="width:100%; padding:5px; margin-bottom:10px;">
            <textarea id="especie-descricao" placeholder="Descrição" style="width:100%; padding:5px; margin-bottom:10px;"></textarea>
            <select id="especie-categoria" style="width:100%; padding:5px; margin-bottom:10px;">
                <option value="">Selecione a categoria</option>
            </select>
            <div style="text-align:right;">
                <button id="btn-salvar-especie" style="padding:5px 10px; cursor:pointer; background:#28a745; border:none; color:#fff; border-radius:6px;">Salvar</button>
                <button id="btn-cancelar-especie" style="padding:5px 10px; cursor:pointer; background:#dc3545; border:none; color:#fff; border-radius:6px;">Cancelar</button>
            </div>
        </div>
        <div id="overlay-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); z-index:999;"></div>
    `;

    // Preencher select de filtro por categoria
    const selectFiltro = document.getElementById("select-filtro-categoria");
    window.categoriasCache.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.nome;
        selectFiltro.appendChild(option);
    });

    // Preencher select do formulário
    const selectForm = document.getElementById("especie-categoria");
    selectForm.innerHTML = `<option value="">Selecione a categoria</option>`;
    window.categoriasCache.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.nome;
        selectForm.appendChild(option);
    });

    // Eventos
    document.getElementById("btn-cadastrar-especie").onclick = abrirFormularioNovo;
    document.getElementById("btn-cancelar-especie").onclick = fecharFormulario;
    document.getElementById("btn-salvar-especie").onclick = salvarOuAtualizarEspecie;
    document.getElementById("input-buscar-especie").oninput = filtrarEspecies;
    selectFiltro.onchange = filtrarEspecies;
}

// ---------------- Mostrar espécies em cards ----------------
function mostrarEspecies(especies) {
    const container = document.getElementById("especies-container");
    container.innerHTML = "";

    especies.forEach(e => {
        const card = document.createElement("div");
        Object.assign(card.style, {
            background:"#fff",
            borderRadius:"12px",
            padding:"15px",
            boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
            display:"flex",
            flexDirection:"column",
            justifyContent:"space-between"
        });

        const title = document.createElement("h4");
        title.textContent = e.nome;

        const desc = document.createElement("p");
        desc.textContent = e.descricao || "Sem descrição.";
        desc.style.color = "#555";
        desc.style.fontSize = "14px";

        const cat = document.createElement("p");
        cat.textContent = `Categoria: ${e.categoriaNome || "—"}`;
        cat.style.fontSize = "13px";
        cat.style.color = "#777";

        const tipos = document.createElement("p");
        tipos.textContent = e.tipos && e.tipos.length ? `Tipos: ${e.tipos.map(t => t.nome).join(", ")}` : "Tipos: —";
        tipos.style.fontSize = "13px";
        tipos.style.color = "#777";

        const actions = document.createElement("div");
        Object.assign(actions.style, {display:"flex", gap:"8px", marginTop:"10px"});

        const btnEdit = document.createElement("button");
        btnEdit.innerHTML = `<i class="fas fa-edit"></i>`;
        Object.assign(btnEdit.style, {background:"#2196F3", border:"none", color:"#fff", borderRadius:"6px", padding:"6px 10px", cursor:"pointer"});
        btnEdit.onclick = () => abrirEditarEspecie(e);

        const btnDelete = document.createElement("button");
        btnDelete.innerHTML = `<i class="fas fa-trash"></i>`;
        Object.assign(btnDelete.style, {background:"#dc3545", border:"none", color:"#fff", borderRadius:"6px", padding:"6px 10px", cursor:"pointer"});
        btnDelete.onclick = () => deletarEspecie(e.id);

        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(cat);
        card.appendChild(tipos);
        card.appendChild(actions);

        container.appendChild(card);
    });
}

// ---------------- Abrir formulário para NOVA espécie ----------------
function abrirFormularioNovo() {
    especieEditando = null;
    document.getElementById("form-titulo").textContent = "Cadastrar Nova Espécie";
    document.getElementById("especie-nome").value = "";
    document.getElementById("especie-descricao").value = "";
    document.getElementById("especie-categoria").value = "";
    abrirModal();
}

// ---------------- Abrir formulário para EDITAR espécie ----------------
function abrirEditarEspecie(especie) {
    especieEditando = especie;
    document.getElementById("form-titulo").textContent = "Editar Espécie";
    document.getElementById("especie-nome").value = especie.nome;
    document.getElementById("especie-descricao").value = especie.descricao || "";
    document.getElementById("especie-categoria").value = especie.categoriaId || "";
    abrirModal();
}

// ---------------- Abrir / Fechar Modal ----------------
function abrirModal() {
    document.getElementById("form-especie").style.display = "block";
    document.getElementById("overlay-modal").style.display = "block";
}

function fecharFormulario() {
    document.getElementById("form-especie").style.display = "none";
    document.getElementById("overlay-modal").style.display = "none";
    especieEditando = null;
}

// ---------------- Salvar ou Atualizar Espécie ----------------
async function salvarOuAtualizarEspecie() {
    const nome = document.getElementById("especie-nome").value.trim();
    const descricao = document.getElementById("especie-descricao").value.trim();
    const categoriaId = document.getElementById("especie-categoria").value;

    if (!nome) return alert("Informe o nome da espécie.");
    if (!categoriaId) return alert("Selecione a categoria.");

    try {
        if (especieEditando) {
            // Atualizar
            const resp = await fetch(`http://localhost:8080/api/especies/${especieEditando.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, descricao, categoriaId: parseInt(categoriaId) })
            });
            if (!resp.ok) throw new Error("Erro ao atualizar espécie");

            const atualizada = await resp.json();
            window.especiesCache = window.especiesCache.map(e => e.id === especieEditando.id ? atualizada : e);
            alert("Espécie atualizada!");

        } else {
            // Criar nova
            const resp = await fetch("http://localhost:8080/api/especies/registrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([{ nome, descricao, categoriaId: parseInt(categoriaId) }])
            });
            if (!resp.ok) throw new Error("Erro ao cadastrar espécie");

            const novasEspecies = await resp.json();
            window.especiesCache.push(...novasEspecies);
            alert("Espécie cadastrada com sucesso!");
        }

        mostrarEspecies(window.especiesCache);
        fecharFormulario();

    } catch (err) {
        console.error(err);
        alert("Erro ao salvar espécie.");
    }
}

// ---------------- Deletar Espécie ----------------
async function deletarEspecie(id) {
    if (!confirm("Deseja realmente deletar esta espécie?")) return;
    try {
        const resp = await fetch(`http://localhost:8080/api/especies/${id}`, {
            method: "DELETE"
        });
        if (!resp.ok) throw new Error("Erro ao deletar espécie");

        window.especiesCache = window.especiesCache.filter(e => e.id !== id);
        mostrarEspecies(window.especiesCache);
        alert("Espécie deletada com sucesso!");
    } catch (err) {
        console.error(err);
        alert("Erro ao deletar espécie.");
    }
}

// ---------------- Filtrar por nome e categoria ----------------
function filtrarEspecies() {
    const nomeBusca = document.getElementById("input-buscar-especie").value.toLowerCase();
    const categoriaFiltro = document.getElementById("select-filtro-categoria").value;

    const filtradas = window.especiesCache.filter(e => {
        const matchNome = e.nome.toLowerCase().includes(nomeBusca);
        const matchCategoria = categoriaFiltro ? e.categoriaId == categoriaFiltro : true;
        return matchNome && matchCategoria;
    });

    mostrarEspecies(filtradas);
}

// ========================== FIM ESPECIE ==================================================================================================================


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