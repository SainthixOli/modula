/**
 * MÓDULA - CONTROLLER DO SISTEMA DE SESSÕES
 * 
 * Lógica de negócio completa para agendamento e gestão de consultas clínicas.
 * Sistema profissional de agenda com controle de evolução, estatísticas e histórico.
 * 
 * Funcionalidades implementadas:
 * - CRUD completo de sessões com validação de ownership
 * - Agendamento inteligente com detecção de conflitos
 * - Registro e atualização de evolução clínica
 * - Visualização de agenda (dia/semana/mês)
 * - Histórico completo do paciente
 * - Timeline de evolução cronológica
 * - Reagendamento com sugestões inteligentes
 * - Estatísticas e relatórios de produtividade
 * - Análise de engajamento dos pacientes
 * - Sistema de busca avançada
 * 
 * Recursos especiais:
 * - Numeração sequencial automática por paciente
 * - Cálculo de duração real vs agendada
 * - Detecção de conflitos temporais
 * - Sincronização automática com Patient.last_appointment
 * - Agregação de dados para dashboards
 * - Filtros avançados com paginação eficiente
 */

const { Session, Patient, User } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');

// ============================================
// FUNÇÕES DE AGENDAMENTO
// ============================================

/**
 * Criar nova sessão/consulta agendada
 */
const createSession = async (req, res) => {
  const { patient_id, session_date, session_time, session_type, duration_minutes, location, notes, is_billable } = req.validatedData;
  const userId = req.userId;

  // Verificar se paciente existe e pertence ao profissional
  const patient = await Patient.findOne({
    where: { id: patient_id, user_id: userId }
  });

  if (!patient) {
    throw new AppError('Paciente não encontrado ou não pertence a você', 404);
  }

  // Construir datetime completo
  const sessionDateTime = new Date(`${session_date}T${session_time}`);

  // Calcular session_number sequencial
  const lastSession = await Session.findOne({
    where: { patient_id },
    order: [['session_number', 'DESC']]
  });

  const sessionNumber = lastSession ? lastSession.session_number + 1 : 1;

  // Criar sessão
  const session = await Session.create({
    patient_id,
    user_id: userId,
    session_number: sessionNumber,
    session_date: sessionDateTime,
    session_type,
    duration_minutes: duration_minutes || 60,
    location: location || 'Consultório',
    notes,
    status: 'scheduled',
    is_billable: is_billable !== undefined ? is_billable : true,
    reminder_sent: false
  });

  // Atualizar first_appointment do paciente se for a primeira
  if (sessionNumber === 1 && !patient.first_appointment) {
    await patient.update({ first_appointment: sessionDateTime });
  }

  // Buscar sessão criada com relacionamentos
  const createdSession = await Session.findByPk(session.id, {
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone', 'email']
      }
    ]
  });

  res.status(201).json({
    success: true,
    message: 'Sessão agendada com sucesso',
    data: createdSession
  });
};

/**
 * Listar sessões do profissional com filtros
 */
const listSessions = async (req, res) => {
  const { patient_id, status, session_type, date_from, date_to, page, limit, sort_by, order } = req.validatedQuery;
  const userId = req.userId;

  // Construir filtros
  const where = { user_id: userId };

  if (patient_id) where.patient_id = patient_id;
  if (status) where.status = status;
  if (session_type) where.session_type = session_type;

  // Filtro de data
  if (date_from || date_to) {
    where.session_date = {};
    if (date_from) where.session_date[Op.gte] = new Date(date_from);
    if (date_to) where.session_date[Op.lte] = new Date(date_to);
  }

  // Paginação
  const offset = (page - 1) * limit;

  // Buscar sessões
  const { count, rows: sessions } = await Session.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort_by || 'session_date', order || 'DESC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone', 'email', 'status']
      }
    ]
  });

  // Metadados de paginação
  const totalPages = Math.ceil(count / limit);

  res.json({
    success: true,
    data: {
      sessions,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
};

/**
 * Obter detalhes de uma sessão específica
 */
const getSessionById = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const session = await Session.findOne({
    where: { id, user_id: userId },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'birth_date', 'phone', 'email', 'status']
      }
    ]
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  res.json({
    success: true,
    data: session
  });
};

