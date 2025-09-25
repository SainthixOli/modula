/**
 * MÓDULA - CONTROLLER DE ANAMNESE
 * 
 * Contém toda a lógica de negócio para o sistema de anamnese digital.
 * Sistema inteligente com auto-save, templates, validações e análises.
 * 
 * Funcionalidades implementadas:
 * - CRUD completo de anamneses
 * - Sistema de seções estruturadas
 * - Auto-save com controle de conflitos
 * - Templates e sugestões inteligentes
 * - Validação contextual por seção
 * - Relatórios e insights automáticos
 * 
 */

const { Op } = require('sequelize');
const { User, Patient, Anamnesis } = require('../models');
const { 
  AppError, 
  createNotFoundError, 
  createValidationError,
  createAuthorizationError
} = require('../middleware/errorHandler');

/**
 * TEMPLATES DE SEÇÕES
 * Estruturas padrão para cada seção da anamnese
 */
const SECTION_TEMPLATES = {
  identification: {
    title: "Identificação e Dados Pessoais",
    description: "Informações básicas sobre o paciente",
    fields: {
      birthplace: { type: "string", label: "Local de nascimento", required: false },
      nationality: { type: "string", label: "Nacionalidade", default: "Brasileira" },
      education_level: { 
        type: "select", 
        label: "Escolaridade",
        options: ["fundamental_incompleto", "fundamental_completo", "medio_incompleto", 
                 "medio_completo", "superior_incompleto", "superior_completo", "pos_graduacao"]
      },
      current_occupation: { type: "string", label: "Ocupação atual" },
      work_situation: { 
        type: "select", 
        label: "Situação profissional",
        options: ["employed", "unemployed", "student", "retired", "self_employed"]
      },
      monthly_income: { 
        type: "select", 
        label: "Renda mensal",
        options: ["ate_1000", "1000_3000", "3000_5000", "5000_10000", "acima_10000"]
      },
      housing_situation: { 
        type: "select", 
        label: "Moradia",
        options: ["own_house", "rented", "family_house", "shared"]
      }
    }
  },

  family_history: {
    title: "História Familiar",
    description: "Informações sobre família e histórico familiar",
    fields: {
      father: {
        type: "object",
        label: "Pai",
        fields: {
          alive: { type: "boolean", label: "Vivo" },
          age: { type: "number", label: "Idade" },
          health_condition: { type: "text", label: "Condições de saúde" },
          relationship_quality: { 
            type: "select", 
            label: "Qualidade do relacionamento",
            options: ["excelente", "boa", "regular", "ruim", "sem_contato"]
          }
        }
      },
      mother: {
        type: "object", 
        label: "Mãe",
        fields: {
          alive: { type: "boolean", label: "Viva" },
          age: { type: "number", label: "Idade" },
          health_condition: { type: "text", label: "Condições de saúde" },
          relationship_quality: { 
            type: "select", 
            label: "Qualidade do relacionamento",
            options: ["excelente", "boa", "regular", "ruim", "sem_contato"]
          }
        }
      },
      siblings: {
        type: "array",
        label: "Irmãos",
        item_fields: {
          gender: { type: "select", options: ["male", "female"] },
          age: { type: "number" },
          health_condition: { type: "text" },
          relationship_quality: { type: "select", options: ["excelente", "boa", "regular", "ruim"] }
        }
      }
    }
  },

  current_complaint: {
    title: "Queixa Principal e Atual",
    description: "Motivo da consulta e situação atual do paciente",
    required: true,
    fields: {
      main_complaint: { 
        type: "text", 
        label: "Queixa principal", 
        required: true,
        placeholder: "Descreva o principal motivo que trouxe o paciente até você..."
      },
      onset: {
        type: "object",
        label: "Início dos sintomas",
        fields: {
          when: { type: "string", label: "Quando começou", required: true },
          trigger: { type: "text", label: "Fator desencadeante" }
        }
      },
      symptoms: {
        type: "array",
        label: "Sintomas",
        item_fields: {
          symptom: { type: "string", label: "Sintoma" },
          frequency: { 
            type: "select", 
            label: "Frequência",
            options: ["diária", "semanal", "mensal", "ocasional", "constante"]
          },
          intensity: { type: "number", label: "Intensidade (1-10)", min: 1, max: 10 },
          situations: { type: "array", label: "Situações que desencadeiam" }
        }
      },
      impact_on_life: {
        type: "object",
        label: "Impacto na vida",
        fields: {
          work: { type: "number", label: "Trabalho (1-10)", min: 1, max: 10 },
          relationships: { type: "number", label: "Relacionamentos (1-10)", min: 1, max: 10 },
          social_life: { type: "number", label: "Vida social (1-10)", min: 1, max: 10 },
          self_care: { type: "number", label: "Autocuidado (1-10)", min: 1, max: 10 }
        }
      }
    }
  },

  treatment_goals: {
    title: "Objetivos do Tratamento",
    description: "Metas e expectativas para o processo terapêutico",
    required: true,
    fields: {
      patient_goals: {
        type: "array",
        label: "Objetivos do paciente",
        required: true,
        item_type: "string",
        min_items: 1
      },
      expectations: {
        type: "object",
        label: "Expectativas",
        fields: {
          treatment_duration: { 
            type: "select", 
            label: "Duração esperada",
            options: ["3_months", "6_months", "1_year", "long_term", "indefinite"]
          },
          session_frequency: { 
            type: "select", 
            label: "Frequência desejada",
            options: ["weekly", "biweekly", "monthly", "as_needed"]
          }
        }
      }
    }
  }
};

