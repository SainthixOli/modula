/**
 * MÓDULA - HELPERS DE CONFLITOS E DISPONIBILIDADE
 * 
 * Utilitários para detecção de conflitos de horário e cálculo de disponibilidade.
 * Sistema inteligente de análise temporal e sugestões de reagendamento.
 * 
 * Funcionalidades implementadas:
 * - Detecção avançada de conflitos temporais
 * - Cálculo de slots disponíveis
 * - Análise de sobreposição de horários
 * - Sugestões inteligentes de horários alternativos
 * - Validação de horários de trabalho
 * - Cálculo de intervalos mínimos entre sessões
 * 
 * Recursos especiais:
 * - Algoritmo de detecção de sobreposição
 * - Geração de slots com intervalo configurável
 * - Respeito a horários de almoço e pausas
 * - Priorização de horários por proximidade
 * - Suporte a configuração de horário de trabalho
 */

const { Op } = require('sequelize');

// ============================================
// CONFIGURAÇÕES PADRÃO
// ============================================

const DEFAULT_CONFIG = {
  workingHours: {
    start: 8,    // 8h
    end: 18,     // 18h
    lunchStart: 12, // 12h
    lunchEnd: 13    // 13h
  },
  slotInterval: 30,      // Intervalos de 30 minutos
  minGapBetweenSessions: 0, // Sem gap mínimo por padrão
  bufferTime: 15,        // Buffer de 15min para atrasos
  workingDays: [1, 2, 3, 4, 5] // Segunda a sexta
};

// ============================================
// DETECÇÃO DE CONFLITOS
// ============================================

/**
 * Verificar se dois intervalos de tempo se sobrepõem
 */
const hasTimeOverlap = (start1, end1, start2, end2) => {
  return (
    (start1 >= start2 && start1 < end2) ||   // Começa durante
    (end1 > start2 && end1 <= end2) ||       // Termina durante
    (start1 <= start2 && end1 >= end2)       // Engloba completamente
  );
};

/**
 * Detectar conflito entre uma nova sessão e sessões existentes
 */
const detectConflict = (newSession, existingSessions, config = {}) => {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  const newStart = new Date(newSession.start);
  const newEnd = new Date(newSession.end);
  
  // Adicionar buffer time se configurado
  if (cfg.bufferTime > 0) {
    newStart.setMinutes(newStart.getMinutes() - cfg.bufferTime);
    newEnd.setMinutes(newEnd.getMinutes() + cfg.bufferTime);
  }
  
  const conflicts = [];
  
  existingSessions.forEach(session => {
    const sessionStart = new Date(session.session_date);
    const sessionEnd = new Date(
      sessionStart.getTime() + session.duration_minutes * 60000
    );
    
    // Adicionar buffer às sessões existentes também
    if (cfg.bufferTime > 0) {
      sessionStart.setMinutes(sessionStart.getMinutes() - cfg.bufferTime);
      sessionEnd.setMinutes(sessionEnd.getMinutes() + cfg.bufferTime);
    }
    
    if (hasTimeOverlap(newStart, newEnd, sessionStart, sessionEnd)) {
      conflicts.push({
        session_id: session.id,
        patient_name: session.patient?.full_name || 'Paciente',
        session_start: session.session_date,
        session_end: sessionEnd,
        overlap_type: getOverlapType(newStart, newEnd, sessionStart, sessionEnd)
      });
    }
  });
  
  return {
    has_conflict: conflicts.length > 0,
    conflicts,
    can_schedule: conflicts.length === 0
  };
};

/**
 * Determinar tipo de sobreposição
 */
const getOverlapType = (start1, end1, start2, end2) => {
  if (start1 >= start2 && end1 <= end2) {
    return 'contained'; // Nova sessão dentro de existente
  } else if (start1 <= start2 && end1 >= end2) {
    return 'contains'; // Nova sessão engloba existente
  } else if (start1 < start2 && end1 > start2) {
    return 'overlaps_start'; // Sobrepõe início
  } else if (start1 < end2 && end1 > end2) {
    return 'overlaps_end'; // Sobrepõe fim
  }
  return 'unknown';
};

