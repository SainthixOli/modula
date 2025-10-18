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
const { requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Importar controller que será criado na próxima etapa
const adminController = require('../controllers/adminController');

// Importar validações que serão criadas
const {
  validateCreateProfessional,
  validateUpdateProfessional,
  validateStatusUpdate
} = require('../middleware/adminValidations');

const router = express.Router();

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

/**
 * MIDDLEWARE DE VALIDAÇÃO DE PARÂMETROS
 * Validar UUIDs nos parâmetros de rota
 */
const { body, param } = require('express-validator');

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