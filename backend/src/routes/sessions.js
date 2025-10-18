/**
 * MÓDULA - ROTAS DO SISTEMA DE SESSÕES
 * 
 * Endpoints completos para agendamento e gestão de consultas/sessões clínicas.
 * Sistema profissional de agenda com controle de evolução e histórico.
 * 
 * Rotas implementadas:
 * - CRUD completo de sessões
 * - Agendamento com detecção de conflitos
 * - Registro de evolução clínica
 * - Visualização de agenda (dia/semana/mês)
 * - Histórico do paciente
 * - Reagendamento e cancelamento
 * - Estatísticas e produtividade
 * 
 * Recursos especiais:
 * - Detecção automática de conflitos de horário
 * - Validação de ownership (profissional só acessa suas sessões)
 * - Filtros avançados com paginação
 * - Timeline de evolução do paciente
 * - Integração com dashboard profissional
 */

const express = require('express');
const router = express.Router();

// Controllers
const sessionController = require('../controllers/sessionController');

// Middlewares de autenticação
const { validateToken, requireProfessional } = require('../middleware/auth');

// Middlewares de validação
const {
  validateCreateSession,
  validateUpdateScheduledSession,
  validateRecordEvolution,
  validateListSessions,
  validateSessionId,
  validateNoScheduleConflict
} = require('../middleware/sessionValidations');

// Middleware de tratamento de erros
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================
// APLICAR AUTENTICAÇÃO EM TODAS AS ROTAS
// ============================================
router.use(validateToken);
router.use(requireProfessional);

// ============================================
// ROTAS DE AGENDAMENTO
// ============================================

/**
 * @route   POST /api/sessions
 * @desc    Criar nova sessão/consulta agendada
 * @access  Professional
 * @body    { patient_id, session_date, session_time, session_type, duration_minutes, location, notes }
 * @returns { success, message, data: session }
 */
router.post(
  '/',
  validateCreateSession,
  validateNoScheduleConflict,
  asyncHandler(sessionController.createSession)
);

/**
 * @route   GET /api/sessions
 * @desc    Listar sessões do profissional com filtros
 * @access  Professional
 * @query   { patient_id?, status?, session_type?, date_from?, date_to?, page?, limit?, sort_by?, order? }
 * @returns { success, data: { sessions, pagination } }
 */
router.get(
  '/',
  validateListSessions,
  asyncHandler(sessionController.listSessions)
);

/**
 * @route   GET /api/sessions/:id
 * @desc    Obter detalhes de uma sessão específica
 * @access  Professional (apenas próprias sessões)
 * @params  { id: UUID }
 * @returns { success, data: session }
 */
router.get(
  '/:id',
  validateSessionId,
  asyncHandler(sessionController.getSessionById)
);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Atualizar sessão agendada (antes da realização)
 * @access  Professional (apenas próprias sessões)
 * @params  { id: UUID }
 * @body    { session_date?, session_time?, session_type?, duration_minutes?, location?, notes?, status?, cancellation_reason? }
 * @returns { success, message, data: session }
 */
router.put(
  '/:id',
  validateSessionId,
  validateUpdateScheduledSession,
  validateNoScheduleConflict,
  asyncHandler(sessionController.updateScheduledSession)
);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Cancelar sessão agendada
 * @access  Professional (apenas próprias sessões)
 * @params  { id: UUID }
 * @body    { cancellation_reason: string }
 * @returns { success, message }
 */
router.delete(
  '/:id',
  validateSessionId,
  asyncHandler(sessionController.cancelSession)
);

// ============================================
// ROTAS DE EVOLUÇÃO CLÍNICA
// ============================================

/**
 * @route   POST /api/sessions/:id/evolution
 * @desc    Registrar evolução da sessão após realização
 * @access  Professional (apenas próprias sessões)
 * @params  { id: UUID }
 * @body    { session_notes, patient_mood?, main_topics?, interventions_used?, homework_assigned?, progress_assessment?, patient_engagement?, treatment_adherence?, next_session_goals?, treatment_plan_updates?, actual_start_time?, actual_end_time?, next_appointment? }
 * @returns { success, message, data: session }
 */
router.post(
  '/:id/evolution',
  validateSessionId,
  validateRecordEvolution,
  asyncHandler(sessionController.recordEvolution)
);

/**
 * @route   PUT /api/sessions/:id/evolution
 * @desc    Atualizar evolução de uma sessão já registrada
 * @access  Professional (apenas próprias sessões)
 * @params  { id: UUID }
 * @body    { session_notes?, patient_mood?, main_topics?, ... }
 * @returns { success, message, data: session }
 */
router.put(
  '/:id/evolution',
  validateSessionId,
  validateRecordEvolution,
  asyncHandler(sessionController.updateEvolution)
);

