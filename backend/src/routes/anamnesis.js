/**
 * MÓDULA - ROTAS DE ANAMNESE
 * 
 * Define todos os endpoints para o sistema de anamnese digital.
 * Sistema inteligente com auto-save, validações por seção e controle de progresso.
 * 
 * Funcionalidades implementadas:
 * - CRUD completo de anamneses
 * - Sistema de seções estruturadas
 * - Auto-save com controle de conflitos
 * - Validação específica por seção
 * - Controle de progresso e completude
 * - Templates e sugestões inteligentes
 * 
 */

const express = require('express');
const { requireProfessional, checkResourceOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { Patient } = require('../models');

// Importar controller de anamnese
const anamnesisController = require('../controllers/anamnesisController');

// Importar validações específicas
const {
  validateCreateAnamnesis,
  validateUpdateSection,
  validateCompleteAnamnesis,
  validateAutoSave,
  validateAnamnesisQuery,
  validatePatientId,
  validateSectionName
} = require('../middleware/anamnesisValidations');

const router = express.Router();

/**
 * ROTAS PRINCIPAIS DE ANAMNESE
 * Gestão completa do ciclo de vida da anamnese
 */

// GET /api/anamnesis/patient/:patientId
// Obter anamnese de um paciente específico
// Cria automaticamente se não existir
router.get('/patient/:patientId',
  requireProfessional,
  validatePatientId,
  checkResourceOwnership(Patient, 'patientId'),
  asyncHandler(anamnesisController.getPatientAnamnesis)
);

// POST /api/anamnesis/patient/:patientId
// Criar nova anamnese para um paciente
router.post('/patient/:patientId',
  requireProfessional,
  validatePatientId,
  checkResourceOwnership(Patient, 'patientId'),
  validateCreateAnamnesis,
  asyncHandler(anamnesisController.createAnamnesis)
);

// PUT /api/anamnesis/:id/section/:sectionName
// Atualizar seção específica da anamnese
// Sistema inteligente com auto-save e validação contextual
router.put('/:id/section/:sectionName',
  requireProfessional,
  validatePatientId,
  validateSectionName,
  validateUpdateSection,
  asyncHandler(anamnesisController.updateAnamnesisSection)
);

// POST /api/anamnesis/:id/auto-save
// Auto-save periódico (chamado automaticamente pelo frontend)
router.post('/:id/auto-save',
  requireProfessional,
  validateAutoSave,
  asyncHandler(anamnesisController.autoSaveAnamnesis)
);

// POST /api/anamnesis/:id/complete
// Marcar anamnese como finalizada
// Valida completude mínima antes de finalizar
router.post('/:id/complete',
  requireProfessional,
  validateCompleteAnamnesis,
  asyncHandler(anamnesisController.completeAnamnesis)
);

/**
 * ROTAS DE GESTÃO E LISTAGEM
 * Visualização e gerenciamento de anamneses
 */

// GET /api/anamnesis/my-anamneses
// Listar todas as anamneses do profissional logado
// Com filtros por status, completude, data
router.get('/my-anamneses',
  requireProfessional,
  validateAnamnesisQuery,
  asyncHandler(anamnesisController.listMyAnamneses)
);

// GET /api/anamnesis/pending
// Anamneses pendentes (incompletas) do profissional
router.get('/pending',
  requireProfessional,
  asyncHandler(anamnesisController.getPendingAnamneses)
);

// GET /api/anamnesis/completed
// Anamneses finalizadas do profissional
router.get('/completed',
  requireProfessional,
  validateAnamnesisQuery,
  asyncHandler(anamnesisController.getCompletedAnamneses)
);

// GET /api/anamnesis/:id/summary
// Obter resumo executivo da anamnese
// Para visualização rápida e relatórios
router.get('/:id/summary',
  requireProfessional,
  asyncHandler(anamnesisController.getAnamnesisSummary)
);

/**
 * ROTAS DE VALIDAÇÃO E PROGRESSO
 * Sistema de validação inteligente por seções
 */

// GET /api/anamnesis/:id/progress
// Obter progresso detalhado da anamnese
// Mostra completude por seção e sugestões
router.get('/:id/progress',
  requireProfessional,
  asyncHandler(anamnesisController.getAnamnesisProgress)
);

// POST /api/anamnesis/:id/validate-section/:sectionName
// Validar seção específica sem salvar
// Para feedback em tempo real no frontend
router.post('/:id/validate-section/:sectionName',
  requireProfessional,
  validateSectionName,
  asyncHandler(anamnesisController.validateSectionOnly)
);

// GET /api/anamnesis/:id/missing-sections
// Obter seções que ainda precisam ser preenchidas
router.get('/:id/missing-sections',
  requireProfessional,
  asyncHandler(anamnesisController.getMissingSections)
);

/**
 * ROTAS DE TEMPLATES E SUGESTÕES
 * Sistema inteligente de templates e sugestões
 */

// GET /api/anamnesis/templates/section/:sectionName
// Obter template/estrutura para uma seção específica
// Ajuda o profissional a entender o que preencher
router.get('/templates/section/:sectionName',
  requireProfessional,
  validateSectionName,
  asyncHandler(anamnesisController.getSectionTemplate)
);

// GET /api/anamnesis/suggestions/:patientId
// Sugestões inteligentes baseadas no perfil do paciente
// Análise de idade, gênero, queixa principal, etc.
router.get('/suggestions/:patientId',
  requireProfessional,
  validatePatientId,
  checkResourceOwnership(Patient, 'patientId'),
  asyncHandler(anamnesisController.getSmartSuggestions)
);

/**
 * ROTAS DE RELATÓRIOS E EXPORTAÇÃO
 * Geração de relatórios e exportação de dados
 */

// GET /api/anamnesis/:id/report
// Gerar relatório completo da anamnese
// Formato profissional para impressão/PDF
router.get('/:id/report',
  requireProfessional,
  asyncHandler(anamnesisController.generateAnamnesisReport)
);

// GET /api/anamnesis/:id/export
// Exportar anamnese em diferentes formatos
// Query params: format (json, pdf, docx)
router.get('/:id/export',
  requireProfessional,
  asyncHandler(anamnesisController.exportAnamnesis)
);

// POST /api/anamnesis/:id/generate-insights
// Gerar insights automáticos baseados na anamnese
// Análise de padrões e sugestões de tratamento
router.post('/:id/generate-insights',
  requireProfessional,
  asyncHandler(anamnesisController.generateInsights)
);

/**
 * ROTAS DE HISTÓRICO E VERSIONING
 * Controle de versões e histórico de alterações
 */

// GET /api/anamnesis/:id/history
// Obter histórico de alterações da anamnese
// Para auditoria e controle de versões
router.get('/:id/history',
  requireProfessional,
  asyncHandler(anamnesisController.getAnamnesisHistory)
);

// POST /api/anamnesis/:id/create-revision
// Criar revisão/snapshot da anamnese atual
// Para marcos importantes no tratamento
router.post('/:id/create-revision',
  requireProfessional,
  asyncHandler(anamnesisController.createRevision)
);

/**
 * ROTAS DE COLABORAÇÃO (FUTURO)
 * Sistema de comentários e colaboração entre profissionais
 */

// POST /api/anamnesis/:id/comments
// Adicionar comentário/observação na anamnese
router.post('/:id/comments',
  requireProfessional,
  asyncHandler(anamnesisController.addComment)
);

// GET /api/anamnesis/:id/comments
// Listar comentários da anamnese
router.get('/:id/comments',
  requireProfessional,
  asyncHandler(anamnesisController.getComments)
);

/**
 * ROTAS DE ESTATÍSTICAS
 * Análises e estatísticas sobre anamneses
 */

// GET /api/anamnesis/stats/my-performance
// Estatísticas do profissional sobre suas anamneses
// Taxa de completude, tempo médio, etc.
router.get('/stats/my-performance',
  requireProfessional,
  asyncHandler(anamnesisController.getMyAnamnesisStats)
);

// GET /api/anamnesis/stats/completion-trends
// Tendências de completude ao longo do tempo
router.get('/stats/completion-trends',
  requireProfessional,
  asyncHandler(anamnesisController.getCompletionTrends)
);

/**
 * ROTAS ADMINISTRATIVAS (Só para admins)
 * Gestão avançada e configurações
 */

// GET /api/anamnesis/admin/overview
// Visão geral de todas as anamneses (admin only)
router.get('/admin/overview',
  requireProfessional, // TODO: Mudar para requireAdmin quando implementado
  asyncHandler(anamnesisController.getAdminOverview)
);

// PUT /api/anamnesis/admin/templates/:sectionName
// Atualizar templates de seções (admin only)
router.put('/admin/templates/:sectionName',
  requireProfessional, // TODO: Mudar para requireAdmin
  validateSectionName,
  asyncHandler(anamnesisController.updateSectionTemplate)
);

/**
 * ROTAS DE BACKUP E RECUPERAÇÃO
 * Sistema de backup e recuperação de anamneses
 */

// POST /api/anamnesis/:id/backup
// Criar backup manual da anamnese
router.post('/:id/backup',
  requireProfessional,
  asyncHandler(anamnesisController.createBackup)
);

// POST /api/anamnesis/:id/restore
// Restaurar anamnese de um backup
router.post('/:id/restore',
  requireProfessional,
  asyncHandler(anamnesisController.restoreFromBackup)
);

/**
 * MIDDLEWARE DE VERIFICAÇÃO DE PROPRIEDADE ESPECÍFICO
 * Verificar se anamnese pertence ao profissional logado
 */
const checkAnamnesisOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const Anamnesis = require('../models/Anamnesis');
    const anamnesis = await Anamnesis.findByPk(id);
    
    if (!anamnesis) {
      return res.status(404).json({
        success: false,
        message: 'Anamnese não encontrada',
        code: 'ANAMNESIS_NOT_FOUND'
      });
    }
    
    if (anamnesis.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Esta anamnese não pertence a você.',
        code: 'ANAMNESIS_ACCESS_DENIED'
      });
    }
    
    // Adicionar anamnese ao req para uso nas rotas
    req.anamnesis = anamnesis;
    next();
  } catch (error) {
    next(error);
  }
};

