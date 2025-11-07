/**
 * MÓDULA - CONTROLLER DO PROFISSIONAL
 * 
 * Contém toda a lógica de negócio para operações dos profissionais de saúde.
 * Foca na gestão de pacientes, dashboard personalizado e relatórios.
 * 
 * Funcionalidades:
 * - Dashboard com estatísticas personalizadas
 * - CRUD completo de pacientes
 * - Sistema de busca e filtros
 * - Agenda e consultas básicas
 * - Relatórios de atividade
 * 
 * Arquivo: /backend/src/controllers/professionalController.js
 */

const { Op } = require('sequelize');
const { User, Patient } = require('../models');
const { 
  AppError, 
  createNotFoundError, 
  createValidationError,
  createAuthorizationError
} = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');
const notificationTriggers = require('../services/notificationTriggers');

/**
 * DASHBOARD E ESTATÍSTICAS PESSOAIS
 */

/**
 * GET /api/professional/dashboard
 * Dashboard personalizado do profissional logado
 */
const getDashboard = async (req, res) => {
  const userId = req.userId;
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Buscar estatísticas em paralelo
  const [
    totalPatients,
    activePatients,
    inactivePatients,
    recentPatients,
    pendingAnamnesis,
    recentlyUpdated,
    weeklyNewPatients,
    monthlyNewPatients
  ] = await Promise.all([
    // Total de pacientes
    Patient.count({ where: { user_id: userId } }),
    
    // Pacientes ativos
    Patient.count({ where: { user_id: userId, status: 'active' } }),
    
    // Pacientes inativos
    Patient.count({ where: { user_id: userId, status: { [Op.ne]: 'active' } } }),
    
    // Pacientes cadastrados nos últimos 7 dias
    Patient.count({
      where: {
        user_id: userId,
        created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    }),
    
    // Pacientes com anamnese pendente (implementação futura)
    // Por enquanto, retornamos 0
    Promise.resolve(0),
    
    // Pacientes atualizados recentemente
    Patient.findAll({
      where: {
        user_id: userId,
        updated_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      attributes: ['id', 'full_name', 'updated_at', 'status'],
      order: [['updated_at', 'DESC']],
      limit: 5
    }),
    
    // Novos pacientes esta semana
    Patient.count({
      where: {
        user_id: userId,
        created_at: { [Op.gte]: startOfWeek }
      }
    }),
    
    // Novos pacientes este mês
    Patient.count({
      where: {
        user_id: userId,
        created_at: { [Op.gte]: startOfMonth }
      }
    })
  ]);
  
  // Calcular algumas métricas úteis
  const patientActiveRate = totalPatients > 0 
    ? Math.round((activePatients / totalPatients) * 100) 
    : 0;
  
  const avgPatientsPerWeek = Math.ceil(weeklyNewPatients || 0);
  const avgPatientsPerMonth = Math.ceil(monthlyNewPatients || 0);
  
  // Buscar próximas consultas (implementação básica)
  // TODO: Implementar quando modelo Session for criado
  const todayAppointments = [];
  const upcomingAppointments = [];
  
  res.json({
    success: true,
    message: 'Dashboard carregado com sucesso',
    data: {
      // Números principais
      overview: {
        patients: {
          total: totalPatients,
          active: activePatients,
          inactive: inactivePatients,
          activeRate: patientActiveRate
        },
        recent_activity: {
          new_patients_week: weeklyNewPatients,
          new_patients_month: monthlyNewPatients,
          recent_patients_7_days: recentPatients,
          recently_updated: recentlyUpdated.length
        },
        pending_tasks: {
          pending_anamnesis: pendingAnamnesis,
          overdue_appointments: 0, // TODO: Implementar
          follow_up_needed: 0 // TODO: Implementar
        }
      },
      
      // Lista de atividades recentes
      recent_updates: recentlyUpdated,
      
      // Agenda do dia (implementação básica)
      today_schedule: {
        appointments: todayAppointments,
        total_appointments: todayAppointments.length,
        next_appointment: upcomingAppointments[0] || null
      },
      
      // Ações rápidas sugeridas
      quick_actions: {
        need_follow_up: [], // TODO: Pacientes que precisam de follow-up
        incomplete_records: [], // TODO: Pacientes com dados incompletos
        suggested_appointments: [] // TODO: Sugestões baseadas em histórico
      },
      
      // Timestamp para cache
      generated_at: new Date().toISOString(),
      cache_expires_in: 300 // 5 minutos
    }
  });
};

/**
 * GET /api/professional/stats
 * Estatísticas detalhadas do profissional
 */
const getMyStats = async (req, res) => {
  const userId = req.userId;
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
  
  const [
    overallStats,
    statusDistribution,
    growthData,
    ageDistribution
  ] = await Promise.all([
    // Estatísticas gerais
    Patient.findAll({
      where: { user_id: userId },
      attributes: [
        [Patient.sequelize.fn('COUNT', Patient.sequelize.col('id')), 'total'],
        [Patient.sequelize.fn('COUNT', Patient.sequelize.literal(`CASE WHEN status = 'active' THEN 1 END`)), 'active'],
        [Patient.sequelize.fn('COUNT', Patient.sequelize.literal(`CASE WHEN created_at >= '${startDate.toISOString()}' THEN 1 END`)), 'new_in_period'],
        [Patient.sequelize.fn('AVG', Patient.sequelize.literal(`CASE WHEN birth_date IS NOT NULL THEN EXTRACT(year FROM age(birth_date)) END`)), 'avg_age']
      ],
      raw: true
    }),
    
    // Distribuição por status
    Patient.findAll({
      where: { user_id: userId },
      attributes: [
        'status',
        [Patient.sequelize.fn('COUNT', Patient.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    }),
    
    // Dados de crescimento mensal (últimos 6 meses)
    Patient.findAll({
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth() - 6, 1)
        }
      },
      attributes: [
        [Patient.sequelize.fn('DATE_TRUNC', 'month', Patient.sequelize.col('created_at')), 'month'],
        [Patient.sequelize.fn('COUNT', Patient.sequelize.col('id')), 'count']
      ],
      group: [Patient.sequelize.fn('DATE_TRUNC', 'month', Patient.sequelize.col('created_at'))],
      order: [[Patient.sequelize.fn('DATE_TRUNC', 'month', Patient.sequelize.col('created_at')), 'ASC']],
      raw: true
    }),
    
    // Distribuição por idade (faixas etárias)
    Patient.findAll({
      where: { 
        user_id: userId,
        birth_date: { [Op.ne]: null }
      },
      attributes: [
        [Patient.sequelize.literal(`
          CASE 
            WHEN EXTRACT(year FROM age(birth_date)) < 18 THEN 'Menor de 18'
            WHEN EXTRACT(year FROM age(birth_date)) BETWEEN 18 AND 30 THEN '18-30 anos'
            WHEN EXTRACT(year FROM age(birth_date)) BETWEEN 31 AND 45 THEN '31-45 anos'
            WHEN EXTRACT(year FROM age(birth_date)) BETWEEN 46 AND 60 THEN '46-60 anos'
            ELSE 'Mais de 60'
          END
        `), 'age_group'],
        [Patient.sequelize.fn('COUNT', Patient.sequelize.col('id')), 'count']
      ],
      group: [Patient.sequelize.literal(`
        CASE 
          WHEN EXTRACT(year FROM age(birth_date)) < 18 THEN 'Menor de 18'
          WHEN EXTRACT(year FROM age(birth_date)) BETWEEN 18 AND 30 THEN '18-30 anos'
          WHEN EXTRACT(year FROM age(birth_date)) BETWEEN 31 AND 45 THEN '31-45 anos'
          WHEN EXTRACT(year FROM age(birth_date)) BETWEEN 46 AND 60 THEN '46-60 anos'
          ELSE 'Mais de 60'
        END
      `)],
      raw: true
    })
  ]);
  
  res.json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: {
      period,
      start_date: startDate,
      overview: {
        ...overallStats[0],
        avg_age: Math.round(overallStats[0].avg_age || 0)
      },
      distributions: {
        by_status: statusDistribution,
        by_age: ageDistribution
      },
      growth: {
        monthly_data: growthData,
        period_growth: overallStats[0].new_in_period
      }
    }
  });
};

