# 🚀 Módula Backend

Backend da plataforma Módula - Sistema de gestão de clínicas e consultórios de saúde.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Deployment](#deployment)

## 🎯 Visão Geral

O backend do Módula é uma API RESTful desenvolvida em Node.js que oferece:

- **Autenticação JWT** com refresh tokens
- **Controle de acesso** baseado em roles (Admin/Profissional)
- **Gestão de usuários** e pacientes
- **Sistema de recuperação de senha** via email
- **Validação robusta** de dados de entrada
- **Logs detalhados** para auditoria
- **Tratamento centralizado** de erros
- **Documentação completa** da API

## 🛠 Tecnologias

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Banco de Dados:** PostgreSQL
- **ORM:** Sequelize
- **Autenticação:** JWT (jsonwebtoken)
- **Validação:** Joi
- **Criptografia:** bcryptjs
- **Email:** Nodemailer
- **Segurança:** helmet, cors, express-rate-limit
- **Logs:** morgan

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 16.0.0 ou superior
- **npm** 8.0.0 ou superior
- **PostgreSQL** 12.0 ou superior
- **Git** para controle de versão

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/SainthixOli/modula.git
cd modula/backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```sql
-- Conecte no PostgreSQL e execute:
CREATE DATABASE modula_dev;
CREATE DATABASE modula_test; -- Para testes

-- Opcional: Criar usuário específico
CREATE USER modula_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE modula_dev TO modula_user;
GRANT ALL PRIVILEGES ON DATABASE modula_test TO modula_user;
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 2. Configurações Essenciais
Preencha pelo menos estas variáveis no `.env`:

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=modula_dev
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT (GERE CHAVES SEGURAS!)
JWT_SECRET=uma_chave_muito_secreta_e_longa_123456789
JWT_REFRESH_SECRET=outra_chave_ainda_mais_secreta_987654321

# Email (para recuperação de senha)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app

# Frontend
FRONTEND_URL=http://localhost:8080
```

### 3. Configuração de Email
Para usar Gmail:
1. Ative a autenticação de 2 fatores
2. Gere uma senha de app específica
3. Use essa senha no `SMTP_PASS`

## ▶️ Execução

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento (com nodemon)
npm run dev

# Ou modo normal
npm start
```

### Produção
```bash
# Definir ambiente de produção
NODE_ENV=production npm start
```

### Verificar se está funcionando
Acesse: `http://localhost:3000/health`

Resposta esperada:
```json
{
  "status": "OK",
  "message": "Módula API está funcionando",
  "timestamp": "2025-08-24T12:00:00.000Z",
  "version": "1.0.0"
}
```

## 🌐 API Endpoints

### Autenticação
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login de usuário | ❌ |
| POST | `/api/auth/refresh-token` | Renovar token | ❌ |
| POST | `/api/auth/forgot-password` | Solicitar recuperação | ❌ |
| POST | `/api/auth/reset-password` | Redefinir senha | ❌ |
| POST | `/api/auth/first-access` | Primeiro acesso | ✅ |
| POST | `/api/auth/validate-token` | Validar token | ✅ |
| POST | `/api/auth/logout` | Logout | ✅ |

### Administração (em desenvolvimento)
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/admin/dashboard` | Dados do dashboard | ✅ Admin |
| GET | `/api/admin/professionals` | Listar profissionais | ✅ Admin |
| POST | `/api/admin/professionals` | Criar profissional | ✅ Admin |

### Profissionais (em desenvolvimento)
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/professional/dashboard` | Dashboard profissional | ✅ Prof |
| GET | `/api/professional/patients` | Listar pacientes | ✅ Prof |
| POST | `/api/professional/patients` | Criar paciente | ✅ Prof |

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do Sequelize
│   ├── controllers/             # Lógica de negócio
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   └── professionalController.js
│   ├── middleware/              # Middlewares customizados
│   │   ├── auth.js             # Autenticação JWT
│   │   ├── errorHandler.js     # Tratamento de erros
│   │   └── validation.js       # Validações
│   ├── models/                  # Modelos do Sequelize
│   │   ├── User.js             # Usuários (Admin/Profissional)
│   │   ├── Patient.js          # Pacientes
│   │   ├── Anamnesis.js        # Anamneses
│   │   └── Session.js          # Sessões/Consultas
│   ├── routes/                  # Definição de rotas
│   │   ├── auth.js             # Autenticação
│   │   ├── admin.js            # Rotas do admin
│   │   ├── professional.js     # Rotas do profissional
│   │   └── patient.js          # Rotas de pacientes
│   ├── services/               # Serviços auxiliares
│   │   ├── emailService.js     # Envio de emails
│   │   └── validationService.js # Validações customizadas
│   └── utils/                   # Utilitários
│       ├── constants.js        # Constantes da aplicação
│       └── helpers.js          # Funções auxiliares
├── tests/                      # Testes automatizados
│   ├── integration/            # Testes de integração
│   └── unit/                   # Testes unitários
├── .env.example               # Exemplo de variáveis de ambiente
├── .gitignore                 # Arquivos ignorados pelo Git
├── package.json               # Dependências e scripts
├── server.js                  # Arquivo principal
└── README.md                  # Esta documentação
```

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia com nodemon (auto-reload)
npm start           # Inicia normalmente

# Testes
npm test            # Executa todos os testes
npm run test:watch  # Executa testes em modo watch

# Linting
npm run lint        # Verifica código com ESLint
npm run lint:fix    # Corrige problemas automaticamente

# Banco de dados
npm run migrate     # Executa migrações
npm run seed        # Popula dados iniciais
```

## 👨‍💻 Desenvolvimento

### Adicionando uma nova rota
1. Defina a rota em `/src/routes/`
2. Crie o controller em `/src/controllers/`
3. Adicione validação se necessário
4. Teste a funcionalidade

### Exemplo de nova rota:
```javascript
// /src/routes/example.js
const express = require('express');
const { validateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/test', validateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Rota funcionando!',
    user: req.user.full_name
  });
}));

module.exports = router;
```

### Padrões de Código
- Use `camelCase` para variáveis e funções
- Use `PascalCase` para classes e modelos
- Use `snake_case` para campos do banco de dados
- Sempre use `asyncHandler` para rotas assíncronas
- Valide dados de entrada com Joi
- Use códigos de erro consistentes

## 🧪 Testes

### Estrutura de Testes
```bash
tests/
├── integration/
│   ├── auth.test.js
│   └── admin.test.js
└── unit/
    ├── models/
    └── services/
```

### Executar testes
```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --grep "Auth"

# Com coverage
npm test -- --coverage

# Modo watch
npm run test:watch
```

### Exemplo de teste
```javascript
const request = require('supertest');
const app = require('../../server');

describe('Auth Endpoints', () => {
  test('POST /api/auth/login - deve fazer login com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@modula.com',
        password: '123456'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens.access_token).toBeDefined();
  });
});
```

## 🚀 Deployment

### Variáveis de Produção
Certifique-se de configurar:
- `NODE_ENV=production`
- URLs corretas de banco e frontend
- Chaves JWT seguras e complexas
- Configurações SMTP válidas

### Heroku
```bash
# Login no Heroku
heroku login

# Criar app
heroku create modula-api

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...

# Deploy
git push heroku main
```

### Docker (opcional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique se PostgreSQL está rodando
   - Confirme credenciais no `.env`
   - Teste conexão: `psql -h localhost -U postgres -d modula_dev`

2. **Erro de JWT**
   - Verifique se `JWT_SECRET` está definido
   - Token pode ter expirado
   - Certifique-se de enviar header correto: `Authorization: Bearer <token>`

3. **Erro de email**
   - Verifique configurações SMTP
   - Para Gmail, use senha de app
   - Teste conectividade SMTP

4. **Porta em uso**
   - Mude a porta no `.env`: `PORT=3001`
   - Ou mate o processo: `lsof -ti:3000 | xargs kill`

### Logs de Debug
```bash
# Ativar logs detalhados
DEBUG=* npm run dev

# Ou apenas logs específicos
DEBUG=modula:* npm run dev
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Consulte os logs da aplicação
3. Abra uma issue no GitHub
4. Entre em contato com a equipe de desenvolvimento


**Desenvolvido com ❤️ pela equipe Módula**