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
window.especiesCache = [];
window.locationCache = JSON.parse(localStorage.getItem("locationCache") || "{}");

// ---------------------------- Usuário logado (admin) ----------------------------
function getUsuarioLogado() {
    // Assumindo que o admin foi salvo no login
    return {
        login: localStorage.getItem("usuarioLogin") || "admin",
        email: localStorage.getItem("usuarioEmail") || "admin@example.com"
    };
}

// ---------------------------- Inicialização ----------------------------
async function fetchSeres() {
    try {
        const resSeres = await fetch("http://localhost:8080/api/seres");
        const seres = await resSeres.json();
        window.seresCache = seres;

        const resEspecies = await fetch("http://localhost:8080/api/especies");
        const especies = await resEspecies.json();
        window.especiesCache = especies;

        renderCardsSeres(seres, especies);
    } catch (err) {
        console.error("Erro ao buscar seres ou espécies:", err);
        alert("Erro ao buscar seres ou espécies");
    }
}

// ---------------------------- Renderizar cards ----------------------------
function renderCardsSeres(seres, especies) {
    const content = document.getElementById("main-content");

    content.innerHTML = `
        <h2 style="margin-bottom:15px;">Seres</h2>
        <div style="margin-bottom:15px; display:flex; flex-wrap:wrap; align-items:center; gap:10px;">
            <input type="text" id="search-nome" placeholder="Nome comum ou científico" style="padding:5px; width:200px;">
            <select id="search-especie" style="padding:5px; width:150px;">
                <option value="">Espécie</option>
                ${especies.map(es => `<option value="${es.nome}">${es.nome}</option>`).join('')}
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
    `;

    document.getElementById("search-nome").oninput = filtrarSeres;
    document.getElementById("search-especie").onchange = filtrarSeres;
    document.getElementById("search-status-aprovacao").onchange = filtrarSeres;
    document.getElementById("search-status-conservacao").onchange = filtrarSeres;

    mostrarSeres(seres);
}