/**
 * GESTÃO DE PACIENTES
 */

/**
 * GET /api/professional/patients
 * Listar pacientes do profissional logado com filtros
 */
const listMyPatients = async (req, res) => {
  const userId = req.userId;
  
  // Extrair parâmetros já validados pelo middleware
  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    sortBy = 'full_name',
    order = 'ASC'
  } = req.query;
  
  // Construir condições de busca
  const whereConditions = { user_id: userId };
  
  // Filtro por busca (nome, email, CPF ou telefone)
  if (search) {
    whereConditions[Op.or] = [
      { full_name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { cpf: { [Op.iLike]: `%${search.replace(/\D/g, '')}%` } },
      { phone: { [Op.iLike]: `%${search.replace(/\D/g, '')}%` } }
    ];
  }
  
  // Filtro por status
  if (status && ['active', 'inactive', 'discharged', 'transferred'].includes(status)) {
    whereConditions.status = status;
  }
  
  try {
    // Buscar pacientes
    const { rows: patients, count: total } = await Patient.findAndCountAll({
      where: whereConditions,
      attributes: [
        'id', 'full_name', 'email', 'phone', 'birth_date', 'gender',
        'status', 'created_at', 'last_appointment', 'notes'
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, order.toUpperCase()]],
      distinct: true
    });
    
    // Enriquecer dados dos pacientes
    const enrichedPatients = patients.map(patient => {
      const patientData = patient.toJSON();
      
      // Calcular idade se data de nascimento existe
      if (patientData.birth_date) {
        const birthDate = new Date(patientData.birth_date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        patientData.age = age;
      }
      
      // Calcular dias desde última consulta
      if (patientData.last_appointment) {
        const lastAppointment = new Date(patientData.last_appointment);
        const daysSinceLastAppointment = Math.floor((new Date() - lastAppointment) / (1000 * 60 * 60 * 24));
        patientData.days_since_last_appointment = daysSinceLastAppointment;
      }
      
      // Status formatado em português
      const statusMap = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'discharged': 'Alta',
        'transferred': 'Transferido'
      };
      patientData.status_label = statusMap[patientData.status] || patientData.status;
      
      return patientData;
    });
    
    // Calcular metadados de paginação
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      message: 'Pacientes listados com sucesso',
      data: enrichedPatients,
      metadata: {
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: total,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        },
        filters: {
          search,
          status,
          sort_by: sortBy,
          order: order.toLowerCase()
        },
        summary: {
          total_patients: total,
          showing: enrichedPatients.length
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    throw new AppError('Erro interno ao buscar pacientes', 500);
  }
};

