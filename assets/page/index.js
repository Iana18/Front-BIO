window.onload = function() {
    const login = localStorage.getItem("login");
    const email = localStorage.getItem("email");

    const navButtonsContainer = document.getElementById("nav-buttons-container");
    navButtonsContainer.innerHTML = ''; // Limpa o conteúdo inicial

    if (login && email) {
        // Se houver um utilizador logado, mostra as informações dele
        const userInfoDiv = document.createElement("div");
        userInfoDiv.className = "user-info";
        userInfoDiv.innerText = `${login} (${email})`;
        navButtonsContainer.appendChild(userInfoDiv);
    } else {
        // Caso contrário, mostra o botão "Login"
        const loginButton = document.createElement("a");
        loginButton.href = "#";
        loginButton.className = "btn";
        loginButton.innerText = "Login";
        navButtonsContainer.appendChild(loginButton);
    }
};



