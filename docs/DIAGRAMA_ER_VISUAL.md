# 🎨 DIAGRAMA ER VISUAL - MÓDULA

> **Complemento do MER Completo**  
> Representação visual das entidades e relacionamentos usando Mermaid Diagram

---

## 📊 DIAGRAMA ENTIDADE-RELACIONAMENTO

```mermaid
erDiagram
    USERS ||--o{ PATIENTS : "manages"
    USERS ||--o{ ANAMNESIS : "creates"
    USERS ||--o{ SESSIONS : "conducts"
    USERS ||--o{ TRANSFERS_FROM : "sends"
    USERS ||--o{ TRANSFERS_TO : "receives"
    USERS ||--o{ TRANSFERS_PROCESSED : "processes"
    USERS ||--o{ NOTIFICATIONS_RECEIVED : "receives"
    USERS ||--o{ NOTIFICATIONS_CREATED : "creates"
    USERS ||--o{ AUDIT_LOGS : "performs"
    
    PATIENTS ||--|| ANAMNESIS : "has"
    PATIENTS ||--o{ SESSIONS : "attends"
    PATIENTS ||--o{ TRANSFERS : "involves"
    
    USERS {
        uuid id PK
        string full_name
        string email UK
        string password
        string professional_register UK
        boolean is_first_access
        enum user_type
        enum status
        string reset_password_token
        date reset_password_expires
        date last_login
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    PATIENTS {
        uuid id PK
        uuid user_id FK
        string full_name
        date birth_date
        enum gender
        string cpf UK
        string rg
        string phone
        string email
        jsonb address
        jsonb emergency_contact
        enum marital_status
        string occupation
        jsonb insurance_info
        enum status
        text notes
        text medical_history
        text current_medications
        text allergies
        date first_appointment
        date last_appointment
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    ANAMNESIS {
        uuid id PK
        uuid patient_id FK
        uuid user_id FK
        enum status
        integer completion_percentage
        date completed_at
        string last_modified_section
        jsonb identification
        jsonb family_history
        jsonb medical_history
        jsonb psychological_history
        jsonb current_complaint
        jsonb life_habits
        jsonb treatment_goals
        jsonb additional_info
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    SESSIONS {
        uuid id PK
        uuid patient_id FK
        uuid user_id FK
        integer session_number
        date session_date
        enum session_type
        integer duration_minutes
        enum status
        text session_notes
        enum patient_mood
        array techniques_used
        text homework_assigned
        jsonb evolution_report
        text next_session_plan
        enum billing_status
        decimal billing_amount
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    TRANSFERS {
        uuid id PK
        uuid patient_id FK
        uuid from_user_id FK
        uuid to_user_id FK
        enum status
        date requested_at
        date processed_at
        date completed_at
        date cancelled_at
        uuid processed_by FK
        uuid cancelled_by FK
        text reason
        text rejection_reason
        text cancellation_reason
        text clinical_summary
        jsonb attachments
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        uuid created_by FK
        enum type
        enum category
        string title
        text message
        enum priority
        boolean is_read
        date read_at
        enum action_type
        jsonb action_data
        date expires_at
        jsonb metadata
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string user_email
        string user_name
        enum user_role
        enum action
        string resource
        uuid resource_id
        jsonb old_data
        jsonb new_data
        text description
        string ip_address
        text user_agent
        enum status
        text error_message
        date retention_until
        jsonb metadata
        timestamp timestamp
    }
```

---

## 🔄 DIAGRAMA DE FLUXOS PRINCIPAIS

### Fluxo de Transferência de Paciente

```mermaid
stateDiagram-v2
    [*] --> Pending: Profissional solicita
    Pending --> Approved: Admin aprova
    Pending --> Rejected: Admin rejeita
    Pending --> Cancelled: Solicitante cancela
    
    Approved --> Completed: Sistema transfere automaticamente
    
    Rejected --> [*]
    Cancelled --> [*]
    Completed --> [*]
    
    note right of Pending
        - from_user_id definido
        - to_user_id definido
        - reason obrigatório
    end note
    
    note right of Approved
        - processed_by = admin_id
        - processed_at = NOW()
    end note
    
    note right of Completed
        - patient.user_id = to_user_id
        - completed_at = NOW()
    end note
```

### Fluxo de Sessão

