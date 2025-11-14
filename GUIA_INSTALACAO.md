# 🚀 Guia de Instalação - Sistema Módula

> **Guia completo para instalar e executar o Sistema Módula localmente**
> 
> Data: 14 de novembro de 2025

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação por Sistema Operacional](#instalação-por-sistema-operacional)
   - [Windows](#-windows)
   - [macOS](#-macos)
   - [Linux (Ubuntu/Debian)](#-linux-ubuntudebian)
3. [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
4. [Configuração do Backend](#-configuração-do-backend)
5. [Configuração do Frontend](#-configuração-do-frontend)
6. [Executando o Sistema](#-executando-o-sistema)
7. [Credenciais de Acesso](#-credenciais-de-acesso)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 Pré-requisitos

O sistema precisa dos seguintes softwares instalados:

- **Node.js** (versão 18 ou superior)
- **PostgreSQL** (versão 14 ou superior)
- **Git**
- **npm** ou **yarn** (vem com Node.js)

---

## 💻 Instalação por Sistema Operacional

### 🪟 Windows

#### 1. Instalar Node.js

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (recomendada)
3. Execute o instalador e siga as instruções
4. Verifique a instalação:
```bash
node --version
npm --version
```

#### 2. Instalar PostgreSQL

1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe o instalador do PostgreSQL
3. Execute o instalador
4. **IMPORTANTE:** Anote a senha do usuário `postgres` que você criar
5. Deixe a porta padrão: `5432`
6. Verifique a instalação:
```bash
psql --version
```

#### 3. Instalar Git

1. Acesse: https://git-scm.com/download/win
2. Baixe e instale o Git
3. Verifique:
```bash
git --version
```

---

### 🍎 macOS

#### 1. Instalar Homebrew (se não tiver)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Instalar Node.js

```bash
brew install node
node --version
npm --version
```

#### 3. Instalar PostgreSQL

```bash
brew install postgresql@14
brew services start postgresql@14

# Configurar senha do postgres
psql postgres
\password postgres
# Digite: postgres
# Confirme: postgres
\q
```

#### 4. Instalar Git (já vem instalado, mas pode atualizar)

```bash
brew install git
git --version
```

---

### 🐧 Linux (Ubuntu/Debian)

#### 1. Atualizar o sistema

```bash
sudo apt update
sudo apt upgrade -y
```

#### 2. Instalar Node.js

```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar
node --version
npm --version
```

#### 3. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar o serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar senha do postgres
sudo -u postgres psql
\password postgres
# Digite: postgres
# Confirme: postgres
\q
```

#### 4. Instalar Git

```bash
sudo apt install -y git
git --version
```

---

## 🗄️ Configuração do Banco de Dados

### Passo 1: Criar o Banco de Dados

**Windows (PowerShell ou CMD):**
```bash
psql -U postgres
```

**macOS/Linux:**
```bash
sudo -u postgres psql
# OU se já configurou senha:
psql -U postgres
```

**Digite a senha:** `postgres`

**Dentro do psql, execute:**
```sql
-- Criar o banco de dados
CREATE DATABASE modula;

-- Criar o usuário
CREATE USER modula_user WITH PASSWORD 'modula123';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE modula TO modula_user;

-- Conectar ao banco
\c modula

-- Dar permissões no schema public
GRANT ALL ON SCHEMA public TO modula_user;

-- Sair
\q
```

### Passo 2: Verificar a Conexão

```bash
psql -U postgres -d modula -c "SELECT version();"
```

Se aparecer a versão do PostgreSQL, está tudo certo! ✅

---

## ⚙️ Configuração do Backend

### Passo 1: Clonar o Repositório (se ainda não tiver)

```bash
git clone https://github.com/SainthixOli/modula.git
cd modula
```

### Passo 2: Instalar Dependências do Backend

```bash
cd backend
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/`:

**Windows (PowerShell):**
```powershell
cd backend
New-Item .env
notepad .env
```

**macOS/Linux:**
```bash
cd backend
nano .env
# OU
code .env
```

**Cole o seguinte conteúdo:**

```env
# Ambiente
NODE_ENV=development
PORT=3000

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=modula
DB_USER=modula_user
DB_PASSWORD=modula123
DB_DIALECT=postgres

# JWT Secret (para autenticação)
JWT_SECRET=modula_secret_key_super_secure_2025
JWT_EXPIRES_IN=24h

# CORS (Frontend)
FRONTEND_URL=http://localhost:8080
```

**Salve o arquivo** (Ctrl+S / Cmd+S)

### Passo 4: Criar as Tabelas do Banco

O sistema cria as tabelas automaticamente quando você inicia o backend pela primeira vez!

```bash
node server.js
```

Você verá mensagens como:
- ✅ Conexão com banco de dados estabelecida
- 🔄 Modelos sincronizados com o banco de dados
- 🎉 SERVIDOR INICIADO COM SUCESSO!

**Deixe o backend rodando!** ✅

---

## 🎨 Configuração do Frontend

### Abra um NOVO terminal (deixe o backend rodando)

**Windows:** Abra outro PowerShell/CMD
**macOS/Linux:** Abra outro terminal

### Passo 1: Navegar para o Frontend

```bash
cd frontend
# Se estiver na raiz do projeto, senão ajuste o caminho
```

### Passo 2: Instalar Dependências

```bash
npm install
```

### Passo 3: Executar o Frontend

```bash
npm run dev
```

Você verá:
```
VITE v5.4.20  ready in XXX ms

➜  Local:   http://localhost:8080/
➜  Network: http://192.168.X.X:8080/
```

---

## 🚀 Executando o Sistema

### Você deve ter 2 terminais abertos:

#### Terminal 1 - Backend
```bash
cd backend
node server.js
```
**URL:** http://localhost:3000

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
**URL:** http://localhost:8080

### Abrir o Sistema

Abra seu navegador e acesse:
```
http://localhost:8080
```

---

## 🔑 Credenciais de Acesso

### Para demonstração, use estas credenciais:

#### 👨‍💼 Administrador
- **Email:** `admin@modula.com`
- **Senha:** `Admin@2025`

#### 👨‍⚕️ Profissional de Saúde
- **Email:** `dr.joao@modula.com`
- **Senha:** `Dr.Joao@2025`

---

## 🎯 Verificação Rápida

Após executar tudo, verifique:

✅ **Backend rodando?**
- Acesse: http://localhost:3000/health
- Deve retornar: `{"status":"healthy"}`

✅ **Frontend rodando?**
- Acesse: http://localhost:8080
- Deve aparecer a tela de login

✅ **Login funcionando?**
- Use as credenciais de admin acima
- Deve entrar no dashboard

---

## 🛠️ Troubleshooting

### ❌ Erro: "Port 3000 already in use"

**Solução:**

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

### ❌ Erro: "ECONNREFUSED ::1:5432" ou "Não consegue conectar ao PostgreSQL"

**Solução:**

1. Verifique se o PostgreSQL está rodando:

**Windows:**
```bash
# Abra Serviços (services.msc)
# Procure por "postgresql" e inicie o serviço
```

**macOS:**
```bash
brew services start postgresql@14
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

2. Verifique a senha no arquivo `.env`:
```env
DB_PASSWORD=modula123
```

3. Tente conectar manualmente:
```bash
psql -U modula_user -d modula -h localhost
# Senha: modula123
```

---

### ❌ Erro: "npm install" falha com erro de permissão

**Linux/macOS:**
```bash
sudo chown -R $USER:$USER ~/.npm
npm install
```

---

### ❌ Frontend não carrega ou tela branca

1. Limpe o cache do navegador (Ctrl+Shift+R / Cmd+Shift+R)
2. Verifique se o backend está rodando
3. Abra o Console do navegador (F12) e veja os erros
4. Reinstale as dependências:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### ❌ Erro: "Module not found" no backend

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
node server.js
```

---

## 📊 Funcionalidades Disponíveis

### Como Admin (`admin@modula.com`):
- ✅ Dashboard administrativo
- ✅ Gestão de profissionais (criar, editar, visualizar)
- ✅ Sistema de transferências
- ✅ Notificações
- ✅ Backups
- ✅ Auditoria LGPD
- ✅ Monitoramento do sistema

### Como Profissional (`dr.joao@modula.com`):
- ✅ Dashboard personalizado
- ✅ Gestão de pacientes (CRUD completo)
- ✅ Calendário de consultas
- ✅ Agendamento de sessões
- ✅ Anamnese digital
- ✅ Histórico de consultas
- ✅ Notificações
- ✅ Transferência de pacientes

---

## 📝 Comandos Úteis

### Parar os servidores:
```bash
# Pressione Ctrl+C em cada terminal
```

### Reiniciar tudo:
```bash
# Terminal 1
cd backend
node server.js

# Terminal 2
cd frontend
npm run dev
```

### Ver logs do PostgreSQL:

**Windows:** Procure em `C:\Program Files\PostgreSQL\14\data\log\`

**macOS:** 
```bash
tail -f /usr/local/var/postgres/server.log
```

**Linux:**
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 🎓 Para o Professor

### Demonstração Rápida (5 minutos):

1. **Login como Admin** → Mostrar dashboard com estatísticas
2. **Criar novo profissional** → Mostrar formulário e validações
3. **Login como Profissional** → Mostrar dashboard
4. **Criar novo paciente** → CRUD completo
5. **Agendar consulta** → Calendário funcionando
6. **Ver histórico** → Página de sessões
7. **Mostrar integrações** → Notificações, transferências

### Pontos Fortes para Destacar:
- ✅ **100% funcional** - Sem dados mockados
- ✅ **Backend robusto** - Node.js + PostgreSQL + Sequelize
- ✅ **Frontend moderno** - React + TypeScript + Tailwind + shadcn/ui
- ✅ **Segurança** - JWT, bcrypt, rate limiting, CORS
- ✅ **LGPD** - Sistema completo de auditoria
- ✅ **Escalável** - Arquitetura profissional MVC

---

## 📞 Suporte

Se tiver problemas durante a instalação:

1. Verifique se todas as versões estão corretas:
```bash
node --version  # v18.x ou superior
npm --version   # 9.x ou superior
psql --version  # 14.x ou superior
```

2. Verifique se os serviços estão rodando:
- PostgreSQL: `telnet localhost 5432`
- Backend: http://localhost:3000/health
- Frontend: http://localhost:8080

3. Abra o Console do navegador (F12) e veja os logs

---

## ✨ Pronto para Apresentar!

Após seguir todos os passos, o sistema estará 100% funcional e pronto para demonstração!

**Boa sorte com a apresentação! 🎉**

---

**Desenvolvido com ❤️ pela equipe Módula**
