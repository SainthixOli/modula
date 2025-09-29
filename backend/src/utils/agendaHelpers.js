/**
 * MÓDULA - HELPERS DE VISUALIZAÇÃO DE AGENDA
 * 
 * Utilitários para formatação e processamento de dados da agenda profissional.
 * Funções auxiliares para visualizações de calendário, timeline e dashboards.
 * 
 * Funcionalidades implementadas:
 * - Formatação de horários e durações
 * - Agrupamento de sessões por período
 * - Cálculo de métricas de agenda
 * - Geração de dados para calendários
 * - Identificação de gaps e disponibilidade
 * - Formatação para diferentes fusos horários
 * 
 * Recursos especiais:
 * - Suporte a múltiplos formatos de data
 * - Cálculo de ocupação por período
 * - Identificação de padrões de agenda
 * - Geração de dados para gráficos
 * - Suporte a internacionalização (pt-BR)
 */

// ============================================
// CONSTANTES
// ============================================

const DAYS_OF_WEEK_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const SESSION_TYPE_LABELS = {
  first_consultation: 'Primeira Consulta',
  follow_up: 'Retorno',
  evaluation: 'Avaliação',
  therapy_session: 'Sessão de Terapia',
  group_therapy: 'Terapia em Grupo',
  family_therapy: 'Terapia Familiar',
  emergency: 'Emergência',
  return: 'Retorno',
  discharge: 'Alta'
};

const STATUS_LABELS = {
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  in_progress: 'Em Andamento',
  completed: 'Realizada',
  cancelled: 'Cancelada',
  no_show: 'Falta',
  rescheduled: 'Reagendada'
};

const STATUS_COLORS = {
  scheduled: '#FFA500',    // Laranja
  confirmed: '#4CAF50',    // Verde
  in_progress: '#2196F3',  // Azul
  completed: '#9E9E9E',    // Cinza
  cancelled: '#F44336',    // Vermelho
  no_show: '#FF5722',      // Vermelho escuro
  rescheduled: '#FF9800'   // Laranja escuro
};

// ============================================
// FORMATAÇÃO DE DATA E HORA
// ============================================

/**
 * Formatar data em português
 */
const formatDatePT = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTHS_PT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} de ${month} de ${year}`;
};

/**
 * Formatar data curta (DD/MM/YYYY)
 */
const formatDateShort = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formatar horário (HH:MM)
 */
const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Formatar duração em texto
 */
const formatDuration = (minutes) => {
  if (!minutes) return '0min';
  if (minutes < 60) return `${minutes}min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

/**
 * Obter dia da semana em português
 */
const getDayOfWeekPT = (date) => {
  const d = new Date(date);
  return DAYS_OF_WEEK_PT[d.getDay()];
};

/**
 * Verificar se é dia útil
 */
const isWeekday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  return day !== 0 && day !== 6; // Não é domingo nem sábado
};

/**
 * Obter nome do mês
 */
const getMonthName = (monthNumber) => {
  return MONTHS_PT[monthNumber - 1] || '';
};

// ============================================
// AGRUPAMENTO DE SESSÕES
// ============================================

/**
 * Agrupar sessões por data
 */
const groupSessionsByDate = (sessions) => {
  const grouped = {};
  
  sessions.forEach(session => {
    const dateKey = new Date(session.session_date).toISOString().split('T')[0];
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        date_formatted: formatDateShort(session.session_date),
        day_of_week: getDayOfWeekPT(session.session_date),
        sessions: [],
        total_duration: 0,
        count: 0
      };
    }
    
    grouped[dateKey].sessions.push(session);
    grouped[dateKey].total_duration += session.duration_minutes || 0;
    grouped[dateKey].count++;
  });
  
  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Agrupar sessões por dia da semana
 */
