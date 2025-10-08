document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Armazena o token no navegador
            localStorage.setItem("token", data.data.tokens.access_token);

            // Redireciona para a segunda tela
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Erro ao fazer login");
        }

    } catch (err) {
        console.error("Erro de conexão:", err);
        alert("Não foi possível conectar ao servidor.");
    }
});
