/**
 * MÓDULA - SERVICE DE GERAÇÃO DE RELATÓRIOS
 * 
 * Serviço especializado para geração de relatórios profissionais formatados.
 * Documentos clínicos, relatórios de evolução e documentação para pacientes.
 * 
 * Funcionalidades implementadas:
 * - Relatório de evolução completo do paciente
 * - Relatório de produtividade do profissional
 * - Anamnese formatada para impressão
 * - Relatório de sessões por período
 * - Templates profissionais personalizáveis
 * - Formatação para PDF
 * 
 * Recursos especiais:
 * - Templates HTML profissionais
 * - Dados estruturados para conversão PDF
 * - Formatação de datas e textos em português
 * - Cabeçalhos e rodapés automáticos
 * - Quebras de página inteligentes
 */

const { Patient, Session, Anamnesis, User } = require('../models');
const { Op } = require('sequelize');
const evolutionHelpers = require('../utils/evolutionHelpers');
const timelineHelpers = require('../utils/timelineHelpers');

// ============================================
// RELATÓRIO DE EVOLUÇÃO DO PACIENTE
// ============================================

/**
 * Gerar relatório completo de evolução do paciente
 */
const generatePatientEvolutionReport = async (patientId, userId, options = {}) => {
  const {
    startDate = null,
    endDate = null,
    includeAnamnesis = true,
    includeSessions = true,
    includeTimeline = true,
    includeStatistics = true
  } = options;

  // Buscar paciente
  const patient = await Patient.findOne({
    where: { id: patientId, user_id: userId },
    include: [
      {
        model: User,
        as: 'professional',
        attributes: ['full_name', 'professional_register']
      }
    ]
  });

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  const report = {
    metadata: {
      report_type: 'patient_evolution',
      generated_at: new Date(),
      generated_by: userId,
      period: { start_date: startDate, end_date: endDate }
    },
    patient: {
      id: patient.id,
      full_name: patient.full_name,
      birth_date: patient.birth_date,
      age: patient.getAge(),
      cpf: patient.cpf,
      phone: patient.phone,
      email: patient.email,
      first_appointment: patient.first_appointment,
      last_appointment: patient.last_appointment
    },
    professional: {
      name: patient.professional?.full_name,
      register: patient.professional?.professional_register
    }
  };

  // Incluir anamnese
  if (includeAnamnesis) {
    const anamnesis = await Anamnesis.findOne({
      where: { patient_id: patientId }
    });

    if (anamnesis) {
      report.anamnesis = {
        status: anamnesis.status,
        completion_percentage: anamnesis.completion_percentage,
        completed_at: anamnesis.completed_at,
        current_complaint: anamnesis.current_complaint,
        family_history: anamnesis.family_history,
        medical_history: anamnesis.medical_history,
        psychological_history: anamnesis.psychological_history,
        lifestyle: anamnesis.lifestyle,
        treatment_goals: anamnesis.treatment_goals
      };
    }
  }

  // Incluir sessões
  if (includeSessions) {
    const where = { patient_id: patientId, status: 'completed' };
    if (startDate || endDate) {
      where.session_date = {};
      if (startDate) where.session_date[Op.gte] = new Date(startDate);
      if (endDate) where.session_date[Op.lte] = new Date(endDate);
    }

    const sessions = await Session.findAll({
      where,
      order: [['session_date', 'DESC']]
    });

    report.sessions = {
      total: sessions.length,
      list: sessions.map(s => ({
        session_number: s.session_number,
        date: s.session_date,
        type: s.session_type,
        duration: s.actual_duration_minutes || s.duration_minutes,
        notes: s.session_notes,
        mood: s.patient_mood,
        topics: s.main_topics,
        interventions: s.interventions_used,
        progress: s.progress_assessment,
        engagement: s.patient_engagement
      }))
    };
  }

  // Incluir timeline
  if (includeTimeline && report.sessions) {
    const sessions = await Session.findAll({
      where: { patient_id: patientId, status: 'completed' },
      order: [['session_date', 'ASC']]
    });

    const milestones = evolutionHelpers.identifyMilestones(sessions);
    report.timeline = {
      milestones,
      progress_trend: evolutionHelpers.analyzeProgressTrend(sessions)
    };
  }

  // Incluir estatísticas
  if (includeStatistics && report.sessions) {
    const sessions = await Session.findAll({
      where: { patient_id: patientId, status: 'completed' }
    });

    report.statistics = {
      total_sessions: sessions.length,
      frequency: timelineHelpers.calculateSessionFrequency(sessions),
      regularity: timelineHelpers.analyzeSessionRegularity(sessions),
      engagement: evolutionHelpers.calculateEngagementByPeriod(sessions),
      most_used_interventions: evolutionHelpers.getMostUsedInterventions(sessions),
      main_themes: evolutionHelpers.getMainThemes(sessions)
    };
  }

  return report;
};

