# MER — Módula (Modelo Entidade-Relacionamento)

Este documento descreve o MER do backend da plataforma Módula, com base na estrutura e documentação atual do projeto. Ele cobre os módulos implementados (Autenticação, Administração, Profissional) e antecipa entidades dos módulos planejados (Anamnese, Sessões).


## Visão Geral

Entidades principais:
- User
- Patient
- Session (planejado)
- Transfer
- Notification
- RefreshToken
- PasswordReset
- AuditLog
- Anamnesis (planejado)
- Setting (opcional/administrativo)

Regras gerais:
- Users possuem roles: admin | professional.
- Patients pertencem a um profissional responsável (User).
- Sessions registram atendimentos por profissional a pacientes.
- Transfers movem pacientes entre profissionais.
- Notifications enviam alertas a usuários.
- Tokens e PasswordReset dão suporte à autenticação/recuperação.
- AuditLog registra ações relevantes.

## Diagrama ER (Mermaid)

```mermaid
erDiagram
  USER ||--o{ PATIENT : "responsável_por"
  USER ||--o{ SESSION : "realiza"
  PATIENT ||--o{ SESSION : "possui"
  PATIENT ||--o{ TRANSFER : "referência"
  USER ||--o{ TRANSFER : "origem(from)"
  USER ||--o{ TRANSFER : "destino(to)"
  USER ||--o{ NOTIFICATION : "recebe"
  USER ||--o{ REFRESH_TOKEN : "possui"
  USER ||--o{ PASSWORD_RESET : "pode_ter"
  USER ||--o{ AUDIT_LOG : "gera"
  PATIENT ||--o{ ANAMNESIS : "possui" 

  USER {
    uuid id PK
    varchar name
    varchar email UNIQUE
    varchar password_hash
    varchar role  "admin|professional"
    varchar status "active|blocked"
    timestamptz last_login_at
    timestamptz created_at
    timestamptz updated_at
  }

  PATIENT {
    uuid id PK
    varchar full_name
    date birth_date
    varchar sex
    varchar email
    varchar phone
    text address
    uuid professional_id FK "-> USER.id"
    timestamptz created_at
    timestamptz updated_at
  }

  SESSION {
    uuid id PK
    uuid patient_id FK "-> PATIENT.id"
    uuid professional_id FK "-> USER.id"
    timestamptz scheduled_at
    varchar status "scheduled|done|cancelled"
    text notes
    timestamptz created_at
    timestamptz updated_at
  }

  TRANSFER {
    uuid id PK
    uuid patient_id FK "-> PATIENT.id"
    uuid from_professional_id FK "-> USER.id"
    uuid to_professional_id FK "-> USER.id"
    varchar status "pending|approved|rejected|cancelled|completed"
    text reason
    text rejection_reason
    timestamptz requested_at
    timestamptz decided_at
    timestamptz completed_at
  }

  NOTIFICATION {
    uuid id PK
    uuid user_id FK "-> USER.id"
    varchar type
    varchar title
    text body
    timestamptz read_at
    timestamptz created_at
  }

  REFRESH_TOKEN {
    uuid id PK
    uuid user_id FK "-> USER.id"
    varchar token UNIQUE
    timestamptz expires_at
    timestamptz revoked_at
    timestamptz created_at
  }

  PASSWORD_RESET {
    uuid id PK
    uuid user_id FK "-> USER.id"
    varchar token UNIQUE
    timestamptz expires_at
    timestamptz used_at
    timestamptz created_at
  }

  AUDIT_LOG {
    uuid id PK
    uuid user_id FK "-> USER.id"
    varchar action
    varchar entity
    uuid entity_id
    jsonb metadata
    inet ip_address
    timestamptz created_at
  }

  ANAMNESIS {
    uuid id PK
    uuid patient_id FK "-> PATIENT.id"
    uuid professional_id FK "-> USER.id"
    jsonb content
    varchar status "draft|final"
    timestamptz created_at
    timestamptz updated_at
  }

  SETTING {
    uuid id PK
    varchar key UNIQUE
    jsonb value
    timestamptz updated_at
  }
```

Notas:
- Campos timestamptz assumem timezone-aware timestamps (PostgreSQL).
- status/role podem ser enums nativos do PostgreSQL.
- jsonb é usado para dados flexíveis (Anamnesis, metadata, Settings).

## Relacionamentos

- User 1—N Patient: profissional responsável pelo paciente (Patient.professional_id → User.id).
- User 1—N Session, Patient 1—N Session: sessões associam paciente e profissional.
- Patient 1—N Transfer; User 1—N Transfer (origem e destino).
- User 1—N Notification, RefreshToken, PasswordReset, AuditLog.
- Patient 1—N Anamnesis; User 1—N Anamnesis (quem preenche).

## Regras de Negócio (resumo)
- Transfer.status segue fluxo: pending → approved/rejected → completed (automação ao aprovar).
- Notificações geradas em eventos: transferências, sessões, segurança.
- Refresh tokens e password reset com expiração e revogação.
- AuditLog registra ações sensíveis (administração, autenticação, alterações de dados).

## Esboço DDL (PostgreSQL)

> Ajuste nomes de schemas/constraints conforme o ORM (Sequelize).

```sql
CREATE TYPE user_role AS ENUM ('admin','professional');
CREATE TYPE user_status AS ENUM ('active','blocked');
CREATE TYPE session_status AS ENUM ('scheduled','done','cancelled');
CREATE TYPE transfer_status AS ENUM ('pending','approved','rejected','cancelled','completed');
CREATE TYPE anamnesis_status AS ENUM ('draft','final');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patients (
  id UUID PRIMARY KEY,
  full_name VARCHAR(180) NOT NULL,
  birth_date DATE,
  sex VARCHAR(20),
  email VARCHAR(180),
  phone VARCHAR(40),
  address TEXT,
  professional_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  professional_id UUID NOT NULL REFERENCES users(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status session_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transfers (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  from_professional_id UUID NOT NULL REFERENCES users(id),
  to_professional_id UUID NOT NULL REFERENCES users(id),
  status transfer_status NOT NULL,
  reason TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(60) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE password_resets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(120),
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE anamneses (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  professional_id UUID NOT NULL REFERENCES users(id),
  content JSONB NOT NULL,
  status anamnesis_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settings (
  id UUID PRIMARY KEY,
  key VARCHAR(120) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
