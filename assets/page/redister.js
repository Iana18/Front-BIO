function register() {
    console.log("Entrou no registro");

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var login = document.getElementById("login").value.trim();
    var password = document.getElementById("password").value;
    var role = "USER"; // sempre user
    var termsChecked = document.getElementById("terms").checked;

    if (!name || !email || !login || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    if (!termsChecked) {
        alert("Você precisa concordar com os termos e política.");
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/api/auth/register", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201) {
            console.log("Cadastro feito com sucesso!", xhr.responseText);
            alert("Cadastro realizado com sucesso! Faça login.");
            window.location.href = "login.html";
        } else {
            console.error("Erro no cadastro:", xhr.responseText);
            alert("Erro no cadastro: " + xhr.responseText);
        }
    };

    xhr.onerror = function () {
        console.error("Erro de rede ou servidor inacessível");
        alert("Erro de rede ou servidor inacessível.");
    };

    var dados = JSON.stringify({
        nomeCompleto:name,
        email: email,
        login: login,
        password: password,
        role: role
    });

    xhr.send(dados);
}