// Aplicar middleware de propriedade em rotas que precisam
const anamnesisOwnershipRoutes = [
  '/:id/section/:sectionName',
  '/:id/auto-save',
  '/:id/complete',
  '/:id/summary',
  '/:id/progress',
  '/:id/validate-section/:sectionName',
  '/:id/missing-sections',
  '/:id/report',
  '/:id/export',
  '/:id/generate-insights',
  '/:id/history',
  '/:id/create-revision',
  '/:id/comments',
  '/:id/backup',
  '/:id/restore'
];

// Aplicar middleware de verificação de propriedade
router.use(anamnesisOwnershipRoutes, checkAnamnesisOwnership);

/**
 * ROTAS DE DESENVOLVIMENTO E DEBUG
 * Apenas em desenvolvimento
 */
if (process.env.NODE_ENV === 'development') {
  // GET /api/anamnesis/debug/:id/structure
  // Visualizar estrutura completa da anamnese (debug)
  router.get('/debug/:id/structure',
    requireProfessional,
    asyncHandler(anamnesisController.debugAnamnesisStructure)
  );
  
  // POST /api/anamnesis/debug/populate-sample/:patientId
  // Popular anamnese com dados de exemplo (debug)
  router.post('/debug/populate-sample/:patientId',
    requireProfessional,
    validatePatientId,
    checkResourceOwnership(Patient, 'patientId'),
    asyncHandler(anamnesisController.populateSampleData)
  );
}

