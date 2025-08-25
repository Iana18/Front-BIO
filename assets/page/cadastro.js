// ------------------- Variáveis globais -------------------
let map;
let marker;
let especiesArray = []; // guarda todas as espécies com suas categorias

const btnMostrarForm = document.getElementById("btnMostrarForm");
const serForm = document.getElementById("serForm");
const inputImagem = document.getElementById("imagem");
const btnTirarFoto = document.getElementById("btnTirarFoto");
const btnEscolherGaleria = document.getElementById("btnEscolherGaleria");
//const previewImagem = document.getElementById("previewImagem");
  const inputGaleria = document.getElementById("imagem");
    const preview = document.getElementById("previewImagem");

// ------------------- Inicialização -------------------
document.addEventListener("DOMContentLoaded", function () {
    carregarEspecies();
    carregarTipos();
    inicializarMapa();

    serForm.addEventListener("submit", cadastrar);
    serForm.style.display = "none";
});

// ------------------- Funções de requisição (XHR) -------------------
function carregarEspecies() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8080/api/especies", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            especiesArray = data; // salva para usar no change, se necessário
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

// ------------------- Inicializa mapa -------------------
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

// ------------------- Mostrar formulário -------------------
btnMostrarForm.addEventListener("click", () => {
    serForm.style.display = "block";
    btnMostrarForm.style.display = "none";
    serForm.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => map.invalidateSize(), 100);
});

// ------------------- Upload de imagem -------------------
// Abrir câmera
    btnTirarFoto.addEventListener("click", () => {
        inputImagem.value = ""; 
        inputImagem.click();
    });

    // Abrir galeria
    btnEscolherGaleria.addEventListener("click", () => {
        inputGaleria.value = ""; 
        inputGaleria.click();
    });

    // Mostrar preview quando escolher da câmera
    inputImagem.addEventListener("change", () => {
        mostrarPreview(inputImagem.files[0]);
    });

    // Mostrar preview quando escolher da galeria
    inputGaleria.addEventListener("change", () => {
        mostrarPreview(inputGaleria.files[0]);
    });

    // Função de preview
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

// ------------------- Função de cadastro -------------------
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

    const especieSelect = document.getElementById("especie");
    const tipoSelect = document.getElementById("tipo");
    const statusConservacaoSelect = document.getElementById("statusConservacao");

    const especieId = especieSelect.value;
    const tipoId = tipoSelect.value;
    const statusConservacao = statusConservacaoSelect.value;

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
    formData.append("especieNome", especieSelect.selectedOptions[0].text);
    formData.append("tipoId", tipoId);
    formData.append("tipoNome", tipoSelect.selectedOptions[0].text);
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
            previewImagem.style.display = "none";
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