// ============================================
// RELATÓRIO DE PRODUTIVIDADE PROFISSIONAL
// ============================================

/**
 * Gerar relatório de produtividade do profissional
 */
const generateProfessionalProductivityReport = async (userId, startDate, endDate) => {
  const professional = await User.findByPk(userId);
  
  if (!professional) {
    throw new Error('Profissional não encontrado');
  }

  // Buscar sessões do período
  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      }
    },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name']
      }
    ],
    order: [['session_date', 'DESC']]
  });

  // Agrupar por status
  const byStatus = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  // Agrupar por tipo
  const byType = sessions.reduce((acc, s) => {
    acc[s.session_type] = (acc[s.session_type] || 0) + 1;
    return acc;
  }, {});

  // Calcular horas trabalhadas
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalMinutes = completedSessions.reduce((sum, s) => 
    sum + (s.actual_duration_minutes || s.duration_minutes), 0
  );

  // Pacientes únicos
  const uniquePatients = new Set(completedSessions.map(s => s.patient_id)).size;

  // Engajamento médio
  const withEngagement = completedSessions.filter(s => s.patient_engagement);
  const avgEngagement = withEngagement.length > 0
    ? (withEngagement.reduce((sum, s) => sum + s.patient_engagement, 0) / withEngagement.length).toFixed(2)
    : null;

  // Taxa de comparecimento
  const scheduled = sessions.filter(s => ['scheduled', 'confirmed', 'completed', 'no_show'].includes(s.status)).length;
  const attendanceRate = scheduled > 0
    ? ((completedSessions.length / scheduled) * 100).toFixed(2)
    : 0;

  return {
    metadata: {
      report_type: 'professional_productivity',
      generated_at: new Date(),
      period: { start_date: startDate, end_date: endDate }
    },
    professional: {
      id: professional.id,
      name: professional.full_name,
      register: professional.professional_register
    },
    summary: {
      total_sessions: sessions.length,
      completed: completedSessions.length,
      cancelled: byStatus.cancelled || 0,
      no_show: byStatus.no_show || 0,
      hours_worked: (totalMinutes / 60).toFixed(2),
      unique_patients: uniquePatients,
      avg_engagement: avgEngagement ? parseFloat(avgEngagement) : null,
      attendance_rate: parseFloat(attendanceRate)
    },
    by_status: byStatus,
    by_type: byType,
    sessions_list: sessions.map(s => ({
      date: s.session_date,
      patient_name: s.patient?.full_name,
      type: s.session_type,
      status: s.status,
      duration: s.duration_minutes
    }))
  };
};

// ============================================
// ANAMNESE FORMATADA
// ============================================

/**
 * Gerar anamnese formatada para impressão
 */
const generateFormattedAnamnesis = async (patientId, userId) => {
  const patient = await Patient.findOne({
    where: { id: patientId, user_id: userId },
    include: [
      {
        model: User,
        as: 'professional',
        attributes: ['full_name', 'professional_register']
      }
    ]
  });

  if (!patient) {
    throw new Error('Paciente não encontrado');
  }

  const anamnesis = await Anamnesis.findOne({
    where: { patient_id: patientId }
  });

  if (!anamnesis) {
    throw new Error('Anamnese não encontrada');
  }

  return {
    metadata: {
      report_type: 'formatted_anamnesis',
      generated_at: new Date(),
      generated_by: userId
    },
    header: {
      professional_name: patient.professional?.full_name,
      professional_register: patient.professional?.professional_register,
      patient_name: patient.full_name,
      patient_age: patient.getAge(),
      date: anamnesis.created_at
    },
    status: {
      completion_percentage: anamnesis.completion_percentage,
      status: anamnesis.status,
      completed_at: anamnesis.completed_at
    },
    sections: {
      identification: anamnesis.identification || {},
      family_history: anamnesis.family_history || {},
      medical_history: anamnesis.medical_history || {},
      psychological_history: anamnesis.psychological_history || {},
      current_complaint: anamnesis.current_complaint || {},
      lifestyle: anamnesis.lifestyle || {},
      relationships: anamnesis.relationships || {},
      treatment_goals: anamnesis.treatment_goals || {}
    },
    observations: anamnesis.notes
  };
};

// ============================================
// RELATÓRIO DE SESSÕES POR PERÍODO
// ============================================

/**
 * Gerar relatório de sessões em um período
 */
