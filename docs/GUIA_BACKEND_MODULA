# 🚀 Módula Backend - Guia de Início Rápido

Este guia irá te ajudar a configurar e executar o backend do Módula em poucos minutos.

## ✅ Checklist de Configuração

### 1. Pré-requisitos
- [ ] Node.js 16+ instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Git configurado
- [ ] Editor de código (VS Code recomendado)

### 2. Configuração do Projeto
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] Banco de dados criado
- [ ] Arquivo `.env` configurado
- [ ] Primeira execução realizada

## 🎯 Passo a Passo Detalhado

### Passo 1: Clone e Instale
```bash
# 1. Clone o repositório
git clone https://github.com/SainthixOli/modula.git
cd modula/backend

# 2. Instale as dependências
npm install
```

### Passo 2: Configure o Banco de Dados
```bash
# 1. Acesse o PostgreSQL
psql -U postgres

# 2. Crie os bancos
CREATE DATABASE modula_dev;
CREATE DATABASE modula_test;

# 3. Saia do psql
\q
```

### Passo 3: Configure o Ambiente
```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env

# 2. Edite o .env (use seu editor favorito)
nano .env
```

**Configurações mínimas necessárias no `.env`:**
```env
# Banco de dados
DB_NAME=modula_dev
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres

# JWT - GERE CHAVES SEGURAS!
JWT_SECRET=sua_chave_super_secreta_123456789
JWT_REFRESH_SECRET=outra_chave_ainda_mais_secreta_987654321

# Email (opcional para começar)
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
```

### Passo 4: Execute o Projeto
```bash
# Desenvolvimento (recomendado)
npm run dev

# Ou execução normal
npm start
```

### Passo 5: Teste a API
Abra seu navegador ou Postman e teste:

**Health Check:**
```
GET http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "message": "Módula API está funcionando",
  "timestamp": "2025-08-24T15:30:00.000Z",
  "version": "1.0.0"
}
```

## 🧪 Testando Funcionalidades

### 1. Criar Usuário Admin (Primeira vez)
Para começar a usar o sistema, você precisa criar um usuário administrador diretamente no banco:

```sql
-- Execute no PostgreSQL
INSERT INTO users (
  id, 
  full_name, 
  email, 
  password, 
  user_type, 
  is_first_access,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Admin do Sistema',
  'admin@modula.com',
  '$2a$12$LQv3c1yqBwEHxv8fGBpbEO8sW7yt0w8D0WYM7R5C4.KF0rOqK2bGS', -- senha: admin123
  'admin',
  true,
  'active',
  NOW(),
  NOW()
);
```

### 2. Teste de Login
**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@modula.com",
  "password": "admin123"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "full_name": "Admin do Sistema",
      "email": "admin@modula.com",
      "user_type": "admin",
      "is_first_access": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "token_type": "Bearer",
      "expires_in": "24h"
    }
  }
}
```

### 3. Teste de Rota Protegida
**Endpoint:** `POST http://localhost:3000/api/auth/validate-token`

**Headers:**
```
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
```

## 🛠️ Próximos Passos de Desenvolvimento

### 1. Implementar Rotas do Admin
Agora você pode expandir o sistema criando:

```javascript
// /src/routes/admin.js - Exemplo básico
router.get('/dashboard', requireAdmin, asyncHandler(async (req, res) => {
  // Implementar lógica do dashboard
  res.json({
    success: true,
    data: {
      totalProfessionals: 0,
      totalPatients: 0,
      pendingTransfers: 0
    }
  });
}));
```

### 2. Completar Modelos
- [ ] Finalizar relacionamentos entre User e Patient
- [ ] Criar modelo Anamnesis
- [ ] Criar modelo Session
- [ ] Implementar associações do Sequelize

### 3. Implementar Validações
- [ ] Middleware de validação com Joi
- [ ] Sanitização de dados
- [ ] Validações personalizadas

### 4. Adicionar Testes
- [ ] Testes de autenticação
- [ ] Testes de CRUD
- [ ] Testes de integração

