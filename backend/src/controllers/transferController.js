/**
 * MÓDULA - CONTROLLER DE TRANSFERÊNCIAS
 * 
 * Lógica completa para gerenciar transferências de pacientes entre profissionais.
 * Workflow: solicitação → aprovação/rejeição → conclusão
 * 
 * Funcionalidades implementadas:
 * - Solicitação de transferência (profissional)
 * - Aprovação/rejeição (admin)
 * - Cancelamento (solicitante)
 * - Listagem e filtros avançados
 * - Estatísticas e histórico
 */

const { Transfer, Patient, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// ============================================
// OPERAÇÕES DO PROFISSIONAL
// ============================================

/**
 * Solicitar transferência de paciente
 * POST /api/transfers
 * 
 * @route POST /api/transfers
 * @access Professional
 */
const requestTransfer = async (req, res) => {
  const { patient_id, to_user_id, reason } = req.body;
  const from_user_id = req.userId;

  // Validar paciente
  const patient = await Patient.findByPk(patient_id);
  if (!patient) {
    throw new AppError('Paciente não encontrado', 404, 'PATIENT_NOT_FOUND');
  }

  // Verificar se paciente pertence ao profissional solicitante
  if (patient.user_id !== from_user_id) {
    throw new AppError(
      'Você não tem permissão para transferir este paciente',
      403,
      'UNAUTHORIZED_TRANSFER'
    );
  }

  // Validar profissional destino
  const toUser = await User.findByPk(to_user_id);
  if (!toUser) {
    throw new AppError('Profissional destino não encontrado', 404, 'TO_USER_NOT_FOUND');
  }

  if (toUser.user_type !== 'professional') {
    throw new AppError(
      'Transferência só pode ser feita para profissionais',
      400,
      'INVALID_TARGET_USER_TYPE'
    );
  }

  if (toUser.status !== 'active') {
    throw new AppError(
      'Profissional destino está inativo',
      400,
      'INACTIVE_TARGET_USER'
    );
  }

  // Verificar se não está transferindo para si mesmo
  if (from_user_id === to_user_id) {
    throw new AppError(
      'Não é possível transferir um paciente para você mesmo',
      400,
      'SELF_TRANSFER'
    );
  }

  // Verificar se já existe transferência pendente
  const existingPending = await Transfer.findOne({
    where: {
      patient_id,
      status: 'pending',
    },
  });

  if (existingPending) {
    throw new AppError(
      'Já existe uma transferência pendente para este paciente',
      409,
      'PENDING_TRANSFER_EXISTS'
    );
  }

  // Contar sessões do paciente (para metadata)
  const Session = require('../models/Session');
  const sessionsCount = await Session.count({
    where: { patient_id },
  });

  // Criar transferência
  const transfer = await Transfer.create({
    patient_id,
    from_user_id,
    to_user_id,
    reason,
    metadata: {
      sessions_count: sessionsCount,
      last_appointment: patient.last_appointment,
      requested_by_name: req.user.full_name,
      target_professional_name: toUser.full_name,
    },
  });

  // Buscar transferência com relacionamentos
  const transferWithDetails = await Transfer.findByPk(transfer.id, {
    include: [
      { model: Patient, as: 'Patient', attributes: ['id', 'full_name', 'cpf'] },
      { model: User, as: 'FromUser', attributes: ['id', 'full_name', 'email'] },
      { model: User, as: 'ToUser', attributes: ['id', 'full_name', 'email'] },
    ],
  });

  res.status(201).json({
    success: true,
    message: 'Solicitação de transferência criada com sucesso',
    data: {
      transfer: transferWithDetails,
      next_steps: [
        'Aguarde a aprovação do administrador',
        'Você será notificado sobre a decisão',
        'Você pode cancelar a solicitação a qualquer momento',
      ],
    },
  });
};

/**
 * Listar minhas solicitações de transferência
 * GET /api/transfers/my-requests
 * 
 * @route GET /api/transfers/my-requests
 * @access Professional
 */
const getMyTransferRequests = async (req, res) => {
  const userId = req.userId;
  const {
    page = 1,
    limit = 20,
    status,
    direction = 'all', // 'sent' | 'received' | 'all'
  } = req.query;

  const result = await Transfer.findByProfessional(userId, direction, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });

  // Calcular resumo
  const summary = {
    sent: await Transfer.count({ where: { from_user_id: userId } }),
    received: await Transfer.count({ where: { to_user_id: userId } }),
    pending_sent: await Transfer.count({ 
      where: { from_user_id: userId, status: 'pending' } 
    }),
    pending_received: await Transfer.count({ 
      where: { to_user_id: userId, status: 'pending' } 
    }),
  };

  res.json({
    success: true,
    data: {
      transfers: result.transfers,
      summary,
    },
    pagination: result.pagination,
  });
};

