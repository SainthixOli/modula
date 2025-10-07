/**
 * MÓDULA - ASSOCIAÇÕES ENTRE MODELOS
 * 
 * Este arquivo define os relacionamentos entre todos os modelos do sistema.
 * Deve ser importado após todos os modelos individuais serem definidos.
 * 
 * Relacionamentos implementados:
 * - User (1) → (N) Patient (profissional tem muitos pacientes)
 * - Patient (N) → (1) User (paciente pertence a um profissional)
 * 
 * 
 */

const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Importar todos os modelos
const User = require('./User');
const Patient = require('./Patient');
const Anamnesis = require('./Anamnesis');
const Session = require('./Session');
const Transfer = require('./Transfer');

// Inicializar modelos
const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Patient: Patient(sequelize, Sequelize.DataTypes),
  Anamnesis: Anamnesis(sequelize, Sequelize.DataTypes),
  Session: Session(sequelize, Sequelize.DataTypes)
};

// ============================================
// ASSOCIAÇÕES ENTRE MODELOS
// ============================================

// --------------------------------------------
// USER ASSOCIATIONS
// --------------------------------------------
// Um usuário (profissional) tem muitos pacientes
models.User.hasMany(models.Patient, {
  foreignKey: 'user_id',
  as: 'patients',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Um usuário tem muitas anamneses
models.User.hasMany(models.Anamnesis, {
  foreignKey: 'user_id',
  as: 'anamneses',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});


// Um usuário (profissional) tem muitas sessões
models.User.hasMany(models.Session, {
  foreignKey: 'user_id',
  as: 'sessions',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// --------------------------------------------
// PATIENT ASSOCIATIONS
// --------------------------------------------
// Um paciente pertence a um usuário (profissional)
models.Patient.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Um paciente tem uma anamnese
models.Patient.hasOne(models.Anamnesis, {
  foreignKey: 'patient_id',
  as: 'anamnesis',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Um paciente tem muitas sessões
models.Patient.hasMany(models.Session, {
  foreignKey: 'patient_id',
  as: 'sessions',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// --------------------------------------------
// ANAMNESIS ASSOCIATIONS
// --------------------------------------------
// Uma anamnese pertence a um paciente
models.Anamnesis.belongsTo(models.Patient, {
  foreignKey: 'patient_id',
  as: 'patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Uma anamnese pertence a um usuário (profissional)
models.Anamnesis.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// --------------------------------------------
// SESSION ASSOCIATIONS (NOVO)
// --------------------------------------------
// Uma sessão pertence a um paciente
models.Session.belongsTo(models.Patient, {
  foreignKey: 'patient_id',
  as: 'patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Uma sessão pertence a um usuário (profissional)
models.Session.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'professional',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});


// ============================================
// ASSOCIAÇÕES DO TRANSFER 
// ============================================

// Transfer -> Patient (paciente sendo transferido)
Transfer.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'Patient',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Transfer -> User (profissional de origem)
Transfer.belongsTo(User, {
  foreignKey: 'from_user_id',
  as: 'FromUser',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Transfer -> User (profissional de destino)
Transfer.belongsTo(User, {
  foreignKey: 'to_user_id',
  as: 'ToUser',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Transfer -> User (admin que processou)
Transfer.belongsTo(User, {
  foreignKey: 'processed_by',
  as: 'ProcessedBy',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Transfer -> User (usuário que cancelou)
Transfer.belongsTo(User, {
  foreignKey: 'cancelled_by',
  as: 'CancelledBy',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Associações reversas
Patient.hasMany(Transfer, {
  foreignKey: 'patient_id',
  as: 'Transfers',
});

User.hasMany(Transfer, {
  foreignKey: 'from_user_id',
  as: 'TransfersSent',
});

User.hasMany(Transfer, {
  foreignKey: 'to_user_id',
  as: 'TransfersReceived',
});

User.hasMany(Transfer, {
  foreignKey: 'processed_by',
  as: 'TransfersProcessed',
});

// ============================================
// EXPORTAR MODELOS E CONEXÃO
// ============================================
module.exports = {
  sequelize,
  User,
  Patient,
  Anamnesis,
  Session,
  Transfer,
};

/**
 * DEFINIR ASSOCIAÇÕES
 * 
 * IMPORTANTE: As associações devem ser definidas APÓS todos os modelos
 * serem carregados para evitar dependências circulares
 */

// RELACIONAMENTO: USER → PATIENT
// Um profissional (User) pode ter muitos pacientes
User.hasMany(Patient, {
  foreignKey: 'user_id',
  as: 'patients',
  onDelete: 'RESTRICT', // Não permite deletar user se tem pacientes
  onUpdate: 'CASCADE'   // Atualiza FK se user_id mudar
});

// RELACIONAMENTO: PATIENT → USER  
// Um paciente pertence a um profissional (User)
Patient.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'professional',
  onDelete: 'RESTRICT', // Não permite deletar user se tem pacientes
  onUpdate: 'CASCADE'
});

/**
 * FUNÇÕES UTILITÁRIAS PARA SYNC
 */

/**
 * Sincronizar todos os modelos com o banco de dados
 * Usado apenas em desenvolvimento
 */
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Modelos sincronizados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao sincronizar modelos:', error);
    throw error;
  }
};

/**
 * Forçar recriação de todas as tabelas
 * CUIDADO: Apaga todos os dados existentes
 */
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

/**
 * Verificar se todas as tabelas existem
 */
const checkTables = async () => {
  try {
    await User.findOne({ limit: 1 });
    await Patient.findOne({ limit: 1 });
    console.log('✅ Todas as tabelas estão acessíveis');
    return true;
  } catch (error) {
    console.log('⚠️  Algumas tabelas podem não existir ainda');
    return false;
  }
};

// Exportar modelos e funções utilitárias
module.exports = {
  // Modelos
  User,
  Patient,
  
  // Instância do Sequelize
  sequelize,
  
  // Funções utilitárias
  syncDatabase,
  resetDatabase,
  checkTables
};

/**
 * COMO USAR AS ASSOCIAÇÕES:
 * 
 * // Buscar profissional com seus pacientes
 * const professional = await User.findByPk(userId, {
 *   include: [{
 *     model: Patient,
 *     as: 'patients',
 *     where: { status: 'active' }
 *   }]
 * });
 * 
 * // Buscar paciente com dados do profissional
 * const patient = await Patient.findByPk(patientId, {
 *   include: [{
 *     model: User,
 *     as: 'professional',
 *     attributes: ['id', 'full_name', 'professional_register']
 *   }]
 * });
 * 
 * // Contar pacientes de um profissional
 * const patientCount = await professional.countPatients({
 *   where: { status: 'active' }
 * });
 * 
 * // Criar paciente associado a um profissional
 * const newPatient = await professional.createPatient({
 *   full_name: 'João Silva',
 *   email: 'joao@email.com'
 *   // user_id será definido automaticamente
 * });
 */