```mermaid
stateDiagram-v2
    [*] --> Scheduled: Criação
    Scheduled --> Confirmed: Paciente confirma
    Scheduled --> Cancelled: Cancelamento
    Scheduled --> NoShow: Paciente falta
    Scheduled --> Rescheduled: Reagendamento
    
    Confirmed --> InProgress: Início da sessão
    InProgress --> Completed: Finalização
    
    Rescheduled --> Scheduled: Nova data
    
    Cancelled --> [*]
    NoShow --> [*]
    Completed --> [*]
    
    note right of Completed
        - session_notes obrigatório
        - evolution_report preenchido
        - last_appointment atualizado
    end note
```

### Fluxo de Anamnese

```mermaid
stateDiagram-v2
    [*] --> Draft: Criação
    Draft --> InProgress: Início do preenchimento
    InProgress --> InProgress: Salvamentos parciais
    InProgress --> Completed: Finalização
    Completed --> Reviewed: Revisão pelo profissional
    
    Reviewed --> [*]
    
    note right of InProgress
        - completion_percentage atualiza
        - last_modified_section registra
    end note
    
    note right of Completed
        - completion_percentage = 100
        - completed_at = NOW()
    end note
```

---

## 📈 DIAGRAMA DE CARDINALIDADES

```mermaid
graph LR
    subgraph "1 Profissional"
        P[USER<br/>professional]
    end
    
    subgraph "N Pacientes"
        PT1[PATIENT 1]
        PT2[PATIENT 2]
        PT3[PATIENT ...]
    end
    
    subgraph "N Sessões"
        S1[SESSION 1]
        S2[SESSION 2]
        S3[SESSION ...]
    end
    
    subgraph "N Anamneses"
        A1[ANAMNESIS 1]
        A2[ANAMNESIS 2]
        A3[ANAMNESIS ...]
    end
    
    P -->|1:N| PT1
    P -->|1:N| PT2
    P -->|1:N| PT3
    
    PT1 -->|1:1| A1
    PT2 -->|1:1| A2
    
    PT1 -->|1:N| S1
    PT1 -->|1:N| S2
    PT2 -->|1:N| S3
    
    P -->|conducts| S1
    P -->|conducts| S2
    P -->|conducts| S3
```

---

## 🔐 DIAGRAMA DE SEGURANÇA E AUDITORIA

```mermaid
graph TB
    subgraph "Operações do Sistema"
        OP1[CREATE]
        OP2[READ]
        OP3[UPDATE]
        OP4[DELETE]
        OP5[LOGIN]
        OP6[EXPORT]
    end
    
    subgraph "Middleware de Auditoria"
        MW[auditMiddleware]
    end
    
    subgraph "Audit Service"
        AS[auditService]
    end
    
    subgraph "Banco de Dados"
        AL[(AUDIT_LOGS)]
    end
    
    OP1 --> MW
    OP2 --> MW
    OP3 --> MW
    OP4 --> MW
    OP5 --> MW
    OP6 --> MW
    
    MW -->|Intercepta| AS
    AS -->|Registra| AL
    
    AL -->|Retenção<br/>90 dias| CLEANUP[Cleanup Job<br/>Diário 3h]
    
    style AL fill:#f9f,stroke:#333,stroke-width:4px
    style MW fill:#bbf,stroke:#333,stroke-width:2px
    style AS fill:#bfb,stroke:#333,stroke-width:2px
```

---

## 📊 DIAGRAMA DE JOBS AUTOMATIZADOS

```mermaid
gantt
    title Jobs Automatizados do Sistema
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Backup
    Backup Diário           :done, 02:00, 30m
    
    section Auditoria
    Cleanup Logs            :done, 03:00, 15m
    
    section Monitoramento
    Health Check            :active, 00:00, 24h
    
    section Notificações
    Triggers em Tempo Real  :active, 00:00, 24h
```

**Frequências:**
- **Backup Job:** Diariamente às 02:00
- **Audit Cleanup Job:** Diariamente às 03:00
- **Health Check Job:** A cada 5 minutos (24/7)
- **Notification Triggers:** Em tempo real (event-driven)

---

## 🗂️ DIAGRAMA DE ÍNDICES POR TABELA

