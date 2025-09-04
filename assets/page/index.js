
// ==========================
// Menu Hamburger (Mobile)
// ==========================
function inicializarMenuHamburger() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (!hamburger || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
        sidebar.setAttribute('aria-hidden', 'false');
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        sidebar.setAttribute('aria-hidden', 'true');
    }

    hamburger.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', closeSidebar));
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

