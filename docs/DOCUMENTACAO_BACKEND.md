# 📚 MÓDULA BACKEND - GUIA COMPLETO DE DESENVOLVIMENTO

**DOCUMENTO PARA EQUIPE DE DESENVOLVIMENTO**

Este é um guia completo e detalhado para que qualquer desenvolvedor possa dar continuidade ao projeto Backend do Módula. Contém todas as informações sobre o que existe, o que precisa ser implementado e como fazer.

---

## 📋 ÍNDICE GERAL

1.  [VISÃO GERAL DO PROJETO](#1-visão-geral-do-projeto)
2.  [ARQUITETURA E ESTRUTURA ATUAL](#2-arquitetura-e-estrutura-atual)
3.  [SISTEMA IMPLEMENTADO](#3-sistema-implementado)
4.  [ROADMAP DE DESENVOLVIMENTO](#4-roadmap-de-desenvolvimento)
5.  [GUIA DE IMPLEMENTAÇÃO POR MÓDULO](#5-guia-de-implementação-por-módulo)
6.  [NOMENCLATURA E PADRÕES](#6-nomenclatura-e-padrões)
7.  [VALIDAÇÕES E SEGURANÇA](#7-validações-e-segurança)
8.  [TESTING E QUALIDADE](#8-testing-e-qualidade)

---

## 1. VISÃO GERAL DO PROJETO

### 🎯 OBJETIVO DO SISTEMA

O Módula é uma plataforma completa de gestão para clínicas e consultórios de saúde que digitaliza e centraliza:

* **Gestão de Usuários:** Administradores e profissionais de saúde.
* **Gestão de Pacientes:** Cadastro completo, histórico e prontuário digital.
* **Anamnese Digital:** Questionários estruturados e personalizáveis.
* **Registro de Consultas:** Evolução dos pacientes e histórico de sessões.
* **Sistema de Transferências:** Mudança de pacientes entre profissionais.
* **Relatórios:** Estatísticas e análises da clínica.

### 🏗️ ARQUITETURA TÉCNICA

**Stack Tecnológica**

* **Runtime:** Node.js 16+
* **Framework Web:** Express.js 4.18+
* **Banco de Dados:** PostgreSQL 12+
* **ORM:** Sequelize 6+ (Object-Relational Mapping)
* **Autenticação:** JSON Web Tokens (JWT) + bcryptjs
* **Validação:** Joi (Schema validation)
* **Email:** Nodemailer
* **Segurança:** Helmet, CORS, Rate Limiting
* **Testes:** Jest + Supertest
* **Documentação:** Swagger/OpenAPI (futura implementação)

**Padrão Arquitetural**

O sistema segue o padrão MVC (Model-View-Controller) adaptado para APIs:

* **Models:** Definição de dados e relacionamentos (Sequelize).
* **Controllers:** Lógica de negócio e processamento.
* **Routes:** Definição de endpoints da API.
* **Middlewares:** Interceptadores para autenticação, validação e tratamento de erros.
* **Services:** Lógica de negócio complexa e reutilizável.

### 📊 STATUS ATUAL DO PROJETO

* **✅ IMPLEMENTADO (30%)**
    * Configuração base do servidor Express.
    * Sistema completo de autenticação JWT.
    * Modelos `User` e `Patient`.
    * Middlewares de segurança e tratamento de erros.
    * Estrutura de banco PostgreSQL com Sequelize.

* **🔄 EM DESENVOLVIMENTO (0%)**
    * Atualmente nenhum módulo está em desenvolvimento ativo.

* **⏳ PENDENTE (70%)**
    * Módulo de Administração (dashboard, CRUD profissionais).
    * Módulo do Profissional (dashboard, gestão pacientes).
    * Sistema de Anamnese Digital.
    * Sistema de Consultas e Sessões.
    * Sistema de Transferências.
    * Relatórios e Estatísticas.
    * Testes automatizados.
    * Documentação da API.

---

## 2. ARQUITETURA E ESTRUTURA ATUAL

### 📁 ORGANIZAÇÃO DE DIRETÓRIOS

```txt

backend/
├── src/                          # Código fonte principal
│   ├── config/                   # Configurações do sistema
│   │   └── database.js          ✅ Configuração PostgreSQL/Sequelize
│   ├── controllers/             ⏳ CRIAR - Lógica de negócio
│   ├── middleware/              # Interceptadores de requisições
│   │   ├── auth.js             ✅ Autenticação e autorização JWT
│   │   └── errorHandler.js     ✅ Tratamento centralizado de erros
│   ├── models/                  # Modelos de dados (Sequelize)
│   │   ├── User.js             ✅ Modelo de usuários
│   │   ├── Patient.js          ✅ Modelo de pacientes
│   │   └── index.js            ⏳ CRIAR - Associações entre modelos
│   ├── routes/                  # Definição de endpoints
│   │   ├── auth.js             ✅ Rotas de autenticação
│   │   ├── admin.js            ⏳ CRIAR - Rotas administrativas
│   │   ├── professional.js     ⏳ CRIAR - Rotas do profissional
│   │   └── patient.js          ⏳ CRIAR - Rotas de pacientes
│   ├── services/               ⏳ CRIAR - Lógica de negócio complexa
│   ├── utils/                  ⏳ CRIAR - Utilitários e helpers
│   └── validations/            ⏳ CRIAR - Schemas de validação Joi
├── tests/                      ⏳ CRIAR - Testes automatizados
├── docs/                       ⏳ CRIAR - Documentação da API
├── server.js                   ✅ Arquivo principal do servidor
├── package.json                ✅ Dependências e scripts
├── .env.example               ✅ Template de variáveis de ambiente
└── README.md                  ✅ Documentação básica

``` 

### 🔧 CONFIGURAÇÕES PRINCIPAIS

**`server.js` - Configuração do Servidor**

* **Funcionalidades Implementadas:**
    * Inicialização do Express.
    * Configuração de middlewares de segurança (Helmet, CORS).
    * Rate limiting (100 requisições por 15 minutos).
    * Parser JSON para requisições.
    * Logging de requisições (Morgan).
    * Conexão com banco de dados.
    * Rotas principais.
    * Tratamento de erros global.
* **Middlewares Ativos:**
    * `helmet()` - Headers de segurança HTTP.
    * `cors()` - Política de compartilhamento de recursos.
    * `rateLimit()` - Proteção contra ataques de força bruta.
    * `express.json()` - Parser de JSON.
    * `morgan('combined')` - Logs detalhados de requisições.

**`database.js` - Configuração do Banco**

* **Funcionalidades Implementadas:**
    * Configuração de conexão PostgreSQL.
    * Pool de conexões otimizado (máx 20, mín 0).
    * Configurações específicas por ambiente (dev/test/prod).
    * SSL para produção.
    * Timezone configurado para Brasília (-03:00).
    * Definições padrão para modelos (timestamps, underscored).

---

## 3. SISTEMA IMPLEMENTADO

### 🔐 MÓDULO DE AUTENTICAÇÃO (100% COMPLETO)

**`auth.js` - Rotas de Autenticação**

* **Endpoints Implementados:**
    * `POST /api/auth/login`: Autenticar usuários.
    * `POST /api/auth/refresh-token`: Renovar access token.
    * `POST /api/auth/forgot-password`: Solicitar recuperação de senha.
    * `POST /api/auth/reset-password`: Redefinir senha com token.
    * `POST /api/auth/first-access`: Alteração obrigatória de senha.
    * `POST /api/auth/validate-token`: Verificar validade do token.
    * `POST /api/auth/logout`: Finalizar sessão.

**`auth.js` - Middlewares de Autenticação**

* **Middlewares Implementados:**
    * `validateToken(req, res, next)`: Validar JWT em rotas protegidas.
    * `requireAdmin(req, res, next)`: Acesso exclusivo para administradores.
    * `requireProfessional(req, res, next)`: Acesso exclusivo para profissionais.
    * `requireUserTypes(allowedTypes)`: Middleware flexível para múltiplos tipos de usuário.
    * `checkFirstAccess(req, res, next)`: Forçar alteração de senha no primeiro acesso.
    * `checkResourceOwnership(model, idParam)`: Verificar se o recurso pertence ao usuário.
* **Funções Utilitárias:**
    * `generateToken(user)`: Gerar JWT access token (expira em 24h).
    * `generateRefreshToken(user)`: Gerar JWT refresh token (expira em 7 dias).
    * `validateRefreshToken(req, res, next)`: Middleware para validar refresh tokens.

### 👥 MODELOS DE DADOS (90% COMPLETO)

**`User.js` - Modelo de Usuários**

* **Campos:** `id`, `full_name`, `email`, `professional_register`, `password`, `user_type`, `status`, `is_first_access`, `reset_password_token`, `reset_password_expires`, `last_login`, `metadata`.
* **Hooks:** `beforeCreate` e `beforeUpdate` para hashear a senha. `afterFind` para remover campos sensíveis.
* **Métodos de Instância:** `validatePassword()`, `generateResetToken()`, `isAdmin()`, `isProfessional()`, `isActive()`, `updateLastLogin()`.
* **Métodos Estáticos:** `findByEmail()`, `findByResetToken()`, `findActiveProfessionals()`.

**`Patient.js` - Modelo de Pacientes**

* **Campos:**
    * **Identificação:** `id`, `user_id`, `full_name`, `birth_date`, `gender`.
    * **Documentos:** `cpf`, `rg`.
    * **Contato:** `phone`, `email`, `address`, `emergency_contact`.
    * **Dados Pessoais:** `marital_status`, `occupation`, `insurance_info`.
    * **Dados Clínicos:** `status`, `medical_history`, `current_medications`, `allergies`, `notes`.
    * **Controle:** `first_appointment`, `last_appointment`, `metadata`.
* **Métodos de Instância:** `getAge()`, `isActive()`, `updateLastAppointment()`, `getBasicInfo()`.
* **Métodos Estáticos:** `findActiveByProfessional()`, `findByCpf()`, `getStatsByProfessional()`, `findWithRecentAppointments()`.

### 🛡️ SISTEMA DE SEGURANÇA (100% COMPLETO)

**`errorHandler.js` - Tratamento de Erros**

* **Tipos de Erro Tratados:** `ValidationError`, `UniqueConstraintError`, `ForeignKeyConstraintError`, `CastError`, `SyntaxError`, `JsonWebTokenError`, `TokenExpiredError`.
* **Classes Customizadas:** `AppError` para erros customizados da aplicação.
* **Funções Utilitárias:** `asyncHandler`, `createValidationError`, `createAuthorizationError`, `createAuthenticationError`, `createNotFoundError`.
* **Middleware Global:** `errorHandler` para capturar todos os erros e `notFound` para rotas inexistentes.

---

## 4. ROADMAP DE DESENVOLVIMENTO

### 🗓️ CRONOGRAMA GERAL

* **FASE 1: ADMINISTRAÇÃO (Semanas 1-2)**
    * **Prioridade:** ALTA
    * **Entregáveis:** Dashboard admin, CRUD de profissionais, gestão de transferências.
* **FASE 2: PROFISSIONAIS (Semanas 3-4)**
    * **Prioridade:** ALTA
    * **Entregáveis:** Dashboard do profissional, gestão de pacientes, agenda básica.
* **FASE 3: ANAMNESE DIGITAL (Semanas 5-6)**
    * **Prioridade:** MÉDIA
    * **Entregáveis:** Modelo Anamnese, formulário dinâmico, validações.
* **FASE 4: CONSULTAS E SESSÕES (Semanas 7-8)**
    * **Prioridade:** MÉDIA
    * **Entregáveis:** Modelo Session, histórico, relatórios de evolução.
* **FASE 5: TRANSFERÊNCIAS (Semana 9)**
    * **Prioridade:** BAIXA
    * **Entregáveis:** Modelo Transfer, workflow de aprovação, notificações.
* **FASE 6: RELATÓRIOS E ANALYTICS (Semana 10)**
    * **Prioridade:** BAIXA
    * **Entregáveis:** Dashboards avançados, estatísticas detalhadas, exportações.

---

## 5. GUIA DE IMPLEMENTAÇÃO POR MÓDULO

### 🏢 MÓDULO ADMINISTRAÇÃO

* **Objetivo:** Sistema completo para administradores gerenciarem a clínica.
* **Arquivos a Criar:** `src/routes/admin.js`, `src/controllers/adminController.js`, `src/middleware/adminValidations.js`.
* **Endpoints Necessários:**
    * `GET /api/admin/dashboard`
    * `GET, POST /api/admin/professionals`
    * `GET, PUT /api/admin/professionals/:id`
    * `PUT /api/admin/professionals/:id/status`
    * `POST /api/admin/professionals/:id/reset-password`
    * `GET /api/admin/transfers`
    * `PUT /api/admin/transfers/:id/approve`
    * `PUT /api/admin/transfers/:id/reject`
    * `GET /api/admin/stats/overview`
    * `GET /api/admin/stats/monthly`
* **Funções do Controller:** `getDashboard`, `listProfessionals`, `createProfessional`, `getProfessionalById`, `updateProfessional`, `toggleProfessionalStatus`, `resetProfessionalPassword`.
* **Funcionalidades:** Dashboard com estatísticas, gestão completa de profissionais (CRUD, filtros, paginação), e workflow de aprovação de transferências.

### 👨‍⚕️ MÓDULO PROFISSIONAL

* **Objetivo:** Interface para profissionais gerenciarem seus pacientes e consultas.
* **Arquivos a Criar:** `src/routes/professional.js`, `src/controllers/professionalController.js`.
* **Endpoints Necessários:**
    * `GET /api/professional/dashboard`
    * `GET, POST /api/professional/patients`
    * `GET, PUT /api/professional/patients/:id`
    * `PUT /api/professional/patients/:id/status`
    * `POST /api/professional/patients/:id/transfer`
    * `GET /api/professional/schedule/today` e `/week`
    * `GET /api/professional/stats`
* **Funções do Controller:** `getDashboard`, `getMyPatients`, `createPatient`, `getPatientById`, `updatePatient`, `requestPatientTransfer`, `getTodaySchedule`.
* **Funcionalidades:** Dashboard com resumo diário, gestão de pacientes (CRUD, filtros), e solicitação de transferência.

### 📋 MÓDULO ANAMNESE DIGITAL

* **Objetivo:** Sistema de anamnese digital estruturada e personalizável.
* **Arquivos a Criar:** `src/models/Anamnesis.js`, `src/routes/anamnesis.js`, `src/controllers/anamnesisController.js`.
* **Modelo `Anamnesis`:** Conterá campos para `patient_id`, `user_id`, `status` e seções em formato JSONB (`personal_history`, `family_history`, `medical_history`, etc.).
* **Endpoints Necessários:**
    * `GET, POST, PUT /api/patients/:patientId/anamnesis`
    * `PUT /api/patients/:patientId/anamnesis/section/:section`
    * `POST /api/patients/:patientId/anamnesis/complete`
    * `GET /api/professional/anamnesis/pending`
* **Funções do Controller:** `getPatientAnamnesis`, `createAnamnesis`, `updateAnamnesisSection`, `completeAnamnesis`.
* **Funcionalidades:** Formulário multi-step com auto-save, cálculo de progresso e validações específicas por seção.

### 📊 MÓDULO CONSULTAS E SESSÕES

* **Objetivo:** Registro de consultas e acompanhamento da evolução dos pacientes.
* **Arquivos a Criar:** `src/models/Session.js`, `src/routes/sessions.js`, `src/controllers/sessionController.js`.
* **Modelo `Session`:** Conterá campos para `patient_id`, `user_id`, `session_number`, `session_date`, `session_type`, `session_notes`, `progress_assessment`, etc.
* **Endpoints Necessários:**
    * `GET, POST /api/patients/:patientId/sessions`
    * `GET, PUT, DELETE /api/sessions/:id`
    * `GET /api/professional/sessions/today` e `/week`
* **Funções do Controller:** `getPatientSessions`, `createSession`, `updateSession`, `getTodaySessions`.
* **Funcionalidades:** Editor de texto rico para notas, timeline de sessões do paciente, gráficos de evolução e exportação em PDF.

### 🔄 MÓDULO TRANSFERÊNCIAS

* **Objetivo:** Sistema para transferência de pacientes entre profissionais com aprovação.
* **Arquivos a Criar:** `src/models/Transfer.js`, `src/routes/transfers.js`, `src/controllers/transferController.js`.
* **Modelo `Transfer`:** Conterá campos para `patient_id`, `from_user_id`, `to_user_id`, `status`, `reason`, `processed_by`.
* **Endpoints Necessários:**
    * `POST /api/transfers` (Profissional)
    * `GET /api/admin/transfers/pending` e `/history` (Admin)
    * `PUT /api/admin/transfers/:id/approve` e `/reject` (Admin)
* **Funções do Controller:** `requestTransfer`, `processTransfer`.
* **Funcionalidades:** Workflow completo de solicitação, notificação, aprovação/rejeição e histórico.

### 📈 MÓDULO RELATÓRIOS E ESTATÍSTICAS

* **Objetivo:** Relatórios gerenciais para administradores e profissionais.
* **Arquivos a Criar:** `src/services/reportService.js`, `src/utils/chartHelpers.js`.
* **Funções do Serviço:**
    * `generateOverviewReport()`: Relatório geral de atividades.
    * `generatePatientEvolutionReport()`: Relatório de evolução de um paciente.
    * `generateClinicStatsReport()`: Estatísticas gerais da clínica (Admin).
* **Funcionalidades:** Geração de dados estruturados para gráficos de linha, barras e cálculo de tendências.

---

## 6. NOMENCLATURA E PADRÕES

### 📝 CONVENÇÕES DE NOMENCLATURA

* **Arquivos e Diretórios:** `camelCase` para arquivos (`adminController.js`), `PascalCase` para Modelos (`User.js`), `lowercase` para diretórios (`models/`).
* **Variáveis e Funções:** `camelCase` (`userId`), `UPPER_SNAKE_CASE` para constantes (`MAX_ATTEMPTS`).
* **Banco de Dados:** Tabelas em `snake_case` plural (`users`), campos em `snake_case` (`full_name`).
* **APIs e Endpoints:** Recursos no plural (`/api/users`), parâmetros em `kebab-case`.

### 🎯 PADRÕES DE CÓDIGO

* **Estrutura de Controllers:** Seguir o padrão: 1. Validação → 2. Processamento → 3. Resposta → 4. Tratamento de Erros.
* **Padrão de Resposta API:** Utilizar um objeto padrão para sucesso (`{ success: true, data: {} }`) e erro (`{ success: false, message: "...", code: "..." }`).
* **Tratamento de Erros:** Usar uma hierarquia de erros com códigos de status HTTP apropriados (400, 401, 403, 404, 409, 500).

---

## 7. VALIDAÇÕES E SEGURANÇA

### 🔒 CHECKLIST DE SEGURANÇA

* **Autenticação:** JWT, refresh tokens, verificação de propriedade de recursos.
* **Validação:** Joi em todas as entradas, sanitização de dados.
* **Banco de Dados:** Usar ORM para prevenir SQL injection, criptografar dados sensíveis.
* **Headers:** Helmet, CORS, Rate limiting global.

### ⚠️ CUIDADOS ESPECÍFICOS

* **Dados Sensíveis:** Nunca retornar senhas. Hashear senhas e tokens de recuperação.
* **Propriedade de Recursos:** Sempre verificar se o recurso pertence ao usuário logado (exceto admins).
* **Rate Limiting:** Implementar limites específicos para endpoints críticos (login, reset de senha).

---

## 8. TESTING E QUALIDADE

### 🧪 ESTRATÉGIA DE TESTES

* **Tipos de Teste:**
    * **Unitários (70%):** Foco em Models, Services, Utils (Jest).
    * **Integração (20%):** Foco em endpoints da API (Jest + Supertest).
    * **End-to-End (10%):** Foco em workflows críticos.
* **Estrutura de Testes:** Organizar testes em diretórios `unit/`, `integration/`, `e2e/`.
* **Padrões de Teste:** Utilizar `describe`, `beforeAll`, `afterAll` e o padrão Arrange-Act-Assert.

### 📊 QUALITY ASSURANCE

* **Code Review Checklist:** Verificar padrões, validações, tratamento de erros, testes, documentação, performance e segurança.
* **Métricas de Qualidade:** Code Coverage > 80%, ESLint sem erros, resposta de API < 200ms.


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