/**
 * Atualizar sessão agendada (antes da realização)
 */
const updateScheduledSession = async (req, res) => {
  const { id } = req.params;
  const updateData = req.validatedData;
  const userId = req.userId;

  // Buscar sessão
  const session = await Session.findOne({
    where: { id, user_id: userId }
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  // Verificar se sessão pode ser atualizada
  if (session.status === 'completed') {
    throw new AppError('Não é possível alterar sessão já realizada. Use a rota de atualização de evolução.', 400);
  }

  // Se alterando data/hora, reconstruir datetime
  if (updateData.session_date || updateData.session_time) {
    const newDate = updateData.session_date || session.session_date.toISOString().split('T')[0];
    const newTime = updateData.session_time || session.session_date.toTimeString().slice(0, 5);
    updateData.session_date = new Date(`${newDate}T${newTime}`);
  }

  // Atualizar sessão
  await session.update(updateData);

  // Buscar sessão atualizada com relacionamentos
  const updatedSession = await Session.findByPk(session.id, {
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone', 'email']
      }
    ]
  });

  res.json({
    success: true,
    message: 'Sessão atualizada com sucesso',
    data: updatedSession
  });
};

/**
 * Cancelar sessão agendada
 */
const cancelSession = async (req, res) => {
  const { id } = req.params;
  const { cancellation_reason } = req.body;
  const userId = req.userId;

  if (!cancellation_reason) {
    throw new AppError('Motivo do cancelamento é obrigatório', 400);
  }

  const session = await Session.findOne({
    where: { id, user_id: userId }
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  if (session.status === 'completed') {
    throw new AppError('Não é possível cancelar sessão já realizada', 400);
  }

  await session.update({
    status: 'cancelled',
    cancellation_reason
  });

  res.json({
    success: true,
    message: 'Sessão cancelada com sucesso'
  });
};

// ============================================
// FUNÇÕES DE EVOLUÇÃO CLÍNICA
// ============================================

/**
 * Registrar evolução da sessão após realização
 */
const recordEvolution = async (req, res) => {
  const { id } = req.params;
  const evolutionData = req.validatedData;
  const userId = req.userId;

  const session = await Session.findOne({
    where: { id, user_id: userId },
    include: [{ model: Patient, as: 'patient' }]
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  if (session.status === 'cancelled') {
    throw new AppError('Não é possível registrar evolução de sessão cancelada', 400);
  }

  // Calcular duração real se informada
  let actualDuration = null;
  if (evolutionData.actual_start_time && evolutionData.actual_end_time) {
    const start = new Date(`2000-01-01T${evolutionData.actual_start_time}`);
    const end = new Date(`2000-01-01T${evolutionData.actual_end_time}`);
    actualDuration = Math.round((end - start) / 60000); // minutos
  }

  // Atualizar sessão com evolução
  await session.update({
    ...evolutionData,
    actual_duration_minutes: actualDuration,
    status: 'completed',
    completed_at: new Date()
  });

  // Atualizar last_appointment do paciente
  await session.patient.update({
    last_appointment: session.session_date
  });

  // Buscar sessão atualizada
  const updatedSession = await Session.findByPk(session.id, {
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name']
      }
    ]
  });

  res.json({
    success: true,
    message: 'Evolução registrada com sucesso',
    data: updatedSession
  });
};

/**
 * Atualizar evolução de uma sessão já registrada
 */
const updateEvolution = async (req, res) => {
  const { id } = req.params;
  const evolutionData = req.validatedData;
  const userId = req.userId;

  const session = await Session.findOne({
    where: { id, user_id: userId }
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  if (session.status !== 'completed') {
    throw new AppError('Apenas sessões finalizadas podem ter evolução atualizada', 400);
  }

  // Recalcular duração se alterada
  if (evolutionData.actual_start_time && evolutionData.actual_end_time) {
    const start = new Date(`2000-01-01T${evolutionData.actual_start_time}`);
    const end = new Date(`2000-01-01T${evolutionData.actual_end_time}`);
    evolutionData.actual_duration_minutes = Math.round((end - start) / 60000);
  }

  await session.update(evolutionData);

  const updatedSession = await Session.findByPk(session.id, {
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name']
      }
    ]
  });

  res.json({
    success: true,
    message: 'Evolução atualizada com sucesso',
    data: updatedSession
  });
};

/**
 * Confirmar presença do paciente na sessão
 */
const confirmSession = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const session = await Session.findOne({
    where: { id, user_id: userId }
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  if (session.status !== 'scheduled') {
    throw new AppError('Apenas sessões agendadas podem ser confirmadas', 400);
  }

  await session.update({
    status: 'confirmed',
    actual_start_time: new Date().toTimeString().slice(0, 5)
  });

  res.json({
    success: true,
    message: 'Presença confirmada',
    data: session
  });
};

/**
 * Marcar paciente como faltante
 */
const markNoShow = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const userId = req.userId;

  const session = await Session.findOne({
    where: { id, user_id: userId }
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  await session.update({
    status: 'no_show',
    notes: notes ? `${session.notes || ''}\n[FALTA]: ${notes}` : session.notes
  });

  res.json({
    success: true,
    message: 'Falta registrada',
    data: session
  });
};

// ============================================
// FUNÇÕES DE AGENDA
// ============================================

/**
 * Obter agenda do dia atual
 */
const getTodayAgenda = async (req, res) => {
  const userId = req.userId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: today,
        [Op.lt]: tomorrow
      },
      status: {
        [Op.in]: ['scheduled', 'confirmed', 'in_progress']
      }
    },
    order: [['session_date', 'ASC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone', 'email']
      }
    ]
  });

  const summary = {
    total: sessions.length,
    confirmed: sessions.filter(s => s.status === 'confirmed').length,
    pending: sessions.filter(s => s.status === 'scheduled').length,
    total_duration: sessions.reduce((sum, s) => sum + s.duration_minutes, 0)
  };

  res.json({
    success: true,
    data: {
      sessions,
      summary
    }
  });
};

