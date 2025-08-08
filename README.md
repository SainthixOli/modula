# Anamnesis Navigator

> Fichário virtual para psicólogos — registro, organização e consulta de anamneses e sessões. MVP focado em entregar o fluxo essencial com segurança e usabilidade.

---

## 🚀 Resumo rápido
Anamnese Navigator é um sistema web pensado para psicólogos gerenciarem pacientes e sessões de forma simples e segura. O objetivo do MVP é cobrir o fluxo mínimo: autenticação do psicólogo, cadastro de pacientes, registro de sessões e visualização do histórico.

---

## 🎯 Objetivos do MVP
- Login seguro para psicólogos  
- Cadastro e listagem de pacientes  
- Registro de sessão (editor de texto simples)  
- Histórico cronológico de sessões por paciente

---

## 🧰 Tecnologias 
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js + Express  
- **Banco de dados:** PostgreSQL  
- **Segurança:** bcrypt, JWT   

> Observação: a stack pode ser ajustada conforme o time.

---

## 📁 Estrutura do repositório (sugestão)
📦 Anamnsis Navigator
│
├── 📂 docs/                      # Toda documentação do projeto
│   ├── README.md                 # Apresentação geral do projeto
│   ├── planejamento.md           # Escopo, objetivos, requisitos, etc.
│   ├── telas.md                  # Descrição das telas, fluxos, funcionalidades
│   ├── tecnologias.md            # Tecnologias utilizadas e integração
│   ├── organograma.png           # Imagem do organograma técnico
│   ├── cronograma.md             # Organização de entregas e prazos
│   └── outros-arquivos/          # Qualquer documento extra
│
├── 📂 design/                    # Arquivos de design
│   ├── figma-screenshots/        # Capturas de tela das telas do Figma
│   └── prototipos.pdf            # Exportação completa do protótipo
│
├── 📂 src/                       # Código fonte do projeto
│   ├── 📂 frontend/              # Código do frontend
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── script.js
│   │   └── assets/               # Imagens, ícones, etc.
│   │
│   ├── 📂 backend/               # Código do backend
│   │   ├── server.js             # Arquivo principal Node.js + Express
│   │   ├── routes/               # Rotas da API
│   │   ├── controllers/          # Lógica das rotas
│   │   ├── models/               # Estrutura de dados / conexão BD
│   │   └── middleware/           # Segurança (auth, validação, etc.)
│   │
│   └── 📂 database/              # Configuração do banco
│       ├── init.sql              # Script de criação das tabelas
│       └── config.js             # Configuração da conexão com o banco
│
├── .gitignore                    # Arquivos/pastas para ignorar no Git
├── package.json                  # Dependências do Node.js
└── LICENSE                       # Licença do projeto (opcional)