// ---------------------------- Mostrar seres em cards ----------------------------
async function mostrarSeres(seres) {
    const container = document.getElementById("cards-seres");
    container.innerHTML = "";

    const cardsPromises = seres.map(async (e) => {
        // IMAGEM
        let imagemSrc = "assets/images/default.png";
        try {
            const imgRes = await fetch(`http://localhost:8080/api/seres/${e.id}/imagem`);
            if (imgRes.ok) {
                const base64 = await imgRes.text();
                if (base64) imagemSrc = `data:image/jpeg;base64,${base64}`;
            }
        } catch {}

        // LOCALIZAÇÃO
        let locationName = "Localização não encontrada";
        if (window.locationCache[e.id]) {
            locationName = window.locationCache[e.id];
        } else if (e.latitude != null && e.longitude != null) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latitude}&lon=${e.longitude}&format=json`);
                if (response.ok) {
                    const locationData = await response.json();
                    if (locationData && locationData.display_name) locationName = locationData.display_name;
                }
                window.locationCache[e.id] = locationName;
                localStorage.setItem("locationCache", JSON.stringify(window.locationCache));
            } catch (err) {
                console.warn("Erro ao buscar localização para ser:", e.id, err);
            }
        }

        // CARD
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

        const body = document.createElement("div");
        Object.assign(body.style, { padding: "12px", display: "flex", flexDirection: "column", gap: "6px" });

        const titulo = document.createElement("h4");
        titulo.style.margin = "0";
        titulo.textContent = e.nomeComum || "—";

        const subtitulo = document.createElement("p");
        Object.assign(subtitulo.style, { margin: 0, fontSize: "14px", color: "#555" });
        subtitulo.textContent = e.nomeCientifico ? `(${e.nomeCientifico})` : "";

        const info = document.createElement("p");
        Object.assign(info.style, { fontSize: "13px", color: "#444" });
        info.innerHTML = `
            <strong>Espécie:</strong> ${e.especie?.nome || "—"} <br>
            <strong>Tipo:</strong> ${e.tipo?.nome || "—"} <br>
            <strong>Localização:</strong> ${locationName} <br>
          <strong>Denunciado por:</strong> ${e.registradoPor?.login || "—"} <br>
            <strong>Status Aprovação:</strong> ${e.statusAprovacao || "—"}
        `;

        body.appendChild(titulo);
        body.appendChild(subtitulo);
        body.appendChild(info);

        // BOTÕES
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
        actions.appendChild(criarBotao("fas fa-edit", "#2196F3", () => abrirModalAtualizar(e)));
        actions.appendChild(criarBotao("fas fa-eye", "#6c757d", () => abrirModalCompleto(e)));

        body.appendChild(actions);
        card.appendChild(body);
        container.appendChild(card);
    });

    await Promise.all(cardsPromises);
}

// ---------------------------- Filtro ----------------------------
function filtrarSeres() {
    const nome = document.getElementById("search-nome").value.toLowerCase();
    const especie = document.getElementById("search-especie").value;
    const statusAprovacao = document.getElementById("search-status-aprovacao").value;
    const statusConservacao = document.getElementById("search-status-conservacao").value;

    const filtrados = window.seresCache.filter(s => 
        (!nome || s.nomeComum.toLowerCase().includes(nome) || s.nomeCientifico.toLowerCase().includes(nome)) &&
        (!especie || s.especie?.nome === especie) &&
        (!statusAprovacao || s.statusAprovacao === statusAprovacao) &&
        (!statusConservacao || s.statusConservacao === statusConservacao)
    );

    mostrarSeres(filtrados);
}

// ---------------------------- Funções REST ----------------------------
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
            const container = document.getElementById("modal-container");
            container.innerHTML = "";

            const overlay = document.createElement("div");
            Object.assign(overlay.style, { position: "fixed", top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",zIndex:1099 });
            overlay.onclick = () => container.innerHTML = "";

            const modal = document.createElement("div");
            Object.assign(modal.style, { position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:"#fff", padding:"20px", borderRadius:"12px", boxShadow:"0 10px 30px rgba(0,0,0,0.3)", width:"600px", maxHeight:"90%", overflowY:"auto", zIndex:1100 });

            for(const key in data){
                const p = document.createElement("p");
                p.innerHTML = `<strong>${key}:</strong> ${data[key]??"—"}`;
                modal.appendChild(p);
            }

            const fechar = document.createElement("button");
            fechar.textContent = "Fechar";
            Object.assign(fechar.style,{padding:"8px 12px",border:"none",borderRadius:"6px",background:"#888",color:"#fff",cursor:"pointer",marginTop:"10px"});
            fechar.onclick = ()=>container.innerHTML="";
            modal.appendChild(fechar);

            container.appendChild(overlay);
            container.appendChild(modal);
        }).catch(console.error);
}

// Modal atualizar
function abrirModalAtualizar(ser){
    const container = document.getElementById("modal-container");
    container.innerHTML = "";

    const overlay = document.createElement("div");
    Object.assign(overlay.style,{position:"fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.5)", zIndex:1099});
    overlay.onclick = ()=>container.innerHTML="";

    const modal = document.createElement("div");
    Object.assign(modal.style,{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",padding:"20px",borderRadius:"12px",boxShadow:"0 10px 30px rgba(0,0,0,0.3)",width:"500px", maxHeight:"90%", overflowY:"auto", zIndex:1100, display:"flex", flexDirection:"column", gap:"10px"});

    const campos = ["nomeComum","nomeCientifico","descricao","statusAprovacao","statusConservacao"];
    const inputs = {};

    campos.forEach(c=>{
        const label = document.createElement("label"); label.textContent=c; label.style.fontWeight="bold";
        const input = document.createElement("input"); input.value=ser[c]??""; input.style.width="100%"; input.style.padding="5px"; input.style.marginBottom="8px";
        modal.appendChild(label); modal.appendChild(input);
        inputs[c]=input;
    });

    const btnSalvar = document.createElement("button");
    btnSalvar.textContent="Salvar";
    Object.assign(btnSalvar.style,{padding:"8px 12px", border:"none", borderRadius:"6px", background:"#28a745", color:"#fff", cursor:"pointer", marginTop:"10px"});
    btnSalvar.onclick = ()=>{
        const u = getUsuarioLogado();
        const formData = new FormData();
        formData.append("nomeComum", inputs.nomeComum.value);
        formData.append("nomeCientifico", inputs.nomeCientifico.value);
        formData.append("descricao", inputs.descricao.value);
        formData.append("statusAprovacao", inputs.statusAprovacao.value);
        formData.append("statusConservacao", inputs.statusConservacao.value);
        formData.append("tipoNome", ser.tipo?.nome||"");
        formData.append("especieNome", ser.especie?.nome||"");
        formData.append("latitude", ser.latitude??0);
        formData.append("longitude", ser.longitude??0);

        fetch(`http://localhost:8080/api/seres/${ser.id}/atualizar-multipart?usuarioLogin=${u.login}&usuarioEmail=${u.email}`, { method:"PUT", body: formData })
            .then(r=>r.ok? filtrarSeres() : Promise.reject("Erro ao atualizar"))
            .catch(console.error);
        container.innerHTML="";
    };
    modal.appendChild(btnSalvar);
    container.appendChild(overlay);
    container.appendChild(modal);
}