```mermaid
graph TD
    subgraph "USERS - 4 índices"
        U1[email - UNIQUE]
        U2[professional_register - UNIQUE]
        U3[user_type]
        U4[status]
    end
    
    subgraph "PATIENTS - 6 índices"
        P1[user_id - FK]
        P2[full_name]
        P3[cpf - UNIQUE]
        P4[status]
        P5[created_at]
        P6[address - GIN JSONB]
    end
    
    subgraph "SESSIONS - 6 índices"
        S1[patient_id - FK]
        S2[user_id - FK]
        S3[patient_id + session_number - COMPOSITE]
        S4[session_date]
        S5[status]
        S6[billing_status]
    end
    
    subgraph "AUDIT_LOGS - 9 índices"
        A1[user_id - FK]
        A2[action]
        A3[resource]
        A4[resource + resource_id - COMPOSITE]
        A5[timestamp DESC]
        A6[user_email]
        A7[ip_address]
        A8[retention_until]
        A9[status]
    end
```

---

## 💾 DIAGRAMA DE ESTRATÉGIAS DE DELEÇÃO

```mermaid
graph LR
    subgraph "CASCADE - Deleção em cascata"
        C1[Patient → Anamnesis]
        C2[Patient → Sessions]
        C3[User → Notifications recebidas]
    end
    
    subgraph "RESTRICT - Impede deleção"
        R1[User com Patients → BLOQUEADO]
        R2[User com Sessions → BLOQUEADO]
        R3[Patient com Transfers → BLOQUEADO]
    end
    
    subgraph "SET NULL - Mantém registro"
        N1[Transfer.processed_by → NULL]
        N2[Transfer.cancelled_by → NULL]
        N3[Notification.created_by → NULL]
    end
    
    style C1 fill:#faa,stroke:#333
    style C2 fill:#faa,stroke:#333
    style C3 fill:#faa,stroke:#333
    
    style R1 fill:#fa4,stroke:#333
    style R2 fill:#fa4,stroke:#333
    style R3 fill:#fa4,stroke:#333
    
    style N1 fill:#afa,stroke:#333
    style N2 fill:#afa,stroke:#333
    style N3 fill:#afa,stroke:#333
```

**Legenda:**
- 🔴 **CASCADE:** Dados dependentes são deletados
- 🟠 **RESTRICT:** Operação é bloqueada se houver dependências
- 🟢 **SET NULL:** Referência é anulada mas registro é mantido

---

## 🔄 DIAGRAMA DE RELACIONAMENTOS MÚLTIPLOS (TRANSFER)

```mermaid
graph TD
    T[TRANSFER<br/>Transferência]
    
    U1[USER<br/>From Professional]
    U2[USER<br/>To Professional]
    U3[USER<br/>Processed By Admin]
    U4[USER<br/>Cancelled By User]
    P[PATIENT<br/>Paciente]
    
    U1 -->|from_user_id| T
    U2 -->|to_user_id| T
    U3 -->|processed_by| T
    U4 -->|cancelled_by| T
    P -->|patient_id| T
    
    style T fill:#f9f,stroke:#333,stroke-width:4px
    style U1 fill:#bbf,stroke:#333
    style U2 fill:#bbf,stroke:#333
    style U3 fill:#bfb,stroke:#333
    style U4 fill:#fbb,stroke:#333
    style P fill:#ffb,stroke:#333
```

**4 Foreign Keys para USER na mesma tabela!**

---

## 📱 DIAGRAMA DE CASOS DE USO

```mermaid
graph TB
    subgraph "Admin"
        A[Administrador]
    end
    
    subgraph "Professional"
        P[Profissional]
    end
    
    subgraph "Sistema"
        UC1[Gerenciar Usuários]
        UC2[Aprovar Transferências]
        UC3[Ver Logs de Auditoria]
        UC4[Executar Backups]
        UC5[Ver Métricas]
        
        UC6[Gerenciar Pacientes]
        UC7[Criar Anamnese]
        UC8[Registrar Sessões]
        UC9[Solicitar Transferência]
        UC10[Ver Notificações]
    end
    
    A --> UC1
    A --> UC2
    A --> UC3
    A --> UC4
    A --> UC5
    A --> UC6
    A --> UC7
    A --> UC8
    A --> UC9
    A --> UC10
    
    P --> UC6
    P --> UC7
    P --> UC8
    P --> UC9
    P --> UC10
    
    style A fill:#faa,stroke:#333,stroke-width:2px
    style P fill:#afa,stroke:#333,stroke-width:2px
```

---

**Este diagrama complementa o MER_COMPLETO.md com representações visuais.**

**Desenvolvido por:** Equipe Módula  
**Versão:** 2.0.0  
**Data:** 06 de Novembro de 2025