/**
 * FUNÇÕES PRINCIPAIS DE ANAMNESE
 */

/**
 * GET /api/anamnesis/patient/:patientId
 * Obter ou criar anamnese para um paciente
 */
const getPatientAnamnesis = async (req, res) => {
  const { patientId } = req.params;
  const userId = req.userId;
  
  // Buscar anamnese existente
  let anamnesis = await Anamnesis.findByPatientId(patientId);
  
  // Se não existe, criar uma nova
  if (!anamnesis) {
    anamnesis = await Anamnesis.create({
      patient_id: patientId,
      user_id: userId,
      status: 'draft'
    });
  }
  
  // Verificar se pertence ao profissional logado
  if (anamnesis.user_id !== userId) {
    throw createAuthorizationError('Anamnese não pertence a você');
  }
  
  // Calcular progresso atual
  const completionPercentage = anamnesis.calculateCompletionPercentage();
  
  // Buscar dados do paciente para contexto
  const patient = await Patient.findByPk(patientId, {
    attributes: ['id', 'full_name', 'birth_date', 'gender']
  });
  
  res.json({
    success: true,
    message: 'Anamnese obtida com sucesso',
    data: {
      anamnesis: {
        ...anamnesis.toJSON(),
        completion_percentage: completionPercentage
      },
      patient: patient,
      templates: SECTION_TEMPLATES,
      progress: {
        completion_percentage: completionPercentage,
        is_completed: anamnesis.isCompleted(),
        missing_sections: getMissingSectionsHelper(anamnesis),
        last_modified: anamnesis.updated_at,
        auto_save_available: true
      }
    }
  });
};

/**
 * POST /api/anamnesis/patient/:patientId
 * Criar nova anamnese (força criação)
 */
const createAnamnesis = async (req, res) => {
  const { patientId } = req.params;
  const userId = req.userId;
  const initialData = req.body || {};
  
  // Verificar se já existe anamnese
  const existingAnamnesis = await Anamnesis.findByPatientId(patientId);
  if (existingAnamnesis) {
    throw new AppError('Paciente já possui anamnese. Use a rota de atualização.', 409);
  }
  
  // Criar nova anamnese
  const anamnesis = await Anamnesis.create({
    patient_id: patientId,
    user_id: userId,
    status: 'draft',
    ...initialData
  });
  
  res.status(201).json({
    success: true,
    message: 'Anamnese criada com sucesso',
    data: anamnesis,
    next_steps: {
      start_with: 'current_complaint',
      template_available: true,
      auto_save_enabled: true
    }
  });
};

/**
 * PUT /api/anamnesis/:id/section/:sectionName
 * Atualizar seção específica da anamnese
 */