/**
 * @route   POST /api/sessions/:id/confirm
 * @desc    Confirmar presença do paciente na sessão
 * @access  Professional
 * @params  { id: UUID }
 * @returns { success, message, data: session }
 */
router.post(
  '/:id/confirm',
  validateSessionId,
  asyncHandler(sessionController.confirmSession)
);

/**
 * @route   POST /api/sessions/:id/no-show
 * @desc    Marcar paciente como faltante
 * @access  Professional
 * @params  { id: UUID }
 * @body    { notes?: string }
 * @returns { success, message, data: session }
 */
router.post(
  '/:id/no-show',
  validateSessionId,
  asyncHandler(sessionController.markNoShow)
);

// ============================================
// ROTAS DE AGENDA
// ============================================

/**
 * @route   GET /api/sessions/agenda/today
 * @desc    Obter agenda do dia atual
 * @access  Professional
 * @returns { success, data: { sessions, summary } }
 */
router.get(
  '/agenda/today',
  asyncHandler(sessionController.getTodayAgenda)
);

/**
 * @route   GET /api/sessions/agenda/week
 * @desc    Obter agenda da semana atual
 * @access  Professional
 * @query   { week_offset?: number }
 * @returns { success, data: { sessions_by_day, summary } }
 */
router.get(
  '/agenda/week',
  asyncHandler(sessionController.getWeekAgenda)
);

/**
 * @route   GET /api/sessions/agenda/month
 * @desc    Obter visão mensal da agenda
 * @access  Professional
 * @query   { year?: number, month?: number }
 * @returns { success, data: { sessions_by_date, summary } }
 */
router.get(
  '/agenda/month',
  asyncHandler(sessionController.getMonthAgenda)
);

/**
 * @route   GET /api/sessions/availability
 * @desc    Verificar disponibilidade de horários
 * @access  Professional
 * @query   { date: YYYY-MM-DD, duration?: number }
 * @returns { success, data: { available_slots, next_available } }
 */
router.get(
  '/availability',
  asyncHandler(sessionController.checkAvailability)
);

// ============================================
// ROTAS DE HISTÓRICO DO PACIENTE
// ============================================

/**
 * @route   GET /api/sessions/patient/:patientId/history
 * @desc    Obter histórico completo de sessões do paciente
 * @access  Professional (apenas próprios pacientes)
 * @params  { patientId: UUID }
 * @query   { page?, limit?, session_type?, date_from?, date_to? }
 * @returns { success, data: { sessions, statistics, pagination } }
 */
router.get(
  '/patient/:patientId/history',
  asyncHandler(sessionController.getPatientHistory)
);

/**
 * @route   GET /api/sessions/patient/:patientId/timeline
 * @desc    Timeline de evolução do paciente
 * @access  Professional (apenas próprios pacientes)
 * @params  { patientId: UUID }
 * @returns { success, data: { timeline, milestones, progress_chart } }
 */
router.get(
  '/patient/:patientId/timeline',
  asyncHandler(sessionController.getPatientTimeline)
);

/**
 * @route   GET /api/sessions/patient/:patientId/stats
 * @desc    Estatísticas das sessões do paciente
 * @access  Professional (apenas próprios pacientes)
 * @params  { patientId: UUID }
 * @returns { success, data: { total_sessions, frequency, engagement_avg, progress_trend } }
 */
router.get(
  '/patient/:patientId/stats',
  asyncHandler(sessionController.getPatientStats)
);

// ============================================
// ROTAS DE REAGENDAMENTO
// ============================================

/**
 * @route   POST /api/sessions/:id/reschedule
 * @desc    Reagendar sessão para nova data/horário
 * @access  Professional
 * @params  { id: UUID }
 * @body    { new_date: YYYY-MM-DD, new_time: HH:MM, reason?: string }
 * @returns { success, message, data: session }
 */
router.post(
  '/:id/reschedule',
  validateSessionId,
  validateNoScheduleConflict,
  asyncHandler(sessionController.rescheduleSession)
);

/**
 * @route   GET /api/sessions/:id/suggest-times
 * @desc    Sugerir horários alternativos para reagendamento
 * @access  Professional
 * @params  { id: UUID }
 * @query   { preferred_date?: YYYY-MM-DD, days_range?: number }
 * @returns { success, data: { suggested_slots } }
 */
router.get(
  '/:id/suggest-times',
  validateSessionId,
  asyncHandler(sessionController.suggestAlternativeTimes)
);

// ============================================
// ROTAS DE ESTATÍSTICAS E RELATÓRIOS
// ============================================

/**
 * @route   GET /api/sessions/stats/overview
 * @desc    Visão geral das estatísticas do profissional
 * @access  Professional
 * @query   { period?: 'week'|'month'|'year' }
 * @returns { success, data: { total_sessions, completed, cancelled, no_show, productivity } }
 */