## 🔧 Ferramentas Recomendadas

### Extensões VS Code
- REST Client (para testar APIs)
- PostgreSQL (syntax highlighting)
- ESLint (linting)
- Prettier (formatação)

### Cliente de API
- **Postman** (recomendado)
- **Insomnia** (alternativa)
- **VS Code REST Client**

### Exemplo de arquivo `.rest` para VS Code:
```http
### Health Check
GET http://localhost:3000/health

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@modula.com",
  "password": "admin123"
}

### Validar Token (substitua o token)
POST http://localhost:3000/api/auth/validate-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🚨 Solução de Problemas Comuns

### Erro: "Cannot connect to database"
**Solução:**
1. Verifique se PostgreSQL está rodando: `brew services start postgresql` (macOS) ou `sudo service postgresql start` (Linux)
2. Confirme credenciais no `.env`
3. Teste conexão: `psql -h localhost -U postgres -d modula_dev`

### Erro: "JWT_SECRET is required"
**Solução:**
1. Verifique se o arquivo `.env` existe
2. Confirme se `JWT_SECRET` está definido
3. Reinicie o servidor após alterar `.env`

### Erro: "Port 3000 already in use"
**Solução:**
1. Mate o processo: `lsof -ti:3000 | xargs kill`
2. Ou mude a porta no `.env`: `PORT=3001`

### Erro: "Cannot send email"
**Solução:**
1. Configurações SMTP opcionais para desenvolvimento
2. Para Gmail: use senha de app, não sua senha normal
3. Ative autenticação de 2 fatores primeiro

## 📚 Estrutura de Desenvolvimento

### Ordem Recomendada de Implementação
1. ✅ **Autenticação** (completo)
2. 🔄 **Modelos** (User e Patient criados)
3. 🔄 **Rotas Admin** (próximo)
4. 🔄 **Rotas Profissional**
5. 🔄 **Rotas Paciente**
6. 🔄 **Validações Avançadas**
7. 🔄 **Testes**
8. 🔄 **Documentação API**

### Próximas Tarefas
1. **Criar associações Sequelize:**
   ```javascript
   // Em models/index.js
   User.hasMany(Patient, { foreignKey: 'user_id' });
   Patient.belongsTo(User, { foreignKey: 'user_id' });
   ```

2. **Implementar rota de criação de profissionais:**
   ```javascript
   // POST /api/admin/professionals
   // Gerar senha temporária
   // Enviar email com credenciais
   ```

3. **Dashboard do admin com estatísticas:**
   ```javascript
   // GET /api/admin/dashboard
   // Contar profissionais ativos
   // Contar total de pacientes
   // Listar transferências pendentes
   ```

## 🎯 Metas de Desenvolvimento

### Semana 1
- [ ] Concluir rotas de administração
- [ ] Implementar CRUD de profissionais
- [ ] Criar sistema de convites

### Semana 2
- [ ] Dashboard do profissional
- [ ] CRUD de pacientes
- [ ] Sistema de anamnese

### Semana 3
- [ ] Registro de consultas
- [ ] Sistema de transferências
- [ ] Relatórios básicos

## 🤝 Contribuindo

### Padrão de Commits
```bash
# Funcionalidade nova
git commit -m "feat: adicionar rota de criação de profissionais"

# Correção de bug
git commit -m "fix: corrigir validação de email no login"

# Documentação
git commit -m "docs: atualizar README com instruções de instalação"

# Refatoração
git commit -m "refactor: melhorar estrutura de middleware de auth"
```

### Fluxo de Desenvolvimento
1. Crie uma branch para cada funcionalidade
2. Faça commits pequenos e descritivos
3. Teste antes de fazer push
4. Abra Pull Request com descrição clara

## 🔗 Links Úteis

- [Documentação Express.js](https://expressjs.com/)
- [Sequelize Docs](https://sequelize.org/)
- [JWT.io](https://jwt.io/) (decodificar tokens)
- [Joi Validation](https://joi.dev/api/) (validação)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**🎉 Parabéns! Agora você tem o backend do Módula funcionando!**