const updateAnamnesisSection = async (req, res) => {
  const { id, sectionName } = req.params;
  const sectionData = req.body;
  const anamnesis = req.anamnesis; // Já validado pelo middleware
  
  // Validar nome da seção
  const validSections = [
    'identification', 'family_history', 'medical_history',
    'psychological_history', 'current_complaint', 'lifestyle',
    'relationships', 'treatment_goals'
  ];
  
  if (!validSections.includes(sectionName)) {
    throw createValidationError('sectionName', 'Nome de seção inválido');
  }
  
  // Validar dados da seção usando template
  const template = SECTION_TEMPLATES[sectionName];
  if (template) {
    const validationResult = validateSectionData(sectionData, template);
    if (!validationResult.isValid) {
      throw createValidationError('sectionData', validationResult.errors.join(', '));
    }
  }
  
  try {
    // Atualizar seção
    anamnesis[sectionName] = sectionData;
    anamnesis.last_modified_section = sectionName;
    anamnesis.status = 'in_progress';
    
    // Recalcular progresso
    const newCompletionPercentage = anamnesis.calculateCompletionPercentage();
    anamnesis.completion_percentage = newCompletionPercentage;
    
    await anamnesis.save();
    
    // Verificar se pode ser marcada como completa automaticamente
    const canComplete = anamnesis.isCompleted();
    
    res.json({
      success: true,
      message: `Seção ${sectionName} atualizada com sucesso`,
      data: {
        section_name: sectionName,
        section_data: sectionData,
        completion_percentage: newCompletionPercentage,
        can_complete: canComplete,
        status: anamnesis.status,
        updated_at: anamnesis.updated_at
      },
      progress: {
        completion_percentage: newCompletionPercentage,
        missing_sections: getMissingSectionsHelper(anamnesis),
        next_suggested_section: getNextSectionSuggestion(anamnesis, sectionName)
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar seção da anamnese:', error);
    throw new AppError('Erro interno ao atualizar seção', 500);
  }
};

/**
 * POST /api/anamnesis/:id/auto-save
 * Sistema de auto-save inteligente
 */
const autoSaveAnamnesis = async (req, res) => {
  const { id } = req.params;
  const { section, data, timestamp } = req.body;
  const anamnesis = req.anamnesis;
  
  // Verificar se dados não são muito antigos (evitar conflitos)
  const requestTime = new Date(timestamp);
  const timeDiff = new Date() - requestTime;
  
  if (timeDiff > 5 * 60 * 1000) { // 5 minutos
    return res.json({
      success: false,
      message: 'Dados muito antigos para auto-save',
      code: 'OUTDATED_DATA',
      current_data: anamnesis[section]
    });
  }
  
  // Verificar conflitos (se alguém mais modificou)
  if (anamnesis.updated_at > requestTime) {
    return res.json({
      success: false,
      message: 'Conflito detectado. Dados foram modificados por outra sessão.',
      code: 'CONFLICT_DETECTED',
      current_data: anamnesis[section],
      last_modified: anamnesis.updated_at
    });
  }
  
  try {
    // Salvar apenas se houve mudança real
    const currentData = anamnesis[section];
    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(data);
    
    if (hasChanges) {
      anamnesis[section] = data;
      anamnesis.last_modified_section = section;
      await anamnesis.updateAutoSave();
      
      res.json({
        success: true,
        message: 'Auto-save realizado com sucesso',
        data: {
          saved_at: anamnesis.last_auto_save,
          section: section,
          has_changes: true
        }
      });
    } else {
      // Apenas atualizar timestamp sem mudanças
      await anamnesis.updateAutoSave();
      
      res.json({
        success: true,
        message: 'Auto-save - sem alterações',
        data: {
          saved_at: anamnesis.last_auto_save,
          section: section,
          has_changes: false
        }
      });
    }
    
  } catch (error) {
    console.error('Erro no auto-save:', error);
    // Não falhar o auto-save - apenas log
    res.json({
      success: false,
      message: 'Erro no auto-save, dados preservados localmente',
      code: 'AUTO_SAVE_ERROR'
    });
  }
};

/**
 * POST /api/anamnesis/:id/complete
 * Finalizar anamnese
 */
const completeAnamnesis = async (req, res) => {
  const anamnesis = req.anamnesis;
  const { professional_observations, clinical_impression, initial_treatment_plan } = req.body;
  
  // Verificar se pode ser finalizada
  const completionPercentage = anamnesis.calculateCompletionPercentage();
  if (completionPercentage < 80) {
    throw createValidationError('completion', 
      `Anamnese deve estar pelo menos 80% completa. Atual: ${completionPercentage}%`);
  }
  
  try {
    // Adicionar observações profissionais
    if (professional_observations) {
      anamnesis.professional_observations = professional_observations;
    }
    if (clinical_impression) {
      anamnesis.clinical_impression = clinical_impression;
    }
    if (initial_treatment_plan) {
      anamnesis.initial_treatment_plan = initial_treatment_plan;
    }
    
    // Finalizar
    await anamnesis.markAsCompleted();
    
    res.json({
      success: true,
      message: 'Anamnese finalizada com sucesso',
      data: {
        id: anamnesis.id,
        status: anamnesis.status,
        completion_percentage: anamnesis.completion_percentage,
        completed_at: anamnesis.completed_at,
        summary: anamnesis.getSummary()
      },
      next_steps: {
        can_create_treatment_plan: true,
        can_schedule_sessions: true,
        report_available: true
      }
    });
    
  } catch (error) {
    console.error('Erro ao finalizar anamnese:', error);
    throw new AppError('Erro interno ao finalizar anamnese', 500);
  }
};

/**
 * FUNÇÕES DE LISTAGEM E CONSULTA
 */

/**
 * GET /api/anamnesis/my-anamneses
 * Listar anamneses do profissional
 */
const listMyAnamneses = async (req, res) => {
  const userId = req.userId;
  const { 
    page = 1, 
    limit = 20, 
    status = '', 
    completion_min = 0,
    completion_max = 100,
    sortBy = 'updated_at',
    order = 'DESC'
  } = req.query;
  
  // Construir filtros
  const whereConditions = { user_id: userId };
  
  if (status) {
    whereConditions.status = status;
  }
  
  if (completion_min > 0 || completion_max < 100) {
    whereConditions.completion_percentage = {
      [Op.gte]: completion_min,
      [Op.lte]: completion_max
    };
  }
  
  try {
    const { rows: anamneses, count: total } = await Anamnesis.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Patient,
        as: 'patient',
        attributes: ['id', 'full_name', 'birth_date']
      }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, order.toUpperCase()]],
      distinct: true
    });
    
    // Enriquecer dados
    const enrichedAnamneses = anamneses.map(anamnesis => {
      const anamnesisData = anamnesis.toJSON();
      return {
        ...anamnesisData,
        completion_percentage: anamnesis.calculateCompletionPercentage(),
        can_complete: anamnesis.isCompleted(),
        days_since_created: Math.floor((new Date() - new Date(anamnesis.created_at)) / (1000 * 60 * 60 * 24))
      };
    });
    
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      message: 'Anamneses listadas com sucesso',
      data: enrichedAnamneses,
      metadata: {
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: total,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        },
        filters: {
          status,
          completion_range: `${completion_min}-${completion_max}%`,
          sort_by: sortBy,
          order: order.toLowerCase()
        },
        summary: {
          total_anamneses: total,
          avg_completion: enrichedAnamneses.length > 0 
            ? Math.round(enrichedAnamneses.reduce((sum, a) => sum + a.completion_percentage, 0) / enrichedAnamneses.length)
            : 0
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar anamneses:', error);
    throw new AppError('Erro interno ao buscar anamneses', 500);
  }
};