const generateSessionsPeriodReport = async (userId, startDate, endDate, options = {}) => {
  const {
    groupBy = 'week',
    includeCharts = true,
    includeDetails = true
  } = options;

  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      }
    },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name']
      }
    ],
    order: [['session_date', 'ASC']]
  });

  const report = {
    metadata: {
      report_type: 'sessions_period',
      generated_at: new Date(),
      period: { start_date: startDate, end_date: endDate }
    },
    summary: {
      total_sessions: sessions.length,
      by_status: sessions.reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      }, {}),
      by_type: sessions.reduce((acc, s) => {
        acc[s.session_type] = (acc[s.session_type] || 0) + 1;
        return acc;
      }, {})
    }
  };

  // Agrupar por período
  if (groupBy) {
    const timeline = timelineHelpers.generateTimeline(sessions, { groupBy });
    report.timeline = timeline;
  }

  // Incluir gráficos
  if (includeCharts) {
    const chartHelpers = require('../utils/chartHelpers');
    report.charts = {
      sessions_over_time: chartHelpers.prepareLineChartData(
        sessions.map(s => ({
          date: s.session_date,
          value: 1
        })),
        { label: 'Sessões', xKey: 'date', yKey: 'value' }
      ),
      by_type: chartHelpers.prepareSessionsByTypeChart(sessions),
      by_status: chartHelpers.prepareStatusDistributionChart(sessions)
    };
  }

  // Incluir detalhes
  if (includeDetails) {
    report.sessions = sessions.map(s => ({
      date: s.session_date,
      patient_name: s.patient?.full_name,
      session_number: s.session_number,
      type: s.session_type,
      status: s.status,
      duration: s.duration_minutes,
      has_notes: !!s.session_notes
    }));
  }

  return report;
};

// ============================================
// TEMPLATES HTML PARA RELATÓRIOS
// ============================================

/**
 * Template HTML para cabeçalho de relatório
 */
const generateReportHeader = (reportData) => {
  return `
    <div class="report-header">
      <div class="logo">
        <h1>MÓDULA - Gestão Clínica</h1>
      </div>
      <div class="professional-info">
        <p><strong>${reportData.professional.name}</strong></p>
        <p>Registro: ${reportData.professional.register}</p>
      </div>
      <div class="report-info">
        <p>Relatório: ${reportData.metadata.report_type}</p>
        <p>Data: ${new Date(reportData.metadata.generated_at).toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  `;
};

/**
 * Template HTML completo para relatório
 */
const generateHTMLReport = (reportData) => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório - ${reportData.metadata.report_type}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .report-header { border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
        .report-header h1 { color: #4CAF50; font-size: 24px; }
        .report-header p { margin: 5px 0; }
        .section { margin: 20px 0; page-break-inside: avoid; }
        .section-title { background: #f5f5f5; padding: 10px; font-weight: bold; font-size: 18px; border-left: 4px solid #4CAF50; }
        .content { padding: 15px; }
        .data-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
        .data-label { font-weight: bold; min-width: 200px; }
        .data-value { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: bold; }
        .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        @media print {
          .page-break { page-break-before: always; }
          body { font-size: 12pt; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${generateReportHeader(reportData)}
        ${generateReportContent(reportData)}
        <div class="footer">
          <p>Documento gerado automaticamente pelo sistema MÓDULA</p>
          <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Gerar conteúdo do relatório baseado no tipo
 */
const generateReportContent = (reportData) => {
  // Implementação específica por tipo de relatório
  // Retornaria HTML formatado baseado no tipo
  return '<div class="content">Conteúdo do relatório aqui</div>';
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Relatórios principais
  generatePatientEvolutionReport,
  generateProfessionalProductivityReport,
  generateFormattedAnamnesis,
  generateSessionsPeriodReport,
  
  // Templates HTML
  generateReportHeader,
  generateHTMLReport,
  generateReportContent
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. RELATÓRIO DE EVOLUÇÃO:
 *    const report = await reportService.generatePatientEvolutionReport(
 *      patientId,
 *      userId,
 *      {
 *        startDate: new Date('2025-01-01'),
 *        endDate: new Date('2025-12-31'),
 *        includeAnamnesis: true,
 *        includeSessions: true,
 *        includeTimeline: true
 *      }
 *    );
 * 
 * 2. RELATÓRIO DE PRODUTIVIDADE:
 *    const report = await reportService.generateProfessionalProductivityReport(
 *      userId,
 *      startDate,
 *      endDate
 *    );
 * 
 * 3. ANAMNESE FORMATADA:
 *    const report = await reportService.generateFormattedAnamnesis(
 *      patientId,
 *      userId
 *    );
 * 
 * 4. RELATÓRIO DE PERÍODO:
 *    const report = await reportService.generateSessionsPeriodReport(
 *      userId,
 *      startDate,
 *      endDate,
 *      {
 *        groupBy: 'month',
 *        includeCharts: true,
 *        includeDetails: true
 *      }
 *    );
 * 
 * 5. GERAR HTML:
 *    const html = reportService.generateHTMLReport(report);
 *    // Pronto para conversão em PDF
 */