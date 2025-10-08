/**
 * MÓDULA - ASSOCIAÇÕES ENTRE MODELOS
 * 
 * Define todos os relacionamentos entre modelos e exporta a instância do Sequelize.
 */

const { sequelize } = require('../config/database');

// Importar modelos
const User = require('./User');
const Patient = require('./Patient');
const Anamnesis = require('./Anamnesis');
const Session = require('./Session');
const Transfer = require('./Transfer');

// ============================================
// ASSOCIAÇÕES ENTRE MODELOS
// ============================================

// ----------------- USER -----------------
// Um usuário (profissional) tem muitos pacientes
User.hasMany(Patient, {
  foreignKey: 'user_id',
  as: 'patients',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Um usuário tem muitas anamneses
User.hasMany(Anamnesis, {
  foreignKey: 'user_id',
  as: 'anamneses',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Um usuário tem muitas sessões
User.hasMany(Session, {
  foreignKey: 'user_id',
  as: 'sessions',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// ----------------- PATIENT -----------------
// Um paciente pertence a um usuário (profissional)
Patient.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Um paciente tem uma anamnese
Patient.hasOne(Anamnesis, {
  foreignKey: 'patient_id',
  as: 'anamnesis',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Um paciente tem muitas sessões
Patient.hasMany(Session, {
  foreignKey: 'patient_id',
  as: 'sessions',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// ----------------- ANAMNESIS -----------------
// Uma anamnese pertence a um paciente
Anamnesis.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Uma anamnese pertence a um usuário
Anamnesis.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// ----------------- SESSION -----------------
// Uma sessão pertence a um paciente
Session.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Uma sessão pertence a um usuário
Session.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// ----------------- TRANSFER -----------------
// Transfer -> Patient
Transfer.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'Patient',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Transfer -> User (origem)
Transfer.belongsTo(User, {
  foreignKey: 'from_user_id',
  as: 'FromUser',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Transfer -> User (destino)
Transfer.belongsTo(User, {
  foreignKey: 'to_user_id',
  as: 'ToUser',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Transfer -> User (admin processou)
Transfer.belongsTo(User, {
  foreignKey: 'processed_by',
  as: 'ProcessedBy',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Transfer -> User (cancelado por)
Transfer.belongsTo(User, {
  foreignKey: 'cancelled_by',
  as: 'CancelledBy',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Relações reversas
Patient.hasMany(Transfer, { foreignKey: 'patient_id', as: 'Transfers' });
User.hasMany(Transfer, { foreignKey: 'from_user_id', as: 'TransfersSent' });
User.hasMany(Transfer, { foreignKey: 'to_user_id', as: 'TransfersReceived' });
User.hasMany(Transfer, { foreignKey: 'processed_by', as: 'TransfersProcessed' });
User.hasMany(Transfer, { foreignKey: 'cancelled_by', as: 'TransfersCancelled' });

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Modelos sincronizados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
    throw error;
  }
};

const resetDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Base de dados resetada com sucesso');
    console.log('⚠️  ATENÇÃO: Todos os dados foram apagados');
  } catch (error) {
    console.error('❌ Erro ao resetar base de dados:', error);
    throw error;
  }
};

const checkTables = async () => {
  try {
    await User.findOne({ limit: 1 });
    await Patient.findOne({ limit: 1 });
    console.log('✅ Todas as tabelas estão acessíveis');
    return true;
  } catch (error) {
    console.log('⚠️ Algumas tabelas podem não existir ainda');
    return false;
  }
};

// ============================================
// EXPORTAR
// ============================================

module.exports = {
  sequelize,
  User,
  Patient,
  Anamnesis,
  Session,
  Transfer,
  syncDatabase,
  resetDatabase,
  checkTables
};
