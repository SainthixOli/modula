
### **# 📚 MÓDULA BACKEND - GUIA COMPLETO DE DESENVOLVIMENTO

> **DOCUMENTO PARA EQUIPE DE DESENVOLVIMENTO**  
> Este é um guia completo e detalhado para que qualquer desenvolvedor possa dar continuidade ao projeto Backend do Módula. Contém todas as informações sobre o que existe, o que precisa ser implementado e como fazer.

---

## 📋 ÍNDICE GERAL

1. [VISÃO GERAL DO PROJETO](#1-visão-geral-do-projeto)
2. [ARQUITETURA E ESTRUTURA ATUAL](#2-arquitetura-e-estrutura-atual)
3. [SISTEMA IMPLEMENTADO](#3-sistema-implementado)
4. [ROADMAP DE DESENVOLVIMENTO](#4-roadmap-de-desenvolvimento)
5. [GUIA DE IMPLEMENTAÇÃO POR MÓDULO](#5-guia-de-implementação-por-módulo)
6. [NOMENCLATURA E PADRÕES](#6-nomenclatura-e-padrões)
7. [VALIDAÇÕES E SEGURANÇA](#7-validações-e-segurança)
8. [TESTING E QUALIDADE](#8-testing-e-qualidade)

---

# 1. VISÃO GERAL DO PROJETO

## 🎯 OBJETIVO DO SISTEMA

O **Módula** é uma plataforma completa de gestão para clínicas e consultórios de saúde que digitaliza e centraliza:

- **Gestão de Usuários:** Administradores e profissionais de saúde
- **Gestão de Pacientes:** Cadastro completo, histórico e prontuário digital
- **Anamnese Digital:** Questionários estruturados e personalizáveis
- **Registro de Consultas:** Evolução dos pacientes e histórico de sessões
- **Sistema de Transferências:** Mudança de pacientes entre profissionais
- **Relatórios:** Estatísticas e análises da clínica

## 🏗️ ARQUITETURA TÉCNICA

### **Stack Tecnológica**
- **Runtime:** Node.js 16+
- **Framework Web:** Express.js 4.18+
- **Banco de Dados:** PostgreSQL 12+
- **ORM:** Sequelize 6+ (Object-Relational Mapping)
- **Autenticação:** JSON Web Tokens (JWT) + bcryptjs
- **Validação:** Joi (Schema validation)
- **Email:** Nodemailer
- **Segurança:** Helmet, CORS, Rate Limiting
- **Testes:** Jest + Supertest
- **Documentação:** Swagger/OpenAPI (futura implementação)

### **Padrão Arquitetural**
O sistema segue o padrão **MVC (Model-View-Controller)** adaptado para APIs:
- **Models:** Definição de dados e relacionamentos (Sequelize)
- **Controllers:** Lógica de negócio e processamento
- **Routes:** Definição de endpoints da API
- **Middlewares:** Interceptadores para autenticação, validação e tratamento de erros
- **Services:** Lógica de negócio complexa e reutilizável

## 📊 STATUS ATUAL DO PROJETO

✅ IMPLEMENTADO (50% → 70%)
- Sistema de Autenticação (100%)
- Modelos User e Patient (100%)  
- Módulo Administração (100%)
- Módulo Profissional (100%) ← NOVO
- Associações entre modelos (100%)

⏳ PENDENTE (50% → 30%)
- Sistema de Anamnese
- Sistema de Consultas/Sessões  
- Sistema de Transferências (estrutura básica pronta)
- Testes automatizados

### 🔄 **EM DESENVOLVIMENTO (0%)**
- SISTEMA DE ANAMNESE
Com admin e profissional 100% funcionais, a próxima prioridade é:
ETAPA 3: SISTEMA DE ANAMNESE DIGITAL

Criar src/models/Anamnesis.js (estrutura completa)
Implementar src/routes/anamnesis.js (formulário dinâmico)
Desenvolver src/controllers/anamnesisController.js (auto-save)
Sistema de seções com validações específicas
Integração com modulo profissional

Características especiais da Anamnese:

✅ Formulário multi-step com progresso visual
✅ Auto-save a cada 30 segundos
✅ Validações específicas por seção
✅ Sistema de completude (%)
✅ Dados estruturados em JSON

---

# 2. **ARQUITETURA COMPLETA DO BACKEND (ATUAL E FUTURO)**

## 📁 ORGANIZAÇÃO DE DIRETÓRIOS

```
backend/
├── src/
│   ├── config/
│   │   └── config.js                   ✅ Configuração PostgreSQL/Sequelize
│   ├── controllers/
│   │   ├── adminController.js          ✅ Lógica de negócio do admin
│   │   ├── anamnesisController.js      ✅ Lógica de negócio da anamnese
│   │   ├── authController.js           ✅ Lógica de negócio de autenticação
│   │   ├── professionalController.js   ✅ Lógica de negócio do profissional
│   │   ├── sessionController.js        ⏳ CRIAR - Lógica do Módulo de Sessões
│   │   └── transferController.js       ⏳ CRIAR - Lógica do Módulo de Transferências
│   ├── database/
│   │   ├── config.js                   ✅ Configuração do banco de dados (Sequelize)
│   │   └── init.sql                    ✅ Script inicial do banco
│   ├── middleware/
│   │   ├── adminValidations.js         ✅ Validações de dados do admin
│   │   ├── anamnesisValidations.js     ✅ Validações de dados da anamnese
│   │   ├── auth.js                     ✅ Middlewares de autenticação (JWT)
│   │   ├── errorHandler.js             ✅ Tratamento centralizado de erros
│   │   └── professionalValidations.js  ✅ Validações de dados do profissional
│   ├── models/
│   │   ├── Anamnesis.js                ✅ Modelo de dados da anamnese
│   │   ├── index.js                    ✅ Associações entre os modelos (Sequelize)
│   │   ├── Patient.js                  ✅ Modelo de dados de pacientes
│   │   ├── Session.js                  ⏳ CRIAR - Modelo do Módulo de Sessões
│   │   ├── Transfer.js                 ⏳ CRIAR - Modelo do Módulo de Transferências
│   │   └── User.js                     ✅ Modelo de dados de usuários
│   ├── routes/
│   │   ├── admin.js                    ✅ Rotas administrativas
│   │   ├── anamnesis.js                ✅ Rotas do sistema de anamnese
│   │   ├── auth.js                     ✅ Rotas de autenticação
│   │   ├── professional.js             ✅ Rotas do profissional
│   │   ├── sessions.js                 ⏳ CRIAR - Rotas do Módulo de Sessões
│   │   └── transfers.js                ⏳ CRIAR - Rotas do Módulo de Transferências
│   ├── services/
│   │   └── reportService.js            ⏳ CRIAR - Lógica de negócio complexa para relatórios
│   └── utils/
│       └── chartHelpers.js             ⏳ CRIAR - Utilitários para gerar gráficos
├── tests/
│   ├── unit/                           ⏳ CRIAR - Testes unitários
│   ├── integration/                    ⏳ CRIAR - Testes de integração
│   ├── e2e/                            ⏳ CRIAR - Testes End-to-End
│   └── fixtures/                       ⏳ CRIAR - Dados de teste (mocks)
├── .env.example                        ✅ Template de variáveis de ambiente
├── .gitignore                          ✅ Arquivo para ignorar arquivos no Git
├── DOCUMENTACAO_BACKEND.md             ✅ Documentação completa do projeto
├── package.json                        ✅ Dependências e scripts do projeto
└── server.js                           ✅ Arquivo principal do servidor Express
```

---

## 🔧 CONFIGURAÇÕES PRINCIPAIS

### **server.js - Configuração do Servidor**
**Funcionalidades Implementadas:**
- Inicialização do Express
- Configuração de middlewares de segurança (Helmet, CORS)
- Rate limiting (100 requisições por 15 minutos)
- Parser JSON para requisições
- Logging de requisições (Morgan)
- Conexão com banco de dados
- Rotas principais
- Tratamento de erros global

**Middlewares Ativos:**
- `helmet()` - Headers de segurança HTTP
- `cors()` - Política de compartilhamento de recursos
- `rateLimit()` - Proteção contra ataques de força bruta
- `express.json()` - Parser de JSON
- `morgan('combined')` - Logs detalhados de requisições

### **database.js - Configuração do Banco**
**Funcionalidades Implementadas:**
- Configuração de conexão PostgreSQL
- Pool de conexões otimizado (máx 20, mín 0)
- Configurações específicas por ambiente (dev/test/prod)
- SSL para produção
- Timezone configurado para Brasília (-03:00)
- Definições padrão para modelos (timestamps, underscored)

---

# 3. SISTEMA IMPLEMENTADO

## 🔐 MÓDULO DE AUTENTICAÇÃO (100% COMPLETO)

### **auth.js - Rotas de Autenticação**

#### **Endpoints Implementados:**

**1. `POST /api/auth/login`**
- **Finalidade:** Autenticar usuários (admin/profissional)
- **Input:** `{ email, password }`
- **Processo:** Valida dados → Busca usuário → Verifica senha → Atualiza último login → Gera tokens
- **Output:** `{ user_data, access_token, refresh_token }`
- **Validações:** Email formato válido, senha mínimo 6 caracteres
- **Segurança:** Senha hasheada com bcrypt, tokens JWT

**2. `POST /api/auth/refresh-token`**
- **Finalidade:** Renovar access token expirado
- **Input:** `{ refresh_token }`
- **Processo:** Valida refresh token → Verifica usuário ativo → Gera novo access token
- **Output:** `{ access_token }`
- **Validações:** Refresh token válido e não expirado

**3. `POST /api/auth/forgot-password`**
- **Finalidade:** Solicitar recuperação de senha via email
- **Input:** `{ email }`
- **Processo:** Busca usuário → Gera token único → Envia email com link
- **Output:** Confirmação de envio
- **Segurança:** Token expira em 1 hora, hasheado no banco

**4. `POST /api/auth/reset-password`**
- **Finalidade:** Redefinir senha com token de recuperação
- **Input:** `{ token, password, confirmPassword }`
- **Processo:** Valida token → Verifica expiração → Atualiza senha → Marca não primeiro acesso
- **Validações:** Senha complexa (8+ chars, maiúscula, minúscula, número, especial)

**5. `POST /api/auth/first-access`**
- **Finalidade:** Alteração obrigatória de senha no primeiro login
- **Input:** `{ password, confirmPassword }`
- **Processo:** Verifica primeiro acesso → Atualiza senha → Marca como acessado → Gera novos tokens
- **Segurança:** Força alteração de senha temporária

**6. `POST /api/auth/validate-token`**
- **Finalidade:** Verificar se token ainda é válido
- **Input:** Token no header Authorization
- **Output:** Dados do usuário autenticado

**7. `POST /api/auth/logout`**
- **Finalidade:** Finalizar sessão do usuário
- **Processo:** Confirma logout (futura implementação de blacklist)

### **auth.js - Middlewares de Autenticação**

#### **Middlewares Implementados:**

**1. `validateToken(req, res, next)`**
- **Função:** Validar JWT em todas as rotas protegidas
- **Processo:** Extrai token → Decodifica JWT → Busca usuário → Verifica status ativo
- **Adiciona ao req:** `req.user`, `req.userId`, `req.userType`
- **Erros Tratados:** Token ausente, inválido, expirado, usuário inexistente/inativo

**2. `requireAdmin(req, res, next)`**
- **Função:** Permitir acesso apenas para administradores
- **Uso:** Deve ser usado APÓS validateToken
- **Verifica:** Se `req.user.user_type === 'admin'`

**3. `requireProfessional(req, res, next)`**
- **Função:** Permitir acesso apenas para profissionais
- **Uso:** Deve ser usado APÓS validateToken
- **Verifica:** Se `req.user.user_type === 'professional'`

**4. `requireUserTypes(allowedTypes)`**
- **Função:** Middleware flexível para múltiplos tipos
- **Uso:** `requireUserTypes(['admin', 'professional'])`
- **Verifica:** Se tipo do usuário está na lista permitida

**5. `checkFirstAccess(req, res, next)`**
- **Função:** Forçar alteração de senha no primeiro acesso
- **Processo:** Verifica `is_first_access` → Permite apenas rotas de alteração de senha

**6. `checkResourceOwnership(model, idParam)`**
- **Função:** Verificar se recurso pertence ao usuário (exceto admin)
- **Uso:** Proteger dados de pacientes de outros profissionais
- **Processo:** Busca recurso → Verifica `resource.user_id === req.userId`

#### **Funções Utilitárias:**

**1. `generateToken(user)`**
- **Função:** Gerar JWT access token
- **Payload:** userId, email, userType, isFirstAccess
- **Expiração:** 24h (configurável via ENV)

**2. `generateRefreshToken(user)`**
- **Função:** Gerar JWT refresh token
- **Payload:** userId, type: 'refresh'
- **Expiração:** 7 dias (configurável via ENV)

**3. `validateRefreshToken(req, res, next)`**
- **Função:** Middleware específico para validar refresh tokens
- **Processo:** Valida refresh token → Verifica tipo → Busca usuário

## 👥 MODELOS DE DADOS (90% COMPLETO)

### **User.js - Modelo de Usuários**

#### **Campos do Modelo:**
- `id` - UUID único (chave primária)
- `full_name` - Nome completo (2-150 chars, obrigatório)
- `email` - Email único (formato válido, lowercase)
- `professional_register` - CRP/CRM (3-20 chars, único)
- `password` - Senha hasheada (bcrypt rounds 12)
- `user_type` - ENUM: 'admin' | 'professional'
- `status` - ENUM: 'active' | 'inactive' | 'suspended'
- `is_first_access` - Boolean (padrão true)
- `reset_password_token` - String para recuperação
- `reset_password_expires` - Timestamp de expiração
- `last_login` - Data do último acesso
- `metadata` - JSONB para dados extras

#### **Hooks Implementados:**
- `beforeCreate` - Hash da senha antes de salvar
- `beforeUpdate` - Hash da senha se alterada
- `afterFind` - Remove campos sensíveis da resposta

#### **Métodos de Instância:**
- `validatePassword(password)` - Compara senha com hash bcrypt
- `generateResetToken()` - Gera token de recuperação SHA256
- `isAdmin()` - Verifica se user_type é 'admin'
- `isProfessional()` - Verifica se user_type é 'professional'
- `isActive()` - Verifica se status é 'active'
- `updateLastLogin()` - Atualiza campo last_login

#### **Métodos Estáticos:**
- `findByEmail(email)` - Busca usuário por email
- `findByResetToken(token)` - Busca por token de recuperação válido
- `findActiveProfessionals()` - Lista profissionais ativos

### **Patient.js - Modelo de Pacientes**

#### **Campos do Modelo:**
**Identificação:**
- `id` - UUID único
- `user_id` - FK para profissional responsável (obrigatório)
- `full_name` - Nome completo (2-150 chars)
- `birth_date` - Data nascimento (DATEONLY)
- `gender` - ENUM: 'male'|'female'|'other'|'not_informed'

**Documentos:**
- `cpf` - CPF formatado (único)
- `rg` - RG do paciente

**Contato:**
- `phone` - Telefone (10-20 chars)
- `email` - Email opcional
- `address` - JSONB com endereço completo
- `emergency_contact` - JSONB com contato de emergência

**Dados Pessoais:**
- `marital_status` - ENUM: 'single'|'married'|'divorced'|'widowed'|'other'
- `occupation` - Profissão (100 chars)
- `insurance_info` - JSONB com dados do convênio

**Dados Clínicos:**
- `status` - ENUM: 'active'|'inactive'|'discharged'|'transferred'
- `medical_history` - TEXT histórico médico
- `current_medications` - TEXT medicações atuais
- `allergies` - TEXT alergias conhecidas
- `notes` - TEXT observações gerais

**Controle:**
- `first_appointment` - Data primeira consulta
- `last_appointment` - Data última consulta
- `metadata` - JSONB dados extras

#### **Métodos de Instância:**
- `getAge()` - Calcula idade baseada na data de nascimento
- `isActive()` - Verifica se status é 'active'
- `updateLastAppointment()` - Atualiza data da última consulta
- `getBasicInfo()` - Retorna dados básicos sem informações sensíveis

#### **Métodos Estáticos:**
- `findActiveByProfessional(userId)` - Pacientes ativos de um profissional
- `findByCpf(cpf)` - Busca paciente por CPF
- `getStatsByProfessional(userId)` - Estatísticas por profissional
- `findWithRecentAppointments(userId, days)` - Pacientes com consultas recentes

## 🏢 MÓDULO ADMINISTRAÇÃO (100% COMPLETO)

### Arquivos Implementados:
- `src/models/index.js` - Associações entre modelos
- `src/routes/admin.js` - 12 endpoints administrativos
- `src/controllers/adminController.js` - 11 funções de controle
- `src/middleware/adminValidations.js` - 8 middlewares de validação

### Endpoints Funcionais:
- Dashboard com estatísticas em tempo real
- CRUD completo de profissionais com validações
- Sistema de ativação/desativação
- Reset de senhas com senhas temporárias
- Relatórios detalhados de produtividade

## 🛡️ SISTEMA DE SEGURANÇA (100% COMPLETO)

### **errorHandler.js - Tratamento de Erros**

#### **Tipos de Erro Tratados:**
- **ValidationError (Sequelize)** - Erros de validação de dados
- **UniqueConstraintError** - Violação de constraint única (email duplicado)
- **ForeignKeyConstraintError** - Violação de chave estrangeira
- **CastError** - Formato de ID inválido
- **SyntaxError** - JSON malformado
- **JsonWebTokenError** - Token JWT inválido
- **TokenExpiredError** - Token JWT expirado

#### **Classes Customizadas:**

**1. `AppError`**
- **Função:** Erro customizado da aplicação
- **Propriedades:** message, statusCode, code, isOperational
- **Uso:** `throw new AppError('Mensagem', 400, 'CODIGO_ERRO')`

#### **Funções Utilitárias:**
- `asyncHandler(fn)` - Wrapper para capturar erros em funções async
- `createValidationError(field, message)` - Criar erro de validação
- `createAuthorizationError(message)` - Criar erro de autorização
- `createAuthenticationError(message)` - Criar erro de autenticação
- `createNotFoundError(resource)` - Criar erro de recurso não encontrado

#### **Middleware Global:**
- `errorHandler(error, req, res, next)` - Captura todos os erros da aplicação
- `notFound(req, res, next)` - Captura rotas inexistentes (404)

---

## 👨‍⚕️ MÓDULO PROFISSIONAL (100% COMPLETO)

### Arquivos Implementados:
- `src/routes/professional.js` - 25 endpoints funcionais
- `src/controllers/professionalController.js` - 25 funções de controle
- `src/middleware/professionalValidations.js` - 12 middlewares de validação

### Funcionalidades Principais:
- Dashboard personalizado com estatísticas em tempo real
- CRUD completo de pacientes com isolamento de dados
- Sistema de busca e filtros avançados
- Validações robustas incluindo CPF e dados clínicos
- Preparação para anamnese e sistema de sessões

---

## 📅 MODELO SESSION (100% COMPLETO)

### Arquivo Implementado:
- `src/models/Session.js` - Modelo completo de consultas e sessões

### Funcionalidades:
- 9 tipos de sessão especializados
- Sistema de status com workflow completo  
- Controle de duração e horários reais
- Avaliação de progresso e engajamento
- Sistema básico de cobrança
- Detecção de conflitos de horário
- Numeração sequencial automática
- Hooks de sincronização com pacientes
- Relatórios de produtividade
- 15+ métodos especializados

#### **Associações Configuradas**
- `src/models/index.js` - Relacionamentos entre Session ↔ Patient ↔ User

#### **Funcionalidades:**
- 9 tipos de sessão especializados
- Sistema de status com workflow completo  
- Controle de duração e horários reais
- Avaliação de progresso e engajamento
- Sistema básico de cobrança
- Detecção de conflitos de horário
- Numeração sequencial automática
- Hooks de sincronização com pacientes
- Relatórios de produtividade
- 15+ métodos especializados

#### **Relacionamentos Implementados:**
- **Session belongsTo Patient** (CASCADE on delete)
- **Session belongsTo User** (RESTRICT on delete)
- **Patient hasMany Sessions** (histórico completo)
- **User hasMany Sessions** (consultas do profissional)

---

### **VALIDAÇÕES DE SESSÃO (100% COMPLETO)**

#### **Arquivo Implementado:**
- `src/middleware/sessionValidations.js` - Validações completas do sistema de sessões

#### **Schemas Joi Implementados:**
- **createSessionSchema** - 9 campos validados para criação
- **updateScheduledSessionSchema** - Atualização flexível com validação condicional
- **recordSessionEvolutionSchema** - 15 campos para registro de evolução clínica
- **listSessionsSchema** - Filtros avançados com paginação

#### **Middlewares de Validação:**
- `validateCreateSession` - Validação de criação com defaults
- `validateUpdateScheduledSession` - Validação parcial (mínimo 1 campo)
- `validateRecordEvolution` - Validação clínica rigorosa
- `validateListSessions` - Validação de query params
- `validateSessionId` - Validação de UUID em rotas
- `validateNoScheduleConflict` - Detecção inteligente de conflitos

#### **Recursos Especiais:**
- ✅ Validação de horários com regex HH:MM
- ✅ Detecção automática de conflitos de agendamento
- ✅ Validação condicional (reason obrigatório em cancelamento)
- ✅ Ranges de data com validação cruzada
- ✅ Suporte a 9 tipos diferentes de sessão
- ✅ Validações de engajamento (1-10) e progresso
- ✅ Mensagens de erro em português

---

# 4. ROADMAP DE DESENVOLVIMENTO

## 🗓️ CRONOGRAMA GERAL

### **FASE 1: ADMINISTRAÇÃO (Semanas 1-2)**
- **Objetivo:** Sistema completo de gestão administrativa
- **Entregáveis:** Dashboard admin, CRUD profissionais, gestão transferências
- **Prioridade:** ALTA - Base para todo o sistema

### **FASE 2: PROFISSIONAIS (Semanas 3-4)**
- **Objetivo:** Interface completa para profissionais de saúde
- **Entregáveis:** Dashboard profissional, gestão pacientes, agenda básica
- **Prioridade:** ALTA - Core do sistema

### **FASE 3: ANAMNESE DIGITAL (Semanas 5-6)**
- **Objetivo:** Sistema de anamnese estruturada e personalizável
- **Entregáveis:** Modelo Anamnese, formulário dinâmico, validações específicas
- **Prioridade:** MÉDIA - Diferencial competitivo

### **FASE 4: CONSULTAS E SESSÕES (Semanas 7-8)**
- **Objetivo:** Registro completo de evolução dos pacientes
- **Entregáveis:** Modelo Session, histórico, relatórios de evolução
- **Prioridade:** MÉDIA - Essencial para continuidade

### **FASE 5: TRANSFERÊNCIAS (Semana 9)**
- **Objetivo:** Sistema de transferência de pacientes entre profissionais
- **Entregáveis:** Modelo Transfer, workflow de aprovação, notificações
- **Prioridade:** BAIXA - Funcionalidade específica

### **FASE 6: RELATÓRIOS E ANALYTICS (Semana 10)**
- **Objetivo:** Dashboards avançados e relatórios gerenciais
- **Entregáveis:** Estatísticas detalhadas, gráficos, exportações
- **Prioridade:** BAIXA - Nice to have

---

# 5. GUIA DE IMPLEMENTAÇÃO POR MÓDULO

## 🏢 MÓDULO ADMINISTRAÇÃO

### **Objetivo**
Sistema completo para administradores gerenciarem a clínica, incluindo profissionais, estatísticas e transferências.

### **Arquivos a Criar:**

#### **`src/routes/admin.js`**
**Responsabilidade:** Definir todos os endpoints administrativos

**Endpoints Necessários:**
1. `GET /api/admin/dashboard` - Carregar dashboard com estatísticas
2. `GET /api/admin/professionals` - Listar profissionais com filtros e paginação
3. `POST /api/admin/professionals` - Criar novo profissional
4. `GET /api/admin/professionals/:id` - Obter detalhes de um profissional
5. `PUT /api/admin/professionals/:id` - Atualizar dados do profissional
6. `PUT /api/admin/professionals/:id/status` - Ativar/desativar profissional
7. `POST /api/admin/professionals/:id/reset-password` - Resetar senha
8. `GET /api/admin/transfers` - Listar solicitações de transferência
9. `PUT /api/admin/transfers/:id/approve` - Aprovar transferência
10. `PUT /api/admin/transfers/:id/reject` - Rejeitar transferência
11. `GET /api/admin/stats/overview` - Estatísticas gerais
12. `GET /api/admin/stats/monthly` - Dados mensais

**Middlewares Necessários:**
- `validateToken` (já aplicado no server.js)
- `requireAdmin` (verificar se é admin)
- Middlewares de validação específicos para cada endpoint

#### **`src/controllers/adminController.js`**
**Responsabilidade:** Lógica de negócio para operações administrativas

**Funções Obrigatórias:**

**1. `getDashboard(req, res)`**
- **Objetivo:** Carregar dados do dashboard administrativo
- **Dados Necessários:**
  - Número de profissionais ativos/inativos
  - Total de pacientes na clínica
  - Pacientes ativos/inativos
  - Transferências pendentes
  - Consultas do mês atual
  - Novos cadastros da semana
- **Processamento:** Agregar dados de múltiplas tabelas
- **Retorno:** Objeto com todas as estatísticas formatadas

**2. `listProfessionals(req, res)`**
- **Objetivo:** Listar profissionais com filtros e paginação
- **Parâmetros Query:**
  - `page` - Página atual (padrão 1)
  - `limit` - Itens por página (padrão 20)
  - `search` - Busca por nome, email ou registro
  - `status` - Filtro por status
  - `sortBy` - Campo de ordenação
  - `order` - ASC ou DESC
- **Processamento:** Construir query dinâmica com where conditions
- **Retorno:** Array de profissionais + metadados de paginação

**3. `createProfessional(req, res)`**
- **Objetivo:** Criar novo profissional no sistema
- **Validações Necessárias:**
  - Email único
  - Registro profissional único (se informado)
  - Dados obrigatórios presentes
- **Processamento:**
  - Gerar senha temporária segura
  - Criar usuário no banco
  - Enviar email com credenciais (implementação futura)
  - Log da operação
- **Retorno:** Dados do profissional criado + senha temporária (apenas uma vez)
- **Cuidados:** Nunca retornar senha em outras operações

**4. `getProfessionalById(req, res)`**
- **Objetivo:** Obter detalhes completos de um profissional
- **Processamento:**
  - Buscar profissional por ID
  - Incluir estatísticas básicas (número de pacientes)
  - Incluir data de último login
- **Retorno:** Dados completos do profissional (exceto senha)

**5. `updateProfessional(req, res)`**
- **Objetivo:** Atualizar dados de um profissional
- **Campos Atualizáveis:**
  - full_name, email, professional_register
  - Não permitir alteração de senha aqui
- **Validações:** Email único, registro único
- **Processamento:** Validar dados → Atualizar → Log da alteração
- **Retorno:** Dados atualizados

**6. `toggleProfessionalStatus(req, res)`**
- **Objetivo:** Ativar/desativar profissional
- **Processamento:**
  - Verificar status atual
  - Alternar entre 'active' e 'inactive'
  - Não permitir exclusão, apenas desativação
  - Log da operação
- **Retorno:** Status atualizado

**7. `resetProfessionalPassword(req, res)`**
- **Objetivo:** Gerar nova senha temporária
- **Processamento:**
  - Gerar senha temporária segura
  - Atualizar no banco
  - Marcar como primeiro acesso
  - Enviar email com nova senha
  - Log da operação
- **Retorno:** Confirmação da operação
- **Segurança:** Não retornar senha na resposta (enviar só por email)

#### **`src/middleware/adminValidations.js`**
**Responsabilidade:** Schemas Joi para validação de dados administrativos

**Schemas Necessários:**

**1. `createProfessionalSchema`**
- Campos obrigatórios: full_name, email
- Campos opcionais: professional_register
- Validações específicas de formato

**2. `updateProfessionalSchema`**
- Todos os campos opcionais
- Pelo menos um campo deve estar presente
- Mesmas validações de formato

**3. `transferActionSchema`**
- Campo obrigatório: action ('approve' | 'reject')
- Campo opcional: reason (obrigatório para reject)

### **Funcionalidades Específicas:**

#### **Dashboard Administrativo**
**Dados a Exibir:**
- Cards com números principais (profissionais, pacientes, transferências)
- Gráfico de evolução mensal de cadastros
- Lista de últimas atividades
- Alertas de sistema (contas inativas, transferências pendentes)

#### **Gestão de Profissionais**
**Funcionalidades:**
- Tabela com todos os profissionais
- Filtros por status, busca por nome/email
- Paginação com controle de itens por página
- Ações: visualizar, editar, ativar/desativar, resetar senha
- Modal de criação com formulário validado
- Modal de confirmação para ações críticas

#### **Sistema de Transferências**
**Workflow:**
1. Profissional solicita transferência de paciente
2. Admin recebe notificação
3. Admin pode aprovar ou rejeitar com motivo
4. Se aprovado, paciente é transferido
5. Histórico da transferência é mantido
6. Ambos profissionais são notificados

---

## 👨‍⚕️ MÓDULO PROFISSIONAL

### **Objetivo**
Interface completa para profissionais gerenciarem seus pacientes, consultas e agenda.

### **Arquivos a Criar:**

#### **`src/routes/professional.js`**
**Responsabilidade:** Endpoints para operações dos profissionais

**Endpoints Necessários:**
1. `GET /api/professional/dashboard` - Dashboard com visão geral
2. `GET /api/professional/patients` - Listar meus pacientes
3. `POST /api/professional/patients` - Cadastrar novo paciente
4. `GET /api/professional/patients/:id` - Detalhes de um paciente
5. `PUT /api/professional/patients/:id` - Atualizar paciente
6. `PUT /api/professional/patients/:id/status` - Alterar status do paciente
7. `POST /api/professional/patients/:id/transfer` - Solicitar transferência
8. `GET /api/professional/schedule/today` - Agenda de hoje
9. `GET /api/professional/schedule/week` - Agenda da semana
10. `GET /api/professional/stats` - Minhas estatísticas

#### **`src/controllers/professionalController.js`**
**Responsabilidade:** Lógica específica para profissionais

**Funções Obrigatórias:**

**1. `getDashboard(req, res)`**
- **Objetivo:** Carregar dashboard do profissional
- **Dados Necessários:**
  - Total de pacientes ativos
  - Consultas agendadas para hoje
  - Consultas da semana
  - Pacientes cadastrados recentemente
  - Anamneses pendentes
  - Próximas consultas
- **Filtro:** Apenas dados do profissional logado (req.userId)

**2. `getMyPatients(req, res)`**
- **Objetivo:** Listar pacientes do profissional logado
- **Filtros Query:**
  - `status` - Status do paciente
  - `search` - Busca por nome ou CPF
  - `page`, `limit` - Paginação
  - `hasRecentAppointment` - Filtro por consultas recentes
- **Processamento:** Buscar apenas pacientes onde `user_id = req.userId`
- **Retorno:** Lista de pacientes com dados básicos

**3. `createPatient(req, res)`**
- **Objetivo:** Cadastrar novo paciente
- **Validações:**
  - CPF único (se informado)
  - Email único (se informado)
  - Dados obrigatórios presentes
- **Processamento:**
  - Associar ao profissional logado (user_id = req.userId)
  - Criar paciente no banco
  - Log da operação
- **Retorno:** Dados do paciente criado + sugestão de próximo passo (anamnese)

**4. `getPatientById(req, res)`**
- **Objetivo:** Obter detalhes completos de um paciente
- **Segurança:** Verificar se paciente pertence ao profissional logado
- **Dados Incluídos:**
  - Todas as informações do paciente
  - Estatísticas (número de consultas, última consulta)
  - Status da anamnese
- **Retorno:** Dados completos organizados por seções

**5. `updatePatient(req, res)`**
- **Objetivo:** Atualizar dados de um paciente
- **Segurança:** Verificar ownership antes de atualizar
- **Campos Permitidos:** Todos exceto user_id
- **Processamento:** Validar dados → Atualizar → Log
- **Retorno:** Dados atualizados

**6. `requestPatientTransfer(req, res)`**
- **Objetivo:** Solicitar transferência de paciente para outro profissional
- **Dados Necessários:**
  - ID do profissional destino
  - Motivo da transferência
- **Processamento:**
  - Verificar se paciente pertence ao profissional
  - Validar se profissional destino existe e está ativo
  - Criar registro de transferência com status 'pending'
  - Notificar administradores
  - Log da solicitação
- **Retorno:** Confirmação da solicitação

**7. `getTodaySchedule(req, res)`**
- **Objetivo:** Obter agenda do dia atual
- **Processamento:**
  - Buscar consultas/sessões agendadas para hoje
  - Incluir dados básicos dos pacientes
  - Ordenar por horário
- **Retorno:** Lista de consultas do dia

### **Funcionalidades Específicas:**

#### **Dashboard do Profissional**
**Dados a Exibir:**
- Cards com números principais (pacientes ativos, consultas hoje)
- Lista de consultas do dia com horários
- Pacientes cadastrados recentemente
- Anamneses pendentes de preenchimento
- Ações rápidas (novo paciente, nova consulta)

#### **Gestão de Pacientes**
**Funcionalidades:**
- Tabela com todos os meus pacientes
- Filtros por status, busca por nome/CPF
- Ações: visualizar prontuário, editar, anamnese, nova consulta
- Modal de cadastro com formulário completo
- Validações em tempo real

---

## 📋 MÓDULO ANAMNESE DIGITAL

### **Objetivo**
Sistema completo de anamnese digital estruturada e personalizável para coleta de dados iniciais dos pacientes.

### **Arquivos a Criar:**

#### **`src/models/Anamnesis.js`**
**Responsabilidade:** Modelo de dados para anamneses

**Campos Necessários:**

**Identificação:**
- `id` - UUID único
- `patient_id` - FK para paciente (obrigatório)
- `user_id` - FK para profissional responsável
- `created_at`, `updated_at` - Timestamps automáticos

**Status e Controle:**
- `status` - ENUM: 'draft' | 'in_progress' | 'completed'
- `completion_percentage` - INTEGER (0-100)
- `completed_at` - DATETIME (quando foi finalizada)
- `last_modified_section` - String (última seção editada)

**Seções da Anamnese:**

**1. História Pessoal:**
- `personal_history` - JSONB com:
  - Local de nascimento
  - Escolaridade
  - Estado civil
  - Filhos (quantidade)
  - Religião/crenças
  - Situação socioeconômica

**2. História Familiar:**
- `family_history` - JSONB com:
  - Dados dos pais (vivos, idade, saúde)
  - Irmãos e suas condições
  - Histórico de doenças mentais na família
  - Doenças genéticas
  - Relacionamento familiar

**3. História Médica:**
- `medical_history` - JSONB com:
  - Doenças crônicas
  - Cirurgias realizadas
  - Internações
  - Medicações atuais
  - Alergias conhecidas
  - Acompanhamento médico atual

**4. História Psicológica:**
- `psychological_history` - JSONB com:
  - Tratamentos psicológicos anteriores
  - Internações psiquiátricas
  - Uso de medicação psiquiátrica
  - Tentativas de autolesão
  - Eventos traumáticos

**5. Queixa Atual:**
- `current_complaint` - JSONB com:
  - Queixa principal
  - Quando começou
  - Fatores desencadeantes
  - Como afeta a vida
  - O que já tentou para resolver

**6. Estilo de Vida:**
- `lifestyle` - JSONB com:
  - Padrão de sono
  - Alimentação
  - Atividade física
  - Vida social
  - Trabalho/estudos
  - Uso de substâncias

**7. Objetivos do Tratamento:**
- `treatment_goals` - JSONB com:
  - Objetivos do paciente
  - Expectativas com o tratamento
  - Disponibilidade para sessões
  - Suporte familiar

**Metadados:**
- `metadata` - JSONB para dados extras
- `notes` - TEXT para observações do profissional

**Métodos Necessários:**
- `calculateCompletionPercentage()` - Calcular % preenchido
- `isCompleted()` - Verificar se está completa
- `markAsCompleted()` - Finalizar anamnese
- `getSummary()` - Resumo para exibição
- `validateSection(sectionName)` - Validar seção específica

#### **`src/routes/anamnesis.js`**
**Endpoints Necessários:**
1. `GET /api/patients/:patientId/anamnesis` - Obter anamnese do paciente
2. `POST /api/patients/:patientId/anamnesis` - Criar nova anamnese
3. `PUT /api/patients/:patientId/anamnesis` - Atualizar anamnese completa
4. `PUT /api/patients/:patientId/anamnesis/section/:section` - Atualizar seção específica
5. `POST /api/patients/:patientId/anamnesis/complete` - Marcar como completa
6. `GET /api/professional/anamnesis/pending` - Anamneses pendentes

#### **`src/controllers/anamnesisController.js`**

**Funções Obrigatórias:**

**1. `getPatientAnamnesis(req, res)`**
- **Objetivo:** Obter anamnese de um paciente específico
- **Segurança:** Verificar se paciente pertence ao profissional
- **Processamento:**
  - Buscar anamnese existente
  - Se não existe, retornar estrutura vazia
  - Calcular percentual de preenchimento
- **Retorno:** Dados da anamnese organizados por seções

**2. `createAnamnesis(req, res)`**
- **Objetivo:** Criar nova anamnese para paciente
- **Validações:**
  - Verificar se paciente existe
  - Verificar se não existe anamnese ativa
  - Validar propriedade do paciente
- **Processamento:**
  - Criar registro inicial
  - Status 'draft'
  - Associar ao profissional e paciente
- **Retorno:** Anamnese criada

**3. `updateAnamnesisSection(req, res)`**
- **Objetivo:** Atualizar seção específica da anamnese
- **Parâmetros:** section (personal_history, family_history, etc.)
- **Validações:**
  - Validar se seção existe
  - Validar dados da seção
  - Verificar propriedade
- **Processamento:**
  - Atualizar seção específica
  - Recalcular percentual de completude
  - Atualizar last_modified_section
  - Auto-save (salvar automaticamente)
- **Retorno:** Seção atualizada + novo percentual

**4. `completeAnamnesis(req, res)`**
- **Objetivo:** Marcar anamnese como finalizada
- **Validações:**
  - Verificar se todas as seções obrigatórias estão preenchidas
  - Pelo menos 80% de completude
- **Processamento:**
  - Alterar status para 'completed'
  - Definir completed_at
  - Calcular completude final
- **Retorno:** Confirmação de finalização

### **Funcionalidades Específicas:**

#### **Interface de Anamnese**
**Características:**
- Formulário multi-step com progresso visual
- Auto-save a cada 30 segundos
- Validação em tempo real
- Seções colapsáveis
- Indicador de campos obrigatórios
- Possibilidade de salvar rascunho

#### **Validações Específicas**
**Regras de Negócio:**
- Seções obrigatórias: current_complaint, personal_history, medical_history
- Seções opcionais: family_history, psychological_history
- Campos obrigatórios dentro de cada seção
- Validações de formato (datas, números, etc.)

---

## 📊 MÓDULO CONSULTAS E SESSÕES

### **Objetivo**
Sistema completo para registro de consultas/sessões e acompanhamento da evolução dos pacientes.

### **Arquivos a Criar:**

#### **`src/models/Session.js`**
**Responsabilidade:** Modelo para registro de consultas/sessões

**Campos Necessários:**

**Identificação:**
- `id` - UUID único
- `patient_id` - FK para paciente (obrigatório)
- `user_id` - FK para profissional
- `session_number` - INTEGER (número sequencial por paciente)

**Dados da Sessão:**
- `session_date` - DATETIME (data e hora da sessão)
- `session_type` - ENUM: 'first_consultation' | 'follow_up' | 'emergency' | 'discharge'
- `duration_minutes` - INTEGER (duração em minutos)
- `session_status` - ENUM: 'scheduled' | 'completed' | 'cancelled' | 'no_show'

**Conteúdo:**
- `session_notes` - TEXT (evolução da sessão)
- `patient_mood` - STRING (humor do paciente)
- `main_topics` - JSONB (array com tópicos abordados)
- `interventions_used` - JSONB (técnicas utilizadas)
- `homework_assigned` - TEXT (tarefas para casa)

**Avaliação:**
- `progress_assessment` - ENUM: 'improved' | 'stable' | 'worsened' | 'no_change'
- `patient_engagement` - INTEGER (1-10, engajamento do paciente)
- `treatment_adherence` - ENUM: 'full' | 'partial' | 'minimal' | 'none'

**Planejamento:**
- `next_session_date` - DATETIME (próxima sessão agendada)
- `next_session_goals` - TEXT (objetivos para próxima sessão)
- `treatment_plan_updates` - TEXT (ajustes no plano de tratamento)

**Metadados:**
- `metadata` - JSONB
- `is_billable` - BOOLEAN (se deve ser faturada)
- `payment_status` - ENUM: 'pending' | 'paid' | 'cancelled'

**Métodos Necessários:**
- `getDuration()` - Calcular duração formatada
- `isCompleted()` - Verificar se sessão foi realizada
- `getFormattedNotes()` - Notas formatadas para exibição
- `calculateProgress()` - Progresso desde última sessão
- `getNextSessionInfo()` - Informações da próxima sessão

**Métodos Estáticos:**
- `getPatientHistory(patientId)` - Histórico completo do paciente
- `getSessionStats(userId)` - Estatísticas do profissional
- `findByDateRange(userId, startDate, endDate)` - Sessões por período

#### **`src/routes/sessions.js`**
**Endpoints Necessários:**
1. `GET /api/patients/:patientId/sessions` - Histórico de sessões
2. `POST /api/patients/:patientId/sessions` - Registrar nova sessão
3. `GET /api/sessions/:id` - Obter sessão específica
4. `PUT /api/sessions/:id` - Atualizar sessão
5. `DELETE /api/sessions/:id` - Cancelar sessão
6. `GET /api/professional/sessions/today` - Minhas sessões de hoje
7. `GET /api/professional/sessions/week` - Sessões da semana
8. `POST /api/sessions/:id/reschedule` - Reagendar sessão

#### **`src/controllers/sessionController.js`**

**Funções Obrigatórias:**

**1. `getPatientSessions(req, res)`**
- **Objetivo:** Obter histórico completo de sessões do paciente
- **Parâmetros Query:**
  - `page`, `limit` - Paginação
  - `dateFrom`, `dateTo` - Filtro por período
  - `sessionType` - Filtro por tipo
- **Processamento:**
  - Verificar propriedade do paciente
  - Buscar sessões ordenadas por data (mais recente primeiro)
  - Incluir estatísticas (total sessões, frequência média)
- **Retorno:** Lista de sessões + estatísticas

**2. `createSession(req, res)`**
- **Objetivo:** Registrar nova sessão/consulta
- **Validações:**
  - Verificar se paciente existe e pertence ao profissional
  - Validar data da sessão (não no futuro distante)
  - Verificar se não há conflito de horário
- **Processamento:**
  - Calcular session_number sequencial
  - Criar registro da sessão
  - Atualizar last_appointment do paciente
  - Log da operação
- **Retorno:** Sessão criada

**3. `updateSession(req, res)`**
- **Objetivo:** Atualizar dados de uma sessão
- **Validações:**
  - Verificar propriedade da sessão
  - Não permitir alteração de sessions antigas (> 7 dias)
- **Campos Atualizáveis:** notes, assessment, interventions, homework
- **Processamento:** Validar → Atualizar → Log
- **Retorno:** Sessão atualizada

**4. `getTodaySessions(req, res)`**
- **Objetivo:** Obter sessões agendadas para hoje
- **Processamento:**
  - Buscar sessões do profissional para data atual
  - Incluir dados básicos dos pacientes
  - Ordenar por horário
- **Retorno:** Lista de sessões do dia

### **Funcionalidades Específicas:**

#### **Editor de Sessões**
**Características:**
- Editor de texto rico para notas
- Templates pré-definidos
- Auto-save durante digitação
- Validação de campos obrigatórios
- Cronômetro de sessão

#### **Histórico do Paciente**
**Funcionalidades:**
- Timeline das sessões
- Gráfico de evolução
- Filtros por período e tipo
- Exportação em PDF
- Comparação entre sessões

---

## 🔄 MÓDULO TRANSFERÊNCIAS

### **Objetivo**
Sistema para transferência de pacientes entre profissionais com workflow de aprovação.

### **Arquivos a Criar:**

#### **`src/models/Transfer.js`**
**Responsabilidade:** Modelo para solicitações de transferência

**Campos Necessários:**
- `id` - UUID único
- `patient_id` - FK para paciente
- `from_user_id` - FK profissional atual
- `to_user_id` - FK profissional destino
- `requested_at` - DATETIME da solicitação
- `processed_at` - DATETIME do processamento
- `processed_by` - FK admin que processou
- `status` - ENUM: 'pending' | 'approved' | 'rejected' | 'completed'
- `reason` - TEXT (motivo da transferência)
- `rejection_reason` - TEXT (motivo da rejeição)
- `notes` - TEXT (observações adicionais)
- `metadata` - JSONB

**Métodos Necessários:**
- `approve(adminId, notes)` - Aprovar transferência
- `reject(adminId, reason)` - Rejeitar transferência
- `complete()` - Finalizar transferência
- `isPending()` - Verificar se está pendente

#### **`src/routes/transfers.js`**
**Endpoints Necessários:**
1. `POST /api/transfers` - Solicitar transferência (profissional)
2. `GET /api/transfers/my-requests` - Minhas solicitações (profissional)
3. `GET /api/admin/transfers/pending` - Transferências pendentes (admin)
4. `PUT /api/admin/transfers/:id/approve` - Aprovar (admin)
5. `PUT /api/admin/transfers/:id/reject` - Rejeitar (admin)
6. `GET /api/admin/transfers/history` - Histórico (admin)

#### **`src/controllers/transferController.js`**

**Funções Obrigatórias:**

**1. `requestTransfer(req, res)`**
- **Objetivo:** Criar solicitação de transferência
- **Dados Necessários:** patient_id, to_user_id, reason
- **Validações:**
  - Paciente pertence ao profissional solicitante
  - Profissional destino existe e está ativo
  - Não existe transferência pendente para este paciente
- **Processamento:** Criar registro → Notificar admins
- **Retorno:** Confirmação da solicitação

**2. `processTransfer(req, res)` (Admin)**
- **Objetivo:** Aprovar ou rejeitar transferência
- **Ações:** approve | reject
- **Processamento para Aprovação:**
  - Alterar user_id do paciente
  - Marcar transferência como approved
  - Notificar ambos profissionais
- **Processamento para Rejeição:**
  - Marcar como rejected
  - Salvar motivo da rejeição
  - Notificar profissional solicitante

### **Funcionalidades Específicas:**

#### **Workflow de Transferência**
1. Profissional solicita transferência
2. Sistema valida dados
3. Admin recebe notificação
4. Admin analisa e decide
5. Sistema executa transferência se aprovada
6. Notificações são enviadas
7. Histórico é mantido

---

## 📈 MÓDULO RELATÓRIOS E ESTATÍSTICAS

### **Objetivo**
Sistema avançado de relatórios gerenciais e estatísticas para administradores e profissionais.

### **Arquivos a Criar:**

#### **`src/services/reportService.js`**
**Responsabilidade:** Lógica complexa para geração de relatórios

**Funções Necessárias:**

**1. `generateOverviewReport(userId, dateRange)`**
- **Objetivo:** Relatório geral de atividades
- **Dados:** Número de sessões, pacientes atendidos, evolução mensal
- **Filtros:** Por profissional, período, status

**2. `generatePatientEvolutionReport(patientId)`**
- **Objetivo:** Relatório de evolução de um paciente
- **Dados:** Timeline de sessões, progressos, observações
- **Formato:** Dados estruturados para gráficos

**3. `generateClinicStatsReport(dateRange)`** (Admin)
- **Objetivo:** Estatísticas gerais da clínica
- **Dados:** Produtividade, pacientes por profissional, tendências
- **Formato:** Dashboard executivo

#### **`src/utils/chartHelpers.js`**
**Responsabilidade:** Funções auxiliares para geração de dados para gráficos

**Funções:**
- `formatDataForLineChart(data)` - Dados para gráfico de linha
- `formatDataForBarChart(data)` - Dados para gráfico de barras
- `calculateTrends(data)` - Calcular tendências
- `generateColorPalette(count)` - Paleta de cores automática

---

# 6. NOMENCLATURA E PADRÕES

## 📝 CONVENÇÕES DE NOMENCLATURA

### **Arquivos e Diretórios**
- **Arquivos:** camelCase - `adminController.js`, `userValidations.js`
- **Modelos:** PascalCase - `User.js`, `Patient.js`, `Session.js`
- **Rotas:** lowercase - `auth.js`, `admin.js`, `professional.js`
- **Diretórios:** lowercase - `models/`, `controllers/`, `middleware/`

### **Variáveis e Funções**
- **Variáveis:** camelCase - `const userId = req.userId`
- **Funções:** camelCase - `getUserById()`, `createPatient()`
- **Constantes:** UPPER_SNAKE_CASE - `const MAX_LOGIN_ATTEMPTS = 5`
- **Parâmetros Query:** snake_case - `?page=1&per_page=20&sort_by=name`

### **Banco de Dados**
- **Tabelas:** snake_case plural - `users`, `patients`, `sessions`
- **Campos:** snake_case - `full_name`, `created_at`, `user_id`
- **Índices:** formato `idx_table_column` - `idx_users_email`
- **Foreign Keys:** formato `fk_table_column` - `fk_patients_user_id`

### **APIs e Endpoints**
- **Recursos:** plural - `/api/users`, `/api/patients`
- **Ações:** verbos HTTP - `GET /users`, `POST /users`, `PUT /users/:id`
- **Parâmetros:** kebab-case - `/api/admin/professionals/:id/reset-password`

## 🎯 PADRÕES DE CÓDIGO

### **Estrutura de Controllers**
```
Padrão para todas as funções de controller:

1. VALIDAÇÃO
   - Extrair parâmetros (req.params, req.query, req.body)
   - Validar tipos e formatos
   - Verificar autorização/propriedade

2. PROCESSAMENTO
   - Buscar dados necessários no banco
   - Aplicar regras de negócio
   - Realizar operações

3. RESPOSTA
   - Formatar dados de retorno
   - Aplicar padrão de resposta consistente
   - Retornar status HTTP apropriado

4. TRATAMENTO DE ERROS
   - Usar try/catch com asyncHandler
   - Lançar erros específicos (AppError)
   - Logs apropriados
```

### **Padrão de Resposta API**
```javascript
// SUCESSO
{
  "success": true,
  "message": "Descrição da operação realizada",
  "data": {
    // Dados retornados
  },
  "metadata": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}

// ERRO
{
  "success": false,
  "message": "Descrição do erro",
  "code": "ERROR_CODE",
  "details": ["Lista de detalhes específicos"],
  "field": "campo_com_erro"
}
```

### **Estrutura de Validação Joi**
```
Padrão para todos os schemas:

1. CAMPOS OBRIGATÓRIOS primeiro
2. CAMPOS OPCIONAIS depois
3. MENSAGENS PERSONALIZADAS em português
4. VALIDAÇÕES ESPECÍFICAS (formato, tamanho, etc.)
5. SCHEMAS REUTILIZÁVEIS para campos comuns
```

### **Tratamento de Erros**
```
Hierarquia de erros:

1. ERROS DE VALIDAÇÃO (400) - Dados inválidos
2. ERROS DE AUTENTICAÇÃO (401) - Token/credenciais
3. ERROS DE AUTORIZAÇÃO (403) - Sem permissão
4. ERROS DE RECURSO (404) - Não encontrado
5. ERROS DE CONFLITO (409) - Duplicação
6. ERROS INTERNOS (500) - Problemas do servidor
```

---

# 7. VALIDAÇÕES E SEGURANÇA

## 🔒 CHECKLIST DE SEGURANÇA

### **Autenticação e Autorização**
- [x] JWT implementado com chaves seguras
- [x] Refresh tokens para renovação
- [x] Verificação de propriedade de recursos
- [x] Middleware de autorização por roles
- [ ] Rate limiting específico por endpoint
- [ ] Blacklist de tokens (logout)
- [ ] Two-factor authentication (2FA) - Futuro

### **Validação de Dados**
- [x] Validação com Joi em todas as entradas
- [x] Sanitização de dados
- [x] Validação de tipos e formatos
- [ ] Validação de arquivo uploads - Futuro
- [ ] Validação de tamanho de requests
- [ ] Escape de HTML/SQL injection

### **Banco de Dados**
- [x] ORM (Sequelize) previne SQL injection
- [x] Índices para performance
- [x] Constraints de integridade
- [ ] Criptografia de dados sensíveis
- [ ] Backup automatizado
- [ ] Auditoria de operações

### **Headers e Configurações**
- [x] Helmet para headers seguros
- [x] CORS configurado adequadamente
- [x] Rate limiting global
- [ ] Content Security Policy (CSP)
- [ ] HTTPS obrigatório em produção
- [ ] Logs de segurança

## ⚠️ CUIDADOS ESPECÍFICOS

### **Dados Sensíveis**
- **NUNCA retornar senhas** em APIs
- **Hashear senhas** antes de armazenar
- **Criptografar tokens** de recuperação
- **Logs não devem** conter dados pessoais
- **Validar inputs** para prevenir XSS

### **Propriedade de Recursos**
- **Sempre verificar** se recurso pertence ao usuário
- **Admins podem** acessar todos os recursos
- **Profissionais apenas** seus próprios recursos
- **Middleware específico** para verificação de ownership

### **Rate Limiting**
- **Global:** 100 req/15min por IP
- **Login:** 5 tentativas/15min por IP
- **Reset senha:** 3 tentativas/hora por email
- **APIs críticas:** Limites específicos

---

# 8. TESTING E QUALIDADE

## 🧪 ESTRATÉGIA DE TESTES

### **Tipos de Teste**

#### **1. Testes Unitários (70%)**
- **Objetivo:** Testar funções isoladamente
- **Foco:** Models, Services, Utils
- **Ferramentas:** Jest
- **Coverage:** Mínimo 80% por arquivo

#### **2. Testes de Integração (20%)**
- **Objetivo:** Testar endpoints da API
- **Foco:** Routes + Controllers + Database
- **Ferramentas:** Jest + Supertest
- **Coverage:** Todos os endpoints principais

#### **3. Testes End-to-End (10%)**
- **Objetivo:** Testar fluxos completos
- **Foco:** Workflows críticos
- **Cenários:** Login → Criar paciente → Anamnese → Sessão

### **Estrutura de Testes**
```
tests/
├── unit/
│   ├── models/
│   │   ├── User.test.js
│   │   └── Patient.test.js
│   ├── services/
│   └── utils/
├── integration/
│   ├── auth.test.js
│   ├── admin.test.js
│   ├── professional.test.js
│   └── patient.test.js
├── e2e/
│   └── workflows.test.js
└── fixtures/
    ├── users.js
    └── patients.js
```

### **Padrões de Teste**

#### **Teste de Endpoint**
```
Estrutura padrão:

describe('Endpoint Name', () => {
  beforeAll(() => {
    // Setup inicial (conexão DB, dados de teste)
  });
  
  afterAll(() => {
    // Cleanup (limpar dados, fechar conexões)
  });
  
  describe('Success Cases', () => {
    test('should return expected data', async () => {
      // Arrange: Preparar dados
      // Act: Executar ação
      // Assert: Verificar resultado
    });
  });
  
  describe('Error Cases', () => {
    test('should return error for invalid data', async () => {
      // Testes de erro
    });
  });
  
  describe('Security', () => {
    test('should deny access without token', async () => {
      // Testes de segurança
    });
  });
});
```

### **Dados de Teste (Fixtures)**
- **Usuários:** Admin, profissional ativo, profissional inativo
- **Pacientes:** Com todos os campos, mínimo necessário
- **Tokens:** Válidos, expirados, inválidos
- **Senhas:** Válidas, inválidas, temporárias

### **Mocks Necessários**
- **Email Service:** Para não enviar emails reais
- **Database:** Usar banco de teste
- **External APIs:** Mock de APIs externas
- **Date/Time:** Para testes consistentes

## 📊 QUALITY ASSURANCE

### **Code Review Checklist**
- [ ] Código segue padrões definidos
- [ ] Validações adequadas implementadas
- [ ] Tratamento de erros correto
- [ ] Logs apropriados
- [ ] Testes cobrem cenários principais
- [ ] Documentação atualizada
- [ ] Performance adequada
- [ ] Segurança verificada

### **Métricas de Qualidade**
- **Code Coverage:** Mínimo 80%
- **ESLint:** Zero warnings/errors
- **Performance:** Resposta < 200ms (endpoints básicos)
- **Memory:** Sem memory leaks
- **Security:** Vulnerabilidades conhecidas

---

# 9. CRONOGRAMA DETALHADO

## 📅 PLANO DE EXECUÇÃO

### **SEMANA 1: MÓDULO ADMINISTRAÇÃO**

#### **Dias 1-2: Fundação**
- Criar estrutura de controllers/
- Implementar `src/routes/admin.js`
- Criar `src/controllers/adminController.js`
- Implementar validações básicas

#### **Dias 3-4: CRUD Profissionais**
- Função `listProfessionals` com paginação
- Função `createProfessional` com validações
- Função `updateProfessional`
- Sistema de ativação/desativação

#### **Dia 5: Dashboard e Testes**
- Função `getDashboard` com estatísticas
- Testes básicos do módulo admin
- Integração com frontend

### **SEMANA 2: MÓDULO PROFISSIONAL**

#### **Dias 1-2: Base Profissional**
- Criar `src/routes/professional.js`
- Implementar `src/controllers/professionalController.js`
- Dashboard do profissional

#### **Dias 3-4: Gestão Pacientes**
- CRUD completo de pacientes
- Sistema de busca e filtros
- Validações específicas

#### **Dia 5: Funcionalidades Extras**
- Agenda básica
- Solicitação de transferências
- Testes do módulo

### **SEMANA 3-4: ANAMNESE DIGITAL**
- Modelo Anamnesis completo
- Interface de formulário
- Sistema de auto-save
- Validações por seção

---

## **APÊNDICE A: FUNDAMENTAÇÃO TEÓRICA E JUSTIFICATIVA DAS TECNOLOGIAS**

Esta seção detalha a base teórica e as justificativas acadêmicas para as principais escolhas de arquitetura, tecnologias e metodologias empregadas no desenvolvimento do backend do sistema Módula.

### **A.1. Arquitetura de Backend e Ambiente de Execução: Node.js**

A plataforma Módula foi desenvolvida sobre o runtime **Node.js**. A escolha se fundamenta em seu modelo de I/O (Entrada/Saída) não-bloqueante e orientado a eventos (*event-driven, non-blocking I/O*). Este modelo arquitetural é particularmente eficaz para aplicações que gerenciam um grande número de conexões simultâneas com operações que não são intensivas em CPU, como é o caso de uma API que serve dados de um banco de dados para múltiplos usuários (profissionais de saúde, administradores).

A eficiência deste modelo é descrita por seu criador, Ryan Dahl, e validada em diversos estudos sobre performance de servidores web. Para uma aplicação de gestão clínica, onde múltiplos profissionais podem estar consultando prontuários, agendando sessões e gerando relatórios concorrentemente, a arquitetura do Node.js permite um uso mais eficiente dos recursos do servidor, resultando em menor latência para o usuário final.

* **Referência Principal:**
    * Tilkov, S., & Vinoski, S. (2010). Node. js: Using JavaScript to build high-performance network programs. *IEEE Internet Computing*, 14(6), 80-83. Este artigo explora o modelo de concorrência do Node.js e sua adequação para aplicações de rede de alta performance.

### **A.2. Padrão Arquitetural: MVC (Model-View-Controller)**

A estrutura do backend segue uma adaptação do padrão arquitetural **Model-View-Controller (MVC)**. O MVC promove a separação de responsabilidades (*Separation of Concerns*), um princípio fundamental da engenharia de software que visa aumentar a manutenibilidade, testabilidade e o desenvolvimento paralelo do sistema.

* **Model:** Representa os dados e a lógica de negócio (modelos `User`, `Patient` no Sequelize).
* **View:** (Adaptado para uma API) A representação dos dados, tipicamente em formato JSON.
* **Controller:** Atua como intermediário, recebendo requisições, acionando a lógica no Model e retornando a representação dos dados.

Este padrão foi originalmente formulado para interfaces gráficas, mas sua aplicação em sistemas web e APIs é consagrada por facilitar a evolução do sistema. A lógica de negócio fica isolada das regras de roteamento e da apresentação dos dados, permitindo que cada parte seja modificada com mínimo impacto nas outras.

* **Referência Clássica:**
    * Reenskaug, T. (1979). *MODELS-VIEWS-CONTROLLERS*. Xerox PARC, Note-79-19. Este é um dos documentos originais onde Trygve Reenskaug descreve a concepção do padrão MVC, enfatizando a separação entre a representação da informação e sua interação com o usuário.

### **A.3. Design de API: REST (Representational State Transfer)**

A comunicação entre o frontend e o backend é projetada seguindo os princípios da arquitetura **REST (Representational State Transfer)**. A escolha pelo REST se deve à sua simplicidade, escalabilidade e aceitação como padrão de mercado para a construção de APIs web. As restrições do REST, como comunicação cliente-servidor, ausência de estado (*statelessness*) e interface uniforme, promovem um baixo acoplamento entre o cliente e o servidor.

Para o Módula, isso significa que diferentes clientes (ex: aplicação web, aplicativo móvel futuro) poderão consumir a mesma API de forma padronizada, utilizando os verbos HTTP (`GET`, `POST`, `PUT`, `DELETE`) para manipular os recursos (`/patients`, `/sessions`, etc.).

* **Referência Definitiva:**
    * Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Tese de Doutorado, University of California, Irvine. A tese de Roy Fielding, um dos principais autores da especificação HTTP, define formalmente os princípios e as restrições da arquitetura REST.

### **A.4. Sistema de Gerenciamento de Banco de Dados: PostgreSQL**

A escolha do **PostgreSQL** como SGBD se baseia em sua robustez, extensibilidade e conformidade com o padrão ACID (Atomicidade, Consistência, Isolamento, Durabilidade). Para um sistema de gestão de saúde que armazena dados sensíveis, a integridade transacional garantida pelo ACID é um requisito não-funcional crítico.

Adicionalmente, o PostgreSQL é um sistema objeto-relacional que oferece suporte nativo a tipos de dados avançados, como `JSONB`. Esta característica é explorada no projeto Módula para armazenar dados semiestruturados (ex: `metadata`, `address`), combinando a flexibilidade de um banco NoSQL com a consistência de um banco relacional.

* **Referência Acadêmica:**
    * Stonebraker, M., & Rowe, L. A. (1986). The design of POSTGRES. *ACM SIGMOD Record*, 15(2), 340-355. Este artigo, escrito pelos criadores do Postgres (predecessor do PostgreSQL), descreve os princípios de design que o tornaram um dos bancos de dados relacionais de código aberto mais avançados e confiáveis.

### **A.5. Mapeamento Objeto-Relacional (ORM com Sequelize)**

O uso de um **ORM (Object-Relational Mapping)**, especificamente o Sequelize, abstrai a complexidade da comunicação com o banco de dados relacional. O ORM resolve o problema da "incompatibilidade de impedância" entre o paradigma orientado a objetos do Node.js e o paradigma relacional do PostgreSQL.

A utilização do Sequelize aumenta a produtividade do desenvolvedor, automatizando a escrita de consultas SQL repetitivas e provendo uma camada de segurança contra ataques de injeção de SQL.

* **Referência Conceitual:**
    * Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley Professional. Martin Fowler descreve detalhadamente o padrão ORM, juntamente com outros padrões de arquitetura de software, explicando seu propósito e trade-offs.

### **A.6. Autenticação e Segurança: JWT, bcrypt e OWASP**

A segurança do sistema é fundamentada em padrões e práticas recomendadas pela comunidade de segurança.

* **JSON Web Tokens (JWT):** A autenticação stateless via JWT foi escolhida por sua eficiência em arquiteturas de microsserviços e aplicações de página única (SPAs). A especificação do JWT é um padrão aberto e documentado pela IETF.
    * **Referência Padrão:** Jones, M., Bradley, J., & Sakimura, N. (2015). *RFC 7519: JSON Web Token (JWT)*. Internet Engineering Task Force (IETF).

* **bcrypt:** Para o armazenamento de senhas, foi utilizado o algoritmo bcrypt. Diferente de algoritmos de hash rápidos como MD5 ou SHA-1, o bcrypt é um algoritmo adaptativo e lento por design, com um "fator de trabalho" configurável. Isso o torna resiliente a ataques de força bruta que utilizam hardware moderno (GPUs, ASICs).
    * **Referência Original:** Provos, N., & Mazières, D. (1999). A Future-Adaptable Password Scheme. In *Proceedings of the FREENIX Track: 1999 USENIX Annual Technical Conference* (pp. 81-92).

* **Princípios OWASP:** A configuração de segurança geral, incluindo o uso de middlewares como `Helmet` e `CORS`, segue as diretrizes do **OWASP (Open Web Application Security Project)**, uma autoridade no campo da segurança de aplicações web. As práticas adotadas visam mitigar riscos comuns listados no OWASP Top 10, como injeção, autenticação quebrada e exposição de dados sensíveis.

### **A.7. Validação de Dados e Defesa em Profundidade (Joi)**

A utilização da biblioteca **Joi** para validação de esquemas (*schema validation*) em todas as entradas da API é uma implementação direta do princípio de segurança **Defesa em Profundidade** (*Defense in Depth*). Este princípio postula que a segurança de um sistema não deve depender de uma única camada de proteção, mas sim de múltiplas barreiras. A validação de entrada é a primeira e uma das mais cruciais dessas barreiras.

Ao definir esquemas estritos para os dados de entrada, o sistema garante que apenas informações no formato, tipo e tamanho esperados sejam processadas pela lógica de negócio. Esta prática mitiga proativamente uma vasta gama de vulnerabilidades, incluindo, mas não se limitando a, ataques de Injeção (SQL, NoSQL), Cross-Site Scripting (XSS) e corrupção de dados. A abordagem declarativa do Joi permite a criação de regras de validação complexas e legíveis, diminuindo a probabilidade de erros humanos na implementação da lógica de validação.

* **Referência Padrão (Indústria):**
    * Open Web Application Security Project (OWASP). *Input Validation Cheat Sheet*. Esta documentação da OWASP é uma referência padrão na indústria que descreve as melhores práticas para validar entradas, afirmando que a validação deve ocorrer o mais cedo possível na arquitetura (no nosso caso, nos middlewares, antes dos controllers).
    * Open Web Application Security Project (OWASP). *Application Security Verification Standard (ASVS)*, V4.0.3, Seção 5.1: Input Validation and Encoding Requirements. O ASVS é um padrão para verificação de segurança que estabelece a validação de entrada como um requisito fundamental (Nível 1) para todas as aplicações.

### **A.8. Estratégia de Qualidade e Testes (Jest & Supertest)**

A estratégia de testes adotada pelo projeto, utilizando **Jest** para testes unitários e **Jest + Supertest** para testes de integração, é fundamentada no conceito da **"Pirâmide de Testes"**. Este modelo, popularizado por Mike Cohn, propõe uma distribuição hierárquica de diferentes tipos de testes para otimizar a eficácia e a eficiência do processo de garantia de qualidade.

A pirâmide sugere a seguinte estrutura:

1.  **Base Larga de Testes Unitários:** O Jest é utilizado para testar pequenas unidades de código (funções, métodos de modelo, serviços) de forma isolada. Estes testes são rápidos, estáveis e fornecem um feedback preciso ao desenvolvedor, formando a base da confiança no sistema.
2.  **Camada Intermediária de Testes de Integração:** O Supertest é usado em conjunto com o Jest para testar os endpoints da API. Estes testes verificam se múltiplos componentes (rotas, controllers, modelos, banco de dados) interagem corretamente, garantindo o funcionamento dos fluxos de negócio.
3.  **(Topo Estreito) de Testes End-to-End (E2E):** (Planejados para o futuro) Testariam a aplicação completa sob a perspectiva do usuário.

Esta abordagem é considerada uma prática recomendada por equilibrar o custo de escrita e manutenção dos testes com a confiança que eles proporcionam, evitando a armadilha do "Cone de Sorvete de Testes" (*Test Ice Cream Cone*), um anti-padrão onde há um excesso de testes manuais e E2E lentos e frágeis.

* **Referências Principais:**
    * Cohn, M. (2009). *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley Professional. Mike Cohn introduz o conceito da Pirâmide de Testes como um guia para alocar esforços em automação de testes em projetos ágeis.
    * Fowler, M. (2012). *The Practical Test Pyramid*. Artigo online. Martin Fowler, uma autoridade em arquitetura de software, elabora sobre o conceito de Cohn, discutindo suas nuances práticas e sua aplicação em arquiteturas modernas.

---

### 📚 DOCUMENTAÇÃO COMPLETA FINALIZADA!
Essa é a documentação técnica completa e detalhada do backend Módula. Este guia é um roadmap definitivo para que qualquer desenvolvedor da equipe possa continuar o projeto sem dificuldade e tendo orientação para tudo.


🎯 O QUE ESTA DOCUMENTAÇÃO CONTÉM:
📋 VISÃO GERAL COMPLETA

Status atual detalhado (30% implementado)
Arquitetura técnica explicada
Stack tecnológica documentada
Estrutura de arquivos mapeada

🔐 SISTEMA ATUAL DOCUMENTADO

Autenticação JWT: Todos os 7 endpoints explicados
Middlewares: 6 middlewares com suas funções específicas
Modelos: User e Patient completamente documentados
Segurança: Sistema completo de tratamento de erros

📝 GUIAS PRÁTICOS

Nomenclatura padronizada para todo o código
Estrutura de cada controller explicada
Padrões de resposta API definidos
Checklist de segurança completo

🧪 QUALIDADE E TESTES

Estratégia de testing com 3 tipos de teste
Code review checklist detalhado
Métricas de qualidade definidas
Troubleshooting guide para problemas comuns


🎯 COMO USAR ESTE DOCUMENTO:

📖 Leia completamente antes de começar a desenvolver
🔍 Use como referência durante o desenvolvimento
✅ Siga os padrões estabelecidos
📝 Mantenha atualizado conforme implementa
