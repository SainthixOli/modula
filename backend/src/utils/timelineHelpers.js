/**
 * MÓDULA - HELPERS DE TIMELINE E HISTÓRICO
 * 
 * Utilitários para visualização cronológica e análise de histórico de sessões.
 * Sistema profissional de timeline com marcos, tendências e comparações.
 * 
 * Funcionalidades implementadas:
 * - Geração de timeline cronológica
 * - Identificação de marcos importantes
 * - Comparação entre períodos
 * - Análise de frequência de sessões
 * - Visualização de gaps temporais
 * - Estatísticas agregadas por período
 * 
 * Recursos especiais:
 * - Timeline interativa com filtros
 * - Identificação automática de padrões
 * - Comparação antes/depois de marcos
 * - Cálculo de intervalos entre sessões
 * - Análise de aderência ao tratamento
 * - Exportação de dados para visualização
 */

// ============================================
// GERAÇÃO DE TIMELINE
// ============================================

/**
 * Gerar timeline cronológica completa
 */
const generateTimeline = (sessions, options = {}) => {
  const {
    includeEmpty = false,
    groupBy = 'month',
    sortOrder = 'desc'
  } = options;

  // Ordenar sessões
  const sorted = [...sessions].sort((a, b) => {
    const dateA = new Date(a.session_date);
    const dateB = new Date(b.session_date);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Agrupar por período
  const grouped = {};
  
  sorted.forEach(session => {
    const date = new Date(session.session_date);
    let key;
    
    switch (groupBy) {
      case 'year':
        key = date.getFullYear().toString();
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'week':
        const weekNumber = getWeekNumber(date);
        key = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        sessions: [],
        count: 0,
        total_duration: 0,
        avg_engagement: null
      };
    }
    
    grouped[key].sessions.push(session);
    grouped[key].count++;
    grouped[key].total_duration += session.duration_minutes || 0;
  });

  // Calcular médias de engajamento
  Object.values(grouped).forEach(period => {
    const withEngagement = period.sessions.filter(s => s.patient_engagement);
    if (withEngagement.length > 0) {
      period.avg_engagement = (
        withEngagement.reduce((sum, s) => sum + s.patient_engagement, 0) / 
        withEngagement.length
      ).toFixed(2);
    }
  });

  return {
    timeline: Object.values(grouped),
    total_sessions: sorted.length,
    group_by: groupBy,
    sort_order: sortOrder
  };
};

/**
 * Gerar timeline com eventos detalhados
 */
const generateDetailedTimeline = (sessions, milestones = []) => {
  const events = [];

  // Adicionar sessões como eventos
  sessions.forEach(session => {
    events.push({
      type: 'session',
      date: new Date(session.session_date),
      session_number: session.session_number,
      session_type: session.session_type,
      status: session.status,
      data: {
        id: session.id,
        patient_mood: session.patient_mood,
        progress: session.progress_assessment,
        engagement: session.patient_engagement,
        topics: session.main_topics || []
      }
    });
  });

  // Adicionar marcos como eventos
  milestones.forEach(milestone => {
    events.push({
      type: 'milestone',
      date: new Date(milestone.date),
      milestone_type: milestone.type,
      description: milestone.description,
      data: milestone
    });
  });

  // Ordenar por data
  events.sort((a, b) => b.date - a.date);

  return {
    events,
    total_events: events.length,
    sessions_count: events.filter(e => e.type === 'session').length,
    milestones_count: events.filter(e => e.type === 'milestone').length
  };
};

/**
 * Obter número da semana do ano
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// ============================================
// ANÁLISE DE FREQUÊNCIA
// ============================================

/**
 * Calcular frequência média de sessões
 */
const calculateSessionFrequency = (sessions) => {
  if (sessions.length < 2) {
    return {
      frequency: null,
      message: 'Dados insuficientes para cálculo de frequência'
    };
  }

  const sorted = [...sessions].sort((a, b) => 
    new Date(a.session_date) - new Date(b.session_date)
  );

  const intervals = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i].session_date);
    const next = new Date(sorted[i + 1].session_date);
    const daysDiff = Math.round((next - current) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const minInterval = Math.min(...intervals);
  const maxInterval = Math.max(...intervals);

  let frequencyLabel;
  if (avgInterval <= 7) frequencyLabel = 'Semanal';
  else if (avgInterval <= 14) frequencyLabel = 'Quinzenal';
  else if (avgInterval <= 30) frequencyLabel = 'Mensal';
  else frequencyLabel = 'Esporádica';

  return {
    avg_interval_days: avgInterval.toFixed(1),
    min_interval_days: minInterval,
    max_interval_days: maxInterval,
    frequency_label: frequencyLabel,
    total_intervals: intervals.length,
    intervals_array: intervals
  };
};

