/**
 * MÓDULA - ROTAS DE DASHBOARD AVANÇADO
 * 
 * Endpoints para dashboards administrativos com estatísticas e KPIs.
 * Agregações complexas, comparativos e análises gerenciais.
 * 
 * Rotas implementadas:
 * - Dashboard administrativo principal
 * - Ranking de profissionais
 * - Detalhes de produtividade
 * - Estatísticas de ocupação
 * - Relatórios de crescimento
 * - Indicadores de qualidade
 * - Comparativos mensais
 * 
 * Recursos especiais:
 * - Autenticação JWT obrigatória
 * - Apenas administradores
 * - Query params flexíveis
 * - Dados prontos para gráficos
 * - Cache automático (futuro)
 */

const express = require('express');
const router = express.Router();

// Controllers
const dashboardController = require('../controllers/dashboardController');

// Middlewares de autenticação
const { validateToken, requireAdmin } = require('../middleware/auth');

// Middleware de tratamento de erros
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================
// APLICAR AUTENTICAÇÃO EM TODAS AS ROTAS
// ============================================
router.use(validateToken);
router.use(requireAdmin);

// ============================================
// ROTAS DE DASHBOARD
// ============================================

/**
 * @route   GET /api/dashboard/admin
 * @desc    Dashboard principal do administrador
 * @access  Admin
 * @returns {
 *   overview: { professionals, patients, sessions_this_month },
 *   growth: { trends, summary },
 *   quality: { improvement_rate, avg_engagement },
 *   top_professionals: Array,
 *   charts: { growth_trend, professionals_comparison }
 * }
 */
router.get(
  '/admin',
  asyncHandler(dashboardController.getAdminDashboard)
);

/**
 * @route   GET /api/dashboard/professionals/ranking
 * @desc    Ranking de produtividade dos profissionais
 * @access  Admin
 * @query   { startDate?, endDate?, sortBy? }
 * @returns {
 *   ranking: Array (com posições),
 *   totals: { sessions, completed, hours, patients },
 *   averages: { sessions_per_professional, hours_per_professional },
 *   charts: { by_sessions, by_hours, by_patients }
 * }
 */
router.get(
  '/professionals/ranking',
  asyncHandler(dashboardController.getProfessionalsRanking)
);

/**
 * @route   GET /api/dashboard/professionals/:professionalId
 * @desc    Detalhes de produtividade de um profissional
 * @access  Admin
 * @params  { professionalId: UUID }
 * @query   { startDate?, endDate? }
 * @returns {
 *   productivity: {
 *     professional, period, active_patients,
 *     sessions, hours_worked, attendance_rate,
 *     unique_patients_seen, avg_engagement, sessions_by_type
 *   },
 *   charts: { sessions_by_type, status_distribution, engagement_over_time }
 * }
 */
router.get(
  '/professionals/:professionalId',
  asyncHandler(dashboardController.getProfessionalDetails)
);

/**
 * @route   GET /api/dashboard/occupancy
 * @desc    Estatísticas de ocupação da clínica
 * @access  Admin
 * @query   { year?, month? }
 * @returns {
 *   period: { year, month, days_in_month },
 *   summary: {
 *     total_sessions, avg_occupancy_rate,
 *     busiest_day, distribution: { full, busy, moderate, light }
 *   },
 *   occupancy_by_day: { [date]: { sessions_count, occupancy_rate, status } }
 * }
 */
router.get(
  '/occupancy',
  asyncHandler(dashboardController.getOccupancyStats)
);

/**
 * @route   GET /api/dashboard/growth
 * @desc    Relatório de crescimento temporal
 * @access  Admin
 * @query   { months? }
 * @returns {
 *   trends: Array[{
 *     year, month, new_patients, sessions_completed,
 *     active_patients_end, growth_rate
 *   }],
 *   summary: {
 *     total_new_patients, total_sessions,
 *     avg_new_patients_per_month, avg_sessions_per_month
 *   },
 *   charts: { growth_trend, new_patients_chart, sessions_chart }
 * }
 */
router.get(
  '/growth',
  asyncHandler(dashboardController.getGrowthReport)
);

/**
 * @route   GET /api/dashboard/quality
 * @desc    Dashboard de indicadores de qualidade
 * @access  Admin
 * @query   { startDate?, endDate? }
 * @returns {
 *   quality: {
 *     improvement_rate, avg_engagement,
 *     full_adherence_rate, anamnesis_completion_rate
 *   },
 *   distributions: {
 *     progress: { labels, datasets },
 *     engagement: { high, medium, low }
 *   },
 *   sessions_analyzed: number
 * }
 */
router.get(
  '/quality',
  asyncHandler(dashboardController.getQualityDashboard)
);

/**
 * @route   GET /api/dashboard/monthly-comparison
 * @desc    Comparativo entre meses
 * @access  Admin
 * @query   { year?, months? }
 * @returns {
 *   comparisons: Array[{
 *     month, year, month_name, summary,
 *     variation: { sessions, patients }
 *   }],
 *   chart: { labels, datasets }
 * }
 */
router.get(
  '/monthly-comparison',
  asyncHandler(dashboardController.getMonthlyComparison)
);

// ============================================
// EXPORTAR ROUTER
// ============================================

module.exports = router;

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * INTEGRAÇÃO NO SERVER.JS:
 * 
 * const dashboardRoutes = require('./routes/dashboard');
 * app.use('/api/dashboard', dashboardRoutes);
 * 
 * EXEMPLOS DE CHAMADAS:
 * 
 * 1. Dashboard Principal:
 *    GET /api/dashboard/admin
 *    Headers: { Authorization: 'Bearer <admin_token>' }
 * 
 * 2. Ranking de Profissionais:
 *    GET /api/dashboard/professionals/ranking?sortBy=completed_sessions&startDate=2025-01-01
 *    Headers: { Authorization: 'Bearer <admin_token>' }
 * 
 * 3. Detalhes do Profissional:
 *    GET /api/dashboard/professionals/uuid-aqui?startDate=2025-01-01&endDate=2025-12-31
 *    Headers: { Authorization: 'Bearer <admin_token>' }
 * 
 * 4. Ocupação:
 *    GET /api/dashboard/occupancy?year=2025&month=10
 *    Headers: { Authorization: 'Bearer <admin_token>' }
 * 
 * 5. Crescimento:
 *    GET /api/dashboard/growth?months=12
 *    Headers: { Authorization: 'Bearer <admin_token>' }
 * 
 * 6. Qualidade:
 *    GET /api/dashboard/quality?startDate=2025-01-01&endDate=2025-12-31
 *    Headers: { Authorization: 'Bearer <admin_token>' }
 * 
 * 7. Comparativo Mensal:
 *    GET /api/dashboard/monthly-comparison?year=2025&months=3
 *    Headers: { Authorization: 'Bearer <admin_token>' }
 * 
 * SEGURANÇA:
 * - Todas as rotas requerem autenticação JWT
 * - Apenas administradores têm acesso (requireAdmin)
 * - Validação automática de tokens
 * - Rate limiting herdado do server.js
 * 
 * RESPONSE FORMAT:
 * Todas as respostas seguem o padrão:
 * {
 *   success: true|false,
 *   data: { ... } ou message: "erro"
 * }
 */