// ---------------------------- Inicializa ----------------------------
fetchSeres();

// ========================== INICIO DENUNCIA==================================================================================================================

// ---------------------------- Cache global ----------------------------
window.denunciasCache = [];
window.especiesCache = [];
window.locationCache = {}; // Cache para nomes de localização por ID

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

// ---------------------------- Ações em lote ----------------------------
async function aprovarSelecionadas() {
    const ids = Array.from(document.querySelectorAll(".select-denuncia:checked")).map(cb => cb.value);
    if(ids.length === 0) return alert("Selecione ao menos uma denúncia.");
    for (let id of ids) await aprovarDenuncia(id);
    alert("Denúncias aprovadas!");
    fetchDenuncias();
}

async function deletarSelecionadas() {
    const ids = Array.from(document.querySelectorAll(".select-denuncia:checked")).map(cb => cb.value);
    if(ids.length === 0) return alert("Selecione ao menos uma denúncia.");
    if (!confirm("Deseja realmente deletar as denúncias selecionadas?")) return;
    for (let id of ids) await deletarDenuncia(id);
    alert("Denúncias deletadas!");
    fetchDenuncias();
}

async function atualizarSelecionadas() {
    const ids = Array.from(document.querySelectorAll(".select-denuncia:checked")).map(cb => cb.value);
    if(ids.length === 0) return alert("Selecione ao menos uma denúncia.");
    alert(`Funcionalidade de atualização ainda não implementada. IDs selecionados: ${ids.join(", ")}`);
}

// ---------------------------- Buscar denúncias ----------------------------
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

function renderizarDenunciasPage() {
    const html = `
        <h2>Denúncias</h2>
        <div style="margin-bottom:10px; display:flex; align-items:center; gap:10px;">
            <input type="text" id="search-input" placeholder="Buscar por título ou descrição" style="padding:5px; width:300px;">
            <button onclick="filtrarDenuncias()" style="padding:5px 10px;">Buscar</button>
            <button onclick="aprovarSelecionadas()" style="padding:5px 10px;">Aprovar Selecionadas</button>
            <button onclick="deletarSelecionadas()" style="padding:5px 10px;">Deletar Selecionadas</button>
            <button onclick="atualizarSelecionadas()" style="padding:5px 10px;">Atualizar Selecionadas</button>
        </div>
        <div id="denuncias-container" style="overflow-x:auto;"></div>
        <div id="modal-container"></div>
    `;
    document.getElementById("main-content").innerHTML = html;
}

// ---------------------------- Filtrar denúncias ----------------------------
function filtrarDenuncias() {
    const termo = document.getElementById("search-input").value.toLowerCase();
    const filtradas = window.denunciasCache.filter(d =>
        d.titulo.toLowerCase().includes(termo) ||
        d.descricao.toLowerCase().includes(termo)
    );
    mostrarDenuncias(filtradas);
}

