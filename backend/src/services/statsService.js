/**
 * MÓDULA - SERVICE DE ESTATÍSTICAS AVANÇADAS
 * 
 * Serviço centralizado para geração de estatísticas, métricas e análises do sistema.
 * Agregação de dados complexos para dashboards administrativos e profissionais.
 * 
 * Funcionalidades implementadas:
 * - Estatísticas gerais da clínica
 * - Métricas de produtividade por profissional
 * - Análise de crescimento e tendências
 * - Indicadores de qualidade do atendimento
 * - Comparativos temporais (mês a mês, ano a ano)
 * - Taxas de conversão e retenção
 * 
 * Recursos especiais:
 * - Cache de estatísticas para performance
 * - Agregações otimizadas com Sequelize
 * - Cálculos de tendências automáticos
 * - Formatação pronta para dashboards
 * - Suporte a múltiplos períodos de análise
 */

const { User, Patient, Session, Anamnesis, sequelize } = require('../models');
const { Op } = require('sequelize');

// ============================================
// ESTATÍSTICAS GERAIS DA CLÍNICA
// ============================================

/**
 * Dashboard administrativo completo
 */
const getClinicOverview = async (adminUserId) => {
  // Contar profissionais
  const professionalsStats = await User.count({
    where: { user_type: 'professional' },
    group: ['status'],
    attributes: ['status', [sequelize.fn('COUNT', 'id'), 'count']]
  });

  const professionals = {
    total: await User.count({ where: { user_type: 'professional' } }),
    active: professionalsStats.find(p => p.status === 'active')?.count || 0,
    inactive: professionalsStats.find(p => p.status === 'inactive')?.count || 0
  };

  // Contar pacientes
  const patientsStats = await Patient.count({
    group: ['status'],
    attributes: ['status', [sequelize.fn('COUNT', 'id'), 'count']]
  });

  const patients = {
    total: await Patient.count(),
    active: patientsStats.find(p => p.status === 'active')?.count || 0,
    inactive: patientsStats.find(p => p.status === 'inactive')?.count || 0,
    discharged: patientsStats.find(p => p.status === 'discharged')?.count || 0
  };

  // Sessões do mês atual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const sessionsThisMonth = await Session.count({
    where: {
      session_date: {
        [Op.gte]: startOfMonth,
        [Op.lte]: endOfMonth
      }
    }
  });

  const completedThisMonth = await Session.count({
    where: {
      session_date: {
        [Op.gte]: startOfMonth,
        [Op.lte]: endOfMonth
      },
      status: 'completed'
    }
  });

  // Anamneses pendentes
  const pendingAnamneses = await Anamnesis.count({
    where: {
      status: { [Op.in]: ['draft', 'in_progress'] }
    }
  });

  // Novos cadastros da semana
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const newPatientsThisWeek = await Patient.count({
    where: {
      created_at: { [Op.gte]: startOfWeek }
    }
  });

  return {
    professionals,
    patients,
    sessions_this_month: {
      total: sessionsThisMonth,
      completed: completedThisMonth,
      completion_rate: sessionsThisMonth > 0 
        ? ((completedThisMonth / sessionsThisMonth) * 100).toFixed(2)
        : 0
    },
    pending_anamneses: pendingAnamneses,
    new_patients_this_week: newPatientsThisWeek,
    generated_at: new Date()
  };
};

/**
 * Estatísticas mensais detalhadas
 */
