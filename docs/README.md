<div align="center">
  <b><h1>Anamnesis Navigator</h1><b>
  <img src="../frontend/src/assets/logo.png" alt="Logo do Projeto" width="400">
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

