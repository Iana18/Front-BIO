window.onload = function() {
    const navButtonsContainer = document.getElementById("nav-buttons-container");
    navButtonsContainer.innerHTML = ''; // Limpa o container

    const login = localStorage.getItem("login");
    const email = localStorage.getItem("email");

    if (login && email) {
        // Usuário logado: cria menu do usuário
        const userMenu = document.createElement("div");
        userMenu.className = "user-menu";
        userMenu.style.position = "relative"; // Para dropdown posicionar corretamente
        userMenu.style.textAlign = "center";  // Centraliza ícone e login

userMenu.innerHTML = `
    <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
        <!-- Ícone do usuário -->
        <i class="fas fa-user-circle fa-2x" 
           style="cursor:pointer; color:#4a90e2; transition: transform 0.2s;" 
           onclick="toggleUserDropdown()"
           onmouseover="this.style.transform='scale(1.1)';" 
           onmouseout="this.style.transform='scale(1)';">
        </i>
        <p id="user-login-outside" style="margin:5px 0 0 0; font-weight:600; font-size:0.95rem; color:#333;">${login}</p>
        
        <!-- Dropdown moderno -->
        <div id="user-dropdown" class="user-dropdown" style="
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
            overflow:hidden;
            transition: all 0.3s ease;
        ">
            <p id="user-login-inside" style="margin:0 0 12px 0; font-weight:600; font-size:0.9rem; color:#555; text-align:center;">${login}</p>
            
            <button onclick="viewProfile()" style="
                width:100%;
                padding:10px;
                margin-bottom:8px;
                border:1px solid #ccc;
                background:#f9f9f9;
                color:#333;
                border-radius:8px;
                font-weight:500;
                cursor:pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='#eee';" onmouseout="this.style.background='#f9f9f9';">Ver Perfil</button>
            
            <button onclick="logout()" style="
                width:100%;
                padding:10px;
                margin-bottom:8px;
                border:1px solid #ccc;
                background:#f9f9f9;
                color:#333;
                border-radius:8px;
                font-weight:500;
                cursor:pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='#eee';" onmouseout="this.style.background='#f9f9f9';">Sair</button>
            
            <button onclick="loginAnother()" style="
                width:100%;
                padding:10px;
                border:1px solid #ccc;
                background:#f9f9f9;
                color:#333;
                border-radius:8px;
                font-weight:500;
                cursor:pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='#eee';" onmouseout="this.style.background='#f9f9f9';">Entrar com outra conta</button>
        </div>
    </div>
`;


        navButtonsContainer.appendChild(userMenu);
    } else {
        // Usuário não logado: mostra botão Login
        const loginButton = document.createElement("a");
        loginButton.href = "login.html";
        loginButton.className = "btn";
        loginButton.innerText = "Login";
        navButtonsContainer.appendChild(loginButton);
    }
};

// Toggle dropdown do menu do usuário
function toggleUserDropdown() {
    const dropdown = document.getElementById("user-dropdown");
    if (!dropdown) return;
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Ver perfil do usuário
function viewProfile() {
      // Redireciona para a página de login
    window.location.href = "usuarios.html";
}

// Logout
function logout() {
    localStorage.removeItem("login");
    localStorage.removeItem("email");
    alert("Você saiu da conta.");
    window.location.reload();
}

// Entrar com outra conta
function loginAnother() {
    // Redireciona para a página de login
    window.location.href = "login.html";
}

// Fecha dropdown se clicar fora
document.addEventListener("click", function(event) {
    const dropdown = document.getElementById("user-dropdown");
    const icon = document.querySelector(".user-menu i");
    if (dropdown && icon && !dropdown.contains(event.target) && event.target !== icon) {
        dropdown.style.display = "none";
    }
});