/**
 * Obter detalhes de uma transferência
 * GET /api/transfers/:id
 * 
 * @route GET /api/transfers/:id
 * @access Professional/Admin
 */
const getTransferById = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const isAdmin = req.user.user_type === 'admin';

  const transfer = await Transfer.findByPk(id, {
    include: [
      { model: Patient, as: 'Patient' },
      { model: User, as: 'FromUser', attributes: ['id', 'full_name', 'email'] },
      { model: User, as: 'ToUser', attributes: ['id', 'full_name', 'email'] },
      { 
        model: User, 
        as: 'ProcessedBy', 
        attributes: ['id', 'full_name', 'email'],
        required: false,
      },
    ],
  });

  if (!transfer) {
    throw new AppError('Transferência não encontrada', 404, 'TRANSFER_NOT_FOUND');
  }

  // Verificar permissão
  const hasAccess = isAdmin || 
                   transfer.from_user_id === userId || 
                   transfer.to_user_id === userId;

  if (!hasAccess) {
    throw new AppError(
      'Você não tem permissão para visualizar esta transferência',
      403,
      'UNAUTHORIZED_ACCESS'
    );
  }

  res.json({
    success: true,
    data: { transfer },
  });
};

/**
 * Cancelar transferência (apenas solicitante)
 * POST /api/transfers/:id/cancel
 * 
 * @route POST /api/transfers/:id/cancel
 * @access Professional
 */
const cancelTransfer = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.userId;

  const transfer = await Transfer.findByPk(id);

  if (!transfer) {
    throw new AppError('Transferência não encontrada', 404, 'TRANSFER_NOT_FOUND');
  }

  // Verificar se é o solicitante
  if (transfer.from_user_id !== userId) {
    throw new AppError(
      'Apenas o solicitante pode cancelar a transferência',
      403,
      'UNAUTHORIZED_CANCELLATION'
    );
  }

  // Verificar se está pendente
  if (!transfer.isPending()) {
    throw new AppError(
      'Apenas transferências pendentes podem ser canceladas',
      400,
      'INVALID_STATUS'
    );
  }

  // Cancelar transferência
  await transfer.cancel(userId, reason);

  res.json({
    success: true,
    message: 'Transferência cancelada com sucesso',
    data: { transfer },
  });
};

// ============================================
// OPERAÇÕES ADMINISTRATIVAS
// ============================================

/**
 * Listar transferências pendentes (admin)
 * GET /api/admin/transfers/pending
 * 
 * @route GET /api/admin/transfers/pending
 * @access Admin
 */
const getPendingTransfers = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'requested_at',
    order = 'ASC',
  } = req.query;

  const result = await Transfer.findPending({
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    order,
  });

  res.json({
    success: true,
    message: `${result.pagination.total} transferência(s) pendente(s)`,
    data: {
      transfers: result.transfers,
    },
    pagination: result.pagination,
  });
};

/**
 * Aprovar transferência (admin)
 * PUT /api/admin/transfers/:id/approve
 * 
 * @route PUT /api/admin/transfers/:id/approve
 * @access Admin
 */