/**
 * Obter agenda da semana atual
 */
const getWeekAgenda = async (req, res) => {
  const userId = req.userId;
  const { week_offset = 0 } = req.query;

  // Calcular início e fim da semana
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + (7 * parseInt(week_offset)));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: startOfWeek,
        [Op.lt]: endOfWeek
      }
    },
    order: [['session_date', 'ASC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone']
      }
    ]
  });

  // Agrupar por dia
  const sessionsByDay = {};
  const daysOfWeek = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  
  sessions.forEach(session => {
    const dayName = daysOfWeek[session.session_date.getDay()];
    if (!sessionsByDay[dayName]) {
      sessionsByDay[dayName] = [];
    }
    sessionsByDay[dayName].push(session);
  });

  const summary = {
    total_sessions: sessions.length,
    total_hours: Math.round(sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60),
    unique_patients: new Set(sessions.map(s => s.patient_id)).size
  };

  res.json({
    success: true,
    data: {
      week_start: startOfWeek,
      week_end: endOfWeek,
      sessions_by_day: sessionsByDay,
      summary
    }
  });
};

/**
 * Obter visão mensal da agenda
 */
const getMonthAgenda = async (req, res) => {
  const userId = req.userId;
  const { year, month } = req.query;

  const targetDate = new Date();
  if (year) targetDate.setFullYear(parseInt(year));
  if (month) targetDate.setMonth(parseInt(month) - 1);

  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: startOfMonth,
        [Op.lte]: endOfMonth
      }
    },
    order: [['session_date', 'ASC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name']
      }
    ]
  });

  // Agrupar por data
  const sessionsByDate = {};
  sessions.forEach(session => {
    const dateKey = session.session_date.toISOString().split('T')[0];
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });

  const summary = {
    total_sessions: sessions.length,
    working_days: Object.keys(sessionsByDate).length,
    avg_sessions_per_day: sessions.length / Object.keys(sessionsByDate).length || 0,
    total_hours: Math.round(sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60)
  };

  res.json({
    success: true,
    data: {
      month: targetDate.getMonth() + 1,
      year: targetDate.getFullYear(),
      sessions_by_date: sessionsByDate,
      summary
    }
  });
};