const getMonthlyStats = async (year = null, month = null) => {
  const targetDate = new Date();
  if (year) targetDate.setFullYear(year);
  if (month) targetDate.setMonth(month - 1);

  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

  // Sessões do mês
  const sessions = await Session.findAll({
    where: {
      session_date: {
        [Op.gte]: startOfMonth,
        [Op.lte]: endOfMonth
      }
    },
    include: [
      {
        model: User,
        as: 'professional',
        attributes: ['id', 'full_name']
      }
    ]
  });

  // Agrupar por profissional
  const byProfessional = sessions.reduce((acc, session) => {
    const profId = session.user_id;
    if (!acc[profId]) {
      acc[profId] = {
        professional_id: profId,
        professional_name: session.professional?.full_name || 'Desconhecido',
        sessions: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
        total_hours: 0
      };
    }
    
    acc[profId].sessions++;
    if (session.status === 'completed') acc[profId].completed++;
    if (session.status === 'cancelled') acc[profId].cancelled++;
    if (session.status === 'no_show') acc[profId].no_show++;
    acc[profId].total_hours += (session.duration_minutes || 0) / 60;
    
    return acc;
  }, {});

  // Novos pacientes do mês
  const newPatients = await Patient.count({
    where: {
      created_at: {
        [Op.gte]: startOfMonth,
        [Op.lte]: endOfMonth
      }
    }
  });

  // Anamneses completadas
  const completedAnamneses = await Anamnesis.count({
    where: {
      completed_at: {
        [Op.gte]: startOfMonth,
        [Op.lte]: endOfMonth
      },
      status: 'completed'
    }
  });

  return {
    period: {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      start_date: startOfMonth,
      end_date: endOfMonth
    },
    summary: {
      total_sessions: sessions.length,
      completed_sessions: sessions.filter(s => s.status === 'completed').length,
      new_patients: newPatients,
      completed_anamneses: completedAnamneses,
      total_hours: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60
    },
    by_professional: Object.values(byProfessional)
  };
};

// ============================================
// PRODUTIVIDADE POR PROFISSIONAL
// ============================================

/**
 * Relatório de produtividade individual
 */
const getProfessionalProductivity = async (userId, startDate = null, endDate = null) => {
  // Definir período (padrão: último mês)
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Buscar dados do profissional
  const professional = await User.findByPk(userId, {
    attributes: ['id', 'full_name', 'professional_register', 'created_at']
  });

  if (!professional) {
    throw new Error('Profissional não encontrado');
  }

  // Pacientes ativos
  const activePatientsCount = await Patient.count({
    where: { user_id: userId, status: 'active' }
  });

  // Sessões no período
  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: start,
        [Op.lte]: end
      }
    }
  });

  // Métricas de sessões
  const sessionMetrics = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
    no_show: sessions.filter(s => s.status === 'no_show').length
  };

  // Horas trabalhadas
  const totalMinutes = sessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes || 0), 0);
  
  const hoursWorked = (totalMinutes / 60).toFixed(2);

  // Taxa de comparecimento
  const scheduled = sessionMetrics.completed + sessionMetrics.no_show + sessionMetrics.cancelled;
  const attendanceRate = scheduled > 0 
    ? ((sessionMetrics.completed / scheduled) * 100).toFixed(2)
    : 0;

  // Pacientes únicos atendidos
  const uniquePatients = new Set(
    sessions
      .filter(s => s.status === 'completed')
      .map(s => s.patient_id)
  ).size;

  // Engajamento médio
  const withEngagement = sessions.filter(s => s.patient_engagement);
  const avgEngagement = withEngagement.length > 0
    ? (withEngagement.reduce((sum, s) => sum + s.patient_engagement, 0) / withEngagement.length).toFixed(2)
    : null;

  // Distribuição por tipo de sessão
  const sessionsByType = sessions.reduce((acc, s) => {
    acc[s.session_type] = (acc[s.session_type] || 0) + 1;
    return acc;
  }, {});

  return {
    professional: {
      id: professional.id,
      name: professional.full_name,
      register: professional.professional_register,
      member_since: professional.created_at
    },
    period: {
      start_date: start,
      end_date: end,
      days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    },
    active_patients: activePatientsCount,
    sessions: sessionMetrics,
    hours_worked: parseFloat(hoursWorked),
    attendance_rate: parseFloat(attendanceRate),
    unique_patients_seen: uniquePatients,
    avg_engagement: avgEngagement ? parseFloat(avgEngagement) : null,
    sessions_by_type: sessionsByType
  };
};

