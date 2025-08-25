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

// ---------------------------- Inicialização ----------------------------
// ---------------------------- Inicialização ----------------------------
async function fetchSeres() {
    try {
        // Buscar seres
        const resSeres = await fetch("http://localhost:8080/api/seres");
        const seres = await resSeres.json();
        window.seresCache = seres;

        // Buscar espécies
        const resEspecies = await fetch("http://localhost:8080/api/especies");
        const especies = await resEspecies.json();
        window.especiesCache = especies;

        const html = `
            <h2>Seres</h2>
            <div style="margin-bottom:10px; display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
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

            <table id="seres-table" border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome Comum</th>
                        <th>Nome Científico</th>
                        <th>Descrição</th>
                        <th>Status Aprovação</th>
                        <th>Status Conservação</th>
                        <th>Categoria</th>
                        <th>Espécie</th>
                        <th>Tipo</th>
                        <th>Registrado Por</th>
                        <th>Detalhes</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>

            <div id="modal-detalhes" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); justify-content:center; align-items:center;">
                <div id="modal-content" style="background:#fff; padding:20px; max-width:600px; width:90%; max-height:90%; overflow:auto; position:relative; border-radius:10px;">
                    <button id="close-modal" style="position:absolute; top:10px; right:10px;">Fechar</button>
                    <div id="modal-body"></div>
                </div>
            </div>
        `;

        document.getElementById("main-content").innerHTML = html;

        // Eventos de filtro reativo
        document.getElementById("search-nome").oninput = filtrarSeres;
        document.getElementById("search-especie").onchange = filtrarSeres;
        document.getElementById("search-status-aprovacao").onchange = filtrarSeres;
        document.getElementById("search-status-conservacao").onchange = filtrarSeres;

        mostrarSeres(seres);
    } catch (err) {
        console.error("Erro ao buscar seres ou espécies:", err);
    }
}

// ---------------------------- Mostrar seres em tabela ----------------------------
async function mostrarSeres(seres) {
    const tbody = document.querySelector("#seres-table tbody");
    tbody.innerHTML = "";

    for (let e of seres) {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${e.id}</td>
            <td>${e.nomeComum}</td>
            <td>${e.nomeCientifico}</td>
            <td>${e.descricao}</td>
            <td>${e.statusAprovacao}</td>
            <td>${e.statusConservacao}</td>
            <td>${e.categoria ? e.categoria.nome : "—"}</td>
            <td>${e.especie ? e.especie.nome : "—"}</td>
            <td>${e.tipo ? e.tipo.nome : "—"}</td>
            <td>${e.registradoPor ? `${e.registradoPor.login} (${e.registradoPor.nomeCompleto})` : "—"}</td>
            <td><button onclick="abrirDetalhes(${e.id})">🔍</button></td>
        `;
        tbody.appendChild(tr);
    }
}

// ---------------------------- Abrir modal detalhes ----------------------------
async function abrirDetalhes(id) {
    const ser = window.seresCache.find(s => s.id === id);
    if (!ser) return;

    let imagemSrc = "";
    try {
        const imgRes = await fetch(`http://localhost:8080/api/seres/${id}/imagem`);
        if (imgRes.ok) {
            const base64 = await imgRes.text();
            if (base64) imagemSrc = `data:image/jpeg;base64,${base64}`;
        }
    } catch { imagemSrc = ""; }

    const modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = `
        ${imagemSrc ? `<img src="${imagemSrc}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin-bottom:10px;">` : ''}
        <p><strong>ID:</strong> ${ser.id}</p>
        <p><strong>Nome Comum:</strong> ${ser.nomeComum}</p>
        <p><strong>Nome Científico:</strong> ${ser.nomeCientifico}</p>
        <p><strong>Descrição:</strong> ${ser.descricao}</p>
        <p><strong>Status Aprovação:</strong> ${ser.statusAprovacao}</p>
        <p><strong>Status Conservação:</strong> ${ser.statusConservacao}</p>
        <p><strong>Categoria:</strong> ${ser.categoria ? ser.categoria.nome : "—"}</p>
        <p><strong>Espécie:</strong> ${ser.especie ? ser.especie.nome : "—"}</p>
        <p><strong>Tipo:</strong> ${ser.tipo ? ser.tipo.nome : "—"}</p>
        <p><strong>Aprovado Por:</strong> ${ser.aprovadoPor ? `${ser.aprovadoPor.login} (${ser.aprovadoPor.nomeCompleto})` : "—"}</p>
        <p><strong>Registrado Por:</strong> ${ser.registradoPor ? `${ser.registradoPor.login} (${ser.registradoPor.nomeCompleto})` : "—"}</p>
        <p><strong>Data Registro:</strong> ${ser.dataRegistro || "—"}</p>
        <p><strong>Data Aprovação:</strong> ${ser.dataAprovacao || "—"}</p>
        <p><strong>Latitude:</strong> ${ser.latitude || "—"}</p>
        <p><strong>Longitude:</strong> ${ser.longitude || "—"}</p>
        <p><strong>Localização:</strong> ${ser.localizacao || "—"}</p>
        <div style="margin-top:10px;">
            <button onclick="aprovarSer(${id})">Aprovar</button>
            <button onclick="deletarSer(${id})">Deletar</button>
            <button onclick="atualizarSerModal(${id})">Atualizar</button>
        </div>
    `;

    const modal = document.getElementById("modal-detalhes");
    modal.style.display = "flex";

    document.getElementById("close-modal").onclick = () => modal.style.display = "none";
}

