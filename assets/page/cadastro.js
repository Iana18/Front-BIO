// ==========================
// Variáveis Globais
// ==========================
let map;
let marker;
let especiesArray = [];

const btnMostrarForm = document.getElementById("btnMostrarForm");
const serForm = document.getElementById("serForm");
const inputImagem = document.getElementById("imagem");
const btnTirarFoto = document.getElementById("btnTirarFoto");
const btnEscolherGaleria = document.getElementById("btnEscolherGaleria");
const inputGaleria = document.getElementById("imagem");
const preview = document.getElementById("previewImagem");

// ==========================
// Inicialização
// ==========================
document.addEventListener("DOMContentLoaded", function () {
    carregarEspecies();
    carregarTipos();
    inicializarMapa();

    serForm.addEventListener("submit", cadastrar);
    serForm.style.display = "none";

    listarSeres();
    inicializarMenuHamburger();
});

// ==========================
// Requisições XHR
// ==========================
function carregarEspecies() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8080/api/especies", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            especiesArray = data;
            const select = document.getElementById("especie");
            select.innerHTML = '<option value="">Selecione uma Espécie</option>';
            data.forEach(esp => {
                const option = document.createElement("option");
                option.value = esp.id;
                option.textContent = esp.nome;
                select.appendChild(option);
            });
        }
    };
    xhr.send();
}

function carregarTipos() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8080/api/tipos", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const select = document.getElementById("tipo");
            select.innerHTML = '<option value="">Selecione um Tipo</option>';
            data.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo.id;
                option.textContent = tipo.nome;
                select.appendChild(option);
            });
        }
    };
    xhr.send();
}

// ==========================
// Inicializa Mapa
// ==========================
function inicializarMapa() {
    map = L.map('map').setView([11.8037, -15.1804], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        if (marker) marker.setLatLng(e.latlng);
        else marker = L.marker(e.latlng).addTo(map);

        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
    });
}

// ==========================
// Mostrar formulário
// ==========================
btnMostrarForm.addEventListener("click", () => {
    serForm.style.display = "block";
    btnMostrarForm.style.display = "none";
    serForm.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => map.invalidateSize(), 100);
});

// ==========================
// Upload de Imagem e Preview
// ==========================
btnTirarFoto.addEventListener("click", () => {
    inputImagem.value = ""; 
    inputImagem.click();
});

btnEscolherGaleria.addEventListener("click", () => {
    inputGaleria.value = ""; 
    inputGaleria.click();
});

inputImagem.addEventListener("change", () => mostrarPreview(inputImagem.files[0]));
inputGaleria.addEventListener("change", () => mostrarPreview(inputGaleria.files[0]));

function mostrarPreview(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

// ==========================
// Função de Cadastro
// ==========================
function cadastrar(event) {
    event.preventDefault();

    const nomeComum = document.getElementById("nomeComum").value.trim();
    const nomeCientifico = document.getElementById("nomeCientifico").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const imagemFile = inputImagem.files[0];

    const login = localStorage.getItem("login");
    const email = localStorage.getItem("email");

    if (!login || !email) {
        alert("Usuário não está logado!");
        return;
    }

    const especieId = document.getElementById("especie").value;
    const tipoId = document.getElementById("tipo").value;
    const statusConservacao = document.getElementById("statusConservacao").value;

    if (!nomeComum || !nomeCientifico || !especieId || !tipoId || !statusConservacao || !latitude || !longitude) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const formData = new FormData();
    formData.append("usuarioLogin", login);
    formData.append("usuarioEmail", email);
    formData.append("nomeComum", nomeComum);
    formData.append("nomeCientifico", nomeCientifico);
    formData.append("descricao", descricao);
    formData.append("especieId", especieId);
    formData.append("especieNome", document.getElementById("especie").selectedOptions[0].text);
    formData.append("tipoId", tipoId);
    formData.append("tipoNome", document.getElementById("tipo").selectedOptions[0].text);
    formData.append("statusConservacao", statusConservacao);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    if (imagemFile) formData.append("imagemFile", imagemFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/api/seres/registrar-multipart", true);

    xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201) {
            alert("Ser cadastrado com sucesso!");
            serForm.reset();
            preview.style.display = "none";
            serForm.style.display = "none";
            btnMostrarForm.style.display = "block";
        } else {
            console.error("Erro ao cadastrar ser:", xhr.responseText);
            alert("Erro ao cadastrar ser: " + xhr.responseText);
        }
    };

    xhr.onerror = function () {
        alert("Erro de rede ou servidor inacessível.");
    };

    xhr.send(formData);
}

// ==========================
// Listagem de Seres
// ==========================
window.locationCache = JSON.parse(localStorage.getItem("locationCache") || "{}");