const approveTransfer = async (req, res) => {
  const { id } = req.params;
  const { notes, auto_complete = true } = req.body;
  const adminId = req.userId;

  const transfer = await Transfer.findByPk(id, {
    include: [
      { model: Patient, as: 'Patient' },
      { model: User, as: 'FromUser', attributes: ['id', 'full_name'] },
      { model: User, as: 'ToUser', attributes: ['id', 'full_name'] },
    ],
  });

  if (!transfer) {
    throw new AppError('Transferência não encontrada', 404, 'TRANSFER_NOT_FOUND');
  }

  if (!transfer.isPending()) {
    throw new AppError(
      'Apenas transferências pendentes podem ser aprovadas',
      400,
      'INVALID_STATUS'
    );
  }

  // Aprovar transferência
  await transfer.approve(adminId, notes);

  // Se auto_complete = true, completar a transferência imediatamente
  if (auto_complete) {
    await transfer.complete();
  }

  res.json({
    success: true,
    message: auto_complete 
      ? 'Transferência aprovada e concluída com sucesso'
      : 'Transferência aprovada. Execute a conclusão manualmente.',
    data: {
      transfer,
      patient: transfer.Patient,
      from: transfer.FromUser,
      to: transfer.ToUser,
    },
  });
};

/**
 * Rejeitar transferência (admin)
 * PUT /api/admin/transfers/:id/reject
 * 
 * @route PUT /api/admin/transfers/:id/reject
 * @access Admin
 */
const rejectTransfer = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminId = req.userId;

  if (!reason || reason.trim().length < 10) {
    throw new AppError(
      'Motivo da rejeição é obrigatório (mínimo 10 caracteres)',
      400,
      'REASON_REQUIRED'
    );
  }

  const transfer = await Transfer.findByPk(id, {
    include: [
      { model: Patient, as: 'Patient', attributes: ['id', 'full_name'] },
      { model: User, as: 'FromUser', attributes: ['id', 'full_name'] },
      { model: User, as: 'ToUser', attributes: ['id', 'full_name'] },
    ],
  });

  if (!transfer) {
    throw new AppError('Transferência não encontrada', 404, 'TRANSFER_NOT_FOUND');
  }

  if (!transfer.isPending()) {
    throw new AppError(
      'Apenas transferências pendentes podem ser rejeitadas',
      400,
      'INVALID_STATUS'
    );
  }

  // Rejeitar transferência
  await transfer.reject(adminId, reason);

  res.json({
    success: true,
    message: 'Transferência rejeitada',
    data: {
      transfer,
      rejection_reason: reason,
    },
  });
};

/**
 * Listar histórico completo de transferências (admin)
 * GET /api/admin/transfers/history
 * 
 * @route GET /api/admin/transfers/history
 * @access Admin
 */