/**
 * Validar gap mínimo entre sessões
 */
const validateMinimumGap = (newSession, existingSessions, minGapMinutes = 0) => {
  if (minGapMinutes === 0) return { valid: true };
  
  const newStart = new Date(newSession.start);
  const newEnd = new Date(newSession.end);
  
  const violations = [];
  
  existingSessions.forEach(session => {
    const sessionStart = new Date(session.session_date);
    const sessionEnd = new Date(
      sessionStart.getTime() + session.duration_minutes * 60000
    );
    
    // Verificar gap antes
    const gapBefore = Math.round((newStart - sessionEnd) / 60000);
    if (gapBefore >= 0 && gapBefore < minGapMinutes) {
      violations.push({
        session_id: session.id,
        gap_minutes: gapBefore,
        required_gap: minGapMinutes,
        position: 'before'
      });
    }
    
    // Verificar gap depois
    const gapAfter = Math.round((sessionStart - newEnd) / 60000);
    if (gapAfter >= 0 && gapAfter < minGapMinutes) {
      violations.push({
        session_id: session.id,
        gap_minutes: gapAfter,
        required_gap: minGapMinutes,
        position: 'after'
      });
    }
  });
  
  return {
    valid: violations.length === 0,
    violations
  };
};

// ============================================
// CÁLCULO DE DISPONIBILIDADE
// ============================================

/**
 * Gerar todos os slots possíveis em um dia
 */
const generateDaySlots = (date, duration, config = {}) => {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const slots = [];
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  // Verificar se é dia útil
  if (!cfg.workingDays.includes(targetDate.getDay())) {
    return [];
  }
  
  // Gerar slots no período da manhã
  for (let hour = cfg.workingHours.start; hour < cfg.workingHours.lunchStart; hour++) {
    for (let minute = 0; minute < 60; minute += cfg.slotInterval) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, minute, 0, 0);
      
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      
      // Verificar se não ultrapassa horário de almoço
      if (slotEnd.getHours() <= cfg.workingHours.lunchStart) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          period: 'morning'
        });
      }
    }
  }
  
  // Gerar slots no período da tarde
  for (let hour = cfg.workingHours.lunchEnd; hour < cfg.workingHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += cfg.slotInterval) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, minute, 0, 0);
      
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      
      // Verificar se não ultrapassa fim do expediente
      if (slotEnd.getHours() < cfg.workingHours.end || 
          (slotEnd.getHours() === cfg.workingHours.end && slotEnd.getMinutes() === 0)) {
        slots.push({
          start: slotStart,
          end: slotEnd,
          time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          period: 'afternoon'
        });
      }
    }
  }
  
  return slots;
};

/**
 * Filtrar slots disponíveis (sem conflitos)
 */
const getAvailableSlots = (date, duration, existingSessions, config = {}) => {
  const allSlots = generateDaySlots(date, duration, config);
  
  return allSlots.filter(slot => {
    const conflictCheck = detectConflict(
      { start: slot.start, end: slot.end },
      existingSessions,
      config
    );
    return !conflictCheck.has_conflict;
  });
};

/**
 * Encontrar próximo slot disponível
 */
const findNextAvailableSlot = (startDate, duration, existingSessions, daysToCheck = 30, config = {}) => {
  for (let i = 0; i < daysToCheck; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    
    const daySlots = getAvailableSlots(checkDate, duration, existingSessions, config);
    
    if (daySlots.length > 0) {
      return {
        found: true,
        date: checkDate.toISOString().split('T')[0],
        slot: daySlots[0],
        days_ahead: i,
        alternative_slots: daySlots.slice(0, 5) // Top 5 opções
      };
    }
  }
  
  return {
    found: false,
    message: `Nenhum horário disponível nos próximos ${daysToCheck} dias`
  };
};

/**
 * Sugerir horários alternativos próximos ao solicitado
 */