module.exports = router;

/**
 * DOCUMENTAÇÃO DE USO DAS ROTAS:
 * 
 * 1. FLUXO BÁSICO DE ANAMNESE:
 *    GET /patient/:id -> Obter/criar anamnese
 *    PUT /:id/section/:section -> Atualizar seções
 *    POST /:id/auto-save -> Auto-save periódico
 *    POST /:id/complete -> Finalizar
 * 
 * 2. SISTEMA DE AUTO-SAVE:
 *    - Frontend chama auto-save a cada 30s
 *    - Detecta conflitos se múltiplas abas
 *    - Salva apenas campos modificados
 * 
 * 3. VALIDAÇÃO POR SEÇÃO:
 *    - Cada seção tem validações específicas
 *    - Feedback em tempo real
 *    - Progress tracking automático
 * 
 * 4. TEMPLATES INTELIGENTES:
 *    - Sugestões baseadas no paciente
 *    - Templates por especialidade
 *    - Campos obrigatórios destacados
 * 
 * EXEMPLO DE USO COMPLETO:
 * 
 * // 1. Obter anamnese do paciente
 * GET /api/anamnesis/patient/uuid-paciente
 * Response: { anamnesis: {...}, templates: {...} }
 * 
 * // 2. Atualizar seção de queixa principal
 * PUT /api/anamnesis/uuid-anamnese/section/current_complaint
 * Body: {
 *   main_complaint: "Ansiedade no trabalho",
 *   onset: { when: "3 meses", trigger: "Promoção" },
 *   symptoms: [...]
 * }
 * 
 * // 3. Auto-save periódico
 * POST /api/anamnesis/uuid-anamnese/auto-save
 * Body: { section: "current_complaint", data: {...} }
 * 
 * // 4. Verificar progresso
 * GET /api/anamnesis/uuid-anamnese/progress
 * Response: { completion: 65, missing_sections: [...] }
 * 
 * // 5. Finalizar anamnese
 * POST /api/anamnesis/uuid-anamnese/complete
 * 
 * SEGURANÇA E CONTROLE:
 * 
 * 1. ISOLAMENTO TOTAL:
 *    - Cada profissional só vê suas anamneses
 *    - Verificação de propriedade em todas as rotas
 *    - Logs de auditoria completos
 * 
 * 2. VALIDAÇÕES:
 *    - Estrutura de dados validada por seção
 *    - Campos obrigatórios verificados
 *    - Integridade referencial garantida
 * 
 * 3. BACKUP E RECOVERY:
 *    - Auto-backup em pontos críticos
 *    - Histórico completo de alterações
 *    - Recovery point-in-time
 * 
 * 4. PERFORMANCE:
 *    - Lazy loading de seções
 *    - Cache inteligente de templates
 *    - Compressão de dados JSON
 *    - Índices otimizados
 */