/**
 * Verificar disponibilidade de horários
 */
const checkAvailability = async (req, res) => {
  const userId = req.userId;
  const { date, duration = 60 } = req.query;

  if (!date) {
    throw new AppError('Data é obrigatória', 400);
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(targetDate.getDate() + 1);

  // Buscar sessões do dia
  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: targetDate,
        [Op.lt]: nextDay
      },
      status: {
        [Op.in]: ['scheduled', 'confirmed', 'in_progress']
      }
    },
    order: [['session_date', 'ASC']]
  });

  // Horário de trabalho padrão (8h às 18h)
  const workStart = 8;
  const workEnd = 18;
  const slotDuration = parseInt(duration);

  const availableSlots = [];
  const occupiedRanges = sessions.map(s => ({
    start: s.session_date,
    end: new Date(s.session_date.getTime() + s.duration_minutes * 60000)
  }));

  // Verificar cada slot de 30 minutos
  for (let hour = workStart; hour < workEnd; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, minute, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

      // Verificar se slot está livre
      const isFree = !occupiedRanges.some(range =>
        (slotStart >= range.start && slotStart < range.end) ||
        (slotEnd > range.start && slotEnd <= range.end) ||
        (slotStart <= range.start && slotEnd >= range.end)
      );

      if (isFree && slotEnd.getHours() <= workEnd) {
        availableSlots.push({
          time: slotStart.toTimeString().slice(0, 5),
          datetime: slotStart
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      date,
      available_slots: availableSlots,
      total_available: availableSlots.length,
      next_available: availableSlots[0] || null
    }
  });
};

// ============================================
// FUNÇÕES DE HISTÓRICO DO PACIENTE
// ============================================

/**
 * Obter histórico completo de sessões do paciente
 */
const getPatientHistory = async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 20, session_type, date_from, date_to } = req.query;
  const userId = req.userId;

  // Verificar se paciente pertence ao profissional
  const patient = await Patient.findOne({
    where: { id: patientId, user_id: userId }
  });

  if (!patient) {
    throw new AppError('Paciente não encontrado', 404);
  }

  // Construir filtros
  const where = { patient_id: patientId };
  if (session_type) where.session_type = session_type;
  if (date_from || date_to) {
    where.session_date = {};
    if (date_from) where.session_date[Op.gte] = new Date(date_from);
    if (date_to) where.session_date[Op.lte] = new Date(date_to);
  }

  const offset = (page - 1) * limit;

  const { count, rows: sessions } = await Session.findAndCountAll({
    where,
    limit,
    offset,
    order: [['session_date', 'DESC']]
  });

  // Estatísticas
  const statistics = await Session.getStatsByPatient(patientId);

  res.json({
    success: true,
    data: {
      patient: {
        id: patient.id,
        full_name: patient.full_name,
        first_appointment: patient.first_appointment,
        last_appointment: patient.last_appointment
      },
      sessions,
      statistics,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    }
  });
};

/**
 * Timeline de evolução do paciente
 */