const suggestAlternatives = (requestedTime, duration, existingSessions, config = {}) => {
  const requestedDate = new Date(requestedTime);
  const suggestions = [];
  
  // Tentar mesmo dia
  const sameDaySlots = getAvailableSlots(
    requestedDate.toISOString().split('T')[0],
    duration,
    existingSessions,
    config
  );
  
  if (sameDaySlots.length > 0) {
    // Ordenar por proximidade ao horário solicitado
    const sorted = sameDaySlots.sort((a, b) => {
      const diffA = Math.abs(a.start - requestedDate);
      const diffB = Math.abs(b.start - requestedDate);
      return diffA - diffB;
    });
    
    suggestions.push({
      date: requestedDate.toISOString().split('T')[0],
      day_offset: 0,
      slots: sorted.slice(0, 3)
    });
  }
  
  // Tentar próximos dias
  for (let i = 1; i <= 7 && suggestions.length < 3; i++) {
    const nextDate = new Date(requestedDate);
    nextDate.setDate(requestedDate.getDate() + i);
    
    const daySlots = getAvailableSlots(
      nextDate.toISOString().split('T')[0],
      duration,
      existingSessions,
      config
    );
    
    if (daySlots.length > 0) {
      suggestions.push({
        date: nextDate.toISOString().split('T')[0],
        day_offset: i,
        slots: daySlots.slice(0, 3)
      });
    }
  }
  
  return suggestions;
};

// ============================================
// ANÁLISE DE AGENDA
// ============================================

/**
 * Calcular densidade da agenda (sessões por hora)
 */