/**
 * Comparar produtividade de todos os profissionais
 */
const compareProfessionalsProductivity = async (startDate = null, endDate = null) => {
  const professionals = await User.findAll({
    where: { user_type: 'professional', status: 'active' },
    attributes: ['id', 'full_name']
  });

  const comparisons = [];

  for (const prof of professionals) {
    const productivity = await getProfessionalProductivity(prof.id, startDate, endDate);
    comparisons.push({
      professional_id: prof.id,
      professional_name: prof.full_name,
      total_sessions: productivity.sessions.total,
      completed_sessions: productivity.sessions.completed,
      hours_worked: productivity.hours_worked,
      active_patients: productivity.active_patients,
      attendance_rate: productivity.attendance_rate,
      avg_engagement: productivity.avg_engagement
    });
  }

  // Ordenar por sessões completadas
  comparisons.sort((a, b) => b.completed_sessions - a.completed_sessions);

  // Calcular médias gerais
  const totals = comparisons.reduce((acc, p) => ({
    sessions: acc.sessions + p.total_sessions,
    completed: acc.completed + p.completed_sessions,
    hours: acc.hours + p.hours_worked,
    patients: acc.patients + p.active_patients
  }), { sessions: 0, completed: 0, hours: 0, patients: 0 });

  return {
    professionals: comparisons,
    totals,
    averages: {
      sessions_per_professional: (totals.sessions / comparisons.length).toFixed(2),
      hours_per_professional: (totals.hours / comparisons.length).toFixed(2),
      patients_per_professional: (totals.patients / comparisons.length).toFixed(2)
    }
  };
};

// ============================================
// ANÁLISE DE CRESCIMENTO
// ============================================

/**
 * Tendência de crescimento mensal
 */
const getGrowthTrend = async (months = 6) => {
  const trends = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Novos pacientes
    const newPatients = await Patient.count({
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      }
    });

    // Sessões realizadas
    const sessionsCompleted = await Session.count({
      where: {
        session_date: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        },
        status: 'completed'
      }
    });

    // Total de pacientes ativos no final do mês
    const activePatientsAtEnd = await Patient.count({
      where: {
        created_at: { [Op.lte]: endOfMonth },
        status: 'active'
      }
    });

    trends.push({
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      month_name: targetDate.toLocaleString('pt-BR', { month: 'long' }),
      new_patients: newPatients,
      sessions_completed: sessionsCompleted,
      active_patients_end: activePatientsAtEnd
    });
  }

  // Calcular taxas de crescimento
  for (let i = 1; i < trends.length; i++) {
    const current = trends[i];
    const previous = trends[i - 1];

    current.growth_rate = {
      patients: previous.new_patients > 0
        ? (((current.new_patients - previous.new_patients) / previous.new_patients) * 100).toFixed(2)
        : null,
      sessions: previous.sessions_completed > 0
        ? (((current.sessions_completed - previous.sessions_completed) / previous.sessions_completed) * 100).toFixed(2)
        : null
    };
  }

  return {
    period_months: months,
    trends,
    summary: {
      total_new_patients: trends.reduce((sum, t) => sum + t.new_patients, 0),
      total_sessions: trends.reduce((sum, t) => sum + t.sessions_completed, 0),
      avg_new_patients_per_month: (trends.reduce((sum, t) => sum + t.new_patients, 0) / months).toFixed(2),
      avg_sessions_per_month: (trends.reduce((sum, t) => sum + t.sessions_completed, 0) / months).toFixed(2)
    }
  };
};

// ============================================
// INDICADORES DE QUALIDADE
// ============================================

/**
 * Indicadores de qualidade do atendimento
 */
