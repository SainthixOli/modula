/**
 * MÓDULA - ROTAS DE TRANSFERÊNCIAS
 * 
 * Endpoints para gerenciar transferências de pacientes entre profissionais.
 * Sistema completo de workflow com aprovação administrativa.
 * 
 * Rotas implementadas:
 * 
 * PROFISSIONAL:
 * - POST /api/transfers - Solicitar transferência
 * - GET /api/transfers/my-requests - Minhas solicitações
 * - GET /api/transfers/:id - Detalhes da transferência
 * - POST /api/transfers/:id/cancel - Cancelar solicitação
 * - GET /api/patients/:id/transfer-history - Histórico do paciente
 * 
 * ADMIN:
 * - GET /api/admin/transfers/pending - Transferências pendentes
 * - PUT /api/admin/transfers/:id/approve - Aprovar transferência
 * - PUT /api/admin/transfers/:id/reject - Rejeitar transferência
 * - POST /api/admin/transfers/:id/complete - Completar transferência
 * - GET /api/admin/transfers/history - Histórico completo
 * - GET /api/admin/transfers/stats - Estatísticas
 */

const express = require('express');
const router = express.Router();

// Middleware de autenticação
const { validateToken, requireProfessional, requireAdmin } = require('../middleware/auth');

// Controller
const transferController = require('../controllers/transferController');

// Validações
const {
  validateRequestTransfer,
  validateApproveTransfer,
  validateRejectTransfer,
  validateCancelTransfer,
  validateListTransfers,
  validateHistoryFilters,
  validateTransferId,
} = require('../middleware/transferValidations');

// Wrapper para async/await
const asyncHandler = require('../middleware/errorHandler').asyncHandler;

// ============================================
// ROTAS DO PROFISSIONAL
// ============================================

/**
 * @route   POST /api/transfers
 * @desc    Solicitar transferência de paciente
 * @access  Professional
 * @body    { patient_id, to_user_id, reason }
 */
router.post(
  '/',
  validateToken,
  requireProfessional,
  validateRequestTransfer,
  asyncHandler(transferController.requestTransfer)
);

/**
 * @route   GET /api/transfers/my-requests
 * @desc    Listar minhas solicitações de transferência
 * @access  Professional
 * @query   page, limit, status, direction (sent/received/all)
 */
router.get(
  '/my-requests',
  validateToken,
  requireProfessional,
  validateListTransfers,
  asyncHandler(transferController.getMyTransferRequests)
);

/**
 * @route   GET /api/transfers/:id
 * @desc    Obter detalhes de uma transferência
 * @access  Professional/Admin
 */
router.get(
  '/:id',
  validateToken,
  validateTransferId,
  asyncHandler(transferController.getTransferById)
);

/**
 * @route   POST /api/transfers/:id/cancel
 * @desc    Cancelar transferência (apenas solicitante)
 * @access  Professional
 * @body    { reason? }
 */
router.post(
  '/:id/cancel',
  validateToken,
  requireProfessional,
  validateTransferId,
  validateCancelTransfer,
  asyncHandler(transferController.cancelTransfer)
);

/**
 * @route   GET /api/patients/:id/transfer-history
 * @desc    Obter histórico de transferências de um paciente
 * @access  Professional/Admin (owner do paciente ou admin)
 */
router.get(
  '/patient/:id/history',
  validateToken,
  asyncHandler(transferController.getPatientTransferHistory)
);

// ============================================
// ROTAS ADMINISTRATIVAS
// ============================================

/**
 * @route   GET /api/admin/transfers/pending
 * @desc    Listar transferências pendentes
 * @access  Admin
 * @query   page, limit, sortBy, order
 */
router.get(
  '/admin/pending',
  validateToken,
  requireAdmin,
  validateListTransfers,
  asyncHandler(transferController.getPendingTransfers)
);

/**
 * @route   PUT /api/admin/transfers/:id/approve
 * @desc    Aprovar transferência
 * @access  Admin
 * @body    { notes?, auto_complete? }
 */
router.put(
  '/admin/:id/approve',
  validateToken,
  requireAdmin,
  validateTransferId,
  validateApproveTransfer,
  asyncHandler(transferController.approveTransfer)
);

/**
 * @route   PUT /api/admin/transfers/:id/reject
 * @desc    Rejeitar transferência
 * @access  Admin
 * @body    { reason }
 */
router.put(
  '/admin/:id/reject',
  validateToken,
  requireAdmin,
  validateTransferId,
  validateRejectTransfer,
  asyncHandler(transferController.rejectTransfer)
);

/**
 * @route   POST /api/admin/transfers/:id/complete
 * @desc    Completar transferência manualmente
 * @access  Admin
 */
router.post(
  '/admin/:id/complete',
  validateToken,
  requireAdmin,
  validateTransferId,
  asyncHandler(transferController.completeTransfer)
);

/**
 * @route   GET /api/admin/transfers/history
 * @desc    Listar histórico completo de transferências
 * @access  Admin
 * @query   page, limit, status, from_date, to_date, patient_id, professional_id
 */
router.get(
  '/admin/history',
  validateToken,
  requireAdmin,
  validateHistoryFilters,
  asyncHandler(transferController.getTransfersHistory)
);

/**
 * @route   GET /api/admin/transfers/stats
 * @desc    Obter estatísticas de transferências
 * @access  Admin
 * @query   start_date?, end_date?, user_id?
 */
router.get(
  '/admin/stats',
  validateToken,
  requireAdmin,
  asyncHandler(transferController.getTransferStats)
);

// ============================================
// EXPORT
// ============================================

module.exports = router;