/**
 * MÓDULA - CONTROLLER DE ADMINISTRAÇÃO
 * 
 * Contém toda a lógica de negócio para operações administrativas.
 * Implementa dashboard, CRUD de profissionais e estatísticas.
 * 
 * Funcionalidades:
 * - Dashboard com estatísticas gerais
 * - Gestão completa de profissionais
 * - Relatórios e análises
 * - Sistema de reset de senhas
 * 
 */

const { Op } = require('sequelize');
const { User, Patient } = require('../models');
const { AppError, createNotFoundError, createValidationError } = require('../middleware/errorHandler');
const crypto = require('crypto');

/**
 * DASHBOARD E ESTATÍSTICAS
 */

/**
 * GET /api/admin/dashboard
 * Carrega dados principais do dashboard administrativo
 */
const getDashboard = async (req, res) => {
  // Buscar estatísticas em paralelo para melhor performance
  const [
    totalProfessionals,
    activeProfessionals,
    inactiveProfessionals,
    totalPatients,
    activePatients,
    inactivePatients,
    recentProfessionals,
    recentPatients
  ] = await Promise.all([
    // Contar profissionais
    User.count({ where: { user_type: 'professional' } }),
    User.count({ where: { user_type: 'professional', status: 'active' } }),
    User.count({ where: { user_type: 'professional', status: { [Op.ne]: 'active' } } }),
    
    // Contar pacientes
    Patient.count(),
    Patient.count({ where: { status: 'active' } }),
    Patient.count({ where: { status: { [Op.ne]: 'active' } } }),
    
    // Profissionais cadastrados nos últimos 7 dias
    User.count({
      where: {
        user_type: 'professional',
        created_at: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Pacientes cadastrados nos últimos 7 dias
    Patient.count({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  // Calcular algumas métricas úteis
  const professionalActiveRate = totalProfessionals > 0 
    ? Math.round((activeProfessionals / totalProfessionals) * 100) 
    : 0;
    
  const patientActiveRate = totalPatients > 0
    ? Math.round((activePatients / totalPatients) * 100)
    : 0;
    
  const avgPatientsPerProfessional = activeProfessionals > 0
    ? Math.round(activePatients / activeProfessionals)
    : 0;

  res.json({
    success: true,
    message: 'Dashboard carregado com sucesso',
    data: {
      // Números principais
      overview: {
        professionals: {
          total: totalProfessionals,
          active: activeProfessionals,
          inactive: inactiveProfessionals,
          activeRate: professionalActiveRate
        },
        patients: {
          total: totalPatients,
          active: activePatients,
          inactive: inactivePatients,
          activeRate: patientActiveRate
        },
        metrics: {
          avgPatientsPerProfessional,
          recentProfessionals,
          recentPatients
        }
      },
      // Timestamp para cache
      generatedAt: new Date().toISOString()
    }
  });
};

/**
 * GET /api/admin/stats/overview
 * Estatísticas detalhadas da clínica
 */
const getOverviewStats = async (req, res) => {
  const { period = 'month' } = req.query;
  
  // Calcular data de início baseada no período
  let startDate;
  const now = new Date();
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      break;
    default: // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [growthStats, statusDistribution] = await Promise.all([
    // Estatísticas de crescimento
    Promise.all([
      User.count({
        where: {
          user_type: 'professional',
          created_at: { [Op.gte]: startDate }
        }
      }),
      Patient.count({
        where: {
          created_at: { [Op.gte]: startDate }
        }
      })
    ]),
    
    // Distribuição por status
    Promise.all([
      User.findAll({
        where: { user_type: 'professional' },
        attributes: [
          'status',
          [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),
      Patient.findAll({
        attributes: [
          'status',
          [Patient.sequelize.fn('COUNT', Patient.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      })
    ])
  ]);

  const [newProfessionals, newPatients] = growthStats;
  const [professionalsByStatus, patientsByStatus] = statusDistribution;

  res.json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: {
      period,
      startDate,
      growth: {
        newProfessionals,
        newPatients
      },
      distribution: {
        professionals: professionalsByStatus,
        patients: patientsByStatus
      }
    }
  });
};

/**
 * GESTÃO DE PROFISSIONAIS
 */

/**
 * GET /api/admin/professionals
 * Lista profissionais com filtros e paginação
 */
const listProfessionals = async (req, res) => {
  // Extrair e validar parâmetros de query
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const search = req.query.search?.trim() || '';
  const status = req.query.status || '';
  const sortBy = req.query.sortBy || 'full_name';
  const order = req.query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  // Construir condições de busca
  const whereConditions = {
    user_type: 'professional'
  };
  
  // Filtro por busca (nome, email ou registro)
  if (search) {
    whereConditions[Op.or] = [
      { full_name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { professional_register: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  // Filtro por status
  if (status && ['active', 'inactive', 'suspended'].includes(status)) {
    whereConditions.status = status;
  }
  
  // Validar campo de ordenação
  const allowedSortFields = ['full_name', 'email', 'status', 'created_at', 'last_login'];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'full_name';
  
  try {
    // Buscar profissionais com contagem total
    const { rows: professionals, count: total } = await User.findAndCountAll({
      where: whereConditions,
      attributes: {
        exclude: ['password', 'reset_password_token']
      },
      include: [{
        model: Patient,
        as: 'patients',
        attributes: [],
        required: false
      }],
      attributes: {
        include: [
          [User.sequelize.fn('COUNT', User.sequelize.col('patients.id')), 'patient_count']
        ],
        exclude: ['password', 'reset_password_token']
      },
      group: ['User.id'],
      subQuery: false,
      limit,
      offset: (page - 1) * limit,
      order: [[validSortBy, order]],
      distinct: true
    });
    
    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      message: 'Profissionais listados com sucesso',
      data: professionals,
      metadata: {
        pagination: {
          current_page: page,
          per_page: limit,
          total: total,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        },
        filters: {
          search,
          status,
          sort_by: validSortBy,
          order: order.toLowerCase()
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    throw new AppError('Erro interno ao buscar profissionais', 500);
  }
};

/**
 * POST /api/admin/professionals
 * Criar novo profissional com senha temporária
 */
const createProfessional = async (req, res) => {
  const { full_name, email, professional_register } = req.body;
  
  // Verificar se email já existe
  const existingEmail = await User.findByEmail(email);
  if (existingEmail) {
    throw new AppError('Este email já está em uso', 409, 'EMAIL_EXISTS');
  }
  
  // Verificar se registro profissional já existe (se fornecido)
  if (professional_register) {
    const existingRegister = await User.findOne({
      where: { professional_register: professional_register.trim() }
    });
    if (existingRegister) {
      throw new AppError('Este registro profissional já está em uso', 409, 'REGISTER_EXISTS');
    }
  }
  
  // Gerar senha temporária segura (8 caracteres alfanuméricos)
  const temporaryPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  try {
    // Criar profissional
    const newProfessional = await User.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      professional_register: professional_register?.trim() || null,
      password: temporaryPassword, // Será hasheada automaticamente pelo hook
      user_type: 'professional',
      is_first_access: true,
      status: 'active'
    });
    
    // Remover dados sensíveis para resposta
    const professionalData = newProfessional.toJSON();
    delete professionalData.password;
    delete professionalData.reset_password_token;
    
    // TODO: Implementar envio de email com credenciais
    // await emailService.sendWelcomeEmail(email, temporaryPassword);
    
    res.status(201).json({
      success: true,
      message: 'Profissional criado com sucesso',
      data: {
        professional: professionalData,
        // Mostrar senha temporária apenas uma vez para o admin
        credentials: {
          email: email,
          temporary_password: temporaryPassword,
          first_access_required: true
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    throw new AppError('Erro interno ao criar profissional', 500);
  }
};

/**
 * GET /api/admin/professionals/:id
 * Obter detalhes específicos de um profissional
 */
const getProfessionalById = async (req, res) => {
  const { id } = req.params;
  
  const professional = await User.findOne({
    where: {
      id,
      user_type: 'professional'
    },
    attributes: {
      exclude: ['password', 'reset_password_token']
    },
    include: [{
      model: Patient,
      as: 'patients',
      attributes: ['id', 'full_name', 'status', 'created_at', 'last_appointment'],
      limit: 5, // Últimos 5 pacientes para preview
      order: [['created_at', 'DESC']]
    }]
  });
  
  if (!professional) {
    throw createNotFoundError('Profissional não encontrado');
  }
  
  // Calcular estatísticas do profissional
  const [totalPatients, activePatients] = await Promise.all([
    Patient.count({ where: { user_id: id } }),
    Patient.count({ where: { user_id: id, status: 'active' } })
  ]);
  
  res.json({
    success: true,
    message: 'Profissional encontrado com sucesso',
    data: {
      ...professional.toJSON(),
      statistics: {
        total_patients: totalPatients,
        active_patients: activePatients,
        inactive_patients: totalPatients - activePatients
      }
    }
  });
};

/**
 * PUT /api/admin/professionals/:id
 * Atualizar dados de um profissional
 */
const updateProfessional = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, professional_register } = req.body;
  
  // Buscar profissional
  const professional = await User.findOne({
    where: { id, user_type: 'professional' }
  });
  
  if (!professional) {
    throw createNotFoundError('Profissional não encontrado');
  }
  
  // Verificar email único (se está mudando)
  if (email && email.toLowerCase() !== professional.email) {
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      throw new AppError('Este email já está em uso', 409, 'EMAIL_EXISTS');
    }
  }
  
  // Verificar registro único (se está mudando)
  if (professional_register && professional_register !== professional.professional_register) {
    const existingRegister = await User.findOne({
      where: { 
        professional_register: professional_register.trim(),
        id: { [Op.ne]: id } // Excluir o próprio profissional
      }
    });
    if (existingRegister) {
      throw new AppError('Este registro profissional já está em uso', 409, 'REGISTER_EXISTS');
    }
  }
  
  // Atualizar dados
  const updatedData = {};
  if (full_name) updatedData.full_name = full_name.trim();
  if (email) updatedData.email = email.toLowerCase().trim();
  if (professional_register !== undefined) {
    updatedData.professional_register = professional_register ? professional_register.trim() : null;
  }
  
  await professional.update(updatedData);
  
  // Retornar dados atualizados
  const professionalData = professional.toJSON();
  delete professionalData.password;
  delete professionalData.reset_password_token;
  
  res.json({
    success: true,
    message: 'Profissional atualizado com sucesso',
    data: professionalData
  });
};

/**
 * PUT /api/admin/professionals/:id/status
 * Atualizar status de um profissional
 */
const updateProfessionalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const professional = await User.findOne({
    where: { id, user_type: 'professional' }
  });
  
  if (!professional) {
    throw createNotFoundError('Profissional não encontrado');
  }
  
  await professional.update({ status });
  
  res.json({
    success: true,
    message: `Profissional ${status === 'active' ? 'ativado' : 'desativado'} com sucesso`,
    data: {
      id: professional.id,
      full_name: professional.full_name,
      status: professional.status
    }
  });
};

/**
 * POST /api/admin/professionals/:id/reset-password
 * Gerar nova senha temporária para profissional
 */
const resetProfessionalPassword = async (req, res) => {
  const { id } = req.params;
  const { sendEmail = true } = req.body;
  
  const professional = await User.findOne({
    where: { id, user_type: 'professional' }
  });
  
  if (!professional) {
    throw createNotFoundError('Profissional não encontrado');
  }
  
  // Gerar nova senha temporária
  const temporaryPassword = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  // Atualizar no banco
  await professional.update({
    password: temporaryPassword, // Será hasheada automaticamente
    is_first_access: true, // Forçar alteração no próximo login
    reset_password_token: null, // Limpar tokens existentes
    reset_password_expires: null
  });
  
  // TODO: Implementar envio de email
  // if (sendEmail) {
  //   await emailService.sendPasswordReset(professional.email, temporaryPassword);
  // }
  
  res.json({
    success: true,
    message: 'Senha resetada com sucesso',
    data: {
      professional_id: professional.id,
      professional_name: professional.full_name,
      // Mostrar senha apenas se email não foi enviado
      ...(sendEmail ? {} : { temporary_password: temporaryPassword }),
      email_sent: sendEmail,
      first_access_required: true
    }
  });
};

/**
 * ESTATÍSTICAS ESPECÍFICAS
 */

/**
 * GET /api/admin/stats/professionals
 * Estatísticas detalhadas dos profissionais
 */
const getProfessionalsStats = async (req, res) => {
  const { period = 'month' } = req.query;
  
  // Calcular período
  let startDate;
  const now = new Date();
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  const [
    totalStats,
    statusDistribution,
    recentActivity,
    topProfessionals
  ] = await Promise.all([
    // Estatísticas totais
    User.findAll({
      where: { user_type: 'professional' },
      attributes: [
        [User.sequelize.fn('COUNT', User.sequelize.col('User.id')), 'total'],
        [User.sequelize.fn('COUNT', User.sequelize.literal(`CASE WHEN status = 'active' THEN 1 END`)), 'active'],
        [User.sequelize.fn('COUNT', User.sequelize.literal(`CASE WHEN created_at >= '${startDate.toISOString()}' THEN 1 END`)), 'new_in_period']
      ],
      raw: true
    }),
    
    // Distribuição por status
    User.findAll({
      where: { user_type: 'professional' },
      attributes: [
        'status',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }),
    
    // Atividade recente (últimos 30 dias)
    User.findAll({
      where: {
        user_type: 'professional',
        last_login: {
          [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: ['id', 'full_name', 'last_login'],
      order: [['last_login', 'DESC']],
      limit: 10
    }),
    
    // Top profissionais por número de pacientes
    User.findAll({
      where: { 
        user_type: 'professional',
        status: 'active'
      },
      attributes: [
        'id', 
        'full_name',
        [User.sequelize.fn('COUNT', User.sequelize.col('patients.id')), 'patient_count']
      ],
      include: [{
        model: Patient,
        as: 'patients',
        attributes: [],
        where: { status: 'active' },
        required: false
      }],
      group: ['User.id'],
      order: [[User.sequelize.literal('patient_count'), 'DESC']],
      limit: 10,
      subQuery: false
    })
  ]);
  
  res.json({
    success: true,
    message: 'Estatísticas dos profissionais obtidas com sucesso',
    data: {
      period,
      overview: totalStats[0],
      status_distribution: statusDistribution,
      recent_activity: recentActivity,
      top_professionals: topProfessionals
    }
  });
};

/**
 * GET /api/admin/stats/patients
 * Estatísticas gerais dos pacientes da clínica
 */
const getPatientsStats = async (req, res) => {
  const [
    totalStats,
    statusDistribution,
    recentPatients,
    patientsPerProfessional
  ] = await Promise.all([
    // Estatísticas gerais
    Patient.findAll({
      attributes: [
        [Patient.sequelize.fn('COUNT', Patient.sequelize.col('id')), 'total'],
        [Patient.sequelize.fn('COUNT', Patient.sequelize.literal(`CASE WHEN status = 'active' THEN 1 END`)), 'active'],
        [Patient.sequelize.fn('AVG', Patient.sequelize.literal(`CASE WHEN birth_date IS NOT NULL THEN EXTRACT(year FROM age(birth_date)) END`)), 'avg_age']
      ],
      raw: true
    }),
    
    // Distribuição por status
    Patient.findAll({
      attributes: [
        'status',
        [Patient.sequelize.fn('COUNT', Patient.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }),
    
    // Pacientes cadastrados recentemente
    Patient.count({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Distribuição de pacientes por profissional
    User.findAll({
      where: { 
        user_type: 'professional',
        status: 'active'
      },
      attributes: [
        'id',
        'full_name',
        [User.sequelize.fn('COUNT', User.sequelize.col('patients.id')), 'patient_count']
      ],
      include: [{
        model: Patient,
        as: 'patients',
        attributes: [],
        required: false
      }],
      group: ['User.id'],
      order: [[User.sequelize.literal('patient_count'), 'DESC']]
    })
  ]);
  
  res.json({
    success: true,
    message: 'Estatísticas dos pacientes obtidas com sucesso',
    data: {
      overview: {
        ...totalStats[0],
        avg_age: Math.round(totalStats[0].avg_age || 0)
      },
      status_distribution: statusDistribution,
      recent_patients_30_days: recentPatients,
      patients_per_professional: patientsPerProfessional
    }
  });
};

/**
 * TRANSFERÊNCIAS (Implementação básica para futuro)
 */

/**
 * GET /api/admin/transfers/pending
 * Listar transferências pendentes (implementação futura)
 */
const listPendingTransfers = async (req, res) => {
  // TODO: Implementar quando modelo Transfer for criado
  res.json({
    success: true,
    message: 'Funcionalidade de transferências será implementada em breve',
    data: {
      pending_transfers: [],
      total: 0
    }
  });
};

/**
 * PUT /api/admin/transfers/:id/approve
 * Aprovar transferência (implementação futura)
 */
const approveTransfer = async (req, res) => {
  // TODO: Implementar quando modelo Transfer for criado
  res.json({
    success: true,
    message: 'Funcionalidade de transferências será implementada em breve'
  });
};

/**
 * PUT /api/admin/transfers/:id/reject
 * Rejeitar transferência (implementação futura)
 */
const rejectTransfer = async (req, res) => {
  // TODO: Implementar quando modelo Transfer for criado
  res.json({
    success: true,
    message: 'Funcionalidade de transferências será implementada em breve'
  });
};

// Exportar todas as funções
module.exports = {
  // Dashboard
  getDashboard,
  getOverviewStats,
  
  // Profissionais
  listProfessionals,
  createProfessional,
  getProfessionalById,
  updateProfessional,
  updateProfessionalStatus,
  resetProfessionalPassword,
  
  // Estatísticas
  getProfessionalsStats,
  getPatientsStats,
  
  // Transferências (futuro)
  listPendingTransfers,
  approveTransfer,
  rejectTransfer
};

/**
 * NOTAS PARA DESENVOLVIMENTO:
 * 
 * 1. PERFORMANCE:
 * - Usar Promise.all para queries paralelas
 * - Implementar cache para estatísticas (Redis futuro)
 * - Limitar resultados com LIMIT
 * - Usar índices apropriados
 * 
 * 2. SEGURANÇA:
 * - Sempre excluir campos sensíveis (password, tokens)
 * - Validar todos os parâmetros de entrada
 * - Usar transações para operações críticas
 * 
 * 3. LOGS:
 * - Implementar logs detalhados para auditoria
 * - Log de criação/alteração de profissionais
 * - Log de reset de senhas
 * 
 * 4. TODO:
 * - Implementar envio de emails
 * - Adicionar testes unitários
 * - Implementar cache para estatísticas
 * - Adicionar filtros avançados
 */