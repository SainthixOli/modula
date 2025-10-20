/**
 * MÓDULA - ROTAS DE ADMINISTRAÇÃO
 * 
 * Define todos os endpoints para operações administrativas.
 * Todas as rotas exigem autenticação (validateToken) e privilégios de admin (requireAdmin).
 * 
 * Endpoints implementados:
 * - Dashboard com estatísticas gerais
 * - CRUD completo de profissionais
 * - Gestão de status de profissionais
 * - Reset de senhas
 * 
 * 
 */

const express = require('express');
const { requireAdmin, validateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const transferController = require('../controllers/transferController');

// Importar controller que será criado na próxima etapa
const adminController = require('../controllers/adminController');

// Importar validações que serão criadas
const {
  validateCreateProfessional,
  validateUpdateProfessional,
  validateStatusUpdate
} = require('../middleware/adminValidations');

const router = express.Router();

const {
  validateApproveTransfer,
  validateRejectTransfer,
  validateHistoryFilters,
  validateTransferId,
} = require('../middleware/transferValidations');

// Validação para ações em lote
const { body, param } = require('express-validator'); 

/**
 * ROTAS DE DASHBOARD
 * Fornecem estatísticas e visão geral da clínica
 */

// GET /api/admin/dashboard
// Retorna estatísticas gerais para o dashboard administrativo
router.get('/dashboard', 
  requireAdmin, 
  asyncHandler(adminController.getDashboard)
);

// GET /api/admin/stats/overview  
// Estatísticas detalhadas da clínica
router.get('/stats/overview',
  requireAdmin,
  asyncHandler(adminController.getOverviewStats)
);

/**
 * ROTAS DE GESTÃO DE PROFISSIONAIS
 * CRUD completo para gerenciar profissionais de saúde
 */

// GET /api/admin/professionals
// Lista todos os profissionais com filtros e paginação
// Query params: page, limit, search, status, sortBy, order
router.get('/professionals',
  requireAdmin,
  asyncHandler(adminController.listProfessionals)
);

// POST /api/admin/professionals
// Cria novo profissional com senha temporária
// Body: { full_name, email, professional_register? }
router.post('/professionals',
  requireAdmin,
  validateCreateProfessional,
  asyncHandler(adminController.createProfessional)
);

// GET /api/admin/professionals/:id
// Obter detalhes específicos de um profissional
// Params: id (UUID do profissional)
router.get('/professionals/:id',
  requireAdmin,
  asyncHandler(adminController.getProfessionalById)
);

// PUT /api/admin/professionals/:id
// Atualizar dados de um profissional
// Body: { full_name?, email?, professional_register? }
router.put('/professionals/:id',
  requireAdmin,
  validateUpdateProfessional,
  asyncHandler(adminController.updateProfessional)
);

// PUT /api/admin/professionals/:id/status
// Ativar/desativar profissional
// Body: { status: 'active' | 'inactive' | 'suspended' }
router.put('/professionals/:id/status',
  requireAdmin,
  validateStatusUpdate,
  asyncHandler(adminController.updateProfessionalStatus)
);

// POST /api/admin/professionals/:id/reset-password
// Gerar nova senha temporária para profissional
// Body: { sendEmail?: boolean }
router.post('/professionals/:id/reset-password',
  requireAdmin,
  asyncHandler(adminController.resetProfessionalPassword)
);

/**
 * ROTAS DE ADMIN COM TRANSFERENCIAS
 * 
 * 
 */
/**
 * @route   GET /api/admin/dashboard
 * @desc    Dashboard administrativo atualizado com transferências
 * @access  Admin
 * 
 * ATUALIZAR a rota existente para usar getDashboardWithTransfers
 */
router.get(
  '/dashboard',
  validateToken,
  requireAdmin,
  asyncHandler(adminController.getDashboardWithTransfers) // Usar nova versão
);

/**
 * @route   GET /api/admin/widgets/pending-transfers
 * @desc    Widget de transferências pendentes
 * @access  Admin
 */
router.get(
  '/widgets/pending-transfers',
  validateToken,
  requireAdmin,
  asyncHandler(adminController.getPendingTransfersWidget)
);

/**
 * @route   GET /api/admin/transfers/pending
 * @desc    Listar transferências pendentes
 * @access  Admin
 */
router.get(
  '/transfers/pending',
  validateToken,
  requireAdmin,
  asyncHandler(transferController.getPendingTransfers)
);

/**
 * @route   PUT /api/admin/transfers/:id/approve
 * @desc    Aprovar transferência
 * @access  Admin
 */
router.put(
  '/transfers/:id/approve',
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
 */
router.put(
  '/transfers/:id/reject',
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
  '/transfers/:id/complete',
  validateToken,
  requireAdmin,
  validateTransferId,
  asyncHandler(transferController.completeTransfer)
);

/**
 * @route   GET /api/admin/transfers/history
 * @desc    Histórico completo de transferências
 * @access  Admin
 */
router.get(
  '/transfers/history',
  validateToken,
  requireAdmin,
  validateHistoryFilters,
  asyncHandler(transferController.getTransfersHistory)
);

/**
 * @route   GET /api/admin/transfers/stats
 * @desc    Estatísticas de transferências
 * @access  Admin
 */
router.get(
  '/transfers/stats',
  validateToken,
  requireAdmin,
  asyncHandler(transferController.getTransferStats)
);

/**
 * @route   GET /api/admin/reports/transfers
 * @desc    Relatório detalhado de transferências
 * @access  Admin
 */
router.get(
  '/reports/transfers',
  validateToken,
  requireAdmin,
  asyncHandler(adminController.getTransfersReport)
);

/**
 * @route   POST /api/admin/transfers/bulk-action
 * @desc    Ações em lote (aprovar/rejeitar múltiplas)
 * @access  Admin
 */
router.post(
  '/transfers/bulk-action',
  validateToken,
  requireAdmin,
  [
    body('transfer_ids')
      .isArray({ min: 1 })
      .withMessage('Lista de IDs é obrigatória'),
    body('transfer_ids.*')
      .isUUID()
      .withMessage('Cada ID deve ser um UUID válido'),
    body('action')
      .isIn(['approve', 'reject'])
      .withMessage('Ação deve ser "approve" ou "reject"'),
    body('reason')
      .if(body('action').equals('reject'))
      .isLength({ min: 10, max: 1000 })
      .withMessage('Motivo é obrigatório para rejeição (10-1000 caracteres)'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas devem ter no máximo 500 caracteres'),
  ],
  asyncHandler(adminController.bulkTransferAction)
);

/**
 * @route   GET /api/admin/transfers/:id
 * @desc    Detalhes de uma transferência (view admin)
 * @access  Admin
 */
router.get(
  '/transfers/:id',
  validateToken,
  requireAdmin,
  validateTransferId,
  asyncHandler(transferController.getTransferById)
);

// ============================================
// RESUMO DAS ROTAS ADICIONADAS
// ============================================

/*
ROTAS DE TRANSFERÊNCIAS INTEGRADAS NO ADMIN:

DASHBOARD E WIDGETS:
✓ GET  /api/admin/dashboard                    - Dashboard atualizado
✓ GET  /api/admin/widgets/pending-transfers    - Widget de pendentes

GESTÃO DE TRANSFERÊNCIAS:
✓ GET  /api/admin/transfers/pending            - Lista pendentes
✓ PUT  /api/admin/transfers/:id/approve        - Aprovar
✓ PUT  /api/admin/transfers/:id/reject         - Rejeitar
✓ POST /api/admin/transfers/:id/complete       - Completar
✓ GET  /api/admin/transfers/:id                - Detalhes
✓ GET  /api/admin/transfers/history            - Histórico
✓ GET  /api/admin/transfers/stats              - Estatísticas

RELATÓRIOS E AÇÕES EM LOTE:
✓ GET  /api/admin/reports/transfers            - Relatório completo
✓ POST /api/admin/transfers/bulk-action        - Ações em lote

TOTAL: 10 rotas administrativas de transferências
*/

/**
 * ROTAS DE ESTATÍSTICAS ESPECÍFICAS
 * Dados detalhados para relatórios administrativos
 */

// GET /api/admin/stats/professionals
// Estatísticas detalhadas dos profissionais
// Query params: period (month, quarter, year)
router.get('/stats/professionals',
  requireAdmin,
  asyncHandler(adminController.getProfessionalsStats)
);

// GET /api/admin/stats/patients
// Estatísticas gerais dos pacientes da clínica
router.get('/stats/patients',
  requireAdmin,
  asyncHandler(adminController.getPatientsStats)
);

/**
 * ROTAS DE TRANSFERÊNCIAS (Implementação futura)
 * Gerenciamento de transferências de pacientes
 */

// GET /api/admin/transfers/pending
// Listar solicitações de transferência pendentes
router.get('/transfers/pending',
  requireAdmin,
  asyncHandler(adminController.listPendingTransfers)
);

// PUT /api/admin/transfers/:id/approve
// Aprovar transferência de paciente
router.put('/transfers/:id/approve',
  requireAdmin,
  asyncHandler(adminController.approveTransfer)
);

// PUT /api/admin/transfers/:id/reject
// Rejeitar transferência de paciente
router.put('/transfers/:id/reject',
  requireAdmin,
  asyncHandler(adminController.rejectTransfer)
);


// Middleware para validar UUID nos parâmetros
const validateUUIDParam = param('id')
  .isUUID()
  .withMessage('ID deve ser um UUID válido');

// Aplicar validação de UUID em rotas específicas
router.param('id', (req, res, next, id) => {
  // Validação básica de UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'ID inválido fornecido',
      code: 'INVALID_UUID'
    });
  }
  next();
});

module.exports = router;

/**
 * COMO USAR ESTAS ROTAS:
 * 
 * Todas as rotas já incluem:
 * - validateToken (aplicado no server.js para /api/admin/*)
 * - requireAdmin (verificação de privilégios)
 * - asyncHandler (tratamento automático de erros)
 * 
 * Exemplos de uso:
 * 
 * // Obter dashboard
 * GET /api/admin/dashboard
 * Headers: { Authorization: 'Bearer <admin_token>' }
 * 
 * // Listar profissionais com filtros
 * GET /api/admin/professionals?page=1&limit=10&search=joão&status=active
 * 
 * // Criar novo profissional
 * POST /api/admin/professionals
 * Body: {
 *   "full_name": "Dr. João Silva",
 *   "email": "joao@clinica.com",
 *   "professional_register": "CRP12345"
 * }
 * 
 * // Atualizar status de profissional
 * PUT /api/admin/professionals/uuid-here/status
 * Body: { "status": "inactive" }
 */