/**
 * POST /api/professional/patients
 * Criar novo paciente
 */
const createPatient = async (req, res) => {
  const userId = req.userId;
  const patientData = req.body;
  
  // Verificar se CPF já existe (se fornecido)
  if (patientData.cpf) {
    const cpfClean = patientData.cpf.replace(/\D/g, '');
    const existingCpf = await Patient.findOne({
      where: { cpf: cpfClean }
    });
    
    if (existingCpf) {
      throw new AppError('Este CPF já está cadastrado', 409, 'CPF_EXISTS');
    }
  }
  
  // Verificar se email já existe (se fornecido)
  if (patientData.email) {
    const existingEmail = await Patient.findOne({
      where: { email: patientData.email.toLowerCase() }
    });
    
    if (existingEmail) {
      throw new AppError('Este email já está cadastrado', 409, 'EMAIL_EXISTS');
    }
  }
  
  try {
    // Preparar dados do paciente
    const newPatientData = {
      ...patientData,
      user_id: userId, // Associar ao profissional logado
      status: 'active', // Novo paciente sempre ativo
      first_appointment: null, // Será definido na primeira consulta
      last_appointment: null
    };
    
    // Limpar e formatar dados
    if (newPatientData.cpf) {
      newPatientData.cpf = newPatientData.cpf.replace(/\D/g, '');
    }
    if (newPatientData.email) {
      newPatientData.email = newPatientData.email.toLowerCase().trim();
    }
    if (newPatientData.phone) {
      newPatientData.phone = newPatientData.phone.replace(/\D/g, '');
    }
    
    // Criar paciente
    const newPatient = await Patient.create(newPatientData);
    
    // Retornar dados do paciente criado
    const patientResponse = newPatient.toJSON();

    await notificationTriggers.notifyNewPatient(
    newPatient,
    req.userId
  );
    
    res.status(201).json({
      success: true,
      message: 'Paciente cadastrado com sucesso',
      data: patientResponse,
      next_steps: {
        anamnesis: {
          pending: true,
          url: `/api/patients/${newPatient.id}/anamnesis`,
          message: 'Recomendamos preencher a anamnese como próximo passo'
        },
        first_appointment: {
          pending: true,
          url: `/api/patients/${newPatient.id}/sessions`,
          message: 'Agende a primeira consulta'
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    throw new AppError('Erro interno ao criar paciente', 500);
  }
};

/**
 * GET /api/professional/patients/:id
 * Obter detalhes completos de um paciente
 */
const getPatientById = async (req, res) => {
  // Paciente já foi verificado pelo middleware checkResourceOwnership
  const patient = req.resource || req.patient;
  
  // Buscar informações adicionais
  const [/* consultaCount, ultimaConsulta */] = await Promise.all([
    // TODO: Implementar quando modelo Session existir
    // Session.count({ where: { patient_id: patient.id } }),
    // Session.findOne({
    //   where: { patient_id: patient.id },
    //   order: [['session_date', 'DESC']]
    // })
    Promise.resolve(0),
    Promise.resolve(null)
  ]);
  
  const patientData = patient.toJSON();
  
  // Enriquecer dados do paciente
  if (patientData.birth_date) {
    const age = patient.getAge();
    patientData.age = age;
  }
  
  // Adicionar estatísticas
  patientData.statistics = {
    total_sessions: 0, // TODO: consultaCount
    days_as_patient: Math.floor((new Date() - new Date(patient.created_at)) / (1000 * 60 * 60 * 24)),
    last_session: null, // TODO: ultimaConsulta
    anamnesis_completed: false // TODO: verificar anamnese
  };
  
  // Adicionar próximas ações sugeridas
  patientData.suggested_actions = [];
  
  if (!patientData.statistics.anamnesis_completed) {
    patientData.suggested_actions.push({
      type: 'anamnesis',
      priority: 'high',
      message: 'Anamnese pendente',
      url: `/api/patients/${patient.id}/anamnesis`
    });
  }
  
  if (patientData.statistics.total_sessions === 0) {
    patientData.suggested_actions.push({
      type: 'first_session',
      priority: 'medium',
      message: 'Primeira consulta não realizada',
      url: `/api/patients/${patient.id}/sessions`
    });
  }
  
  res.json({
    success: true,
    message: 'Paciente encontrado com sucesso',
    data: patientData
  });
};

/**
 * PUT /api/professional/patients/:id
 * Atualizar dados de um paciente
 */
const updatePatient = async (req, res) => {
  const patient = req.resource || req.patient;
  const updateData = req.body;
  
  // Verificar CPF único (se está mudando)
  if (updateData.cpf) {
    const cpfClean = updateData.cpf.replace(/\D/g, '');
    if (cpfClean !== patient.cpf) {
      const existingCpf = await Patient.findOne({
        where: { 
          cpf: cpfClean,
          id: { [Op.ne]: patient.id }
        }
      });
      if (existingCpf) {
        throw new AppError('Este CPF já está em uso', 409, 'CPF_EXISTS');
      }
      updateData.cpf = cpfClean;
    }
  }
  
  // Verificar email único (se está mudando)
  if (updateData.email) {
    const emailClean = updateData.email.toLowerCase().trim();
    if (emailClean !== patient.email) {
      const existingEmail = await Patient.findOne({
        where: { 
          email: emailClean,
          id: { [Op.ne]: patient.id }
        }
      });
      if (existingEmail) {
        throw new AppError('Este email já está em uso', 409, 'EMAIL_EXISTS');
      }
      updateData.email = emailClean;
    }
  }
  
  // Limpar telefone se fornecido
  if (updateData.phone) {
    updateData.phone = updateData.phone.replace(/\D/g, '');
  }
  
  try {
    // Atualizar paciente
    await patient.update(updateData);
    
    // Retornar dados atualizados
    res.json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      data: patient.toJSON()
    });
    
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    throw new AppError('Erro interno ao atualizar paciente', 500);
  }
};

/**
 * DELETE /api/professional/patients/:id
 * Excluir (soft delete) um paciente
 */
const deletePatient = async (req, res) => {
  // O middleware 'checkResourceOwnership' já deve ter carregado
  // o paciente em req.resource e verificado a posse.
  const patient = req.resource; 

  if (!patient) {
    // Se o middleware não carregou, algo deu muito errado
    throw new AppError('Paciente não encontrado ou acesso não autorizado', 404);
  }

  try {
    // Soft delete: O Sequelize (com paranoid: true no model)
    // só vai marcar a coluna 'deletedAt'
    await patient.destroy(); 

    // Retorna 200 OK com uma mensagem de sucesso
    res.status(200).json({ 
      success: true,
      message: 'Paciente excluído com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    throw new AppError('Erro interno ao excluir paciente', 500);
  }
};

/**
 * PUT /api/professional/patients/:id/status
 * Alterar status do paciente
 */
const updatePatientStatus = async (req, res) => {
  const patient = req.resource || req.patient;
  const { status, reason } = req.body;
  
  const oldStatus = patient.status;
  
  // Validações específicas por status
  if (status === 'discharged' && !reason) {
    throw createValidationError('reason', 'Motivo é obrigatório para dar alta');
  }
  
  if (status === 'transferred' && !reason) {
    throw createValidationError('reason', 'Motivo é obrigatório para transferir');
  }
  
  try {
    // Atualizar status
    await patient.update({
      status,
      // Adicionar timestamp específico se necessário
      ...(status === 'discharged' && { discharged_at: new Date() }),
      ...(status === 'transferred' && { transferred_at: new Date() }),
      // Adicionar motivo nas notes se fornecido
      ...(reason && {
        notes: patient.notes 
          ? `${patient.notes}\n\n[${new Date().toLocaleDateString()}] Status alterado para ${status}: ${reason}`
          : `[${new Date().toLocaleDateString()}] Status alterado para ${status}: ${reason}`
      })
    });
    
    const statusMessages = {
      'active': 'ativado',
      'inactive': 'inativado',
      'discharged': 'recebeu alta',
      'transferred': 'foi transferido'
    };
    
    res.json({
      success: true,
      message: `Paciente ${statusMessages[status] || 'atualizado'} com sucesso`,
      data: {
        id: patient.id,
        full_name: patient.full_name,
        old_status: oldStatus,
        new_status: status,
        reason: reason || null,
        updated_at: patient.updated_at
      }
    });
    
  } catch (error) {
    console.error('Erro ao alterar status do paciente:', error);
    throw new AppError('Erro interno ao alterar status', 500);
  }
};

/**
 * FUNCIONALIDADES DE BUSCA E FILTROS
 */

/**
 * GET /api/professional/patients/search
 * Busca avançada de pacientes
 */
const searchPatients = async (req, res) => {
  const userId = req.userId;
  const { q: searchTerm, limit = 10 } = req.query;
  
  if (!searchTerm || searchTerm.trim().length < 2) {
    return res.json({
      success: true,
      message: 'Digite pelo menos 2 caracteres para buscar',
      data: [],
      metadata: { total: 0 }
    });
  }
  
  try {
    const patients = await Patient.findAll({
      where: {
        user_id: userId,
        [Op.and]: [
          {
            [Op.or]: [
              { full_name: { [Op.iLike]: `%${searchTerm}%` } },
              { email: { [Op.iLike]: `%${searchTerm}%` } },
              { cpf: { [Op.iLike]: `%${searchTerm.replace(/\D/g, '')}%` } },
              { phone: { [Op.iLike]: `%${searchTerm.replace(/\D/g, '')}%` } }
            ]
          }
        ]
      },
      attributes: ['id', 'full_name', 'email', 'phone', 'status', 'last_appointment'],
      limit: parseInt(limit),
      order: [['full_name', 'ASC']]
    });
    
    res.json({
      success: true,
      message: 'Busca realizada com sucesso',
      data: patients,
      metadata: {
        search_term: searchTerm,
        total: patients.length,
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Erro na busca de pacientes:', error);
    throw new AppError('Erro interno na busca', 500);
  }
};

/**
 * GET /api/professional/patients/recent
 * Pacientes com atividade recente
 */
const getRecentPatients = async (req, res) => {
  const userId = req.userId;
  const { days = 30 } = req.query;
  
  const cutoffDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
  
  try {
    const recentPatients = await Patient.findAll({
      where: {
        user_id: userId,
        [Op.or]: [
          { last_appointment: { [Op.gte]: cutoffDate } },
          { updated_at: { [Op.gte]: cutoffDate } },
          { created_at: { [Op.gte]: cutoffDate } }
        ]
      },
      attributes: [
        'id', 'full_name', 'status', 'created_at', 
        'updated_at', 'last_appointment'
      ],
      order: [
        ['last_appointment', 'DESC NULLS LAST'],
        ['updated_at', 'DESC']
      ],
      limit: 50
    });
    
    // Enriquecer com tipo de atividade
    const enrichedPatients = recentPatients.map(patient => {
      const patientData = patient.toJSON();
      const now = new Date();
      
      // Determinar tipo de atividade recente
      if (patient.created_at >= cutoffDate) {
        patientData.activity_type = 'new_patient';
        patientData.activity_date = patient.created_at;
      } else if (patient.last_appointment && patient.last_appointment >= cutoffDate) {
        patientData.activity_type = 'recent_appointment';
        patientData.activity_date = patient.last_appointment;
      } else if (patient.updated_at >= cutoffDate) {
        patientData.activity_type = 'updated_info';
        patientData.activity_date = patient.updated_at;
      }
      
      return patientData;
    });
    
    res.json({
      success: true,
      message: 'Pacientes recentes obtidos com sucesso',
      data: enrichedPatients,
      metadata: {
        days: parseInt(days),
        cutoff_date: cutoffDate,
        total: enrichedPatients.length
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar pacientes recentes:', error);
    throw new AppError('Erro interno ao buscar pacientes recentes', 500);
  }
};

/**
 * GET /api/professional/patients/pending-anamnesis
 * Pacientes com anamnese pendente
 */
const getPendingAnamnesis = async (req, res) => {
  const userId = req.userId;
  
  try {
    // TODO: Implementar quando modelo Anamnesis existir
    // Por enquanto, retornar pacientes ativos sem anamnese (simulação)
    const patientsWithoutAnamnesis = await Patient.findAll({
      where: {
        user_id: userId,
        status: 'active'
        // TODO: adicionar condição para verificar anamnese
      },
      attributes: ['id', 'full_name', 'email', 'created_at', 'status'],
      order: [['created_at', 'ASC']],
      limit: 20
    });
    
    res.json({
      success: true,
      message: 'Pacientes com anamnese pendente',
      data: patientsWithoutAnamnesis,
      metadata: {
        total: patientsWithoutAnamnesis.length,
        note: 'Funcionalidade completa será implementada com o módulo de Anamnese'
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar anamneses pendentes:', error);
    throw new AppError('Erro interno', 500);
  }
};

/**
 * AGENDA E CONSULTAS (Implementação básica)
 */

/**
 * GET /api/professional/schedule/today
 * Agenda do dia atual
 */
const getTodaySchedule = async (req, res) => {
  const userId = req.userId;
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  
  // TODO: Implementar quando modelo Session existir
  // Por enquanto, retornar estrutura básica
  
  res.json({
    success: true,
    message: 'Agenda do dia obtida com sucesso',
    data: {
      date: startOfDay.toISOString().split('T')[0],
      appointments: [], // TODO: buscar sessões do dia
      summary: {
        total_appointments: 0,
        completed: 0,
        pending: 0,
        cancelled: 0
      },
      next_appointment: null,
      note: 'Funcionalidade completa será implementada com o módulo de Sessões'
    }
  });
};

/**
 * GET /api/professional/schedule/week
 * Agenda da semana
 */
const getWeekSchedule = async (req, res) => {
  const userId = req.userId;
  const { startDate } = req.query;
  
  const weekStart = startDate ? new Date(startDate) : new Date();
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // TODO: Implementar quando modelo Session existir
  
  res.json({
    success: true,
    message: 'Agenda da semana obtida com sucesso',
    data: {
      week_start: weekStart.toISOString().split('T')[0],
      week_end: weekEnd.toISOString().split('T')[0],
      daily_schedule: [], // TODO: agenda por dia
      summary: {
        total_appointments: 0,
        busiest_day: null,
        available_slots: 0
      },
      note: 'Funcionalidade completa será implementada com o módulo de Sessões'
    }
  });
};

/**
 * TRANSFERÊNCIAS (Implementação básica)
 */

/**
 * POST /api/professional/patients/:id/transfer
 * Solicitar transferência de paciente
 */
const requestPatientTransfer = async (req, res) => {
  const patient = req.resource || req.patient;
  const { to_professional_id, reason } = req.body;
  const fromUserId = req.userId;
  
  // Verificar se profissional destino existe e está ativo
  const toProfessional = await User.findOne({
    where: {
      id: to_professional_id,
      user_type: 'professional',
      status: 'active'
    }
  });
  
  if (!toProfessional) {
    throw createNotFoundError('Profissional destino não encontrado ou inativo');
  }
  
  if (toProfessional.id === fromUserId) {
    throw createValidationError('to_professional_id', 'Não é possível transferir para si mesmo');
  }
  
  // TODO: Implementar quando modelo Transfer existir
  // Por enquanto, simular criação da solicitação
  
  res.json({
    success: true,
    message: 'Solicitação de transferência criada com sucesso',
    data: {
      patient: {
        id: patient.id,
        name: patient.full_name
      },
      from_professional: req.user.full_name,
      to_professional: toProfessional.full_name,
      reason,
      status: 'pending',
      created_at: new Date(),
      note: 'A solicitação será processada por um administrador'
    }
  });
};

/**
 * PERFIL E CONFIGURAÇÕES
 */

/**
 * GET /api/professional/profile
 * Obter perfil do profissional logado
 */
const getMyProfile = async (req, res) => {
  const user = req.user;
  
  // Buscar estatísticas básicas
  const patientCount = await Patient.count({ where: { user_id: user.id } });
  
  const profileData = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    professional_register: user.professional_register,
    status: user.status,
    created_at: user.created_at,
    last_login: user.last_login,
    statistics: {
      total_patients: patientCount
    }
  };
  
  res.json({
    success: true,
    message: 'Perfil obtido com sucesso',
    data: profileData
  });
};

// Exportar todas as funções
module.exports = {
  // Dashboard
  getDashboard,
  getMyStats,
  
  // Pacientes
  listMyPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient,
  updatePatientStatus,
  
  // Busca e filtros
  searchPatients,
  getRecentPatients,
  getPendingAnamnesis,
  
  // Agenda (básico)
  getTodaySchedule,
  getWeekSchedule,
  
  // Transferências (básico)
  requestPatientTransfer,
  
  // Perfil
  getMyProfile,
  
  // TODO: Implementar nas próximas etapas
  getSchedule: async (req, res) => {
    res.json({ success: true, message: 'Em implementação', data: [] });
  },
  getMyTransferRequests: async (req, res) => {
    res.json({ success: true, message: 'Em implementação', data: [] });
  },
  getPatientSummaryReport: async (req, res) => {
    res.json({ success: true, message: 'Em implementação', data: {} });
  },
  getActivityReport: async (req, res) => {
    res.json({ success: true, message: 'Em implementação', data: {} });
  },
  updateMyProfile: async (req, res) => {
    res.json({ success: true, message: 'Em implementação' });
  },
  changePassword: async (req, res) => {
    res.json({ success: true, message: 'Em implementação' });
  },
  getNotifications: async (req, res) => {
    res.json({ success: true, message: 'Em implementação', data: [] });
  },
  markNotificationAsRead: async (req, res) => {
    res.json({ success: true, message: 'Em implementação' });
  },
  quickNewAppointment: async (req, res) => {
    res.json({ success: true, message: 'Em implementação' });
  },
  getPatientQuickOverview: async (req, res) => {
    res.json({ success: true, message: 'Em implementação', data: {} });
  }
};

/**
 * NOTAS PARA DESENVOLVIMENTO:
 * 
 * 1. ISOLAMENTO DE DADOS:
 * - Todas as queries filtram por user_id automaticamente
 * - Middleware checkResourceOwnership garante propriedade
 * - Nenhum profissional acessa dados de outro
 * 
 * 2. PERFORMANCE:
 * - Queries otimizadas com Promise.all
 * - Paginação obrigatória em listas
 * - Índices apropriados nos campos de busca
 * - Cache de estatísticas (implementação futura)
 * 
 * 3. UX/UI:
 * - Dados enriquecidos (idade, dias desde consulta)
 * - Sugestões de próximas ações
 * - Mensagens claras e em português
 * - Metadados úteis para frontend
 * 
 * 4. SEGURANÇA:
 * - Validação rigorosa de dados
 * - Verificação de propriedade em todas as operações
 * - Sanitização de entrada (CPF, telefone, email)
 * - Logs de auditoria (implementação futura)
 * 
 * 5. EXTENSIBILIDADE:
 * - Estrutura preparada para anamnese
 * - Preparado para sistema de sessões
 * - Suporte a notificações
 * - Relatórios expansíveis
 */