const groupSessionsByDayOfWeek = (sessions) => {
  const grouped = {};
  
  DAYS_OF_WEEK_PT.forEach(day => {
    grouped[day] = {
      day_name: day,
      sessions: [],
      total_duration: 0,
      count: 0
    };
  });
  
  sessions.forEach(session => {
    const dayName = getDayOfWeekPT(session.session_date);
    grouped[dayName].sessions.push(session);
    grouped[dayName].total_duration += session.duration_minutes || 0;
    grouped[dayName].count++;
  });
  
  return grouped;
};

/**
 * Agrupar sessões por tipo
 */
const groupSessionsByType = (sessions) => {
  const grouped = {};
  
  sessions.forEach(session => {
    const type = session.session_type;
    
    if (!grouped[type]) {
      grouped[type] = {
        type,
        type_label: SESSION_TYPE_LABELS[type] || type,
        sessions: [],
        count: 0,
        total_duration: 0
      };
    }
    
    grouped[type].sessions.push(session);
    grouped[type].count++;
    grouped[type].total_duration += session.duration_minutes || 0;
  });
  
  return Object.values(grouped).sort((a, b) => b.count - a.count);
};

/**
 * Agrupar sessões por status
 */
const groupSessionsByStatus = (sessions) => {
  const grouped = {};
  
  sessions.forEach(session => {
    const status = session.status;
    
    if (!grouped[status]) {
      grouped[status] = {
        status,
        status_label: STATUS_LABELS[status] || status,
        color: STATUS_COLORS[status] || '#000000',
        sessions: [],
        count: 0
      };
    }
    
    grouped[status].sessions.push(session);
    grouped[status].count++;
  });
  
  return Object.values(grouped).sort((a, b) => b.count - a.count);
};

// ============================================
// CÁLCULOS DE MÉTRICAS
// ============================================

/**
 * Calcular taxa de ocupação da agenda
 */
const calculateOccupancyRate = (sessions, workingHoursPerDay = 8) => {
  // Agrupar por data para contar dias únicos
  const dateSet = new Set();
  let totalMinutes = 0;
  
  sessions.forEach(session => {
    const dateKey = new Date(session.session_date).toISOString().split('T')[0];
    dateSet.add(dateKey);
    totalMinutes += session.duration_minutes || 0;
  });
  
  const workingDays = dateSet.size;
  const availableMinutes = workingDays * workingHoursPerDay * 60;
  const occupancyRate = availableMinutes > 0 ? (totalMinutes / availableMinutes) * 100 : 0;
  
  return {
    occupancy_rate: occupancyRate.toFixed(2),
    total_minutes: totalMinutes,
    available_minutes: availableMinutes,
    working_days: workingDays,
    total_hours: (totalMinutes / 60).toFixed(2),
    available_hours: workingDays * workingHoursPerDay
  };
};

/**
 * Calcular gaps (intervalos livres) entre sessões
 */
const calculateGaps = (sessions) => {
  if (sessions.length < 2) return [];
  
  // Ordenar por data
  const sorted = [...sessions].sort((a, b) => 
    new Date(a.session_date) - new Date(b.session_date)
  );
  
  const gaps = [];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentSession = sorted[i];
    const nextSession = sorted[i + 1];
    
    const currentEnd = new Date(
      new Date(currentSession.session_date).getTime() + 
      currentSession.duration_minutes * 60000
    );
    const nextStart = new Date(nextSession.session_date);
    
    // Verificar se são no mesmo dia
    const sameDay = currentEnd.toDateString() === nextStart.toDateString();
    
    if (sameDay) {
      const gapMinutes = Math.round((nextStart - currentEnd) / 60000);
      
      if (gapMinutes > 0) {
        gaps.push({
          after_session: currentSession.id,
          before_session: nextSession.id,
          gap_minutes: gapMinutes,
          gap_formatted: formatDuration(gapMinutes),
          start_time: formatTime(currentEnd),
          end_time: formatTime(nextStart),
          date: formatDateShort(currentEnd)
        });
      }
    }
  }
  
  return gaps;
};

/**
 * Calcular sessões por hora do dia
 */
