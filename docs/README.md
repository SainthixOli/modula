<div align="center">
  <b><h1>Anamnesis Navigator</h1><b>
  <img src="../frontend/src/assets/logo.png" alt="Logo do Projeto" width="400">
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue" alt="Status do Projeto">
  <img src="https://img.shields.io/badge/Versão-0.1.0-orange" alt="Versão do Projeto">
  <img src="https://img.shields.io/github/license/SainthixOli/anamnesis-navigator" alt="Licença">
</div>

### Fichário virtual para psicólogos 🧠
- Registro, organização e consulta de anamneses e sessões. 
- MVP focado em entregar o fluxo essencial com segurança e usabilidade.

---

## 🚀 Resumo rápido
Anamnese Navigator é um sistema web pensado para psicólogos gerenciarem pacientes e sessões de forma simples e segura. O objetivo do MVP é cobrir o fluxo mínimo: autenticação do psicólogo, cadastro de pacientes, registro de sessões e visualização do histórico.

---

## 🎯 Objetivos do MVP
- Login seguro para psicólogos  
- Cadastro e listagem de pacientes  
- Registro de sessão (editor de texto simples)  
- Histórico cronológico de sessões por paciente


## 💻 Como executar o projeto

Para executar o Anamnesis Navigator na tua máquina, segue os passos abaixo:

### Pré-requisitos
Certifica-te de que tens as seguintes ferramentas instaladas:
- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/) 
- [PostgreSQL](https://www.postgresql.org/download/)

### Passo a passo
1.  **Clona este repositório:**
    ```bash
    git clone [https://github.com/SainthixOli/anamnesis-navigator.git](https://github.com/SainthixOli/anamnesis-navigator.git)
    cd anamnesis-navigator
    ```
2.  **Configura o backend:**
    - Navega até a pasta `backend`: `cd backend`
    - Instala as dependências: `npm install`
    - Cria um arquivo `.env` com as tuas credenciais do banco de dados (exemplo: `DATABASE_URL=postgres://user:password@localhost:5432/anamnesis_db`)
    - Inicia o servidor: `npm start`
3.  **Configura o frontend:**
    - Navega até a pasta `frontend`: `cd ../frontend`
    - Abre o arquivo `index.html` no teu navegador preferido.


---

## 🧰 Tecnologias 
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js + Express  
- **Banco de dados:** PostgreSQL  
- **Segurança:** bcrypt, JWT   

> Observação: a stack pode ser ajustada conforme o time.

---

## 📁 Estrutura do repositório 
```txt
anamnesis-navigator/
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