// ---------------------------- Mostrar denúncias ----------------------------
async function mostrarDenuncias(denuncias) {
    const container = document.getElementById("denuncias-container");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "14px";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr style="background:#f2f2f2;">
            <th><input type="checkbox" id="select-all" onchange="toggleSelectAll(this)"></th>
            <th>ID</th>
            <th>Título</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Data Denúncia</th>
            <th>Localização</th>
            <th>Espécie</th>
            <th>Denunciado Por</th>
            <th>Imagem</th>
            <th>Detalhes</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (let d of denuncias) {
        let locationName = "—";

        // Cache de localização
        if (window.locationCache[d.id]) {
            locationName = window.locationCache[d.id];
        } else if (d.latitude && d.longitude) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${d.latitude}&lon=${d.longitude}&format=json`);
                const data = await response.json();
                locationName = data.display_name || "—";
                window.locationCache[d.id] = locationName;
            } catch (err) {
                console.error("Erro ao obter localização:", err);
            }
        }

        const denunciadoPor = d.denunciadoPor ? `${d.denunciadoPor.login} (${d.denunciadoPor.nomeCompleto})` : "—";

        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #ccc";

        tr.innerHTML = `
            <td><input type="checkbox" class="select-denuncia" value="${d.id}"></td>
            <td>${d.id}</td>
            <td>${d.titulo}</td>
            <td>${d.descricao}</td>
            <td>${d.statusAprovacao}</td>
            <td>${d.dataDenuncia ? new Date(d.dataDenuncia).toLocaleString() : "—"}</td>
            <td>${locationName}</td>
            <td>${d.especie ? d.especie.nome : "Desconhecido"}</td>
            <td>${denunciadoPor}</td>
            <td>${d.imagem ? `<img src="data:image/jpeg;base64,${d.imagem}" style="width:60px; height:50px; object-fit:cover; border-radius:4px;">` : "Sem imagem"}</td>
            <td style="text-align:center;">
                <button onclick="abrirDetalhes(${d.id})" style="background:none; border:none; cursor:pointer; font-size:18px;" title="Ver detalhes">👁️</button>
            </td>
        `;
        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    container.appendChild(table);
}

// ---------------------------- Modal de detalhes ----------------------------
function abrirDetalhes(denunciaId) {
    const d = window.denunciasCache.find(item => item.id === denunciaId);
    if (!d) return;

    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = ""; // limpa qualquer modal anterior

    // === Overlay ===
    const overlay = document.createElement("div");
    overlay.id = "overlay-denuncia";
    Object.assign(overlay.style, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        zIndex: 999
    });
    overlay.onclick = fecharDetalhes;

    // === Modal principal ===
    const modal = document.createElement("div");
    modal.id = "detalhes-denuncia";
    Object.assign(modal.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fefefe",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        zIndex: 1000,
        width: "650px",
        maxHeight: "90%",
        overflowY: "auto"
    });

    // === Cabeçalho ===
    const h3 = document.createElement("h3");
    h3.textContent = `Detalhes Denúncia #${d.id}`;
    modal.appendChild(h3);

    // === Conteúdo ===
    const contentWrapper = document.createElement("div");
    Object.assign(contentWrapper.style, { display: "flex", gap: "20px" });

    // Imagem
    const imgDiv = document.createElement("div");
    imgDiv.style.flex = "0 0 300px";
    imgDiv.innerHTML = d.imagem 
        ? `<img src="data:image/jpeg;base64,${d.imagem}" style="width:100%;border-radius:8px;object-fit:cover;">`
        : "Sem imagem";

    // Detalhes texto
    const detailsDiv = document.createElement("div");
    Object.assign(detailsDiv.style, { flex: "1", display: "flex", flexDirection: "column", gap: "8px" });

    const info = [
        ["Título", d.titulo],
        ["Descrição", d.descricao],
        ["Status Aprovação", d.statusAprovacao],
        ["Data Denúncia", d.dataDenuncia ? new Date(d.dataDenuncia).toLocaleString() : "—"],
        ["Data Aprovação", d.dataAprovacao ? new Date(d.dataAprovacao).toLocaleString() : "—"],
        ["Data Resolução", d.dataResolucao ? new Date(d.dataResolucao).toLocaleString() : "—"],
        ["Latitude", d.latitude || "—"],
        ["Longitude", d.longitude || "—"],
        ["Localização", d.latitude && d.longitude ? window.locationCache[d.id] || "—" : "—"],
        ["Espécie", d.especie ? d.especie.nome : "Desconhecido"],
        ["Denunciado por", d.denunciadoPor ? `${d.denunciadoPor.login} (${d.denunciadoPor.nomeCompleto})` : "—"],
        ["Aprovado por", d.aprovadoPor ? `${d.aprovadoPor.login} (${d.aprovadoPor.nomeCompleto})` : "—"]
    ];

    info.forEach(([label, value]) => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${label}:</strong> ${value}`;
        detailsDiv.appendChild(p);
    });

    contentWrapper.appendChild(imgDiv);
    contentWrapper.appendChild(detailsDiv);
    modal.appendChild(contentWrapper);

    // Botão fechar
    const btnDiv = document.createElement("div");
    btnDiv.style.textAlign = "right";
    btnDiv.style.marginTop = "15px";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Fechar";
    Object.assign(closeBtn.style, {
        padding: "8px 15px",
        border: "none",
        borderRadius: "6px",
        background: "#4CAF50",
        color: "#fff",
        cursor: "pointer"
    });
    closeBtn.onclick = fecharDetalhes;

    btnDiv.appendChild(closeBtn);
    modal.appendChild(btnDiv);

    // Adicionar overlay e modal ao container
    modalContainer.appendChild(overlay);
    modalContainer.appendChild(modal);
}

function fecharDetalhes() {
    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = "";
}


function fecharDetalhes() {
    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = "";
}

// ---------------------------- Selecionar todos ----------------------------
function toggleSelectAll(master) {
    document.querySelectorAll(".select-denuncia").forEach(cb => cb.checked = master.checked);
}

// ---------------------------- Aprovar / Deletar individual ----------------------------
async function aprovarDenuncia(id) {
    try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`http://localhost:8080/api/denuncias/${id}/aprovar`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });
        if (!resp.ok) throw new Error(`Erro ao aprovar denúncia: ${resp.status}`);
    } catch (err) {
        console.error(err);
        alert(`Erro ao aprovar denúncia ${id}`);
    }
}

async function deletarDenuncia(id) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/denuncias/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Erro ao deletar denúncia: ${text}`);
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

// ---------------------------- Inicialização ----------------------------
async function init() {
    await fetchEspecies();
    fetchDenuncias();
}

init();

// ========================== FIM DENUNCIA ==================================================================================================================


// ========================== INICIO DE CATEGORIA ==================================================================================================================

window.categoriasCache = []; // Cache global

async function fetchCategorias() {
    try {
        // Busca categorias do backend
        const resp = await fetch("http://localhost:8080/api/categorias");
        if (!resp.ok) throw new Error("Erro ao buscar categorias");
        const categorias = await resp.json();
        window.categoriasCache = categorias;

        // Renderiza a página de categorias
        const main = document.getElementById("main-content");
        main.innerHTML = `
            <h2>Categorias</h2>
            <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <button id="btn-cadastrar-categoria" style="padding:5px 10px; cursor:pointer;">Cadastrar Categoria</button>
            </div>
            <div id="categorias-container" style="overflow-x:auto;"></div>
            <div id="form-categoria" style="display:none; margin-top:15px; padding:15px; border:1px solid #ccc; border-radius:8px; max-width:400px;">
                <h3>Cadastrar Nova Categoria</h3>
                <input type="text" id="categoria-nome" placeholder="Nome da categoria" style="width:100%; padding:5px; margin-bottom:10px;">
                <textarea id="categoria-descricao" placeholder="Descrição da categoria" style="width:100%; padding:5px; margin-bottom:10px;"></textarea>
                <div style="text-align:right;">
                    <button id="btn-salvar-categoria" style="padding:5px 10px; cursor:pointer;">Salvar</button>
                    <button id="btn-cancelar-categoria" style="padding:5px 10px; cursor:pointer;">Cancelar</button>
                </div>
            </div>
        `;

        // Mostra a tabela com categorias
        mostrarCategorias(categorias);

        // Eventos do formulário
        document.getElementById("btn-cadastrar-categoria").onclick = () => {
            document.getElementById("form-categoria").style.display = "block";
        };
        document.getElementById("btn-cancelar-categoria").onclick = () => {
            document.getElementById("form-categoria").style.display = "none";
        };
        document.getElementById("btn-salvar-categoria").onclick = salvarCategoria;

    } catch (err) {
        console.error(err);
        alert("Erro ao buscar categorias.");
    }
}

// ---------------- Mostrar categorias em tabela ----------------
function mostrarCategorias(categorias) {
    const container = document.getElementById("categorias-container");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr style="background:#f2f2f2;">
            <th>ID</th>
            <th>Nome</th>
            <th>Descrição</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    categorias.forEach(c => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #ccc";
        tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.nome}</td>
            <td>${c.descricao || "—"}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// ---------------- Salvar nova categoria ----------------
async function salvarCategoria() {
    const nome = document.getElementById("categoria-nome").value.trim();
    const descricao = document.getElementById("categoria-descricao").value.trim();
    if (!nome) return alert("Informe o nome da categoria.");

    try {
        const resp = await fetch("http://localhost:8080/api/categorias/criar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, descricao })
        });

        if (!resp.ok) throw new Error("Erro ao cadastrar categoria");

        const novaCategoria = await resp.json();
        window.categoriasCache.push(novaCategoria);
        mostrarCategorias(window.categoriasCache);

        // Limpa e fecha o formulário
        document.getElementById("categoria-nome").value = "";
        document.getElementById("categoria-descricao").value = "";
        document.getElementById("form-categoria").style.display = "none";

        alert("Categoria cadastrada com sucesso!");
    } catch (err) {
        console.error(err);
        alert("Erro ao cadastrar categoria.");
    }
}


// ========================== FIM CATEGORIA ==================================================================================================================



// ========================== INICIO TIPO ==================================================================================================================
window.tiposCache = []; // cache global de tipos
window.especiesCache = []; // cache global de espécies

// ---------------- Buscar Tipos ----------------
async function fetchTipos() {
    try {
        const resp = await fetch("http://localhost:8080/api/tipos");
        if (!resp.ok) throw new Error("Erro ao buscar tipos");
        const tipos = await resp.json(); // já vem como TipoResponseDTO
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
            <button id="btn-cadastrar-tipo" style="padding:5px 10px; cursor:pointer;">Cadastrar Tipo</button>
        </div>
        <div id="tipos-container" style="overflow-x:auto;"></div>

        <div id="form-tipo" style="display:none; margin-top:15px; padding:15px; border:1px solid #ccc; border-radius:8px; max-width:450px;">
            <h3>Cadastrar Novo Tipo</h3>
            <input type="text" id="tipo-nome" placeholder="Nome do tipo" style="width:100%; padding:5px; margin-bottom:10px;">
            <textarea id="tipo-descricao" placeholder="Descrição do tipo" style="width:100%; padding:5px; margin-bottom:10px;"></textarea>
            <select id="tipo-especie" style="width:100%; padding:5px; margin-bottom:10px;">
                <option value="">Selecione a espécie</option>
            </select>
            <div style="text-align:right;">
                <button id="btn-salvar-tipo" style="padding:5px 10px; cursor:pointer;">Salvar</button>
                <button id="btn-cancelar-tipo" style="padding:5px 10px; cursor:pointer;">Cancelar</button>
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
    document.getElementById("btn-cadastrar-tipo").onclick = () => {
        document.getElementById("form-tipo").style.display = "block";
    };
    document.getElementById("btn-cancelar-tipo").onclick = () => {
        document.getElementById("form-tipo").style.display = "none";
    };
    document.getElementById("btn-salvar-tipo").onclick = salvarTipo;
}

// ---------------- Mostrar Tipos ----------------
function mostrarTipos(tipos) {
    const container = document.getElementById("tipos-container");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr style="background:#f2f2f2;">
            <th>ID</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Espécie</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    tipos.forEach(t => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #ccc";
        tr.innerHTML = `
            <td>${t.id}</td>
            <td>${t.nome}</td>
            <td>${t.descricao || "—"}</td>
            <td>${t.especieNome || "—"}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// ---------------- Salvar novo Tipo ----------------
async function salvarTipo() {
    const nome = document.getElementById("tipo-nome").value.trim();
    const descricao = document.getElementById("tipo-descricao").value.trim();
    const especieId = document.getElementById("tipo-especie").value;

    if (!nome) return alert("Informe o nome do tipo.");
    if (!especieId) return alert("Selecione a espécie.");

    try {
        // Monta o DTO
        const tipoDTO = {
            nome,
            descricao,
            especieId: parseInt(especieId)
        };

        const resp = await fetch("http://localhost:8080/api/tipos/criar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([tipoDTO]) // enviando como lista para o controller
        });

        if (!resp.ok) throw new Error("Erro ao cadastrar tipo");

        const novosTipos = await resp.json(); // já retorna TipoResponseDTO
        window.tiposCache.push(...novosTipos);
        mostrarTipos(window.tiposCache);

        // Limpa e fecha o formulário
        document.getElementById("tipo-nome").value = "";
        document.getElementById("tipo-descricao").value = "";
        document.getElementById("tipo-especie").value = "";
        document.getElementById("form-tipo").style.display = "none";

        alert("Tipo cadastrado com sucesso!");
    } catch (err) {
        console.error(err);
        alert("Erro ao cadastrar tipo.");
    }
}