/**
 * GET /api/anamnesis/pending
 * Anamneses pendentes (incompletas)
 */
const getPendingAnamneses = async (req, res) => {
  const userId = req.userId;
  
  try {
    const pendingAnamneses = await Anamnesis.findIncompleteByProfessional(userId);
    
    // Incluir dados do paciente
    const anamnesesWithPatients = await Promise.all(
      pendingAnamneses.map(async (anamnesis) => {
        const patient = await Patient.findByPk(anamnesis.patient_id, {
          attributes: ['id', 'full_name', 'created_at']
        });
        
        return {
          ...anamnesis.toJSON(),
          patient,
          completion_percentage: anamnesis.calculateCompletionPercentage(),
          days_pending: Math.floor((new Date() - new Date(anamnesis.created_at)) / (1000 * 60 * 60 * 24)),
          priority: calculatePriority(anamnesis)
        };
      })
    );
    
    // Ordenar por prioridade
    anamnesesWithPatients.sort((a, b) => b.priority - a.priority);
    
    res.json({
      success: true,
      message: 'Anamneses pendentes obtidas com sucesso',
      data: anamnesesWithPatients,
      metadata: {
        total_pending: anamnesesWithPatients.length,
        urgent_count: anamnesesWithPatients.filter(a => a.priority >= 8).length,
        avg_days_pending: anamnesesWithPatients.length > 0 
          ? Math.round(anamnesesWithPatients.reduce((sum, a) => sum + a.days_pending, 0) / anamnesesWithPatients.length)
          : 0
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar anamneses pendentes:', error);
    throw new AppError('Erro interno', 500);
  }
};

/**
 * GET /api/anamnesis/:id/progress
 * Obter progresso detalhado da anamnese
 */
const getAnamnesisProgress = async (req, res) => {
  const anamnesis = req.anamnesis;
  
  const completionPercentage = anamnesis.calculateCompletionPercentage();
  const sectionsProgress = getSectionsProgressHelper(anamnesis);
  const missingSections = getMissingSectionsHelper(anamnesis);
  
  res.json({
    success: true,
    message: 'Progresso obtido com sucesso',
    data: {
      overall: {
        completion_percentage: completionPercentage,
        is_completed: anamnesis.isCompleted(),
        status: anamnesis.status,
        can_complete: completionPercentage >= 80
      },
      sections: sectionsProgress,
      missing: missingSections,
      suggestions: {
        next_section: getNextSectionSuggestion(anamnesis),
        estimated_time_remaining: estimateTimeRemaining(anamnesis),
        priority_sections: getPrioritySections(anamnesis)
      },
      timeline: {
        created_at: anamnesis.created_at,
        last_modified: anamnesis.updated_at,
        last_auto_save: anamnesis.last_auto_save,
        days_in_progress: Math.floor((new Date() - new Date(anamnesis.created_at)) / (1000 * 60 * 60 * 24))
      }
    }
  });
};

/**
 * GET /api/anamnesis/templates/section/:sectionName
 * Obter template de uma seção
 */
const getSectionTemplate = async (req, res) => {
  const { sectionName } = req.params;
  
  const template = SECTION_TEMPLATES[sectionName];
  if (!template) {
    throw createNotFoundError('Template de seção não encontrado');
  }
  
  // Enriquecer template com exemplos e dicas
  const enrichedTemplate = {
    ...template,
    examples: getTemplateExamples(sectionName),
    tips: getTemplateTips(sectionName),
    estimated_time: getEstimatedSectionTime(sectionName),
    importance_level: getSectionImportance(sectionName)
  };
  
  res.json({
    success: true,
    message: 'Template obtido com sucesso',
    data: enrichedTemplate
  });
};

/**
 * GET /api/anamnesis/suggestions/:patientId
 * Sugestões inteligentes baseadas no paciente
 */
const getSmartSuggestions = async (req, res) => {
  const { patientId } = req.params;
  
  // Buscar dados do paciente
  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    throw createNotFoundError('Paciente não encontrado');
  }
  
  // Gerar sugestões baseadas no perfil
  const suggestions = generateSmartSuggestions(patient);
  
  res.json({
    success: true,
    message: 'Sugestões geradas com sucesso',
    data: {
      patient_profile: {
        age: patient.getAge(),
        gender: patient.gender,
        has_medical_history: !!patient.medical_history
      },
      suggestions: suggestions,
      recommended_focus: getRecommendedFocus(patient),
      alert_sections: getAlertSections(patient)
    }
  });
};

/**
 * FUNÇÕES AUXILIARES E HELPERS
 */

/**
 * Validar dados de uma seção usando seu template
 */
const validateSectionData = (data, template) => {
  const errors = [];
  
  if (!template.fields) {
    return { isValid: true, errors: [] };
  }
  
  // Validar campos obrigatórios
  Object.entries(template.fields).forEach(([fieldName, fieldConfig]) => {
    if (fieldConfig.required && (!data[fieldName] || data[fieldName] === '')) {
      errors.push(`Campo obrigatório: ${fieldConfig.label || fieldName}`);
    }
    
    // Validações específicas por tipo
    if (data[fieldName] !== undefined && data[fieldName] !== null) {
      const value = data[fieldName];
      
      switch (fieldConfig.type) {
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`${fieldConfig.label} deve ser um número`);
          } else {
            if (fieldConfig.min && value < fieldConfig.min) {
              errors.push(`${fieldConfig.label} deve ser pelo menos ${fieldConfig.min}`);
            }
            if (fieldConfig.max && value > fieldConfig.max) {
              errors.push(`${fieldConfig.label} deve ser no máximo ${fieldConfig.max}`);
            }
          }
          break;
          
        case 'select':
          if (fieldConfig.options && !fieldConfig.options.includes(value)) {
            errors.push(`${fieldConfig.label} deve ser uma das opções válidas`);
          }
          break;
          
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${fieldConfig.label} deve ser uma lista`);
          } else {
            if (fieldConfig.min_items && value.length < fieldConfig.min_items) {
              errors.push(`${fieldConfig.label} deve ter pelo menos ${fieldConfig.min_items} item(ns)`);
            }
          }
          break;
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obter seções que ainda precisam ser preenchidas
 */
const getMissingSectionsHelper = (anamnesis) => {
  const allSections = [
    'identification', 'family_history', 'medical_history',
    'psychological_history', 'current_complaint', 'lifestyle',
    'relationships', 'treatment_goals'
  ];
  
  return allSections.filter(section => {
    const sectionData = anamnesis[section];
    if (!sectionData || Object.keys(sectionData).length === 0) {
      return true;
    }
    
    // Verificar se tem conteúdo significativo
    const hasSignificantContent = Object.values(sectionData).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    });
    
    return !hasSignificantContent;
  }).map(section => ({
    section,
    title: SECTION_TEMPLATES[section]?.title || section,
    required: SECTION_TEMPLATES[section]?.required || false,
    estimated_time: getEstimatedSectionTime(section)
  }));
};

/**
 * Obter progresso detalhado por seção
 */
const getSectionsProgressHelper = (anamnesis) => {
  const sections = [
    'identification', 'family_history', 'medical_history',
    'psychological_history', 'current_complaint', 'lifestyle',
    'relationships', 'treatment_goals'
  ];
  
  return sections.map(section => {
    const sectionData = anamnesis[section];
    const template = SECTION_TEMPLATES[section];
    
    let completion = 0;
    if (sectionData && Object.keys(sectionData).length > 0) {
      // Calcular completude baseada nos campos do template
      if (template && template.fields) {
        const totalFields = Object.keys(template.fields).length;
        const filledFields = Object.keys(template.fields).filter(field => {
          const value = sectionData[field];
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
          return value !== null && value !== undefined && value !== '';
        }).length;
        
        completion = Math.round((filledFields / totalFields) * 100);
      } else {
        completion = Object.keys(sectionData).length > 0 ? 50 : 0;
      }
    }
    
    return {
      section,
      title: template?.title || section,
      completion_percentage: completion,
      is_complete: completion >= 80,
      required: template?.required || false,
      last_modified: anamnesis.last_modified_section === section ? anamnesis.updated_at : null
    };
  });
};

/**
 * Sugerir próxima seção a ser preenchida
 */
const getNextSectionSuggestion = (anamnesis, currentSection = null) => {
  // Ordem lógica de preenchimento
  const recommendedOrder = [
    'current_complaint',
    'treatment_goals', 
    'medical_history',
    'psychological_history',
    'identification',
    'lifestyle',
    'relationships',
    'family_history'
  ];
  
  const missingSections = getMissingSectionsHelper(anamnesis).map(s => s.section);
  
  // Se estamos preenchendo uma seção, sugerir a próxima na ordem
  if (currentSection) {
    const currentIndex = recommendedOrder.indexOf(currentSection);
    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < recommendedOrder.length; i++) {
        if (missingSections.includes(recommendedOrder[i])) {
          return recommendedOrder[i];
        }
      }
    }
  }
  
  // Retornar primeira seção faltante na ordem recomendada
  return recommendedOrder.find(section => missingSections.includes(section)) || null;
};

/**
 * Calcular prioridade de uma anamnese pendente
 */
const calculatePriority = (anamnesis) => {
  let priority = 5; // Base
  
  // Mais antiga = maior prioridade
  const daysOld = Math.floor((new Date() - new Date(anamnesis.created_at)) / (1000 * 60 * 60 * 24));
  if (daysOld > 7) priority += 2;
  if (daysOld > 14) priority += 2;
  
  // Mais completa = menor prioridade (pode esperar um pouco)
  const completion = anamnesis.calculateCompletionPercentage();
  if (completion > 50) priority -= 1;
  if (completion > 70) priority -= 1;
  
  // Seções importantes preenchidas = menor prioridade
  if (anamnesis.current_complaint && Object.keys(anamnesis.current_complaint).length > 0) {
    priority -= 1;
  }
  
  return Math.max(1, Math.min(10, priority));
};

/**
 * Estimar tempo restante para completar anamnese
 */
const estimateTimeRemaining = (anamnesis) => {
  const completion = anamnesis.calculateCompletionPercentage();
  const missingSections = getMissingSectionsHelper(anamnesis);
  
  // Tempo base por seção (em minutos)
  const sectionTimes = {
    'current_complaint': 10,
    'treatment_goals': 5,
    'medical_history': 8,
    'psychological_history': 10,
    'identification': 5,
    'lifestyle': 7,
    'relationships': 6,
    'family_history': 8
  };
  
  const totalTime = missingSections.reduce((sum, section) => {
    return sum + (sectionTimes[section.section] || 5);
  }, 0);
  
  return {
    estimated_minutes: totalTime,
    estimated_display: totalTime < 60 
      ? `${totalTime} minutos`
      : `${Math.floor(totalTime / 60)}h ${totalTime % 60}min`
  };
};

/**
 * Obter seções prioritárias baseadas no paciente
 */
const getPrioritySections = (anamnesis) => {
  const priorities = [];
  
  // Queixa principal sempre prioritária se vazia
  if (!anamnesis.current_complaint || Object.keys(anamnesis.current_complaint).length === 0) {
    priorities.push({
      section: 'current_complaint',
      reason: 'Essencial para entender o motivo da consulta',
      urgency: 'high'
    });
  }
  
  // Objetivos importantes para direcionar tratamento
  if (!anamnesis.treatment_goals || Object.keys(anamnesis.treatment_goals).length === 0) {
    priorities.push({
      section: 'treatment_goals',
      reason: 'Define direção do tratamento',
      urgency: 'high'
    });
  }
  
  return priorities;
};

// Continua na próxima parte...
const getTemplateExamples = (sectionName) => {
  const examples = {
    current_complaint: {
      main_complaint: "Sinto muita ansiedade antes de apresentações no trabalho",
      onset: {
        when: "Há 6 meses",
        trigger: "Promoção para cargo de liderança"
      },
      symptoms: [
        {
          symptom: "palpitações",
          frequency: "sempre que preciso apresentar",
          intensity: 8,
          situations: ["reuniões com diretoria", "apresentações públicas"]
        }
      ]
    },
    treatment_goals: {
      patient_goals: [
        "Reduzir ansiedade em situações profissionais",
        "Melhorar confiança para falar em público",
        "Desenvolver técnicas de relaxamento"
      ],
      expectations: {
        treatment_duration: "6_months",
        session_frequency: "weekly"
      }
    }
  };
  
  return examples[sectionName] || {};
};

const getTemplateTips = (sectionName) => {
  const tips = {
    current_complaint: [
      "Seja específico sobre quando e onde os sintomas ocorrem",
      "Descreva o impacto na vida diária do paciente",
      "Pergunte sobre fatores que melhoram ou pioram"
    ],
    treatment_goals: [
      "Objetivos devem ser específicos e mensuráveis",
      "Considere metas de curto e longo prazo",
      "Alinhe expectativas sobre tempo de tratamento"
    ],
    medical_history: [
      "Include histórico de medicações psiquiátricas",
      "Pergunte sobre internações e tratamentos anteriores",
      "Considere condições que podem afetar humor/comportamento"
    ]
  };
  
  return tips[sectionName] || [];
};

const getEstimatedSectionTime = (sectionName) => {
  const times = {
    'current_complaint': 10,
    'treatment_goals': 5,
    'medical_history': 8,
    'psychological_history': 10,
    'identification': 5,
    'lifestyle': 7,
    'relationships': 6,
    'family_history': 8
  };
  
  return times[sectionName] || 5;
};

const getSectionImportance = (sectionName) => {
  const importance = {
    'current_complaint': 'critical',
    'treatment_goals': 'critical',
    'medical_history': 'high',
    'psychological_history': 'high',
    'lifestyle': 'medium',
    'identification': 'medium',
    'relationships': 'medium',
    'family_history': 'low'
  };
  
  return importance[sectionName] || 'medium';
};

// Exportar funções implementadas
module.exports = {
  // Principais
  getPatientAnamnesis,
  createAnamnesis,
  updateAnamnesisSection,
  autoSaveAnamnesis,
  completeAnamnesis,
  
  // Listagem
  listMyAnamneses,
  getPendingAnamneses,
  
  // Progresso e templates
  getAnamnesisProgress,
  getSectionTemplate,
  getSmartSuggestions,
  
  // Implementações básicas para outras funções (serão expandidas)
  getCompletedAnamneses: async (req, res) => {
    res.json({ success: true, message: 'Em implementação', data: [] });
  },
  
  getAnamnesisSummary: async (req, res) => {
    const anamnesis = req.anamnesis;
    res.json({ 
      success: true, 
      data: anamnesis.getSummary() 
    });
  },
  
  validateSectionOnly: async (req, res) => {
    const { sectionName } = req.params;
    const sectionData = req.body;
    
    const template = SECTION_TEMPLATES[sectionName];
    if (!template) {
      throw createNotFoundError('Template não encontrado');
    }
    
    const validation = validateSectionData(sectionData, template);
    
    res.json({
      success: true,
      data: {
        is_valid: validation.isValid,
        errors: validation.errors,
        section: sectionName
      }
    });
  },
  
  getMissingSections: async (req, res) => {
    const anamnesis = req.anamnesis;
    const missing = getMissingSectionsHelper(anamnesis);
    
    res.json({
      success: true,
      data: {
        missing_sections: missing,
        total_missing: missing.length,
        completion_percentage: anamnesis.calculateCompletionPercentage()
      }
    });
  },
  
  // TODO: Implementar nas próximas etapas
  generateAnamnesisReport: async (req, res) => {
    res.json({ success: true, message: 'Relatório em implementação' });
  },
  
  exportAnamnesis: async (req, res) => {
    res.json({ success: true, message: 'Export em implementação' });
  },
  
  generateInsights: async (req, res) => {
    res.json({ success: true, message: 'Insights em implementação' });
  },
  
  getAnamnesisHistory: async (req, res) => {
    res.json({ success: true, message: 'Histórico em implementação' });
  },
  
  createRevision: async (req, res) => {
    res.json({ success: true, message: 'Revisão em implementação' });
  },
  
  addComment: async (req, res) => {
    res.json({ success: true, message: 'Comentários em implementação' });
  },
  
  getComments: async (req, res) => {
    res.json({ success: true, message: 'Comentários em implementação' });
  },
  
  getMyAnamnesisStats: async (req, res) => {
    res.json({ success: true, message: 'Estatísticas em implementação' });
  },
  
  getCompletionTrends: async (req, res) => {
    res.json({ success: true, message: 'Tendências em implementação' });
  },
  
  getAdminOverview: async (req, res) => {
    res.json({ success: true, message: 'Overview admin em implementação' });
  },
  
  updateSectionTemplate: async (req, res) => {
    res.json({ success: true, message: 'Update template em implementação' });
  },
  
  createBackup: async (req, res) => {
    res.json({ success: true, message: 'Backup em implementação' });
  },
  
  restoreFromBackup: async (req, res) => {
    res.json({ success: true, message: 'Restore em implementação' });
  },
  
  debugAnamnesisStructure: async (req, res) => {
    const anamnesis = req.anamnesis;
    res.json({
      success: true,
      data: {
        structure: anamnesis.toJSON(),
        templates: SECTION_TEMPLATES,
        progress: getSectionsProgressHelper(anamnesis)
      }
    });
  },
  
  populateSampleData: async (req, res) => {
    res.json({ success: true, message: 'Sample data em implementação' });
  }
};

// Função auxiliar para gerar sugestões inteligentes
const generateSmartSuggestions = (patient) => {
  const suggestions = [];
  const age = patient.getAge();
  
  // Sugestões baseadas na idade
  if (age && age < 18) {
    suggestions.push({
      type: 'age_specific',
      message: 'Paciente menor de idade - considere dinâmica familiar e escolar',
      sections: ['family_history', 'identification'],
      priority: 'high'
    });
  }
  
  if (age && age > 65) {
    suggestions.push({
      type: 'age_specific',
      message: 'Paciente idoso - atenção especial ao histórico médico e medicações',
      sections: ['medical_history', 'lifestyle'],
      priority: 'high'
    });
  }
  
  // Sugestões baseadas no gênero
  if (patient.gender === 'female') {
    suggestions.push({
      type: 'gender_specific',
      message: 'Considere questões específicas do gênero feminino',
      sections: ['medical_history', 'lifestyle'],
      priority: 'medium'
    });
  }
  
  return suggestions;
};

const getRecommendedFocus = (patient) => {
  const focuses = [];
  const age = patient.getAge();
  
  if (age && age < 25) {
    focuses.push('Desenvolvimento de identidade e autonomia');
  } else if (age && age > 50) {
    focuses.push('Questões de meia-idade e transições de vida');
  }
  
  if (patient.medical_history) {
    focuses.push('Interface psicossomática');
  }
  
  return focuses;
};

const getAlertSections = (patient) => {
  const alerts = [];
  
  if (patient.medical_history) {
    alerts.push({
      section: 'medical_history',
      reason: 'Paciente possui histórico médico',
      action: 'Investigar possível interface psicossomática'
    });
  }
  
  return alerts;
};