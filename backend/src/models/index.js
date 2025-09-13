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

const { sequelize } = require('../config/database');

// Importar todos os modelos
const User = require('./User');
const Patient = require('./Patient');

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