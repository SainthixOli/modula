/**
 * MODEL: NotificationRule
 * 
 * Gerencia triggers/regras de notificação customizadas criadas pelos admins
 */

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class NotificationRule extends Model {
  /**
   * Retorna dados formatados da regra
   */
  getFormattedData() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      category: this.category,
      event_type: this.event_type,
      conditions: this.conditions,
      notification_template: this.notification_template,
      target_user_type: this.target_user_type,
      target_user_ids: this.target_user_ids,
      schedule: this.schedule,
      is_scheduled: this.is_scheduled,
      enabled: this.enabled,
      trigger_count: this.trigger_count,
      last_triggered_at: this.last_triggered_at,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  /**
   * Incrementa contador de execuções
   */
  async incrementTriggerCount() {
    this.trigger_count = (this.trigger_count || 0) + 1;
    this.last_triggered_at = new Date();
    await this.save();
  }

  /**
   * Processa template substituindo variáveis {{var}} por valores
   * @param {Object} data - Dados para substituir no template
   */
  processTemplate(data) {
    const template = this.notification_template;
    const processed = {};

    Object.keys(template).forEach(key => {
      let value = template[key];
      
      if (typeof value === 'string') {
        // Substitui {{variavel}} pelos valores
        value = value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
          return data[varName] !== undefined ? data[varName] : match;
        });
      }
      
      processed[key] = value;
    });

    return processed;
  }

  /**
   * Verifica se as condições são atendidas
   * @param {Object} eventData - Dados do evento
   */
  matchesConditions(eventData) {
    if (!this.conditions || Object.keys(this.conditions).length === 0) {
      return true; // Sem condições = sempre dispara
    }

    // Verifica cada condição
    return Object.keys(this.conditions).every(key => {
      const expectedValue = this.conditions[key];
      const actualValue = eventData[key];
      
      // Suporta comparação simples
      if (typeof expectedValue === 'object' && expectedValue !== null) {
        // Operadores: $gt, $lt, $gte, $lte, $in, $ne
        if (expectedValue.$gt !== undefined) return actualValue > expectedValue.$gt;
        if (expectedValue.$lt !== undefined) return actualValue < expectedValue.$lt;
        if (expectedValue.$gte !== undefined) return actualValue >= expectedValue.$gte;
        if (expectedValue.$lte !== undefined) return actualValue <= expectedValue.$lte;
        if (expectedValue.$in !== undefined) return expectedValue.$in.includes(actualValue);
        if (expectedValue.$ne !== undefined) return actualValue !== expectedValue.$ne;
      }
      
      return actualValue === expectedValue;
    });
  }
}

NotificationRule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['transfer', 'session', 'anamnesis', 'patient', 'system', 'custom']],
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    conditions: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    notification_template: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    target_user_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['admin', 'professional', 'specific_user', 'all']],
      },
    },
    target_user_ids: {
      type: DataTypes.JSONB,
    },
    schedule: {
      type: DataTypes.STRING(100),
    },
    is_scheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    trigger_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_triggered_at: {
      type: DataTypes.DATE,
    },
    created_by: {
      type: DataTypes.UUID,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'NotificationRule',
    tableName: 'notification_rules',
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

module.exports = NotificationRule;
