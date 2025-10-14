<div align="center">
  <b><h1>Módula</h1><b>
  <img src="..frontend/src/components/assets/logo.png" alt="Logo do Projeto" width="400">
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue" alt="Status do Projeto">
  <img src="https://img.shields.io/badge/Versão-0.1.0-orange" alt="Versão do Projeto">
  <img src="https://img.shields.io/github/license/SainthixOli/modula" alt="Licença">
</div>

### 🧠 Módula 
- Módula é a plataforma de gestão que promete revolucionar o dia a dia de clínicas e consultórios de saúde. Nossa missão é transformar processos manuais, complexos e descentralizados em uma experiência digital, integrada e inteligente.

- Chega de pilhas de papéis, planilhas confusas e sistemas que não se conversam. Com o Módula, você centraliza a gestão de agendamentos, prontuários, finanças e o relacionamento com o paciente em um único lugar, de forma segura e acessível de onde estiver.

---

## ✨ Funcionalidades em Destaque
Nossa plataforma foi desenhada para otimizar cada aspecto da sua clínica, desde a recepção até a gestão financeira.

🏥 Para a sua Clínica: Controle Total e Eficiência
Oferecemos ferramentas poderosas para simplificar a administração e permitir que você foque no que realmente importa: o cuidado com o paciente.

❤️ Para o seu Paciente: Comodidade e Engajamento
Fortaleça o relacionamento com seus pacientes oferecendo uma experiência moderna, com autonomia e acesso facilitado às informações.



---

## 🎯 Objetivos
- Digitalizar e Centralizar: Unificar todas as operações da clínica em uma única plataforma.

- Otimizar o Tempo: Automatizar tarefas repetitivas como agendamentos, lembretes e controle financeiro.

- Aprimorar a Experiência do Paciente: Oferecer conveniência, autonomia e comunicação transparente.

- Garantir a Segurança: Proteger os dados sensíveis de pacientes e da clínica com as melhores práticas de segurança.
  
---

## 🧰 Tecnologias

<div align="center">

| Frontend | Backend | Banco de Dados | Segurança |
|:---:|:---:|:---:|:---:|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) | ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) | | ![Bcrypt](https://img.shields.io/badge/Bcrypt-4A90E2?style=for-the-badge&logoColor=white) |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) | | | |

</div>

---

## 💻 Como executar o projeto

Para executar o Módula em sua máquina, siga os passos abaixo:

### Pré-requisitos
Certifica-te de que tens as seguintes ferramentas instaladas:
- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/) 
- [PostgreSQL](https://www.postgresql.org/download/)

### Passo a passo
1.  **Clone este repositório:**
    ```bash
    git clone [https://github.com/SainthixOli/modula.git](https://github.com/SainthixOli/modula.git)
    cd modula
    ```
2.  **Configure o backend:**
    - Navega até a pasta `backend`: `cd backend`
    - Instala as dependências: `npm install`
    - Cria um arquivo `.env` com as tuas credenciais do banco de dados (exemplo: `DATABASE_URL=postgres://user:password@localhost:5432/modula_db`)
    - Inicia o servidor: `npm start`
3.  **Configura o frontend:**
    - Navega até a pasta `frontend`: `cd ../frontend`
    - Abre o arquivo `index.html` no teu navegador preferido.

---
## 💻 Telas Protótipos

### Tela de Login  
  <div align="center">
  <img src="../design/figma-screenshots/ModulaTela1.png" alt="Tela de Login"> 
  </div>

  ### Tela Inicial
  <div align="center">
    <img src="../design/figma-screenshots/ModulaTela2.png" alt="Tela Inicial">
  </div>

---

## 📁 Estrutura do repositório 
```txt
modula/
│
├── docs/                      # Toda a documentação do projeto
│   ├── README.md               # Apresentação geral do projeto
│   ├── planejamento.md         # Escopo, objetivos, requisitos, etc.
│   ├── telas.md                # Descrição das telas, fluxos, funcionalidades
│   ├── tecnologias.md          # Tecnologias utilizadas e integração
│   ├── organograma.png         # Imagem do organograma técnico
│   ├── cronograma.md           # Organização de entregas e prazos
│   └── outros-arquivos/        # Qualquer documento extra
│
├── design/                     # Arquivos de design
│   ├── figma-screenshots/      # Capturas de tela das telas do Figma
│   └── prototipos.pdf          # Exportação completa do protótipo
│
├── frontend/                   # Código do frontend
│   └── src/
│       ├── assets/             # Imagens, ícones, etc.
│       ├── index.html
│       ├── styles.css
│       └── script.js
│
├── backend/                    # Código do backend e banco de dados
│   └── src/
│       ├── config/             # Configuração do banco (conexão, etc.)
│       ├── controllers/        # Lógica das rotas
│       ├── middleware/         # Segurança (auth, validação, etc.)
│       ├── models/             # Estrutura de dados / ORM
│       ├── routes/             # Rotas da API
│       └── server.js           # Arquivo principal Node.js + Express
│
├── .gitignore                  # Arquivos/pastas para ignorar no Git
├── package.json                # Dependências do Node.js
└── LICENSE                     # Licença do projeto (opcional)
```
---

## 👥 Equipe

Este projeto foi desenvolvido com a colaboração dos seguintes membros:

| | Nome | Função | Perfil no GitHub |
| :---: | :---: | :---: | :---: |
| <img src="https://github.com/andersonskywalkr.png" width="80px;" alt="Foto de Perfil do Anderson"/> | **Anderson** | Líder | [@andersonskywalkr](https://github.com/andersonskywalkr) |
| <img src="https://github.com/Davi3L.png" width="80px;" alt="Foto de Perfil do Davi"/> | **Davi** | Tester | [@Davi3L](https://github.com/Davi3L) |
| <img src="https://github.com/gabrielpyxp.png" width="80px;" alt="Foto de Perfil do Gabriel"/> | **Gabriel** | Desenvolvedor | [@gabrielpyxp](https://github.com/gabrielpyxp) |
| <img src="https://github.com/strlovs.png" width="80px;" alt="Foto de Perfil da Layla"/> | **Layla** | Tester | [@strlovs](https://github.com/strlovs) |
| <img src="https://github.com/SainthixOli.png" width="80px;" alt="Foto de Perfil do Oliver"/> | **Oliver** | Desenvolvedor | [@SainthixOli](https://github.com/SainthixOli) |
| <img src="https://github.com/rafaelsanoli.png" width="80px;" alt="Foto de Perfil do Rafael"/> | **Rafael** | Desenvolvedor | [@rafaelsanoli](https://github.com/rafaelsanoli) |