// ========================== FIM TIPO ==================================================================================================================


// ========================== INICIO ESPECIE ==================================================================================================================
window.especiesCache = []; // cache global de espécies

// ---------------- Buscar Espécies ----------------
async function fetchEspecies() {
    try {
        const resp = await fetch("http://localhost:8080/api/especies");
        if (!resp.ok) throw new Error("Erro ao buscar espécies");
        const especies = await resp.json(); // já retorna EspecieResponseDTO
        window.especiesCache = especies;

        renderizarEspeciesPage();
        mostrarEspecies(especies);
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar espécies.");
    }
}

// ---------------- Renderizar página de espécies ----------------
function renderizarEspeciesPage() {
    const main = document.getElementById("main-content");
    main.innerHTML = `
        <h2>Espécies</h2>
        <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <button id="btn-cadastrar-especie" style="padding:5px 10px; cursor:pointer;">Cadastrar Espécie</button>
        </div>
        <div id="especies-container" style="overflow-x:auto;"></div>

        <div id="form-especie" style="display:none; margin-top:15px; padding:15px; border:1px solid #ccc; border-radius:8px; max-width:450px;">
            <h3>Cadastrar Nova Espécie</h3>
            <input type="text" id="especie-nome" placeholder="Nome da espécie" style="width:100%; padding:5px; margin-bottom:10px;">
            <textarea id="especie-descricao" placeholder="Descrição" style="width:100%; padding:5px; margin-bottom:10px;"></textarea>
            <select id="especie-categoria" style="width:100%; padding:5px; margin-bottom:10px;">
                <option value="">Selecione a categoria</option>
            </select>
            <div style="text-align:right;">
                <button id="btn-salvar-especie" style="padding:5px 10px; cursor:pointer;">Salvar</button>
                <button id="btn-cancelar-especie" style="padding:5px 10px; cursor:pointer;">Cancelar</button>
            </div>
        </div>
    `;

    // Preencher select com categorias
    const selectCategoria = document.getElementById("especie-categoria");
    window.categoriasCache.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.nome;
        selectCategoria.appendChild(option);
    });

    // Eventos
    document.getElementById("btn-cadastrar-especie").onclick = () => {
        document.getElementById("form-especie").style.display = "block";
    };
    document.getElementById("btn-cancelar-especie").onclick = () => {
        document.getElementById("form-especie").style.display = "none";
    };
    document.getElementById("btn-salvar-especie").onclick = salvarEspecie;
}