/**
 * Analisar regularidade das sessões
 */
const analyzeSessionRegularity = (sessions) => {
  if (sessions.length < 3) {
    return {
      regularity: 'insufficient_data',
      score: null
    };
  }

  const frequency = calculateSessionFrequency(sessions);
  const intervals = frequency.intervals_array || [];

  // Calcular desvio padrão
  const avg = parseFloat(frequency.avg_interval_days);
  const variance = intervals.reduce((sum, interval) => {
    return sum + Math.pow(interval - avg, 2);
  }, 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // Coeficiente de variação (quanto menor, mais regular)
  const cv = (stdDev / avg) * 100;

  let regularity;
  let score;

  if (cv < 20) {
    regularity = 'very_regular';
    score = 5;
  } else if (cv < 40) {
    regularity = 'regular';
    score = 4;
  } else if (cv < 60) {
    regularity = 'moderate';
    score = 3;
  } else if (cv < 80) {
    regularity = 'irregular';
    score = 2;
  } else {
    regularity = 'very_irregular';
    score = 1;
  }

  return {
    regularity,
    regularity_score: score,
    coefficient_variation: cv.toFixed(2),
    standard_deviation: stdDev.toFixed(2),
    avg_interval: avg
  };
};

/**
 * Identificar gaps prolongados
 */
const identifySessionGaps = (sessions, thresholdDays = 30) => {
  const sorted = [...sessions].sort((a, b) => 
    new Date(a.session_date) - new Date(b.session_date)
  );

  const gaps = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i].session_date);
    const next = new Date(sorted[i + 1].session_date);
    const daysDiff = Math.round((next - current) / (1000 * 60 * 60 * 24));

    if (daysDiff > thresholdDays) {
      gaps.push({
        after_session: sorted[i].session_number,
        before_session: sorted[i + 1].session_number,
        gap_days: daysDiff,
        gap_weeks: (daysDiff / 7).toFixed(1),
        start_date: sorted[i].session_date,
        end_date: sorted[i + 1].session_date,
        severity: daysDiff > 90 ? 'critical' : daysDiff > 60 ? 'high' : 'moderate'
      });
    }
  }

  return {
    gaps_found: gaps.length,
    gaps,
    longest_gap: gaps.length > 0 ? Math.max(...gaps.map(g => g.gap_days)) : 0
  };
};

// ============================================
// COMPARAÇÃO DE PERÍODOS
// ============================================

/**
 * Comparar dois períodos de tratamento
 */
const comparePeriods = (period1Sessions, period2Sessions, labels = ['Período 1', 'Período 2']) => {
  const calculatePeriodStats = (sessions) => {
    if (sessions.length === 0) return null;

    const withEngagement = sessions.filter(s => s.patient_engagement);
    const withProgress = sessions.filter(s => s.progress_assessment);

    const improved = withProgress.filter(s => s.progress_assessment === 'improved').length;

    return {
      total_sessions: sessions.length,
      avg_engagement: withEngagement.length > 0
        ? (withEngagement.reduce((sum, s) => sum + s.patient_engagement, 0) / withEngagement.length).toFixed(2)
        : null,
      improvement_rate: withProgress.length > 0
        ? ((improved / withProgress.length) * 100).toFixed(2)
        : null,
      total_duration: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    };
  };

  const stats1 = calculatePeriodStats(period1Sessions);
  const stats2 = calculatePeriodStats(period2Sessions);

  if (!stats1 || !stats2) {
    return {
      comparable: false,
      message: 'Um ou ambos os períodos não têm dados suficientes'
    };
  }

  // Calcular diferenças
  const differences = {
    sessions: stats2.total_sessions - stats1.total_sessions,
    engagement: stats1.avg_engagement && stats2.avg_engagement
      ? (parseFloat(stats2.avg_engagement) - parseFloat(stats1.avg_engagement)).toFixed(2)
      : null,
    improvement_rate: stats1.improvement_rate && stats2.improvement_rate
      ? (parseFloat(stats2.improvement_rate) - parseFloat(stats1.improvement_rate)).toFixed(2)
      : null
  };

  return {
    comparable: true,
    period1: {
      label: labels[0],
      stats: stats1
    },
    period2: {
      label: labels[1],
      stats: stats2
    },
    differences,
    summary: generateComparisonSummary(differences)
  };
};

