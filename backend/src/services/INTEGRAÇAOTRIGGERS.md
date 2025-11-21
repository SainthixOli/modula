# 🔔 GUIA DE INTEGRAÇÃO - NOTIFICATION TRIGGERS

## 📋 O QUE SÃO OS TRIGGERS?

Os triggers são funções que **criam notificações automaticamente** quando eventos específicos acontecem no sistema.

Por exemplo:
- ✅ Transferência solicitada → Admins recebem notificação
- ✅ Sessão amanhã → Profissional recebe lembrete
- ✅ Anamnese pendente há 7 dias → Profissional recebe aviso

---

## 🔧 INSTALAÇÃO DA DEPENDÊNCIA

```bash
# Instalar node-cron para jobs agendados
npm install node-cron

# OU
yarn add node-cron
```

---

## 📦 ONDE COLOCAR O ARQUIVO

```
backend/
└── src/
    └── services/
        └── notificationTriggers.js  ← CRIAR AQUI
```

---

## 🚀 PASSO 1: CONFIGURAR NO SERVER.JS

Adicione no final do arquivo `server.js`, **ANTES** de `app.listen()`:

```javascript
// ============================================
// CONFIGURAR NOTIFICATION TRIGGERS
// ============================================
const notificationTriggers = require('./src/services/notificationTriggers');

// Inicializar cron jobs
notificationTriggers.setupCronJobs();
console.log('✓ Notification triggers configurados');

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
```

---

## 🔗 PASSO 2: INTEGRAR NOS CONTROLLERS

### **A. transferController.js**

```javascript
// NO TOPO DO ARQUIVO (após os requires)
const notificationTriggers = require('../services/notificationTriggers');

// ============================================
// 1. APÓS CRIAR TRANSFERÊNCIA
// ============================================
const requestTransfer = async (req, res) => {
  // ... código existente ...
  
  const transfer = await Transfer.create({ /* ... */ });
  
  // ✅ ADICIONAR TRIGGER AQUI
  await notificationTriggers.notifyTransferRequested(
    transfer, 
    req.user.full_name
  );
  
  res.status(201).json({ /* ... */ });
};

// ============================================
// 2. APÓS APROVAR TRANSFERÊNCIA
// ============================================
const approveTransfer = async (req, res) => {
  // ... código existente ...
  
  await transfer.approve(adminId, notes);
  
  // ✅ ADICIONAR TRIGGER AQUI
  await notificationTriggers.notifyTransferApproved(
    transfer,
    req.user.full_name
  );
  
  res.json({ /* ... */ });
};

// ============================================
// 3. APÓS REJEITAR TRANSFERÊNCIA
// ============================================
const rejectTransfer = async (req, res) => {
  // ... código existente ...
  
  await transfer.reject(adminId, reason);
  
  // ✅ ADICIONAR TRIGGER AQUI
  await notificationTriggers.notifyTransferRejected(
    transfer,
    req.user.full_name,
    reason
  );
  
  res.json({ /* ... */ });
};
```

---

### **B. sessionController.js**

```javascript
// NO TOPO DO ARQUIVO
const notificationTriggers = require('../services/notificationTriggers');

// ============================================
// APÓS CANCELAR SESSÃO
// ============================================
const cancelSession = async (req, res) => {
  // ... código existente ...
  
  const { reason } = req.body;
  
  // Carregar sessão com dados do paciente
  const session = await Session.findByPk(id, {
    include: [{ model: Patient, as: 'Patient' }],
  });
  
  // Cancelar
  await session.update({ status: 'cancelled' });
  
  // ✅ ADICIONAR TRIGGER AQUI
  await notificationTriggers.notifySessionCancelled(session, reason);
  
  res.json({ /* ... */ });
};
```

---

### **C. professionalController.js**

```javascript
// NO TOPO DO ARQUIVO
const notificationTriggers = require('../services/notificationTriggers');

// ============================================
// APÓS CRIAR PACIENTE
// ============================================
const createPatient = async (req, res) => {
  // ... código existente ...
  
  const patient = await Patient.create({
    ...req.body,
    user_id: req.userId,
  });
  
  // ✅ ADICIONAR TRIGGER AQUI
  await notificationTriggers.notifyNewPatient(
    patient,
    req.userId
  );
  
  res.status(201).json({ /* ... */ });
};
```

---