// ---------------- Mostrar Espécies ----------------
function mostrarEspecies(especies) {
    const container = document.getElementById("especies-container");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr style="background:#f2f2f2;">
            <th>ID</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Tipos</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    especies.forEach(e => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid #ccc";

        // Mostrar nomes dos tipos separados por vírgula
        const tiposNomes = e.tipos && e.tipos.length > 0 ? e.tipos.map(t => t.nome).join(", ") : "—";

        tr.innerHTML = `
            <td>${e.id}</td>
            <td>${e.nome}</td>
            <td>${e.descricao || "—"}</td>
            <td>${e.categoriaNome || "—"}</td>
            <td>${tiposNomes}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// ---------------- Salvar nova Espécie ----------------
async function salvarEspecie() {
    const nome = document.getElementById("especie-nome").value.trim();
    const descricao = document.getElementById("especie-descricao").value.trim();
    const categoriaId = document.getElementById("especie-categoria").value;

    if (!nome) return alert("Informe o nome da espécie.");
    if (!categoriaId) return alert("Selecione a categoria.");

    try {
        const resp = await fetch("http://localhost:8080/api/especies/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{
                nome,
                descricao,
                categoriaId: parseInt(categoriaId)
            }])
        });

        if (!resp.ok) throw new Error("Erro ao cadastrar espécie");

        const novasEspecies = await resp.json();
        window.especiesCache.push(...novasEspecies);
        mostrarEspecies(window.especiesCache);

        // Limpa e fecha o formulário
        document.getElementById("especie-nome").value = "";
        document.getElementById("especie-descricao").value = "";
        document.getElementById("especie-categoria").value = "";
        document.getElementById("form-especie").style.display = "none";

        alert("Espécie cadastrada com sucesso!");
    } catch (err) {
        console.error(err);
        alert("Erro ao cadastrar espécie.");
    }
}


// ========================== FIM ESPECIE  ==================================================================================================================

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