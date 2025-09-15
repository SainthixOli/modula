document.addEventListener('DOMContentLoaded', () => {
    
    // Função para rotacionar as imagens decorativas
    function iniciarRotacaoDeImagens() {
        // CORREÇÃO: A gente precisa selecionar as imagens DENTRO do grid, e não o grid inteiro.
        // Trocado de '.decorative-grid' para '.decorative-grid img'
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

    // NOTA: A lógica dos botões 'Entrar', 'irlogin' e 'voltar' foi removida
    // porque os botões com esses IDs não existem neste arquivo HTML.
    // Eles provavelmente pertencem a outras páginas, como a de cadastro ou uma página inicial.
});