const calculateScheduleDensity = (sessions, date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const daySessions = sessions.filter(s => {
    const sessionDate = new Date(s.session_date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === targetDate.getTime();
  });
  
  if (daySessions.length === 0) {
    return {
      density: 0,
      level: 'empty',
      sessions_count: 0,
      total_minutes: 0
    };
  }
  
  const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const workingMinutes = 8 * 60; // 8 horas
  const density = (totalMinutes / workingMinutes) * 100;
  
  let level;
  if (density < 30) level = 'light';
  else if (density < 60) level = 'moderate';
  else if (density < 85) level = 'busy';
  else level = 'full';
  
  return {
    density: density.toFixed(2),
    level,
    sessions_count: daySessions.length,
    total_minutes: totalMinutes,
    working_minutes: workingMinutes
  };
};

/**
 * Identificar períodos livres no dia
 */
const findFreePeriods = (sessions, date, config = {}) => {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const targetDate = new Date(date);
  
  const daySessions = sessions
    .filter(s => {
      const sessionDate = new Date(s.session_date);
      return sessionDate.toDateString() === targetDate.toDateString();
    })
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
  
  const freePeriods = [];
  
  // Período antes da primeira sessão
  if (daySessions.length > 0) {
    const firstSessionStart = new Date(daySessions[0].session_date);
    const workStart = new Date(targetDate);
    workStart.setHours(cfg.workingHours.start, 0, 0, 0);
    
    if (firstSessionStart > workStart) {
      const freeMinutes = Math.round((firstSessionStart - workStart) / 60000);
      freePeriods.push({
        start: workStart,
        end: firstSessionStart,
        duration_minutes: freeMinutes,
        period_type: 'before_first'
      });
    }
  }
  
  // Períodos entre sessões
  for (let i = 0; i < daySessions.length - 1; i++) {
    const currentEnd = new Date(
      new Date(daySessions[i].session_date).getTime() + 
      daySessions[i].duration_minutes * 60000
    );
    const nextStart = new Date(daySessions[i + 1].session_date);
    
    if (nextStart > currentEnd) {
      const freeMinutes = Math.round((nextStart - currentEnd) / 60000);
      freePeriods.push({
        start: currentEnd,
        end: nextStart,
        duration_minutes: freeMinutes,
        period_type: 'between_sessions'
      });
    }
  }
  
  // Período após última sessão
  if (daySessions.length > 0) {
    const lastSession = daySessions[daySessions.length - 1];
    const lastSessionEnd = new Date(
      new Date(lastSession.session_date).getTime() + 
      lastSession.duration_minutes * 60000
    );
    const workEnd = new Date(targetDate);
    workEnd.setHours(cfg.workingHours.end, 0, 0, 0);
    
    if (lastSessionEnd < workEnd) {
      const freeMinutes = Math.round((workEnd - lastSessionEnd) / 60000);
      freePeriods.push({
        start: lastSessionEnd,
        end: workEnd,
        duration_minutes: freeMinutes,
        period_type: 'after_last'
      });
    }
  }
  
  return freePeriods;
};

/**
 * Analisar padrão de agendamento
 */
const analyzeSchedulePattern = (sessions, days = 30) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const recentSessions = sessions.filter(s => 
    new Date(s.session_date) >= startDate && new Date(s.session_date) <= now
  );
  
  // Horários mais comuns
  const hourCounts = {};
  recentSessions.forEach(s => {
    const hour = new Date(s.session_date).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const preferredHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      percentage: ((count / recentSessions.length) * 100).toFixed(2)
    }));
  
  // Dias da semana mais comuns
  const dayCounts = {};
  recentSessions.forEach(s => {
    const day = new Date(s.session_date).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  
  const preferredDays = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day, count]) => ({
      day: parseInt(day),
      count,
      percentage: ((count / recentSessions.length) * 100).toFixed(2)
    }));
  
  return {
    total_sessions: recentSessions.length,
    avg_per_day: (recentSessions.length / days).toFixed(2),
    preferred_hours: preferredHours,
    preferred_days: preferredDays
  };
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Configurações
  DEFAULT_CONFIG,
  
  // Detecção de conflitos
  hasTimeOverlap,
  detectConflict,
  getOverlapType,
  validateMinimumGap,
  
  // Disponibilidade
  generateDaySlots,
  getAvailableSlots,
  findNextAvailableSlot,
  suggestAlternatives,
  
  // Análise de agenda
  calculateScheduleDensity,
  findFreePeriods,
  analyzeSchedulePattern
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. DETECTAR CONFLITOS:
 *    const conflict = detectConflict(
 *      { start: newDate, end: newEndDate },
 *      existingSessions,
 *      { bufferTime: 15 }
 *    );
 * 
 * 2. ENCONTRAR SLOTS DISPONÍVEIS:
 *    const slots = getAvailableSlots(
 *      '2025-10-15',
 *      60, // duração
 *      existingSessions
 *    );
 * 
 * 3. PRÓXIMO HORÁRIO DISPONÍVEL:
 *    const next = findNextAvailableSlot(
 *      new Date(),
 *      60,
 *      existingSessions,
 *      30 // verificar 30 dias
 *    );
 * 
 * 4. SUGESTÕES ALTERNATIVAS:
 *    const alternatives = suggestAlternatives(
 *      requestedDateTime,
 *      60,
 *      existingSessions
 *    );
 * 
 * 5. ANÁLISE DE DENSIDADE:
 *    const density = calculateScheduleDensity(sessions, '2025-10-15');
 *    // { density: '75.50', level: 'busy', sessions_count: 8 }
 * 
 * 6. PERÍODOS LIVRES:
 *    const free = findFreePeriods(sessions, '2025-10-15');
 * 
 * 7. PADRÕES DE AGENDAMENTO:
 *    const pattern = analyzeSchedulePattern(sessions, 30);
 * 
 * INTEGRAÇÃO COM VALIDAÇÃO:
 * 
 * const conflictHelpers = require('../utils/conflictHelpers');
 * 
 * const validateNoScheduleConflict = async (req, res, next) => {
 *   const sessions = await Session.findAll({ ... });
 *   
 *   const conflict = conflictHelpers.detectConflict(
 *     { start: newStart, end: newEnd },
 *     sessions,
 *     { bufferTime: 15 }
 *   );
 *   
 *   if (conflict.has_conflict) {
 *     return res.status(409).json({
 *       success: false,
 *       message: 'Conflito detectado',
 *       conflicts: conflict.conflicts
 *     });
 *   }
 *   
 *   next();
 * };
 */