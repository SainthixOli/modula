document.addEventListener('DOMContentLoaded', () => {
    
    // Função para rotacionar as imagens decorativas (mantida como está)
    function iniciarRotacaoDeImagens() {
        const imagens = document.querySelectorAll('.decorative-grid img');
        if (imagens.length === 0) {
            console.log('Nenhuma imagem encontrada para animar.');
            return;
        }
        imagens.forEach((img, index) => {
            setTimeout(() => {
                let anguloAtual = 0;
                setInterval(() => {
                    anguloAtual += 90;
                    img.style.transform = `rotate(${anguloAtual}deg)`;
                }, 1000);
            }, index * 150);
        });
    }

    iniciarRotacaoDeImagens();

    // ---- CORREÇÃO APLICADA AQUI ----
    // Usando querySelector para encontrar o botão pela classe
    const loginButton = document.querySelector(".btn.btn-primary");

    if (loginButton) {
        loginButton.addEventListener("click", function(event) {
            event.preventDefault(); // Impede o envio do formulário
            window.location.href = "/pagina-que-nao-existe"; // Redireciona para uma URL inválida
        });
    } else {
        console.error("Botão de login não encontrado! Verifique o seletor '.btn.btn-primary'.");
    }
});