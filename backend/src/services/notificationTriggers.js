/**
 * MÓDULA - NOTIFICATION TRIGGERS
 * 
 * Sistema de triggers automáticos para criar notificações baseadas em eventos.
 * Integra-se com os controllers existentes para notificar usuários automaticamente.
 * 
 * Eventos monitorados:
 * - Transferências (solicitadas, aprovadas, rejeitadas)
 * - Sessões (próximas, confirmadas, canceladas)
 * - Anamneses (pendentes, completadas)
 * - Pacientes (novos cadastros, alta)
 * - Sistema (backup, manutenção, alertas)
 */

const { Notification, User, Patient, Session, Transfer } = require('../models');
const { Op } = require('sequelize');

// ============================================
// TRIGGERS DE TRANSFERÊNCIAS
// ============================================

/**
 * Notificar quando transferência é solicitada
 * Trigger: Após criar transferência (POST /api/transfers)
 * 
 * @param {Object} transfer - Dados da transferência
 * @param {String} fromProfessionalName - Nome do profissional solicitante
 */
const notifyTransferRequested = async (transfer, fromProfessionalName) => {
  try {
    // 1. Notificar todos os admins
    const admins = await User.findAll({
      where: { 
        user_type: 'admin',
        status: 'active',
      },
      attributes: ['id'],
    });

    if (admins.length > 0) {
      const adminIds = admins.map(admin => admin.id);
      
      await Notification.createBulk(adminIds, {
        type: 'warning',
        category: 'transfer',
        title: 'Nova Transferência Pendente',
        message: `${fromProfessionalName} solicitou transferência de paciente. Aguardando sua aprovação.`,
        priority: 'high',
        action_type: 'approve_transfer',
        action_url: '/admin/transfers/pending',
        action_data: {
          transfer_id: transfer.id,
          patient_id: transfer.patient_id,
        },
        related_entity_type: 'transfer',
        related_entity_id: transfer.id,
      });

      console.log(`[TRIGGER] Notificação de transferência enviada para ${adminIds.length} admin(s)`);
    }

    // 2. Notificar profissional destino
    await Notification.createForUser(transfer.to_user_id, {
      type: 'info',
      category: 'transfer',
      title: 'Você Recebeu uma Solicitação de Transferência',
      message: `${fromProfessionalName} gostaria de transferir um paciente para você. Aguardando aprovação administrativa.`,
      priority: 'medium',
      action_type: 'link',
      action_url: '/professional/transfers/incoming',
      action_data: {
        transfer_id: transfer.id,
      },
      related_entity_type: 'transfer',
      related_entity_id: transfer.id,
    });

    console.log(`[TRIGGER] Notificação de transferência enviada para profissional destino`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyTransferRequested:', error.message);
  }
};

/**
 * Notificar quando transferência é aprovada
 * Trigger: Após aprovar transferência (PUT /api/admin/transfers/:id/approve)
 * 
 * @param {Object} transfer - Dados da transferência
 * @param {String} adminName - Nome do admin que aprovou
 */
const notifyTransferApproved = async (transfer, adminName) => {
  try {
    // 1. Notificar profissional solicitante (origem)
    await Notification.createForUser(transfer.from_user_id, {
      type: 'success',
      category: 'transfer',
      title: 'Transferência Aprovada',
      message: `Sua solicitação de transferência foi aprovada por ${adminName}. O paciente foi transferido com sucesso.`,
      priority: 'medium',
      action_type: 'link',
      action_url: `/professional/patients`,
      action_data: {
        transfer_id: transfer.id,
      },
      related_entity_type: 'transfer',
      related_entity_id: transfer.id,
    });

    // 2. Notificar profissional destino
    await Notification.createForUser(transfer.to_user_id, {
      type: 'success',
      category: 'transfer',
      title: 'Novo Paciente Transferido Para Você',
      message: `Você recebeu um novo paciente por transferência. Revise o histórico e agende a primeira consulta.`,
      priority: 'high',
      action_type: 'view_patient',
      action_url: `/professional/patients/${transfer.patient_id}`,
      action_data: {
        transfer_id: transfer.id,
        patient_id: transfer.patient_id,
      },
      related_entity_type: 'transfer',
      related_entity_id: transfer.id,
    });

    console.log(`[TRIGGER] Notificações de aprovação enviadas`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyTransferApproved:', error.message);
  }
};

/**
 * Notificar quando transferência é rejeitada
 * Trigger: Após rejeitar transferência (PUT /api/admin/transfers/:id/reject)
 * 
 * @param {Object} transfer - Dados da transferência
 * @param {String} adminName - Nome do admin que rejeitou
 * @param {String} rejectionReason - Motivo da rejeição
 */
const notifyTransferRejected = async (transfer, adminName, rejectionReason) => {
  try {
    // Notificar apenas o profissional solicitante
    await Notification.createForUser(transfer.from_user_id, {
      type: 'error',
      category: 'transfer',
      title: 'Transferência Rejeitada',
      message: `Sua solicitação de transferência foi rejeitada por ${adminName}. Motivo: ${rejectionReason}`,
      priority: 'medium',
      action_type: 'link',
      action_url: '/professional/transfers/my-requests',
      action_data: {
        transfer_id: transfer.id,
      },
      related_entity_type: 'transfer',
      related_entity_id: transfer.id,
    });

    console.log(`[TRIGGER] Notificação de rejeição enviada`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyTransferRejected:', error.message);
  }
};

// ============================================
// TRIGGERS DE SESSÕES
// ============================================

/**
 * Notificar sobre sessões próximas (24h antes)
 * Trigger: Job agendado (cron) - rodar diariamente
 */
const notifyUpcomingSessions = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Buscar sessões agendadas para amanhã
    const upcomingSessions = await Session.findAll({
      where: {
        session_date: {
          [Op.gte]: tomorrow,
          [Op.lt]: dayAfterTomorrow,
        },
        status: {
          [Op.in]: ['scheduled', 'confirmed'],
        },
      },
      include: [
        { model: Patient, as: 'Patient', attributes: ['id', 'full_name'] },
        { model: User, as: 'Professional', attributes: ['id', 'full_name'] },
      ],
    });

    console.log(`[TRIGGER] Encontradas ${upcomingSessions.length} sessões para amanhã`);

    // Criar notificação para cada profissional
    for (const session of upcomingSessions) {
      const sessionTime = new Date(session.session_date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      await Notification.createForUser(session.user_id, {
        type: 'reminder',
        category: 'session',
        title: 'Lembrete: Sessão Amanhã',
        message: `Você tem uma sessão agendada com ${session.Patient.full_name} amanhã às ${sessionTime}.`,
        priority: 'medium',
        action_type: 'view_session',
        action_url: `/professional/sessions/${session.id}`,
        action_data: {
          session_id: session.id,
          patient_id: session.patient_id,
        },
        related_entity_type: 'session',
        related_entity_id: session.id,
        expires_at: dayAfterTomorrow, // Expira após o dia da sessão
      });
    }

    console.log(`[TRIGGER] ${upcomingSessions.length} notificações de lembrete criadas`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyUpcomingSessions:', error.message);
  }
};

/**
 * Notificar sobre sessões sem evolução registrada
 * Trigger: Job agendado (cron) - rodar diariamente
 */
const notifyPendingEvolutions = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Buscar sessões completadas sem evolução registrada
    const sessionsWithoutEvolution = await Session.findAll({
      where: {
        status: 'completed',
        session_date: {
          [Op.gte]: threeDaysAgo,
          [Op.lt]: new Date(),
        },
        // Assumindo que session_notes vazio = sem evolução
        session_notes: {
          [Op.or]: [null, ''],
        },
      },
      include: [
        { model: Patient, as: 'Patient', attributes: ['id', 'full_name'] },
      ],
    });

    console.log(`[TRIGGER] Encontradas ${sessionsWithoutEvolution.length} sessões pendentes de evolução`);

    // Agrupar por profissional
    const sessionsByProfessional = {};
    sessionsWithoutEvolution.forEach(session => {
      if (!sessionsByProfessional[session.user_id]) {
        sessionsByProfessional[session.user_id] = [];
      }
      sessionsByProfessional[session.user_id].push(session);
    });

    // Criar notificação para cada profissional
    for (const [userId, sessions] of Object.entries(sessionsByProfessional)) {
      const count = sessions.length;
      const patientNames = sessions.slice(0, 3).map(s => s.Patient.full_name).join(', ');
      const moreText = count > 3 ? ` e mais ${count - 3}` : '';

      await Notification.createForUser(userId, {
        type: 'warning',
        category: 'session',
        title: 'Evoluções Pendentes',
        message: `Você tem ${count} sessão(ões) sem evolução registrada: ${patientNames}${moreText}. Registre as evoluções o quanto antes.`,
        priority: 'high',
        action_type: 'link',
        action_url: '/professional/sessions/pending',
        action_data: {
          pending_count: count,
        },
        related_entity_type: 'session',
        related_entity_id: sessions[0].id,
      });
    }

    console.log(`[TRIGGER] Notificações de evolução pendente enviadas para ${Object.keys(sessionsByProfessional).length} profissional(is)`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyPendingEvolutions:', error.message);
  }
};

/**
 * Notificar quando sessão é cancelada
 * Trigger: Após cancelar sessão (DELETE /api/sessions/:id)
 * 
 * @param {Object} session - Dados da sessão
 * @param {String} reason - Motivo do cancelamento
 */
const notifySessionCancelled = async (session, reason) => {
  try {
    const sessionTime = new Date(session.session_date).toLocaleString('pt-BR');

    await Notification.createForUser(session.user_id, {
      type: 'info',
      category: 'session',
      title: 'Sessão Cancelada',
      message: `Sessão com ${session.Patient?.full_name || 'paciente'} agendada para ${sessionTime} foi cancelada. ${reason ? `Motivo: ${reason}` : ''}`,
      priority: 'low',
      action_type: 'link',
      action_url: '/professional/sessions',
      action_data: {
        session_id: session.id,
      },
      related_entity_type: 'session',
      related_entity_id: session.id,
    });

    console.log(`[TRIGGER] Notificação de cancelamento de sessão enviada`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifySessionCancelled:', error.message);
  }
};

// ============================================
// TRIGGERS DE ANAMNESE
// ============================================

/**
 * Notificar sobre anamneses pendentes
 * Trigger: Job agendado (cron) - rodar semanalmente
 */
const notifyPendingAnamnesis = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Buscar pacientes sem anamnese completada
    const Anamnesis = require('../models/Anamnesis');
    
    const pendingAnamnesis = await Anamnesis.findAll({
      where: {
        status: {
          [Op.in]: ['draft', 'in_progress'],
        },
        created_at: {
          [Op.lte]: sevenDaysAgo,
        },
      },
      include: [
        { model: Patient, as: 'Patient', attributes: ['id', 'full_name'] },
      ],
    });

    console.log(`[TRIGGER] Encontradas ${pendingAnamnesis.length} anamneses pendentes (7+ dias)`);

    // Agrupar por profissional
    const anamnesisByProfessional = {};
    pendingAnamnesis.forEach(anamnesis => {
      if (!anamnesisByProfessional[anamnesis.user_id]) {
        anamnesisByProfessional[anamnesis.user_id] = [];
      }
      anamnesisByProfessional[anamnesis.user_id].push(anamnesis);
    });

    // Criar notificação para cada profissional
    for (const [userId, anamnesisList] of Object.entries(anamnesisByProfessional)) {
      const count = anamnesisList.length;
      const patientNames = anamnesisList.slice(0, 3).map(a => a.Patient.full_name).join(', ');
      const moreText = count > 3 ? ` e mais ${count - 3}` : '';

      await Notification.createForUser(userId, {
        type: 'warning',
        category: 'anamnesis',
        title: 'Anamneses Pendentes',
        message: `Você tem ${count} anamnese(s) não finalizada(s) há mais de 7 dias: ${patientNames}${moreText}. Complete-as para melhor acompanhamento.`,
        priority: 'medium',
        action_type: 'link',
        action_url: '/professional/anamnesis/pending',
        action_data: {
          pending_count: count,
        },
        related_entity_type: 'anamnesis',
        related_entity_id: anamnesisList[0].id,
      });
    }

    console.log(`[TRIGGER] Notificações de anamnese pendente enviadas para ${Object.keys(anamnesisByProfessional).length} profissional(is)`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyPendingAnamnesis:', error.message);
  }
};

/**
 * Notificar quando anamnese é completada
 * Trigger: Após completar anamnese (POST /api/anamnesis/:id/complete)
 * 
 * @param {Object} anamnesis - Dados da anamnese
 * @param {String} patientName - Nome do paciente
 */
const notifyAnamnesisCompleted = async (anamnesis, patientName) => {
  try {
    await Notification.createForUser(anamnesis.user_id, {
      type: 'success',
      category: 'anamnesis',
      title: 'Anamnese Completada',
      message: `Anamnese de ${patientName} foi completada com sucesso. Você pode agora agendar sessões e acompanhar o tratamento.`,
      priority: 'low',
      action_type: 'view_patient',
      action_url: `/professional/patients/${anamnesis.patient_id}`,
      action_data: {
        anamnesis_id: anamnesis.id,
        patient_id: anamnesis.patient_id,
      },
      related_entity_type: 'anamnesis',
      related_entity_id: anamnesis.id,
    });

    console.log(`[TRIGGER] Notificação de anamnese completada enviada`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyAnamnesisCompleted:', error.message);
  }
};

// ============================================
// TRIGGERS DE PACIENTES
// ============================================

/**
 * Notificar quando novo paciente é cadastrado
 * Trigger: Após criar paciente (POST /api/professional/patients)
 * 
 * @param {Object} patient - Dados do paciente
 * @param {String} professionalId - ID do profissional
 */
const notifyNewPatient = async (patient, professionalId) => {
  try {
    await Notification.createForUser(professionalId, {
      type: 'success',
      category: 'patient',
      title: 'Novo Paciente Cadastrado',
      message: `${patient.full_name} foi cadastrado com sucesso. Próximo passo: preencher a anamnese.`,
      priority: 'medium',
      action_type: 'complete_anamnesis',
      action_url: `/professional/patients/${patient.id}/anamnesis`,
      action_data: {
        patient_id: patient.id,
      },
      related_entity_type: 'patient',
      related_entity_id: patient.id,
    });

    console.log(`[TRIGGER] Notificação de novo paciente enviada`);

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyNewPatient:', error.message);
  }
};

// ============================================
// TRIGGERS DE SISTEMA
// ============================================

/**
 * Notificar sobre backup realizado
 * Trigger: Após executar backup (cron job)
 * 
 * @param {Object} backupInfo - Informações do backup
 */
const notifyBackupCompleted = async (backupInfo) => {
  try {
    // Notificar todos os admins
    const admins = await User.findAll({
      where: { 
        user_type: 'admin',
        status: 'active',
      },
      attributes: ['id'],
    });

    if (admins.length > 0) {
      const adminIds = admins.map(admin => admin.id);
      
      await Notification.createBulk(adminIds, {
        type: 'success',
        category: 'backup',
        title: 'Backup Realizado com Sucesso',
        message: `Backup do sistema foi concluído. Tamanho: ${backupInfo.size || 'N/A'}. Próximo backup: ${backupInfo.next_backup || 'agendado'}.`,
        priority: 'low',
        action_type: 'none',
        related_entity_type: 'system',
      });

      console.log(`[TRIGGER] Notificação de backup enviada para ${adminIds.length} admin(s)`);
    }

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyBackupCompleted:', error.message);
  }
};

/**
 * Notificar sobre manutenção programada
 * Trigger: Manual (admin cria)
 * 
 * @param {Object} maintenanceInfo - Informações da manutenção
 */
const notifyScheduledMaintenance = async (maintenanceInfo) => {
  try {
    // Notificar TODOS os usuários ativos
    const users = await User.findAll({
      where: { status: 'active' },
      attributes: ['id'],
    });

    if (users.length > 0) {
      const userIds = users.map(user => user.id);
      
      await Notification.createBulk(userIds, {
        type: 'warning',
        category: 'system',
        title: 'Manutenção Programada',
        message: `Sistema em manutenção ${maintenanceInfo.date} das ${maintenanceInfo.start_time} às ${maintenanceInfo.end_time}. Durante este período o sistema estará indisponível.`,
        priority: 'high',
        action_type: 'none',
        related_entity_type: 'system',
        expires_at: new Date(maintenanceInfo.date),
      });

      console.log(`[TRIGGER] Notificação de manutenção enviada para ${userIds.length} usuário(s)`);
    }

  } catch (error) {
    console.error('[TRIGGER ERROR] notifyScheduledMaintenance:', error.message);
  }
};

// ============================================
// CRON JOBS (Para rodar periodicamente)
// ============================================

/**
 * Configurar jobs agendados
 * Deve ser chamado na inicialização do servidor
 */
const setupCronJobs = () => {
  // Nota: Requer biblioteca 'node-cron' instalada
  // npm install node-cron
  
  try {
    const cron = require('node-cron');

    // Rodar todos os dias às 8h - Notificar sessões de amanhã
    cron.schedule('0 8 * * *', () => {
      console.log('[CRON] Executando: notifyUpcomingSessions');
      notifyUpcomingSessions();
    });

    // Rodar todos os dias às 18h - Notificar evoluções pendentes
    cron.schedule('0 18 * * *', () => {
      console.log('[CRON] Executando: notifyPendingEvolutions');
      notifyPendingEvolutions();
    });

    // Rodar toda segunda-feira às 9h - Notificar anamneses pendentes
    cron.schedule('0 9 * * 1', () => {
      console.log('[CRON] Executando: notifyPendingAnamnesis');
      notifyPendingAnamnesis();
    });

    console.log('[CRON] ✓ Jobs agendados configurados com sucesso');

  } catch (error) {
    console.error('[CRON ERROR] Falha ao configurar jobs:', error.message);
    console.log('[CRON] Instale node-cron: npm install node-cron');
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Triggers de transferências
  notifyTransferRequested,
  notifyTransferApproved,
  notifyTransferRejected,
  
  // Triggers de sessões
  notifyUpcomingSessions,
  notifyPendingEvolutions,
  notifySessionCancelled,
  
  // Triggers de anamnese
  notifyPendingAnamnesis,
  notifyAnamnesisCompleted,
  
  // Triggers de pacientes
  notifyNewPatient,
  
  // Triggers de sistema
  notifyBackupCompleted,
  notifyScheduledMaintenance,
  
  // Setup de cron jobs
  setupCronJobs,
};

/**
 * COMO INTEGRAR NOS CONTROLLERS:
 * 
 * // No transferController.js
 * const notificationTriggers = require('../services/notificationTriggers');
 * 
 * // Após criar transferência
 * await notificationTriggers.notifyTransferRequested(transfer, req.user.full_name);
 * 
 * // Após aprovar transferência
 * await notificationTriggers.notifyTransferApproved(transfer, req.user.full_name);
 * 
 * // No server.js (inicialização)
 * const notificationTriggers = require('./src/services/notificationTriggers');
 * notificationTriggers.setupCronJobs();
 */