const calculateSessionsByHour = (sessions) => {
  const hourCounts = Array(24).fill(0);
  
  sessions.forEach(session => {
    const hour = new Date(session.session_date).getHours();
    hourCounts[hour]++;
  });
  
  // Retornar apenas horários com sessões
  const result = [];
  hourCounts.forEach((count, hour) => {
    if (count > 0) {
      result.push({
        hour,
        hour_formatted: `${String(hour).padStart(2, '0')}:00`,
        count
      });
    }
  });
  
  return result.sort((a, b) => b.count - a.count);
};

/**
 * Identificar horários de pico
 */
const identifyPeakHours = (sessions) => {
  const hourCounts = calculateSessionsByHour(sessions);
  
  if (hourCounts.length === 0) return null;
  
  const maxCount = Math.max(...hourCounts.map(h => h.count));
  const peakHours = hourCounts.filter(h => h.count === maxCount);
  
  return {
    peak_hours: peakHours,
    max_sessions: maxCount,
    total_peak_sessions: peakHours.reduce((sum, h) => sum + h.count, 0)
  };
};

// ============================================
// GERAÇÃO DE DADOS PARA CALENDÁRIO
// ============================================

/**
 * Gerar estrutura de calendário mensal
 */
const generateMonthCalendar = (year, month, sessions) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  
  // Agrupar sessões por data
  const sessionsByDate = {};
  sessions.forEach(session => {
    const dateKey = new Date(session.session_date).toISOString().split('T')[0];
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });
  
  // Gerar dias do calendário
  const calendar = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateKey = date.toISOString().split('T')[0];
    const daySessions = sessionsByDate[dateKey] || [];
    
    calendar.push({
      day,
      date: dateKey,
      day_of_week: DAYS_OF_WEEK_PT[date.getDay()],
      is_weekday: isWeekday(date),
      is_today: dateKey === new Date().toISOString().split('T')[0],
      sessions_count: daySessions.length,
      sessions: daySessions,
      total_duration: daySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      has_sessions: daySessions.length > 0
    });
  }
  
  return {
    year,
    month,
    month_name: MONTHS_PT[month - 1],
    first_day: firstDay.getDay(),
    days_in_month: daysInMonth,
    calendar
  };
};

/**
 * Gerar estrutura de semana
 */
const generateWeekStructure = (startDate, sessions) => {
  const week = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(s => 
      new Date(s.session_date).toISOString().split('T')[0] === dateKey
    );
    
    week.push({
      date: dateKey,
      date_formatted: formatDateShort(date),
      day_of_week: DAYS_OF_WEEK_PT[date.getDay()],
      day_number: date.getDate(),
      is_today: dateKey === new Date().toISOString().split('T')[0],
      is_weekday: isWeekday(date),
      sessions: daySessions.sort((a, b) => 
        new Date(a.session_date) - new Date(b.session_date)
      ),
      sessions_count: daySessions.length,
      total_duration: daySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    });
  }
  
  return week;
};

// ============================================
// FORMATAÇÃO PARA VISUALIZAÇÕES
// ============================================

/**
 * Formatar sessão para exibição em agenda
 */
const formatSessionForAgenda = (session) => {
  return {
    id: session.id,
    patient_name: session.patient?.full_name || 'Paciente não identificado',
    patient_id: session.patient_id,
    time: formatTime(session.session_date),
    duration: formatDuration(session.duration_minutes),
    duration_minutes: session.duration_minutes,
    type: session.session_type,
    type_label: SESSION_TYPE_LABELS[session.session_type] || session.session_type,
    status: session.status,
    status_label: STATUS_LABELS[session.status] || session.status,
    status_color: STATUS_COLORS[session.status] || '#000000',
    location: session.location,
    notes: session.notes,
    is_billable: session.is_billable,
    can_edit: ['scheduled', 'confirmed'].includes(session.status),
    can_cancel: ['scheduled', 'confirmed'].includes(session.status)
  };
};

/**
 * Formatar lista de sessões para timeline
 */