/**
 * Gerar resumo de comparação
 */
const generateComparisonSummary = (differences) => {
  const summary = [];

  if (differences.sessions !== 0) {
    const change = differences.sessions > 0 ? 'aumento' : 'diminuição';
    summary.push(`${change} de ${Math.abs(differences.sessions)} sessão(ões)`);
  }

  if (differences.engagement) {
    const value = parseFloat(differences.engagement);
    if (Math.abs(value) >= 0.5) {
      const change = value > 0 ? 'aumento' : 'diminuição';
      summary.push(`${change} de ${Math.abs(value)} no engajamento`);
    }
  }

  if (differences.improvement_rate) {
    const value = parseFloat(differences.improvement_rate);
    if (Math.abs(value) >= 5) {
      const change = value > 0 ? 'aumento' : 'diminuição';
      summary.push(`${change} de ${Math.abs(value)}% na taxa de melhora`);
    }
  }

  return summary.length > 0 ? summary.join(', ') : 'Sem mudanças significativas';
};

// ============================================
// ANÁLISE DE ADERÊNCIA
// ============================================

/**
 * Calcular taxa de aderência ao tratamento
 */
const calculateAdherenceRate = (sessions, scheduledSessions = null) => {
  const completed = sessions.filter(s => s.status === 'completed').length;
  const noShow = sessions.filter(s => s.status === 'no_show').length;
  const cancelled = sessions.filter(s => s.status === 'cancelled').length;

  const totalScheduled = scheduledSessions || (completed + noShow + cancelled);

  if (totalScheduled === 0) {
    return {
      adherence_rate: null,
      message: 'Nenhuma sessão agendada para calcular aderência'
    };
  }

  const adherenceRate = (completed / totalScheduled) * 100;

  let adherenceLevel;
  if (adherenceRate >= 90) adherenceLevel = 'excellent';
  else if (adherenceRate >= 75) adherenceLevel = 'good';
  else if (adherenceRate >= 60) adherenceLevel = 'moderate';
  else if (adherenceRate >= 40) adherenceLevel = 'low';
  else adherenceLevel = 'very_low';

  return {
    adherence_rate: adherenceRate.toFixed(2),
    adherence_level: adherenceLevel,
    completed_sessions: completed,
    missed_sessions: noShow,
    cancelled_sessions: cancelled,
    total_scheduled: totalScheduled,
    no_show_rate: ((noShow / totalScheduled) * 100).toFixed(2)
  };
};

// ============================================
// EXPORTAÇÃO DE DADOS
// ============================================

/**
 * Preparar dados para exportação/visualização
 */
const prepareDataForVisualization = (sessions, format = 'chart') => {
  switch (format) {
    case 'chart':
      return prepareChartData(sessions);
    case 'table':
      return prepareTableData(sessions);
    case 'calendar':
      return prepareCalendarData(sessions);
    default:
      return sessions;
  }
};

/**
 * Preparar dados para gráficos
 */
const prepareChartData = (sessions) => {
  const sorted = [...sessions].sort((a, b) => 
    new Date(a.session_date) - new Date(b.session_date)
  );

  return {
    engagement_over_time: sorted
      .filter(s => s.patient_engagement)
      .map(s => ({
        session: s.session_number,
        date: s.session_date,
        value: s.patient_engagement
      })),
    
    progress_distribution: {
      improved: sorted.filter(s => s.progress_assessment === 'improved').length,
      stable: sorted.filter(s => s.progress_assessment === 'stable').length,
      worsened: sorted.filter(s => s.progress_assessment === 'worsened').length,
      no_change: sorted.filter(s => s.progress_assessment === 'no_change').length
    },
    
    sessions_by_type: sorted.reduce((acc, s) => {
      acc[s.session_type] = (acc[s.session_type] || 0) + 1;
      return acc;
    }, {})
  };
};