const getPatientTimeline = async (req, res) => {
  const { patientId } = req.params;
  const userId = req.userId;

  // Verificar ownership
  const patient = await Patient.findOne({
    where: { id: patientId, user_id: userId }
  });

  if (!patient) {
    throw new AppError('Paciente não encontrado', 404);
  }

  // Buscar todas as sessões completadas
  const sessions = await Session.findAll({
    where: {
      patient_id: patientId,
      status: 'completed'
    },
    order: [['session_date', 'ASC']],
    attributes: [
      'id', 'session_number', 'session_date', 'session_type',
      'progress_assessment', 'patient_engagement', 'treatment_adherence',
      'session_notes', 'main_topics'
    ]
  });

  // Identificar marcos importantes
  const milestones = [];
  
  if (sessions.length > 0) {
    milestones.push({
      type: 'first_session',
      date: sessions[0].session_date,
      description: 'Primeira consulta'
    });
  }

  // Identificar mudanças significativas
  sessions.forEach((session, index) => {
    if (index > 0 && session.progress_assessment === 'improved') {
      const prevSession = sessions[index - 1];
      if (prevSession.progress_assessment !== 'improved') {
        milestones.push({
          type: 'improvement',
          date: session.session_date,
          description: 'Início de melhora significativa'
        });
      }
    }
  });

  // Gráfico de progresso
  const progressChart = sessions.map(s => ({
    session_number: s.session_number,
    date: s.session_date,
    engagement: s.patient_engagement,
    assessment: s.progress_assessment
  }));

  res.json({
    success: true,
    data: {
      patient_info: {
        id: patient.id,
        full_name: patient.full_name,
        total_sessions: sessions.length
      },
      timeline: sessions,
      milestones,
      progress_chart: progressChart
    }
  });
};

/**
 * Estatísticas das sessões do paciente
 */
const getPatientStats = async (req, res) => {
  const { patientId } = req.params;
  const userId = req.userId;

  const patient = await Patient.findOne({
    where: { id: patientId, user_id: userId }
  });

  if (!patient) {
    throw new AppError('Paciente não encontrado', 404);
  }

  const stats = await Session.getStatsByPatient(patientId);

  res.json({
    success: true,
    data: stats
  });
};

// ============================================
// FUNÇÕES DE REAGENDAMENTO
// ============================================

/**
 * Reagendar sessão para nova data/horário
 */
const rescheduleSession = async (req, res) => {
  const { id } = req.params;
  const { new_date, new_time, reason } = req.body;
  const userId = req.userId;

  if (!new_date || !new_time) {
    throw new AppError('Nova data e horário são obrigatórios', 400);
  }

  const session = await Session.findOne({
    where: { id, user_id: userId }
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  if (session.status === 'completed') {
    throw new AppError('Não é possível reagendar sessão já realizada', 400);
  }

  const oldDate = session.session_date;
  const newDateTime = new Date(`${new_date}T${new_time}`);

  await session.update({
    session_date: newDateTime,
    status: 'rescheduled',
    notes: `${session.notes || ''}\n[REAGENDAMENTO]: ${oldDate.toLocaleString('pt-BR')} → ${newDateTime.toLocaleString('pt-BR')}${reason ? `. Motivo: ${reason}` : ''}`
  });

  const updatedSession = await Session.findByPk(session.id, {
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone']
      }
    ]
  });

  res.json({
    success: true,
    message: 'Sessão reagendada com sucesso',
    data: updatedSession
  });
};

/**
 * Sugerir horários alternativos para reagendamento
 */
