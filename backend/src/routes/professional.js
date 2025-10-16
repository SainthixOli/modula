/**
 * MÓDULA - ROTAS DO PROFISSIONAL
 * 
 * Define todos os endpoints para operações dos profissionais de saúde.
 * Todas as rotas exigem autenticação (validateToken) e verificação de tipo profissional.
 * 
 * Funcionalidades implementadas:
 * - Dashboard personalizado do profissional
 * - Gestão completa de pacientes
 * - Agenda e consultas
 * - Estatísticas pessoais
 * - Solicitação de transferências
 * 
 */

const express = require('express');
const { requireProfessional, checkResourceOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { Patient } = require('../models');

// Importar controller que será criado na próxima etapa
const professionalController = require('../controllers/professionalController');

// Importar validações específicas
const {
  validateCreatePatient,
  validateUpdatePatient,
  validatePatientStatusUpdate,
  validateTransferRequest,
  validateListPatientsQuery,
  validatePatientId
} = require('../middleware/professionalValidations');

const router = express.Router();

/**
 * ROTAS DE DASHBOARD
 * Visão geral personalizada para cada profissional
 */

// GET /api/professional/dashboard
// Dashboard com estatísticas e visão geral do profissional
router.get('/dashboard',
  requireProfessional,
  asyncHandler(professionalController.getDashboard)
);

// GET /api/professional/stats
// Estatísticas detalhadas do profissional
// Query params: period (week, month, quarter, year)
router.get('/stats',
  requireProfessional,
  asyncHandler(professionalController.getMyStats)
);

/**
 * ROTAS DE GESTÃO DE PACIENTES
 * CRUD completo para pacientes do profissional logado
 */

// GET /api/professional/patients
// Listar todos os meus pacientes com filtros
// Query params: page, limit, search, status, sortBy, order
router.get('/patients',
  requireProfessional,
  validateListPatientsQuery,
  asyncHandler(professionalController.listMyPatients)
);

// POST /api/professional/patients
// Cadastrar novo paciente
// Body: dados completos do paciente
router.post('/patients',
  requireProfessional,
  validateCreatePatient,
  asyncHandler(professionalController.createPatient)
);

// GET /api/professional/patients/:id
// Obter detalhes completos de um paciente específico
// Inclui verificação de propriedade
router.get('/patients/:id',
  requireProfessional,
  validatePatientId,
  checkResourceOwnership(Patient),
  asyncHandler(professionalController.getPatientById)
);

// PUT /api/professional/patients/:id
// Atualizar dados de um paciente
// Body: campos a serem atualizados
router.put('/patients/:id',
  requireProfessional,
  validatePatientId,
  checkResourceOwnership(Patient),
  validateUpdatePatient,
  asyncHandler(professionalController.updatePatient)
);

// PUT /api/professional/patients/:id/status
// Alterar status do paciente (ativo/inativo/alta/transferido)
// Body: { status: string, reason?: string }
router.put('/patients/:id/status',
  requireProfessional,
  validatePatientId,
  checkResourceOwnership(Patient),
  validatePatientStatusUpdate,
  asyncHandler(professionalController.updatePatientStatus)
);

/**
 * ROTAS DE TRANSFERÊNCIA
 * Sistema para solicitar transferência de pacientes
 */

// POST /api/professional/patients/:id/transfer
// Solicitar transferência de paciente para outro profissional
// Body: { to_professional_id: uuid, reason: string }
router.post('/patients/:id/transfer',
  requireProfessional,
  validatePatientId,
  checkResourceOwnership(Patient),
  validateTransferRequest,
  asyncHandler(professionalController.requestPatientTransfer)
);

// GET /api/professional/transfer-requests
// Listar minhas solicitações de transferência
// Query params: status, page, limit
router.get('/transfer-requests',
  requireProfessional,
  asyncHandler(professionalController.getMyTransferRequests)
);

/**
 * ROTAS DE AGENDA E CONSULTAS
 * Gestão de agenda e registros de consultas
 */

// GET /api/professional/schedule/today
// Agenda do dia atual
router.get('/schedule/today',
  requireProfessional,
  asyncHandler(professionalController.getTodaySchedule)
);

// GET /api/professional/schedule/week
// Agenda da semana atual
// Query params: startDate (opcional)
router.get('/schedule/week',
  requireProfessional,
  asyncHandler(professionalController.getWeekSchedule)
);

// GET /api/professional/schedule
// Agenda completa com filtros
// Query params: startDate, endDate, page, limit
router.get('/schedule',
  requireProfessional,
  asyncHandler(professionalController.getSchedule)
);

// Rotas de Pacientes
router.post('/patients', professionalController.createPatient);
router.get('/patients/:id', professionalController.getPatientById);

/**
 * ROTAS DE BUSCA E FILTROS
 * Funcionalidades avançadas de busca
 */

// GET /api/professional/patients/search
// Busca avançada de pacientes
// Query params: q (termo de busca), filters (JSON)
router.get('/patients/search',
  requireProfessional,
  asyncHandler(professionalController.searchPatients)
);

// GET /api/professional/patients/recent
// Pacientes com atividade recente
// Query params: days (padrão 30)
router.get('/patients/recent',
  requireProfessional,
  asyncHandler(professionalController.getRecentPatients)
);

// GET /api/professional/patients/pending-anamnesis
// Pacientes com anamnese pendente
router.get('/patients/pending-anamnesis',
  requireProfessional,
  asyncHandler(professionalController.getPendingAnamnesis)
);

/**
 * ROTAS DE RELATÓRIOS
 * Relatórios específicos do profissional
 */

// GET /api/professional/reports/patient-summary
// Resumo de todos os pacientes
// Query params: format (json, csv), period
router.get('/reports/patient-summary',
  requireProfessional,
  asyncHandler(professionalController.getPatientSummaryReport)
);

// GET /api/professional/reports/activity
// Relatório de atividades do profissional
// Query params: startDate, endDate, format
router.get('/reports/activity',
  requireProfessional,
  asyncHandler(professionalController.getActivityReport)
);

/**
 * ROTAS DE CONFIGURAÇÕES PESSOAIS
 * Configurações específicas do profissional
 */

// GET /api/professional/profile
// Obter perfil do profissional logado
router.get('/profile',
  requireProfessional,
  asyncHandler(professionalController.getMyProfile)
);

// PUT /api/professional/profile
// Atualizar dados do próprio perfil
// Body: campos permitidos para atualização
router.put('/profile',
  requireProfessional,
  asyncHandler(professionalController.updateMyProfile)
);

// POST /api/professional/change-password
// Alterar senha (diferente do primeiro acesso)
// Body: { currentPassword, newPassword, confirmPassword }
router.post('/change-password',
  requireProfessional,
  asyncHandler(professionalController.changePassword)
);

/**
 * ROTAS DE NOTIFICAÇÕES
 * Sistema básico de notificações
 */

// GET /api/professional/notifications
// Obter notificações do profissional
// Query params: unread_only, page, limit
router.get('/notifications',
  requireProfessional,
  asyncHandler(professionalController.getNotifications)
);

// PUT /api/professional/notifications/:id/read
// Marcar notificação como lida
router.put('/notifications/:id/read',
  requireProfessional,
  asyncHandler(professionalController.markNotificationAsRead)
);

/**
 * MIDDLEWARE DE VALIDAÇÃO DE PROPRIEDADE
 * Garantir que profissional só acessa seus próprios dados
 */

// Middleware customizado para verificar propriedade de paciente
const checkPatientOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const patient = await Patient.findByPk(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado',
        code: 'PATIENT_NOT_FOUND'
      });
    }
    
    if (patient.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Este paciente não pertence a você.',
        code: 'PATIENT_ACCESS_DENIED'
      });
    }
    
    // Adicionar paciente ao req para uso nas rotas
    req.patient = patient;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ROTAS DE QUICK ACTIONS
 * Ações rápidas para melhorar UX
 */