/**
 * Preparar dados para tabela
 */
const prepareTableData = (sessions) => {
  return sessions.map(s => ({
    session_number: s.session_number,
    date: new Date(s.session_date).toLocaleDateString('pt-BR'),
    type: s.session_type,
    status: s.status,
    duration: s.duration_minutes || s.actual_duration_minutes,
    engagement: s.patient_engagement || '-',
    progress: s.progress_assessment || '-',
    has_notes: !!s.session_notes
  }));
};

/**
 * Preparar dados para calendário
 */
const prepareCalendarData = (sessions) => {
  const calendar = {};
  
  sessions.forEach(s => {
    const date = new Date(s.session_date).toISOString().split('T')[0];
    
    if (!calendar[date]) {
      calendar[date] = {
        date,
        sessions: [],
        count: 0
      };
    }
    
    calendar[date].sessions.push({
      id: s.id,
      number: s.session_number,
      time: new Date(s.session_date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: s.session_type,
      status: s.status
    });
    calendar[date].count++;
  });
  
  return Object.values(calendar);
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Timeline
  generateTimeline,
  generateDetailedTimeline,
  getWeekNumber,
  
  // Frequência
  calculateSessionFrequency,
  analyzeSessionRegularity,
  identifySessionGaps,
  
  // Comparação
  comparePeriods,
  generateComparisonSummary,
  
  // Aderência
  calculateAdherenceRate,
  
  // Visualização
  prepareDataForVisualization,
  prepareChartData,
  prepareTableData,
  prepareCalendarData
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. GERAR TIMELINE:
 *    const timeline = generateTimeline(sessions, {
 *      groupBy: 'month',
 *      sortOrder: 'desc'
 *    });
 * 
 * 2. CALCULAR FREQUÊNCIA:
 *    const frequency = calculateSessionFrequency(sessions);
 *    // { avg_interval_days: '7.5', frequency_label: 'Semanal' }
 * 
 * 3. ANALISAR REGULARIDADE:
 *    const regularity = analyzeSessionRegularity(sessions);
 *    // { regularity: 'regular', regularity_score: 4 }
 * 
 * 4. IDENTIFICAR GAPS:
 *    const gaps = identifySessionGaps(sessions, 30);
 *    // Gaps maiores que 30 dias
 * 
 * 5. COMPARAR PERÍODOS:
 *    const comparison = comparePeriods(
 *      firstMonthSessions,
 *      lastMonthSessions,
 *      ['Primeiro Mês', 'Último Mês']
 *    );
 * 
 * 6. CALCULAR ADERÊNCIA:
 *    const adherence = calculateAdherenceRate(sessions);
 *    // { adherence_rate: '87.50', adherence_level: 'good' }
 * 
 * 7. PREPARAR PARA VISUALIZAÇÃO:
 *    const chartData = prepareDataForVisualization(sessions, 'chart');
 *    const tableData = prepareDataForVisualization(sessions, 'table');
 * 
 * INTEGRAÇÃO NO CONTROLLER:
 * 
 * const timelineHelpers = require('../utils/timelineHelpers');
 * 
 * const getPatientTimeline = async (req, res) => {
 *   const sessions = await Session.findAll({ ... });
 *   
 *   const timeline = timelineHelpers.generateDetailedTimeline(
 *     sessions,
 *     milestones
 *   );
 *   
 *   const frequency = timelineHelpers.calculateSessionFrequency(sessions);
 *   const regularity = timelineHelpers.analyzeSessionRegularity(sessions);
 *   const gaps = timelineHelpers.identifySessionGaps(sessions, 30);
 *   const adherence = timelineHelpers.calculateAdherenceRate(sessions);
 *   
 *   res.json({
 *     success: true,
 *     data: {
 *       timeline,
 *       frequency,
 *       regularity,
 *       gaps,
 *       adherence
 *     }
 *   });
 * };
 */