const getTransfersHistory = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    from_date,
    to_date,
    patient_id,
    professional_id,
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Construir filtros
  const where = {};

  if (status) {
    where.status = status;
  }

  if (from_date || to_date) {
    where.requested_at = {};
    if (from_date) where.requested_at[Op.gte] = new Date(from_date);
    if (to_date) where.requested_at[Op.lte] = new Date(to_date);
  }

  if (patient_id) {
    where.patient_id = patient_id;
  }

  if (professional_id) {
    where[Op.or] = [
      { from_user_id: professional_id },
      { to_user_id: professional_id },
    ];
  }

  const { count, rows } = await Transfer.findAndCountAll({
    where,
    include: [
      { model: Patient, as: 'Patient', attributes: ['id', 'full_name', 'cpf'] },
      { model: User, as: 'FromUser', attributes: ['id', 'full_name'] },
      { model: User, as: 'ToUser', attributes: ['id', 'full_name'] },
      { 
        model: User, 
        as: 'ProcessedBy', 
        attributes: ['id', 'full_name'],
        required: false,
      },
    ],
    order: [['requested_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  res.json({
    success: true,
    data: {
      transfers: rows,
    },
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
};

/**
 * Completar transferência manualmente (admin)
 * POST /api/admin/transfers/:id/complete
 * 
 * @route POST /api/admin/transfers/:id/complete
 * @access Admin
 */
const completeTransfer = async (req, res) => {
  const { id } = req.params;

  const transfer = await Transfer.findByPk(id, {
    include: [
      { model: Patient, as: 'Patient' },
      { model: User, as: 'FromUser', attributes: ['id', 'full_name'] },
      { model: User, as: 'ToUser', attributes: ['id', 'full_name'] },
    ],
  });

  if (!transfer) {
    throw new AppError('Transferência não encontrada', 404, 'TRANSFER_NOT_FOUND');
  }

  if (!transfer.isApproved()) {
    throw new AppError(
      'Apenas transferências aprovadas podem ser concluídas',
      400,
      'INVALID_STATUS'
    );
  }

  // Completar transferência
  await transfer.complete();

  res.json({
    success: true,
    message: 'Transferência concluída. Paciente transferido com sucesso.',
    data: {
      transfer,
      patient: transfer.Patient,
      from: transfer.FromUser,
      to: transfer.ToUser,
    },
  });
};

// ============================================
// ESTATÍSTICAS E RELATÓRIOS
// ============================================

/**
 * Obter estatísticas de transferências
 * GET /api/admin/transfers/stats
 * 
 * @route GET /api/admin/transfers/stats
 * @access Admin
 */
const getTransferStats = async (req, res) => {
  const { start_date, end_date, user_id } = req.query;

  const stats = await Transfer.getStats({
    startDate: start_date,
    endDate: end_date,
    userId: user_id,
  });

  // Buscar transferências mais recentes
  const recentTransfers = await Transfer.findAll({
    limit: 5,
    order: [['requested_at', 'DESC']],
    include: [
      { model: Patient, as: 'Patient', attributes: ['id', 'full_name'] },
      { model: User, as: 'FromUser', attributes: ['id', 'full_name'] },
      { model: User, as: 'ToUser', attributes: ['id', 'full_name'] },
    ],
  });

  res.json({
    success: true,
    data: {
      statistics: stats,
      recent_transfers: recentTransfers,
    },
  });
};

/**
 * Obter histórico de transferências de um paciente
 * GET /api/patients/:id/transfer-history
 * 
 * @route GET /api/patients/:id/transfer-history
 * @access Professional/Admin
 */
const getPatientTransferHistory = async (req, res) => {
  const { id: patientId } = req.params;
  const userId = req.userId;
  const isAdmin = req.user.user_type === 'admin';

  // Verificar se paciente existe
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    throw new AppError('Paciente não encontrado', 404, 'PATIENT_NOT_FOUND');
  }

  // Verificar permissão
  if (!isAdmin && patient.user_id !== userId) {
    throw new AppError(
      'Você não tem permissão para visualizar este histórico',
      403,
      'UNAUTHORIZED_ACCESS'
    );
  }

  const transfers = await Transfer.findByPatient(patientId);

  res.json({
    success: true,
    data: {
      patient: {
        id: patient.id,
        name: patient.full_name,
        current_professional: patient.user_id,
      },
      transfers,
      summary: {
        total_transfers: transfers.length,
        completed: transfers.filter(t => t.status === 'completed').length,
        rejected: transfers.filter(t => t.status === 'rejected').length,
        cancelled: transfers.filter(t => t.status === 'cancelled').length,
      },
    },
  });
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Operações do profissional
  requestTransfer,
  getMyTransferRequests,
  getTransferById,
  cancelTransfer,
  
  // Operações administrativas
  getPendingTransfers,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  getTransfersHistory,
  
  // Estatísticas
  getTransferStats,
  getPatientTransferHistory,
};