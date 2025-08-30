// Cria o menu do usuário dinamicamente
async function criarMenuUsuario() {
    try {
        // Pega usuário logado
        const resp = await fetch("http://localhost:8080/api/usuarios/me");
        if (!resp.ok) throw new Error("Usuário não logado");
        const usuario = await resp.json();

        // Cria container do menu
        const container = document.createElement("div");
        container.id = "user-menu-container";
        Object.assign(container.style, {
            position: "fixed",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            fontFamily: "Arial, sans-serif",
            zIndex: 1000
        });

        // Ícone + login
        const btn = document.createElement("div");
        btn.id = "user-menu-btn";
        btn.style.display = "flex";
        btn.style.flexDirection = "column";
        btn.style.alignItems = "center";

        const avatar = document.createElement("img");
        avatar.src = usuario.avatar ? `data:image/jpeg;base64,${usuario.avatar}` : "assets/images/default-avatar.png";
        Object.assign(avatar.style, {
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid #ccc",
            marginBottom: "5px"
        });

        const login = document.createElement("span");
        login.textContent = usuario.login;
        login.style.fontSize = "12px";

        btn.appendChild(avatar);
        btn.appendChild(login);
        container.appendChild(btn);

        // Dropdown
        const dropdown = document.createElement("div");
        dropdown.id = "user-dropdown";
        Object.assign(dropdown.style, {
            display: "none",
            position: "absolute",
            top: "50px",
            right: "0",
            backgroundColor: "#fff",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflow: "hidden",
            minWidth: "150px"
        });

        const criarOpcao = (texto, onClick) => {
            const item = document.createElement("div");
            item.textContent = texto;
            Object.assign(item.style, {
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee"
            });
            item.addEventListener("mouseenter", () => item.style.backgroundColor = "#f0f0f0");
            item.addEventListener("mouseleave", () => item.style.backgroundColor = "#fff");
            item.addEventListener("click", onClick);
            return item;
        };

        dropdown.appendChild(criarOpcao("Ver Conta", () => window.location.href = "perfil.html"));
        dropdown.appendChild(criarOpcao("Trocar Conta", () => window.location.href = "login.html"));
        dropdown.appendChild(criarOpcao("Sair", () => logout()));

        container.appendChild(dropdown);
        document.body.appendChild(container);

        // Toggle dropdown
        btn.addEventListener("click", () => {
            dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
        });

        // Fecha dropdown ao clicar fora
        document.addEventListener("click", (e) => {
            if (!container.contains(e.target)) dropdown.style.display = "none";
        });

    } catch (err) {
        console.error("Menu usuário:", err);
    }
}

// Logout simples
async function logout() {
    try {
        await fetch("http://localhost:8080/api/logout", { method: "POST", credentials: "include" });
        window.location.href = "login.html";
    } catch {
        window.location.href = "login.html";
    }
}

// Chama ao carregar a página
criarMenuUsuario();
