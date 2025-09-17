document.addEventListener('DOMContentLoaded', () => {
    
    // Função para rotacionar as imagens decorativas
    function iniciarRotacaoDeImagens() {
        const imagens = document.querySelectorAll('.decorative-grid img');

        if (imagens.length === 0) {
            console.log('Nenhuma imagem encontrada para animar. Verifique a classe ".decorative-grid img" no HTML.');
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

    // Inicia a função de rotação
    iniciarRotacaoDeImagens();

});