const suggestAlternativeTimes = async (req, res) => {
  const { id } = req.params;
  const { preferred_date, days_range = 7 } = req.query;
  const userId = req.userId;

  const session = await Session.findOne({
    where: { id, user_id: userId }
  });

  if (!session) {
    throw new AppError('Sessão não encontrada', 404);
  }

  const startDate = preferred_date ? new Date(preferred_date) : new Date();
  const suggestions = [];

  // Buscar slots disponíveis nos próximos dias
  for (let i = 0; i < parseInt(days_range); i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(startDate.getDate() + i);
    
    const dayOfWeek = checkDate.getDay();
    // Pular finais de semana
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Buscar disponibilidade do dia
    const availabilityResponse = await checkAvailability({
      userId,
      query: { date: checkDate.toISOString().split('T')[0], duration: session.duration_minutes }
    });

    if (availabilityResponse?.data?.available_slots?.length > 0) {
      suggestions.push({
        date: checkDate.toISOString().split('T')[0],
        slots: availabilityResponse.data.available_slots.slice(0, 3) // Top 3 horários
      });
    }

    if (suggestions.length >= 5) break; // Máximo 5 dias com sugestões
  }

  res.json({
    success: true,
    data: {
      current_session: {
        id: session.id,
        current_date: session.session_date,
        duration: session.duration_minutes
      },
      suggested_slots: suggestions
    }
  });
};

// ============================================
// FUNÇÕES DE ESTATÍSTICAS E RELATÓRIOS
// ============================================

/**
 * Visão geral das estatísticas do profissional
 */
const getStatsOverview = async (req, res) => {
  const userId = req.userId;
  const { period = 'month' } = req.query;

  // Calcular range de datas baseado no período
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  // Buscar sessões do período
  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      }
    }
  });

  const stats = {
    period,
    total_sessions: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    confirmed: sessions.filter(s => s.status === 'confirmed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
    no_show: sessions.filter(s => s.status === 'no_show').length,
    total_hours: Math.round(sessions.reduce((sum, s) => s.actual_duration_minutes || s.duration_minutes, 0) / 60),
    unique_patients: new Set(sessions.map(s => s.patient_id)).size,
    avg_sessions_per_day: (sessions.length / Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))).toFixed(2),
    completion_rate: sessions.length > 0 
      ? ((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100).toFixed(2)
      : 0
  };

  res.json({
    success: true,
    data: stats
  });
};

/**
 * Relatório de produtividade detalhado
 */
const getProductivityReport = async (req, res) => {
  const userId = req.userId;
  const { date_from, date_to } = req.query;

  const startDate = date_from ? new Date(date_from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDate = date_to ? new Date(date_to) : new Date();

  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      }
    },
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name']
      }
    ]
  });

  // Sessões por tipo
  const sessionsByType = {};
  sessions.forEach(s => {
    sessionsByType[s.session_type] = (sessionsByType[s.session_type] || 0) + 1;
  });

  // Horas trabalhadas
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes), 0);
  const hoursWorked = Math.round(totalMinutes / 60);

  // Pacientes únicos atendidos
  const patientsSeenSet = new Set(sessions.filter(s => s.status === 'completed').map(s => s.patient_id));
  const patientsSeen = patientsSeenSet.size;

  // Estimativa de faturamento (se billable)
  const billableSessions = sessions.filter(s => s.is_billable && s.status === 'completed');
  const revenueEstimate = {
    billable_sessions: billableSessions.length,
    total_hours: Math.round(billableSessions.reduce((sum, s) => sum + (s.actual_duration_minutes || s.duration_minutes), 0) / 60)
  };

  // Taxa de comparecimento
  const scheduledOrConfirmed = sessions.filter(s => ['scheduled', 'confirmed', 'completed'].includes(s.status)).length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const attendanceRate = scheduledOrConfirmed > 0 
    ? ((completed / scheduledOrConfirmed) * 100).toFixed(2)
    : 0;

  res.json({
    success: true,
    data: {
      period: {
        start: startDate,
        end: endDate
      },
      sessions_by_type: sessionsByType,
      hours_worked: hoursWorked,
      patients_seen: patientsSeen,
      revenue_estimate: revenueEstimate,
      attendance_rate: attendanceRate,
      total_sessions: sessions.length
    }
  });
};

/**
 * Análise de engajamento dos pacientes
 */
