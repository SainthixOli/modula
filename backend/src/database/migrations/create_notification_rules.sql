/**
 * MIGRATION: Criar tabela notification_rules
 * 
 * Armazena triggers/regras de notificação customizadas criadas pelos admins
 * Permite criar novas regras sem precisar programar
 */

CREATE TABLE IF NOT EXISTS notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações básicas
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tipo e categoria
  type VARCHAR(50) NOT NULL, -- 'transfer', 'session', 'anamnesis', 'patient', 'system', 'custom'
  category VARCHAR(50) NOT NULL, -- categoria da notificação que será criada
  
  -- Trigger/Evento
  event_type VARCHAR(100) NOT NULL, -- qual evento dispara (ex: 'patient_created', 'session_completed')
  
  -- Condições (JSON) - quando o trigger deve disparar
  conditions JSONB DEFAULT '{}',
  -- Exemplo: { "patient_status": "active", "session_type": "initial" }
  
  -- Template da notificação
  notification_template JSONB NOT NULL,
  -- Exemplo: {
  --   "type": "info",
  --   "priority": "medium",
  --   "title": "{{patient_name}} chegou",
  --   "message": "Paciente {{patient_name}} aguardando atendimento",
  --   "action_url": "/professional/patients/{{patient_id}}"
  -- }
  
  -- Destinatários
  target_user_type VARCHAR(50) NOT NULL, -- 'admin', 'professional', 'specific_user', 'all'
  target_user_ids JSONB, -- IDs específicos se target_user_type = 'specific_user'
  
  -- Agendamento (se for trigger periódico)
  schedule VARCHAR(100), -- expressão cron (ex: '0 8 * * *')
  is_scheduled BOOLEAN DEFAULT false,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  
  -- Estatísticas
  trigger_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP,
  
  -- Metadados
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete
);

-- Índices
CREATE INDEX idx_notification_rules_type ON notification_rules(type);
CREATE INDEX idx_notification_rules_event_type ON notification_rules(event_type);
CREATE INDEX idx_notification_rules_enabled ON notification_rules(enabled) WHERE enabled = true;
CREATE INDEX idx_notification_rules_created_by ON notification_rules(created_by);

-- Comentários
COMMENT ON TABLE notification_rules IS 'Regras customizadas de notificações criadas pelos admins';
COMMENT ON COLUMN notification_rules.conditions IS 'Condições em JSON para quando o trigger deve disparar';
COMMENT ON COLUMN notification_rules.notification_template IS 'Template da notificação com suporte a variáveis {{var}}';
COMMENT ON COLUMN notification_rules.target_user_type IS 'Define quem receberá a notificação';
