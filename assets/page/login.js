function login() {
    var loginValue = document.getElementById("login").value.trim();
    var passwordValue = document.getElementById("password").value;

    if (!loginValue || !passwordValue) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/api/auth/login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            
            // Salva dados no localStorage
            localStorage.setItem("token", data.chave);
            localStorage.setItem("login", data.login);
            localStorage.setItem("email", data.email);

            console.log("Login realizado com sucesso!", data);

            if (data.login.toLowerCase() === "admin") {
                // Cria o modal
                let modal = document.createElement("div");
                modal.id = "admin-modal";
                modal.style.position = "fixed";
                modal.style.top = "0";
                modal.style.left = "0";
                modal.style.width = "100%";
                modal.style.height = "100%";
                modal.style.background = "rgba(0,0,0,0.5)";
                modal.style.display = "flex";
                modal.style.alignItems = "center";
                modal.style.justifyContent = "center";
                modal.style.zIndex = "1000";

                let modalContent = document.createElement("div");
                modalContent.style.background = "#fff";
                modalContent.style.padding = "30px";
                modalContent.style.borderRadius = "8px";
                modalContent.style.boxShadow = "0 8px 16px rgba(0,0,0,0.3)";
                modalContent.style.textAlign = "center";
                modalContent.innerHTML = `
                    <h2 style="margin-bottom: 15px;">Bem-vindo, Admin!</h2>
                    <p style="margin-bottom: 20px;">Para onde deseja ir?</p>
                    <button id="admin-page-btn" style="margin:5px; padding:10px 20px; font-size:16px; cursor:pointer;">Página Admin</button>
                    <button id="main-page-btn" style="margin:5px; padding:10px 20px; font-size:16px; cursor:pointer;">Página Principal</button>
                `;

                modal.appendChild(modalContent);
                document.body.appendChild(modal);

                document.getElementById("admin-page-btn").onclick = function() {
                    window.location.href = "admin.html";
                };
                document.getElementById("main-page-btn").onclick = function() {
                    window.location.href = "index.html";
                };

            } else {
                // Usuário normal vai direto para a página principal
                window.location.href = "index.html";
            }

        } else {
            console.error("Erro no login:", xhr.responseText);
            alert("Erro no login: " + xhr.responseText);
        }
    };

    xhr.onerror = function () {
        console.error("Erro de rede ou servidor inacessível");
        alert("Erro de rede ou servidor inacessível.");
    };

    var dados = JSON.stringify({
        login: loginValue,
        password: passwordValue
    });

    xhr.send(dados);
}
