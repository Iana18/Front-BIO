document.addEventListener("DOMContentLoaded", () => {
  const btnMostrarForm = document.getElementById("btnMostrarForm");
  const btnFecharForm = document.getElementById("btnFecharForm");
  const serForm = document.getElementById("serForm");
  const imagemInput = document.getElementById("imagem");
  const previewImagem = document.getElementById("previewImagem");
  const btnTirarFoto = document.getElementById("btnTirarFoto");
  const btnEscolherGaleria = document.getElementById("btnEscolherGaleria");
  const latitudeInput = document.getElementById("latitude");
  const longitudeInput = document.getElementById("longitude");
  const especieSelect = document.getElementById("especieId");

  let map;
  let marker;

  // ---------- Mostrar formulário ----------
  btnMostrarForm.addEventListener("click", () => {
    serForm.style.display = "block";
    btnMostrarForm.style.display = "none"; // esconde botão abrir
    inicializarMapa();
    carregarEspecies();
  });

  // ---------- Fechar formulário pelo "X" ----------
  btnFecharForm.addEventListener("click", () => {
    serForm.style.display = "none";
    btnMostrarForm.style.display = "block"; // mostra botão abrir novamente
  });

  // ---------- Inicializar mapa ----------
  function inicializarMapa() {
    if (!map) {
      map = L.map("map").setView([11.8037, -15.1804], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        latitudeInput.value = lat;
        longitudeInput.value = lng;

        if (marker) marker.setLatLng(e.latlng);
        else marker = L.marker(e.latlng).addTo(map);
      });
    } else {
      map.invalidateSize();
    }
  }

  // ---------- Carregar espécies do backend ----------
function carregarEspecies() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:8080/api/especies", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      especiesArray = data; // guarda array se precisar
      const select = document.getElementById("especieId");

      // Limpa opções e adiciona padrão
      select.innerHTML = '<option value="">Selecione uma Espécie</option>';

      // Adiciona todas as espécies do backend
      data.forEach(esp => {
        const option = document.createElement("option");
        option.value = esp.id;
        option.textContent = esp.nome;
        select.appendChild(option);
      });

      // Adiciona opção "Não sei"
      const naoSeiOption = document.createElement("option");
      naoSeiOption.value = "";
      naoSeiOption.textContent = "Desconhecido";
      select.appendChild(naoSeiOption);
    }
  };
  xhr.send();
}


  // ---------- Escolher imagem ----------
  btnEscolherGaleria.addEventListener("click", () => {
    imagemInput.removeAttribute("capture");
    imagemInput.click();
  });

  btnTirarFoto.addEventListener("click", () => {
    imagemInput.setAttribute("capture", "environment");
    imagemInput.click();
  });

  // ---------- Preview da imagem ----------
  imagemInput.addEventListener("change", () => {
    const file = imagemInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImagem.src = e.target.result;
        previewImagem.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // ---------- Envio da denúncia ----------
  function enviarDenuncia(event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const latitude = latitudeInput.value;
    const longitude = longitudeInput.value;
    const especieId = especieSelect.value;
    const imagemFile = imagemInput.files[0];

    if (!titulo || !descricao || !latitude || !longitude || !especieId) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const login = localStorage.getItem("login");
    const email = localStorage.getItem("email");

    if (!login || !email) {
      alert("Usuário não está logado!");
      return;
    }

    const formData = new FormData();
    formData.append("usuarioLogin", login);
    formData.append("usuarioEmail", email);
    formData.append("titulo", titulo);
    formData.append("descricao", descricao);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("especieId", especieId);
    if (imagemFile) formData.append("imagem", imagemFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/api/denuncias/upload", true);

    xhr.onload = function () {
      if (xhr.status === 200 || xhr.status === 201) {
        alert("Denúncia enviada com sucesso!");
        serForm.reset();
        previewImagem.style.display = "none";

        // 🔴 Fecha automaticamente o formulário
        serForm.style.display = "none";
        btnMostrarForm.style.display = "block";
      } else {
        console.error("Erro ao enviar denúncia:", xhr.responseText);
        alert("Erro ao enviar denúncia: " + xhr.responseText);
      }
    };

    xhr.onerror = function () {
      alert("Erro de rede ou servidor inacessível.");
    };

    xhr.send(formData);
  }

  serForm.addEventListener("submit", enviarDenuncia);
});