async function listarSeres() {
    const listaContainer = document.getElementById("listaEspecies");
    listaContainer.innerHTML = "";

    try {
        const res = await fetch("http://localhost:8080/api/seres");
        const data = await res.json();

        const seresAprovados = data.filter(ser => ser.statusAprovacao === "APROVADO");

        if (seresAprovados.length === 0) {
            listaContainer.innerHTML = "<p>Nenhum ser aprovado cadastrado ainda.</p>";
            return;
        }

        const statusLabels = {
            "EXTINTO": "Extinto",
            "CRITICAMENTE_EM_PERIGO": "Criticamente em perigo",
            "EM_PERIGO": "Em perigo",
            "VULNERAVEL": "Vulnerável",
            "QUASE_AMEACADO": "Quase ameaçado",
            "POUCO_PREOCUPANTE": "Pouco preocupante",
            "DADOS_INSUFICIENTES": "Dados insuficientes"
        };

        const statusIconMap = {
            "EXTINTO": '<i class="bi bi-x-circle-fill text-dark"></i>',
            "CRITICAMENTE_EM_PERIGO": '<i class="bi bi-exclamation-octagon-fill text-danger"></i>',
            "EM_PERIGO": '<i class="bi bi-exclamation-triangle-fill text-danger"></i>',
            "VULNERAVEL": '<i class="bi bi-exclamation-circle-fill text-warning"></i>',
            "QUASE_AMEACADO": '<i class="bi bi-shield-fill-exclamation text-warning"></i>',
            "POUCO_PREOCUPANTE": '<i class="bi bi-check-circle-fill text-success"></i>',
            "DADOS_INSUFICIENTES": '<i class="bi bi-question-circle-fill text-secondary"></i>'
        };

        const fragment = document.createDocumentFragment();

        const cardsPromises = seresAprovados.map(async (ser) => {
            let imagemSrc = "assets/images/default.png";
            try {
                const imgRes = await fetch(`http://localhost:8080/api/seres/${ser.id}/imagem`);
                if (imgRes.ok) {
                    const base64 = await imgRes.text();
                    if (base64) imagemSrc = `data:image/jpeg;base64,${base64}`;
                }
            } catch {}

            let locationName = "Localização não encontrada";
            if (window.locationCache[ser.id]) {
                locationName = window.locationCache[ser.id];
            } else if (ser.latitude && ser.longitude) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${ser.latitude}&lon=${ser.longitude}&format=json`);
                    if (response.ok) {
                        const locationData = await response.json();
                        if (locationData.display_name) locationName = locationData.display_name;
                    }
                    window.locationCache[ser.id] = locationName;
                    localStorage.setItem("locationCache", JSON.stringify(window.locationCache));
                } catch (err) {
                    console.warn("Erro ao buscar localização para ser:", ser.id, err);
                }
            }

            const col = document.createElement("div");
            col.className = "col";
            col.innerHTML = `
                <div class="card h-100 pinterest-card">
                    <img src="${imagemSrc}" class="card-img-top" alt="Foto de ${ser.nomeComum}"
                         onerror="this.src='assets/images/default.png'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${ser.nomeComum} <small class="text-muted">(${ser.nomeCientifico})</small></h5>
                        <p class="mb-1"><i class="bi bi-bookmark-fill text-primary me-1"></i>${ser.especie ? ser.especie.nome : "—"}</p>
                        <p class="mb-1"><i class="bi bi-bookmark-fill text-primary me-1"></i>${ser.descricao || "—"}</p>
                        <p class="mb-1">${statusIconMap[ser.statusConservacao] || "—"} ${statusLabels[ser.statusConservacao] || "—"}</p>
                        <p class="mb-1"><i class="bi bi-person-circle me-1"></i>${ser.registradoPor?.login || "—"}</p>
                        <p class="mb-2"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${locationName}</p>
                        <a href="seresDetalhes.html?id=${ser.id}" class="btn btn-sm btn-success mt-auto text-center">Ver Mais</a>
                    </div>
                </div>
            `;
            fragment.appendChild(col);
        });

        await Promise.all(cardsPromises);
        listaContainer.appendChild(fragment);

    } catch (err) {
        console.error(err);
        listaContainer.innerHTML = "<p class='text-danger'>Erro ao carregar seres.</p>";
    }
}
// ==========================
// Menu Hamburger (Mobile)
// ==========================
// Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const desktopButtons = document.getElementById("nav-buttons-container");
  const mobileButtons = document.getElementById("nav-buttons-container-mobile");

  function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
    sidebar.setAttribute('aria-hidden', 'false');

    if (desktopButtons && mobileButtons) {
      mobileButtons.innerHTML = desktopButtons.innerHTML;
    }
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    sidebar.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);


document.addEventListener('DOMContentLoaded', inicializarMenuHamburger);