const getEngagementAnalysis = async (req, res) => {
  const userId = req.userId;

  // Buscar sessões completadas com engajamento registrado
  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      status: 'completed',
      patient_engagement: {
        [Op.ne]: null
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

  if (sessions.length === 0) {
    return res.json({
      success: true,
      data: {
        message: 'Nenhuma sessão com engajamento registrado ainda',
        avg_engagement: null,
        trend: null,
        patients_by_engagement: []
      }
    });
  }

  // Engajamento médio geral
  const avgEngagement = (sessions.reduce((sum, s) => sum + s.patient_engagement, 0) / sessions.length).toFixed(2);

  // Tendência (últimos 10 vs primeiros 10)
  const recentSessions = sessions.slice(0, 10);
  const oldSessions = sessions.slice(-10);
  
  const recentAvg = recentSessions.reduce((sum, s) => sum + s.patient_engagement, 0) / recentSessions.length;
  const oldAvg = oldSessions.reduce((sum, s) => sum + s.patient_engagement, 0) / oldSessions.length;
  
  const trend = recentAvg > oldAvg ? 'improving' : recentAvg < oldAvg ? 'declining' : 'stable';

  // Engajamento por paciente
  const patientEngagement = {};
  sessions.forEach(s => {
    if (!patientEngagement[s.patient_id]) {
      patientEngagement[s.patient_id] = {
        patient_id: s.patient_id,
        patient_name: s.patient.full_name,
        sessions_count: 0,
        total_engagement: 0
      };
    }
    patientEngagement[s.patient_id].sessions_count++;
    patientEngagement[s.patient_id].total_engagement += s.patient_engagement;
  });

  const patientsByEngagement = Object.values(patientEngagement)
    .map(p => ({
      ...p,
      avg_engagement: (p.total_engagement / p.sessions_count).toFixed(2)
    }))
    .sort((a, b) => b.avg_engagement - a.avg_engagement);

  res.json({
    success: true,
    data: {
      avg_engagement: parseFloat(avgEngagement),
      trend,
      trend_details: {
        recent_avg: recentAvg.toFixed(2),
        old_avg: oldAvg.toFixed(2),
        difference: (recentAvg - oldAvg).toFixed(2)
      },
      patients_by_engagement: patientsByEngagement,
      total_sessions_analyzed: sessions.length
    }
  });
};

// ============================================
// FUNÇÕES DE BUSCA E FILTROS
// ============================================

/**
 * Busca avançada de sessões
 */
const searchSessions = async (req, res) => {
  const userId = req.userId;
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.length < 3) {
    throw new AppError('Termo de busca deve ter pelo menos 3 caracteres', 400);
  }

  const offset = (page - 1) * limit;

  // Buscar em notas e tópicos principais
  const { count, rows: sessions } = await Session.findAndCountAll({
    where: {
      user_id: userId,
      [Op.or]: [
        { session_notes: { [Op.iLike]: `%${q}%` } },
        { patient_mood: { [Op.iLike]: `%${q}%` } },
        { main_topics: { [Op.contains]: [q] } }
      ]
    },
    limit,
    offset,
    order: [['session_date', 'DESC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name']
      }
    ]
  });

  res.json({
    success: true,
    data: {
      query: q,
      results: sessions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    }
  });
};

/**
 * Próximas sessões agendadas
 */
const getUpcomingSessions = async (req, res) => {
  const userId = req.userId;
  const { days = 7, include_today = true } = req.query;

  const startDate = new Date();
  if (!include_today) {
    startDate.setDate(startDate.getDate() + 1);
  }
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + parseInt(days));

  const sessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      },
      status: {
        [Op.in]: ['scheduled', 'confirmed']
      }
    },
    order: [['session_date', 'ASC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone', 'email']
      }
    ]
  });

  res.json({
    success: true,
    data: {
      upcoming_sessions: sessions,
      count: sessions.length,
      period: {
        start: startDate,
        end: endDate,
        days: parseInt(days)
      }
    }
  });
};

/**
 * Sessões pendentes de registro de evolução
 */