router.get(
  '/stats/overview',
  asyncHandler(sessionController.getStatsOverview)
);

/**
 * @route   GET /api/sessions/stats/productivity
 * @desc    Relatório de produtividade detalhado
 * @access  Professional
 * @query   { date_from?: YYYY-MM-DD, date_to?: YYYY-MM-DD }
 * @returns { success, data: { sessions_by_type, hours_worked, patients_seen, revenue_estimate } }
 */
router.get(
  '/stats/productivity',
  asyncHandler(sessionController.getProductivityReport)
);

/**
 * @route   GET /api/sessions/stats/engagement
 * @desc    Análise de engajamento dos pacientes
 * @access  Professional
 * @returns { success, data: { avg_engagement, trend, patients_by_engagement } }
 */
router.get(
  '/stats/engagement',
  asyncHandler(sessionController.getEngagementAnalysis)
);

// ============================================
// ROTAS DE BUSCA E FILTROS
// ============================================

/**
 * @route   GET /api/sessions/search
 * @desc    Busca avançada de sessões
 * @access  Professional
 * @query   { q: string, filters?: object, page?, limit? }
 * @returns { success, data: { results, pagination } }
 */
router.get(
  '/search',
  asyncHandler(sessionController.searchSessions)
);

/**
 * @route   GET /api/sessions/upcoming
 * @desc    Próximas sessões agendadas
 * @access  Professional
 * @query   { days?: number, include_today?: boolean }
 * @returns { success, data: { upcoming_sessions, count } }
 */
router.get(
  '/upcoming',
  asyncHandler(sessionController.getUpcomingSessions)
);

/**
 * @route   GET /api/sessions/pending
 * @desc    Sessões pendentes de registro de evolução
 * @access  Professional
 * @returns { success, data: { pending_sessions, count } }
 */
router.get(
  '/pending',
  asyncHandler(sessionController.getPendingSessions)
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. AUTENTICAÇÃO:
 *    - Todas as rotas requerem token JWT válido
 *    - Apenas profissionais têm acesso (requireProfessional)
 *    - Ownership automática (user_id do token)
 * 
 * 2. AGENDAMENTO:
 *    - POST / - Criar sessão com validação de conflitos
 *    - PUT /:id - Atualizar sessão agendada
 *    - DELETE /:id - Cancelar com motivo obrigatório
 * 
 * 3. EVOLUÇÃO CLÍNICA:
 *    - POST /:id/evolution - Registrar após sessão
 *    - PUT /:id/evolution - Editar evolução existente
 *    - Validação rigorosa de campos clínicos
 * 
 * 4. AGENDA:
 *    - /agenda/today - Sessões de hoje
 *    - /agenda/week - Visão semanal
 *    - /agenda/month - Calendário mensal
 *    - /availability - Horários livres
 * 
 * 5. HISTÓRICO DO PACIENTE:
 *    - /patient/:id/history - Todas as sessões
 *    - /patient/:id/timeline - Evolução cronológica
 *    - /patient/:id/stats - Estatísticas específicas
 * 
 * 6. ESTATÍSTICAS:
 *    - /stats/overview - Dashboard principal
 *    - /stats/productivity - Relatório detalhado
 *    - /stats/engagement - Análise de pacientes
 * 
 * 7. UTILITÁRIOS:
 *    - /search - Busca textual avançada
 *    - /upcoming - Próximas sessões
 *    - /pending - Evoluções pendentes
 *    - /:id/suggest-times - Sugestões de horário
 * 
 * INTEGRAÇÃO NO SERVER.JS:
 * 
 * const sessionRoutes = require('./routes/sessions');
 * app.use('/api/sessions', sessionRoutes);
 * 
 * EXEMPLOS DE USO:
 * 
 * // Criar sessão
 * POST /api/sessions
 * {
 *   "patient_id": "uuid-do-paciente",
 *   "session_date": "2025-10-15",
 *   "session_time": "14:30",
 *   "session_type": "therapy_session",
 *   "duration_minutes": 50
 * }
 * 
 * // Registrar evolução
 * POST /api/sessions/:id/evolution
 * {
 *   "session_notes": "Paciente apresentou melhora...",
 *   "patient_mood": "Ansioso mas colaborativo",
 *   "main_topics": ["Ansiedade", "Relacionamentos"],
 *   "progress_assessment": "improved",
 *   "patient_engagement": 8
 * }
 * 
 * // Buscar agenda da semana
 * GET /api/sessions/agenda/week?week_offset=0
 * 
 * // Histórico do paciente
 * GET /api/sessions/patient/:patientId/history?page=1&limit=10
 */