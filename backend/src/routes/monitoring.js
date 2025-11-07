/**
 * Rotas de Monitoramento
 * 
 * Endpoints para health check, métricas e alertas
 */

const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { validateToken, authorizeAdmin } = require('../middleware/auth');

// ====================
// ROTAS PÚBLICAS
// ====================

/**
 * @route GET /api/monitoring/health
 * @desc Health check básico (público para monitoramento externo)
 * @access Public
 */
router.get('/health', monitoringController.healthCheck);

// ====================
// ROTAS PROTEGIDAS (ADMIN)
// ====================

/**
 * @route GET /api/monitoring/health/advanced
 * @desc Health check avançado com métricas detalhadas
 * @access Admin
 */
router.get('/health/advanced', validateToken, authorizeAdmin, monitoringController.advancedHealthCheck);

/**
 * @route GET /api/monitoring/metrics
 * @desc Obter todas as métricas do sistema
 * @access Admin
 */
router.get('/metrics', validateToken, authorizeAdmin, monitoringController.getMetrics);

/**
 * @route GET /api/monitoring/metrics/summary
 * @desc Obter resumo das métricas
 * @access Admin
 */
router.get('/metrics/summary', validateToken, authorizeAdmin, monitoringController.getMetricsSummary);

/**
 * @route POST /api/monitoring/metrics/reset
 * @desc Resetar todas as métricas
 * @access Admin
 */
router.post('/metrics/reset', validateToken, authorizeAdmin, monitoringController.resetMetrics);

/**
 * @route GET /api/monitoring/status
 * @desc Obter status geral do sistema
 * @access Admin
 */
router.get('/status', validateToken, authorizeAdmin, monitoringController.getStatus);

/**
 * @route GET /api/monitoring/alerts/config
 * @desc Obter configuração de alertas
 * @access Admin
 */
router.get('/alerts/config', validateToken, authorizeAdmin, monitoringController.getAlertsConfig);

/**
 * @route POST /api/monitoring/alerts/clear
 * @desc Limpar histórico de alertas
 * @access Admin
 */
router.post('/alerts/clear', validateToken, authorizeAdmin, monitoringController.clearAlertsHistory);

/**
 * @route POST /api/monitoring/check
 * @desc Executar verificação de saúde manualmente
 * @access Admin
 */
router.post('/check', validateToken, authorizeAdmin, monitoringController.checkSystemHealth);

module.exports = router;
