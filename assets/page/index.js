document.addEventListener('DOMContentLoaded', () => {
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

  // Login dinâmico
  const login = localStorage.getItem("login");
  const email = localStorage.getItem("email");
  const navButtonsContainer = document.getElementById("nav-buttons-container");

  if (navButtonsContainer) {
    navButtonsContainer.innerHTML = '';

    if (login && email) {
      const userMenu = document.createElement("div");
      userMenu.style.position = "relative";

      userMenu.innerHTML = `
        <i class="fas fa-user-circle fa-lg" onclick="toggleUserDropdown()" style="cursor:pointer;"></i>
        <div id="user-dropdown" class="user-dropdown">
          <p style="margin:0 0 10px 0; font-weight:bold;">${login}</p>
          <button onclick="viewProfile()">Ver Perfil</button>
          <button onclick="logout()">Sair</button>
          <button onclick="loginAnother()">Entrar com outra conta</button>
        </div>
      `;

      navButtonsContainer.appendChild(userMenu);
    } else {
      const loginButton = document.createElement("a");
      loginButton.href = "login.html";
      loginButton.className = "btn";
      loginButton.innerText = "Entrar";

      navButtonsContainer.appendChild(loginButton);
    }
  }
});

// Funções do menu usuário
function toggleUserDropdown() {
  const dropdown = document.getElementById("user-dropdown");
  if (!dropdown) return;

  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}



// Carregar carrossel de seres
async function carregarCarrosselSeres() {
  const carouselContainer = document.getElementById("carouselEspecies");
  carouselContainer.innerHTML = "";

  try {
    const res = await fetch("http://localhost:8080/api/seres");
    const data = await res.json();

    // Filtrar apenas 4 seres aprovados e ameaçados/vulneráveis
    const seresCarrossel = data.filter(ser =>
      ser.statusAprovacao === "APROVADO" &&
      ["AMEACADO", "VULNERAVEL", "EM_PERIGO", "CRITICAMENTE_EM_PERIGO"].includes(ser.statusConservacao)
    ).slice(0, 5);

    if (seresCarrossel.length === 0) {
      carouselContainer.innerHTML = `<p>Nenhum ser ameaçado encontrado.</p>`;
      return;
    }

    for (const ser of seresCarrossel) {
      let imagemSrc = "assets/images/default.png";
      try {
        const imgRes = await fetch(`http://localhost:8080/api/seres/${ser.id}/imagem`);
        if (imgRes.ok) {
          const base64 = await imgRes.text();
          if (base64) imagemSrc = `data:image/jpeg;base64,${base64}`;
        }
      } catch {}

      const card = document.createElement("div");
      card.className = "pinterest-card";

      card.innerHTML = `
  <img src="${imagemSrc}" alt="${ser.nomeComum}">
  <div class="card-body">
    <h5>
      ${ser.nomeComum} <small class="text-muted">(${ser.nomeCientifico})</small>
    </h5>
    <p>
      <i class="bi bi-bookmark-fill text-primary me-1"></i>
      ${ser.especie ? ser.especie.nome : "—"}
    </p>
    <p>
      <i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>
      ${ser.statusConservacao || "—"}
    </p>
    <a href="seresDetalhes.html?id=${ser.id}" class="btn-ver-mais">Ver Mais</a>
  </div>
`;

      carouselContainer.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    carouselContainer.innerHTML = "<p class='text-danger'>Erro ao carregar seres.</p>";
  }
}

// --- Botões de navegação ---
document.addEventListener('DOMContentLoaded', () => {
  carregarCarrosselSeres();

  const track = document.getElementById("carouselEspecies");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  prevBtn.addEventListener("click", () => track.scrollBy({ left: -320, behavior: "smooth" }));
  nextBtn.addEventListener("click", () => track.scrollBy({ left: 320, behavior: "smooth" }));
});