const formatSessionsForTimeline = (sessions) => {
  return sessions.map(session => ({
    ...formatSessionForAgenda(session),
    date: formatDatePT(session.session_date),
    date_short: formatDateShort(session.session_date),
    day_of_week: getDayOfWeekPT(session.session_date),
    session_number: session.session_number,
    has_evolution: !!session.session_notes,
    progress_assessment: session.progress_assessment,
    patient_engagement: session.patient_engagement
  }));
};

/**
 * Gerar dados para gráfico de sessões
 */
const generateChartData = (sessions, groupBy = 'date') => {
  let grouped;
  
  switch (groupBy) {
    case 'date':
      grouped = groupSessionsByDate(sessions);
      return grouped.map(g => ({
        label: g.date_formatted,
        value: g.count,
        duration: g.total_duration
      }));
      
    case 'type':
      grouped = groupSessionsByType(sessions);
      return grouped.map(g => ({
        label: g.type_label,
        value: g.count,
        duration: g.total_duration
      }));
      
    case 'status':
      grouped = groupSessionsByStatus(sessions);
      return grouped.map(g => ({
        label: g.status_label,
        value: g.count,
        color: g.color
      }));
      
    case 'day_of_week':
      grouped = groupSessionsByDayOfWeek(sessions);
      return Object.values(grouped).map(g => ({
        label: g.day_name,
        value: g.count,
        duration: g.total_duration
      }));
      
    default:
      return [];
  }
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Constantes
  DAYS_OF_WEEK_PT,
  MONTHS_PT,
  SESSION_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  
  // Formatação de data/hora
  formatDatePT,
  formatDateShort,
  formatTime,
  formatDuration,
  getDayOfWeekPT,
  isWeekday,
  getMonthName,
  
  // Agrupamento
  groupSessionsByDate,
  groupSessionsByDayOfWeek,
  groupSessionsByType,
  groupSessionsByStatus,
  
  // Cálculos
  calculateOccupancyRate,
  calculateGaps,
  calculateSessionsByHour,
  identifyPeakHours,
  
  // Geração de estruturas
  generateMonthCalendar,
  generateWeekStructure,
  
  // Formatação para visualizações
  formatSessionForAgenda,
  formatSessionsForTimeline,
  generateChartData
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. FORMATAÇÃO DE DATA/HORA:
 *    const formatted = formatDatePT(session.session_date);
 *    const time = formatTime(session.session_date);
 *    const duration = formatDuration(session.duration_minutes);
 * 
 * 2. AGRUPAMENTO DE SESSÕES:
 *    const byDate = groupSessionsByDate(sessions);
 *    const byType = groupSessionsByType(sessions);
 *    const byStatus = groupSessionsByStatus(sessions);
 * 
 * 3. CÁLCULO DE MÉTRICAS:
 *    const occupancy = calculateOccupancyRate(sessions);
 *    const gaps = calculateGaps(sessions);
 *    const peakHours = identifyPeakHours(sessions);
 * 
 * 4. GERAÇÃO DE CALENDÁRIO:
 *    const calendar = generateMonthCalendar(2025, 10, sessions);
 *    const week = generateWeekStructure(startDate, sessions);
 * 
 * 5. FORMATAÇÃO PARA FRONTEND:
 *    const formatted = formatSessionForAgenda(session);
 *    const timeline = formatSessionsForTimeline(sessions);
 *    const chartData = generateChartData(sessions, 'type');
 * 
 * EXEMPLO DE INTEGRAÇÃO NO CONTROLLER:
 * 
 * const agendaHelpers = require('../utils/agendaHelpers');
 * 
 * const getMonthAgenda = async (req, res) => {
 *   const sessions = await Session.findAll({ ... });
 *   
 *   const calendar = agendaHelpers.generateMonthCalendar(
 *     year, month, sessions
 *   );
 *   
 *   const occupancy = agendaHelpers.calculateOccupancyRate(sessions);
 *   const gaps = agendaHelpers.calculateGaps(sessions);
 *   
 *   res.json({
 *     success: true,
 *     data: { calendar, occupancy, gaps }
 *   });
 * };
 */