// ---------------------------- Funções de ação do modal ----------------------------
async function aprovarSer(id) {
    await fetch(`http://localhost:8080/api/seres/${id}/aprovar?usuarioLogin=admin&usuarioEmail=admin@example.com`, { method: "POST" });
    alert("Ser aprovado!");
    fetchSeres();
    document.getElementById("modal-detalhes").style.display = "none";
}

async function deletarSer(id) {
    if (!confirm("Deseja realmente deletar este ser?")) return;
    await fetch(`http://localhost:8080/api/seres/${id}?usuarioLogin=admin&usuarioEmail=admin@example.com`, { method: "DELETE" });
    alert("Ser deletado!");
    fetchSeres();
    document.getElementById("modal-detalhes").style.display = "none";
}

function atualizarSerModal(id) {
    alert("Implementar formulário de atualização para o ser " + id);
}

// ---------------------------- Filtrar reativo ----------------------------
async function filtrarSeres() {
    const nome = document.getElementById("search-nome").value.toLowerCase();
    const especie = document.getElementById("search-especie").value.toLowerCase();
    const statusAprovacao = document.getElementById("search-status-aprovacao").value.toLowerCase();
    const statusConservacao = document.getElementById("search-status-conservacao").value.toLowerCase();

    const filtrados = window.seresCache.filter(s => {
        const nomeMatch = s.nomeComum.toLowerCase().includes(nome) || s.nomeCientifico.toLowerCase().includes(nome);
        const especieMatch = !especie || (s.especie && s.especie.nome.toLowerCase() === especie);
        const aprovacaoMatch = !statusAprovacao || s.statusAprovacao.toLowerCase() === statusAprovacao;
        const conservacaoMatch = !statusConservacao || s.statusConservacao.toLowerCase() === statusConservacao;
        return nomeMatch && especieMatch && aprovacaoMatch && conservacaoMatch;
    });

    mostrarSeres(filtrados);
}

// ---------------------------- Inicializar ----------------------------
fetchSeres();

// ========================== FIM SERES ==================================================================================================================




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
    modalContainer.innerHTML = `
        <div id="overlay-denuncia" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999;"></div>
        <div id="detalhes-denuncia" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fefefe;padding:25px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.3);z-index:1000;width:650px;max-height:90%;overflow-y:auto;">
            <h3>Detalhes Denúncia #${d.id}</h3>
            <div style="display:flex; gap:20px;">
                <div style="flex:0 0 300px;">
                    ${d.imagem ? `<img src="data:image/jpeg;base64,${d.imagem}" style="width:100%;border-radius:8px;object-fit:cover;">` : "Sem imagem"}
                </div>
                <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
                    <p><strong>Título:</strong> ${d.titulo}</p>
                    <p><strong>Descrição:</strong> ${d.descricao}</p>
                    <p><strong>Status Aprovação:</strong> ${d.statusAprovacao}</p>
                    <p><strong>Data Denúncia:</strong> ${d.dataDenuncia ? new Date(d.dataDenuncia).toLocaleString() : "—"}</p>
                    <p><strong>Data Aprovação:</strong> ${d.dataAprovacao ? new Date(d.dataAprovacao).toLocaleString() : "—"}</p>
                    <p><strong>Data Resolução:</strong> ${d.dataResolucao ? new Date(d.dataResolucao).toLocaleString() : "—"}</p>
                    <p><strong>Latitude:</strong> ${d.latitude || "—"}</p>
                    <p><strong>Longitude:</strong> ${d.longitude || "—"}</p>
                    <p><strong>Localização:</strong> ${d.latitude && d.longitude ? window.locationCache[d.id] || "—" : "—"}</p>
                    <p><strong>Espécie:</strong> ${d.especie ? d.especie.nome : "Desconhecido"}</p>
                    <p><strong>Denunciado por:</strong> ${d.denunciadoPor ? `${d.denunciadoPor.login} (${d.denunciadoPor.nomeCompleto})` : "—"}</p>
                    <p><strong>Aprovado por:</strong> ${d.aprovadoPor ? `${d.aprovadoPor.login} (${d.aprovadoPor.nomeCompleto})` : "—"}</p>
                </div>
            </div>
            <div style="text-align:right; margin-top:15px;">
                <button onclick="fecharDetalhes()" style="padding:8px 15px; border:none; border-radius:6px; background:#4CAF50; color:#fff; cursor:pointer;">Fechar</button>
            </div>
        </div>
    `;

    document.getElementById("overlay-denuncia").onclick = fecharDetalhes;
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