const getPendingSessions = async (req, res) => {
  const userId = req.userId;

  // Sessões realizadas mas sem evolução completa
  const now = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 3);

  const pendingSessions = await Session.findAll({
    where: {
      user_id: userId,
      session_date: {
        [Op.gte]: threeDaysAgo,
        [Op.lte]: now
      },
      status: {
        [Op.in]: ['confirmed', 'in_progress']
      },
      [Op.or]: [
        { session_notes: null },
        { session_notes: '' }
      ]
    },
    order: [['session_date', 'ASC']],
    include: [
      {
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'phone']
      }
    ]
  });

  res.json({
    success: true,
    data: {
      pending_sessions: pendingSessions,
      count: pendingSessions.length,
      message: pendingSessions.length > 0 
        ? `Você tem ${pendingSessions.length} sessão(ões) pendente(s) de evolução`
        : 'Todas as sessões estão com evolução registrada!'
    }
  });
};

// ============================================
// EXPORTAR TODAS AS FUNÇÕES
// ============================================

module.exports = {
  // Agendamento
  createSession,
  listSessions,
  getSessionById,
  updateScheduledSession,
  cancelSession,

  // Evolução clínica
  recordEvolution,
  updateEvolution,
  confirmSession,
  markNoShow,

  // Agenda
  getTodayAgenda,
  getWeekAgenda,
  getMonthAgenda,
  checkAvailability,

  // Histórico do paciente
  getPatientHistory,
  getPatientTimeline,
  getPatientStats,

  // Reagendamento
  rescheduleSession,
  suggestAlternativeTimes,

  // Estatísticas
  getStatsOverview,
  getProductivityReport,
  getEngagementAnalysis,

  // Busca e filtros
  searchSessions,
  getUpcomingSessions,
  getPendingSessions
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. FLUXO DE AGENDAMENTO:
 *    a) createSession - Validar conflitos e criar
 *    b) getTodayAgenda - Visualizar agenda do dia
 *    c) confirmSession - Confirmar presença
 *    d) recordEvolution - Registrar após sessão
 * 
 * 2. GESTÃO DE CONFLITOS:
 *    - Validação automática em validateNoScheduleConflict
 *    - checkAvailability retorna slots livres
 *    - suggestAlternativeTimes para reagendamento
 * 
 * 3. HISTÓRICO E EVOLUÇÃO:
 *    - getPatientHistory: Lista paginada de sessões
 *    - getPatientTimeline: Cronologia visual
 *    - getPatientStats: Agregação de dados
 * 
 * 4. ESTATÍSTICAS:
 *    - getStatsOverview: Dashboard principal
 *    - getProductivityReport: Análise detalhada
 *    - getEngagementAnalysis: Tendências
 * 
 * 5. SINCRONIZAÇÃO AUTOMÁTICA:
 *    - Patient.first_appointment na primeira sessão
 *    - Patient.last_appointment ao completar sessão
 *    - session_number incrementa automaticamente
 * 
 * 6. STATUS WORKFLOW:
 *    scheduled → confirmed → in_progress → completed
 *    scheduled → cancelled
 *    scheduled → no_show
 *    scheduled → rescheduled → scheduled
 * 
 * 7. OWNERSHIP E SEGURANÇA:
 *    - Todas as funções verificam user_id do token
 *    - Pacientes devem pertencer ao profissional
 *    - Sessões só acessíveis pelo criador
 * 
 * EXEMPLOS DE INTEGRAÇÃO:
 * 
 * // Dashboard do profissional
 * const today = await getTodayAgenda(req, res);
 * const upcoming = await getUpcomingSessions(req, res);
 * const pending = await getPendingSessions(req, res);
 * 
 * // Fluxo de consulta
 * const session = await createSession(req, res);
 * await confirmSession(req, res);
 * await recordEvolution(req, res);
 * 
 * // Relatórios
 * const stats = await getStatsOverview(req, res);
 * const productivity = await getProductivityReport(req, res);
 */