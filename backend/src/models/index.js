/**
 * MÓDULA - MODELS INDEX
 * 
 * Arquivo central de associações entre modelos do Sequelize.
 * Define todos os relacionamentos entre as entidades do sistema.
 * 
 * Modelos implementados:
 * - User (usuários do sistema)
 * - Patient (pacientes)
 * - Anamnesis (anamneses)
 * - Session (consultas/sessões)
 * - Transfer (transferências)
 * - Notification (notificações)
 */

const sequelize = require('../config/database');

// ============================================
// IMPORTAR TODOS OS MODELOS
// ============================================
const User = require('./User');
const Patient = require('./Patient');
const Anamnesis = require('./Anamnesis');
const Session = require('./Session');
const Transfer = require('./Transfer');
const Notification = require('./Notification');

// ============================================
// ASSOCIAÇÕES: USER ↔ PATIENT
// ============================================

// Um profissional tem muitos pacientes
User.hasMany(Patient, {
  foreignKey: 'user_id',
  as: 'Patients',
  onDelete: 'RESTRICT', // Não permite deletar profissional com pacientes
  onUpdate: 'CASCADE',
});

// Um paciente pertence a um profissional
Patient.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'Professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// ============================================
// ASSOCIAÇÕES: PATIENT ↔ ANAMNESIS
// ============================================

// Um paciente tem uma anamnese
Patient.hasOne(Anamnesis, {
  foreignKey: 'patient_id',
  as: 'Anamnesis',
  onDelete: 'CASCADE', // Deletar anamnese quando paciente é deletado
  onUpdate: 'CASCADE',
});

// Uma anamnese pertence a um paciente
Anamnesis.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'Patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// ============================================
// ASSOCIAÇÕES: USER ↔ ANAMNESIS
// ============================================

// Um profissional tem muitas anamneses
User.hasMany(Anamnesis, {
  foreignKey: 'user_id',
  as: 'Anamneses',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Uma anamnese pertence a um profissional
Anamnesis.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'Professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// ============================================
// ASSOCIAÇÕES: PATIENT ↔ SESSION
// ============================================

// Um paciente tem muitas sessões
Patient.hasMany(Session, {
  foreignKey: 'patient_id',
  as: 'Sessions',
  onDelete: 'CASCADE', // Deletar sessões quando paciente é deletado
  onUpdate: 'CASCADE',
});

// Uma sessão pertence a um paciente
Session.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'Patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// ============================================
// ASSOCIAÇÕES: USER ↔ SESSION
// ============================================

// Um profissional tem muitas sessões
User.hasMany(Session, {
  foreignKey: 'user_id',
  as: 'Sessions',
  onDelete: 'RESTRICT', // Não permite deletar profissional com sessões
  onUpdate: 'CASCADE',
});

// Uma sessão pertence a um profissional
Session.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'Professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// ============================================
// ASSOCIAÇÕES: TRANSFER ↔ PATIENT
// ============================================

// Um paciente tem muitas transferências (histórico)
Patient.hasMany(Transfer, {
  foreignKey: 'patient_id',
  as: 'Transfers',
  onDelete: 'RESTRICT', // Manter histórico de transferências
  onUpdate: 'CASCADE',
});

// Uma transferência pertence a um paciente
Transfer.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'Patient',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// ============================================
// ASSOCIAÇÕES: TRANSFER ↔ USER (MÚLTIPLAS)
// ============================================

// Transferências enviadas por um profissional
User.hasMany(Transfer, {
  foreignKey: 'from_user_id',
  as: 'TransfersSent',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Transferências recebidas por um profissional
User.hasMany(Transfer, {
  foreignKey: 'to_user_id',
  as: 'TransfersReceived',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Transferências processadas por um admin
User.hasMany(Transfer, {
  foreignKey: 'processed_by',
  as: 'TransfersProcessed',
  onDelete: 'SET NULL', // Manter registro mesmo se admin for deletado
  onUpdate: 'CASCADE',
});

// Transferências canceladas por um usuário
User.hasMany(Transfer, {
  foreignKey: 'cancelled_by',
  as: 'TransfersCancelled',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Uma transferência tem um profissional de origem
Transfer.belongsTo(User, {
  foreignKey: 'from_user_id',
  as: 'FromUser',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Uma transferência tem um profissional de destino
Transfer.belongsTo(User, {
  foreignKey: 'to_user_id',
  as: 'ToUser',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Uma transferência pode ter sido processada por um admin
Transfer.belongsTo(User, {
  foreignKey: 'processed_by',
  as: 'ProcessedBy',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Uma transferência pode ter sido cancelada por um usuário
Transfer.belongsTo(User, {
  foreignKey: 'cancelled_by',
  as: 'CancelledBy',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// ============================================
// ASSOCIAÇÕES: NOTIFICATION ↔ USER
// ============================================

// Um usuário tem muitas notificações
User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'Notifications',
  onDelete: 'CASCADE', // Deletar notificações quando usuário é deletado
  onUpdate: 'CASCADE',
});

// Um usuário pode ter criado muitas notificações
User.hasMany(Notification, {
  foreignKey: 'created_by',
  as: 'CreatedNotifications',
  onDelete: 'SET NULL', // Manter notificação mesmo se criador for deletado
  onUpdate: 'CASCADE',
});

// Uma notificação pertence a um usuário (destinatário)
Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'User',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Uma notificação pode ter sido criada por um usuário
Notification.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'Creator',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// ============================================
// EXPORTAR TUDO
// ============================================

module.exports = {
  sequelize,
  User,
  Patient,
  Anamnesis,
  Session,
  Transfer,
  Notification,
};

/**
 * RESUMO DAS ASSOCIAÇÕES:
 * 
 * USER (Profissional/Admin):
 * - hasMany: Patients, Anamneses, Sessions
 * - hasMany: TransfersSent, TransfersReceived, TransfersProcessed, TransfersCancelled
 * - hasMany: Notifications, CreatedNotifications
 * 
 * PATIENT:
 * - belongsTo: Professional (User)
 * - hasOne: Anamnesis
 * - hasMany: Sessions, Transfers
 * 
 * ANAMNESIS:
 * - belongsTo: Patient, Professional (User)
 * 
 * SESSION:
 * - belongsTo: Patient, Professional (User)
 * 
 * TRANSFER:
 * - belongsTo: Patient
 * - belongsTo: FromUser (User), ToUser (User), ProcessedBy (User), CancelledBy (User)
 * 
 * NOTIFICATION:
 * - belongsTo: User (destinatário), Creator (User)
 * 
 * ESTRATÉGIAS DE DELEÇÃO:
 * 
 * CASCADE:
 * - Patient deletado → deleta Anamnesis, Sessions
 * - User deletado → deleta Notifications (recebidas)
 * 
 * RESTRICT:
 * - Não permite deletar User com Patients, Sessions, Anamneses
 * - Não permite deletar Patient com Transfers (histórico)
 * 
 * SET NULL:
 * - Admin deletado → Transfer mantém registro mas processed_by = null
 * - Usuário deletado → Notification criada por ele mantém registro
 */