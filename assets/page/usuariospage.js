
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById("user-menu");
  if (!container) return;

  const login = localStorage.getItem("login");
  const email = localStorage.getItem("email");

  container.innerHTML = ''; // Limpa container

  if (login && email) {
    const userMenu = document.createElement("div");
    userMenu.className = "user-menu";
    userMenu.style.position = "relative";

    userMenu.innerHTML = `
      <i class="fas fa-user-circle fa-2x"
         style="cursor:pointer; color:#4caf50;"></i>
      <p style="margin:5px 0 0 0; font-weight:600; font-size:0.95rem; color:#333;">${login}</p>

      <div class="user-dropdown" style="
          display:none;
          position:absolute;
          right:0;
          top:50px;
          background:#fff;
          border-radius:12px;
          padding:12px;
          box-shadow:0 8px 20px rgba(0,0,0,0.15);
          z-index:100;
          min-width:220px;
      ">
        <p style="margin:0 0 12px 0; font-weight:600; font-size:0.9rem; text-align:center; background-color: var(--cor-verde-musgo); color:#fff; border-radius:8px; padding:6px 0;">${login}</p>
        <button onclick="viewProfile()">Ver Perfil</button>
        <button onclick="logout()">Sair</button>
        <button onclick="loginAnother()">Entrar com outra conta</button>
      </div>
    `;
    container.appendChild(userMenu);

    const icon = userMenu.querySelector("i");
    const dropdown = userMenu.querySelector(".user-dropdown");

    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
      dropdown.style.display = "none";
    });

  } else {
    const loginButton = document.createElement("a");
    loginButton.href = "login.html";
    loginButton.innerText = "Entrar";

    // Estilização do botão de login
    loginButton.style.display = "inline-block";
    loginButton.style.padding = "10px 20px";
    loginButton.style.background = "#4caf50";
    loginButton.style.color = "#fff";
    loginButton.style.border = "none";
    loginButton.style.borderRadius = "8px";
    loginButton.style.fontSize = "1rem";
    loginButton.style.fontWeight = "600";
    loginButton.style.textDecoration = "none";
    loginButton.style.cursor = "pointer";
    loginButton.style.transition = "all 0.3s ease";

    // Hover effect
    loginButton.addEventListener("mouseenter", () => {
      loginButton.style.background = "#4caf50";
    });
    loginButton.addEventListener("mouseleave", () => {
      loginButton.style.background = "#4caf50";
    });

    container.appendChild(loginButton);
  }
});

// Funções auxiliares
function viewProfile() { window.location.href = "usuarios.html"; }
function logout() {
  localStorage.removeItem("login");
  localStorage.removeItem("email");
  alert("Você saiu da conta.");
  window.location.reload();
}
function loginAnother() { window.location.href = "login.html"; }