// POST /api/professional/quick-actions/new-appointment
// Agendar consulta rápida
// Body: { patient_id, date, notes }
router.post('/quick-actions/new-appointment',
  requireProfessional,
  asyncHandler(professionalController.quickNewAppointment)
);

// GET /api/professional/quick-actions/patient-overview/:id
// Visão rápida do paciente (para modals/previews)
router.get('/quick-actions/patient-overview/:id',
  requireProfessional,
  validatePatientId,
  checkPatientOwnership,
  asyncHandler(professionalController.getPatientQuickOverview)
);

module.exports = router;

/**
 * SEGURANÇA E VALIDAÇÕES APLICADAS:
 * 
 * 1. AUTENTICAÇÃO:
 *    - validateToken (aplicado no server.js para /api/professional/*)
 *    - requireProfessional (só profissionais podem acessar)
 * 
 * 2. AUTORIZAÇÃO:
 *    - checkResourceOwnership (pacientes só do profissional logado)
 *    - checkPatientOwnership (middleware customizado)
 * 
 * 3. VALIDAÇÃO:
 *    - Validação de UUIDs nos parâmetros
 *    - Validação de dados de entrada com Joi
 *    - Validação de query parameters
 * 
 * 4. TRATAMENTO DE ERROS:
 *    - asyncHandler para capturar erros automáticamente
 *    - Códigos de erro específicos
 *    - Mensagens claras em português
 * 
 * EXEMPLOS DE USO:
 * 
 * // Dashboard do profissional
 * GET /api/professional/dashboard
 * Headers: { Authorization: 'Bearer <professional_token>' }
 * 
 * // Listar meus pacientes com filtros
 * GET /api/professional/patients?page=1&limit=10&status=active&search=joão
 * 
 * // Criar novo paciente
 * POST /api/professional/patients
 * Body: {
 *   "full_name": "Maria Silva",
 *   "email": "maria@email.com",
 *   "phone": "(11) 99999-9999",
 *   "birth_date": "1990-05-15"
 * }
 * 
 * // Solicitar transferência
 * POST /api/professional/patients/uuid-here/transfer
 * Body: {
 *   "to_professional_id": "uuid-do-outro-profissional",
 *   "reason": "Especialização em ansiedade"
 * }
 * 
 * NOTA IMPORTANTE:
 * Todas as operações de pacientes são automaticamente filtradas
 * pelo user_id do profissional logado, garantindo isolamento total
 * dos dados entre profissionais.
 */