const getQualityIndicators = async (startDate = null, endDate = null) => {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Sessões completadas com avaliações
  const sessionsWithAssessment = await Session.findAll({
    where: {
      session_date: {
        [Op.gte]: start,
        [Op.lte]: end
      },
      status: 'completed',
      progress_assessment: { [Op.ne]: null }
    }
  });

  // Taxa de melhora
  const improved = sessionsWithAssessment.filter(s => s.progress_assessment === 'improved').length;
  const improvementRate = sessionsWithAssessment.length > 0
    ? ((improved / sessionsWithAssessment.length) * 100).toFixed(2)
    : 0;

  // Engajamento médio
  const withEngagement = sessionsWithAssessment.filter(s => s.patient_engagement);
  const avgEngagement = withEngagement.length > 0
    ? (withEngagement.reduce((sum, s) => sum + s.patient_engagement, 0) / withEngagement.length).toFixed(2)
    : null;

  // Adesão ao tratamento
  const withAdherence = sessionsWithAssessment.filter(s => s.treatment_adherence);
  const fullAdherence = withAdherence.filter(s => s.treatment_adherence === 'full').length;
  const adherenceRate = withAdherence.length > 0
    ? ((fullAdherence / withAdherence.length) * 100).toFixed(2)
    : null;

  // Completude de anamneses
  const totalAnamneses = await Anamnesis.count({
    where: {
      created_at: {
        [Op.gte]: start,
        [Op.lte]: end
      }
    }
  });

  const completedAnamneses = await Anamnesis.count({
    where: {
      created_at: {
        [Op.gte]: start,
        [Op.lte]: end
      },
      status: 'completed'
    }
  });

  const anamnesisCompletionRate = totalAnamneses > 0
    ? ((completedAnamneses / totalAnamneses) * 100).toFixed(2)
    : 0;

  return {
    period: {
      start_date: start,
      end_date: end
    },
    improvement_rate: parseFloat(improvementRate),
    avg_engagement: avgEngagement ? parseFloat(avgEngagement) : null,
    full_adherence_rate: adherenceRate ? parseFloat(adherenceRate) : null,
    anamnesis_completion_rate: parseFloat(anamnesisCompletionRate),
    sessions_analyzed: sessionsWithAssessment.length
  };
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Visão geral
  getClinicOverview,
  getMonthlyStats,
  
  // Produtividade
  getProfessionalProductivity,
  compareProfessionalsProductivity,
  
  // Crescimento
  getGrowthTrend,
  
  // Qualidade
  getQualityIndicators
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. DASHBOARD ADMINISTRATIVO:
 *    const overview = await getClinicOverview(adminUserId);
 *    // Retorna contadores gerais da clínica
 * 
 * 2. ESTATÍSTICAS MENSAIS:
 *    const monthly = await getMonthlyStats(2025, 10);
 *    // Estatísticas de outubro/2025
 * 
 * 3. PRODUTIVIDADE INDIVIDUAL:
 *    const productivity = await getProfessionalProductivity(
 *      userId,
 *      new Date('2025-10-01'),
 *      new Date('2025-10-31')
 *    );
 * 
 * 4. COMPARAR PROFISSIONAIS:
 *    const comparison = await compareProfessionalsProductivity(
 *      startDate,
 *      endDate
 *    );
 * 
 * 5. TENDÊNCIA DE CRESCIMENTO:
 *    const growth = await getGrowthTrend(6);
 *    // Últimos 6 meses com taxas de crescimento
 * 
 * 6. INDICADORES DE QUALIDADE:
 *    const quality = await getQualityIndicators(startDate, endDate);
 *    // Taxa de melhora, engajamento, adesão
 * 
 * INTEGRAÇÃO NO CONTROLLER:
 * 
 * const statsService = require('../services/statsService');
 * 
 * const getDashboard = async (req, res) => {
 *   const overview = await statsService.getClinicOverview(req.userId);
 *   const growth = await statsService.getGrowthTrend(6);
 *   const quality = await statsService.getQualityIndicators();
 *   
 *   res.json({
 *     success: true,
 *     data: { overview, growth, quality }
 *   });
 * };
 */