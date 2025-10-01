/**
 * MÓDULA - HELPERS DE EVOLUÇÃO CLÍNICA
 * 
 * Utilitários para registro, formatação e análise de evolução de sessões clínicas.
 * Sistema profissional de templates e sugestões para documentação clínica.
 * 
 * Funcionalidades implementadas:
 * - Templates por tipo de sessão
 * - Sugestões de intervenções por abordagem terapêutica
 * - Formatação de notas clínicas
 * - Validação de completude de evolução
 * - Análise de progresso temporal
 * - Geração de relatórios de evolução
 * 
 * Recursos especiais:
 * - Templates dinâmicos por especialidade
 * - Banco de intervenções categorizadas
 * - Análise de tendências de progresso
 * - Identificação de marcos terapêuticos
 * - Sugestões contextuais baseadas em histórico
 */

// ============================================
// TEMPLATES DE EVOLUÇÃO
// ============================================

/**
 * Templates base por tipo de sessão
 */
const EVOLUTION_TEMPLATES = {
  first_consultation: {
    sections: [
      'Motivo da consulta',
      'História atual da queixa',
      'Expectativas do paciente',
      'Impressão clínica inicial',
      'Plano terapêutico proposto'
    ],
    suggested_topics: [
      'Apresentação e rapport',
      'Escuta ativa',
      'Anamnese inicial',
      'Contrato terapêutico',
      'Definição de objetivos'
    ]
  },
  
  therapy_session: {
    sections: [
      'Estado atual do paciente',
      'Temas abordados na sessão',
      'Intervenções realizadas',
      'Resposta às intervenções',
      'Tarefas propostas',
      'Planejamento próxima sessão'
    ],
    suggested_topics: [
      'Revisão de tarefas anteriores',
      'Processamento emocional',
      'Identificação de padrões',
      'Desenvolvimento de estratégias',
      'Prática de habilidades'
    ]
  },
  
  evaluation: {
    sections: [
      'Objetivo da avaliação',
      'Instrumentos utilizados',
      'Observações comportamentais',
      'Resultados obtidos',
      'Hipóteses diagnósticas',
      'Recomendações'
    ],
    suggested_topics: [
      'Avaliação psicológica',
      'Testagem',
      'Observação clínica',
      'Análise funcional',
      'Formulação de caso'
    ]
  },
  
  follow_up: {
    sections: [
      'Evolução desde última sessão',
      'Cumprimento de tarefas',
      'Mudanças observadas',
      'Ajustes no plano terapêutico',
      'Próximos passos'
    ],
    suggested_topics: [
      'Revisão de progresso',
      'Consolidação de ganhos',
      'Manutenção de mudanças',
      'Prevenção de recaídas'
    ]
  },
  
  emergency: {
    sections: [
      'Situação de crise apresentada',
      'Avaliação de risco',
      'Intervenções de estabilização',
      'Rede de apoio acionada',
      'Encaminhamentos realizados',
      'Plano de segurança'
    ],
    suggested_topics: [
      'Manejo de crise',
      'Avaliação de risco suicida',
      'Contenção emocional',
      'Acionamento de rede',
      'Plano de segurança'
    ]
  },
  
  discharge: {
    sections: [
      'Motivo da alta',
      'Objetivos alcançados',
      'Evolução durante tratamento',
      'Recomendações pós-alta',
      'Orientações de manutenção',
      'Encaminhamentos se necessário'
    ],
    suggested_topics: [
      'Revisão do processo terapêutico',
      'Conquistas e aprendizados',
      'Estratégias de manutenção',
      'Prevenção de recaídas',
      'Autonomia do paciente'
    ]
  }
};

/**
 * Obter template por tipo de sessão
 */
const getEvolutionTemplate = (sessionType) => {
  return EVOLUTION_TEMPLATES[sessionType] || EVOLUTION_TEMPLATES.therapy_session;
};

// ============================================
// BANCO DE INTERVENÇÕES
// ============================================

/**
 * Intervenções categorizadas por abordagem
 */
const INTERVENTIONS_LIBRARY = {
  cognitive_behavioral: [
    'Reestruturação cognitiva',
    'Identificação de pensamentos automáticos',
    'Registro de pensamentos',
    'Questionamento socrático',
    'Experimentos comportamentais',
    'Exposição gradual',
    'Técnicas de relaxamento',
    'Treino de habilidades sociais',
    'Resolução de problemas',
    'Ativação comportamental'
  ],
  
  psychodynamic: [
    'Análise de transferência',
    'Interpretação de conteúdo inconsciente',
    'Exploração de conflitos internos',
    'Associação livre',
    'Análise de sonhos',
    'Exploração de padrões relacionais',
    'Insight sobre defesas',
    'Elaboração de perdas'
  ],
  
  humanistic: [
    'Escuta empática',
    'Reflexão de sentimentos',
    'Clarificação',
    'Confrontação gentil',
    'Facilitação da auto-exploração',
    'Validação emocional',
    'Foco no aqui e agora',
    'Exploração do self'
  ],
  
  systemic: [
    'Genograma familiar',
    'Análise de padrões de comunicação',
    'Reframing',
    'Prescrição de tarefas familiares',
    'Circularidade',
    'Questionamento circular',
    'Hipóteses sistêmicas'
  ],
  
  mindfulness: [
    'Meditação guiada',
    'Atenção plena à respiração',
    'Body scan',
    'Observação de pensamentos',
    'Aceitação radical',
    'Defusão cognitiva',
    'Prática de gratidão'
  ],
  
  common: [
    'Psicoeducação',
    'Validação emocional',
    'Estabelecimento de rapport',
    'Escuta ativa',
    'Normalização de experiências',
    'Reforço positivo',
    'Estabelecimento de metas',
    'Planejamento de ações'
  ]
};

/**
 * Sugerir intervenções baseadas em contexto
 */
const suggestInterventions = (context = {}) => {
  const { approach = 'common', issue_type, previous_interventions = [] } = context;
  
  let suggestions = INTERVENTIONS_LIBRARY[approach] || INTERVENTIONS_LIBRARY.common;
  
  // Filtrar intervenções já utilizadas recentemente
  if (previous_interventions.length > 0) {
    suggestions = suggestions.filter(i => 
      !previous_interventions.includes(i)
    );
  }
  
  // Adicionar algumas intervenções comuns
  const commonSuggestions = INTERVENTIONS_LIBRARY.common
    .filter(i => !previous_interventions.includes(i))
    .slice(0, 3);
  
  return {
    primary: suggestions.slice(0, 5),
    common: commonSuggestions,
    all_available: [...suggestions, ...commonSuggestions]
  };
};

// ============================================
// FORMATAÇÃO DE EVOLUÇÃO
// ============================================

/**
 * Formatar evolução para exibição
 */
const formatEvolution = (session) => {
  if (!session || !session.session_notes) {
    return null;
  }
  
  return {
    session_info: {
      number: session.session_number,
      date: session.session_date,
      type: session.session_type,
      duration_planned: session.duration_minutes,
      duration_actual: session.actual_duration_minutes
    },
    
    clinical_data: {
      notes: session.session_notes,
      mood: session.patient_mood,
      topics: session.main_topics || [],
      interventions: session.interventions_used || [],
      homework: session.homework_assigned
    },
    
    assessment: {
      progress: session.progress_assessment,
      engagement: session.patient_engagement,
      adherence: session.treatment_adherence
    },
    
    planning: {
      next_goals: session.next_session_goals,
      plan_updates: session.treatment_plan_updates,
      next_appointment: session.next_appointment
    }
  };
};

/**
 * Gerar resumo executivo da evolução
 */
const generateExecutiveSummary = (session) => {
  const summary = [];
  
  // Resumo básico
  summary.push(`Sessão ${session.session_number} - ${session.session_type}`);
  
  // Humor/estado
  if (session.patient_mood) {
    summary.push(`Estado: ${session.patient_mood}`);
  }
  
  // Progresso
  if (session.progress_assessment) {
    const progressLabels = {
      improved: 'Melhora identificada',
      stable: 'Quadro estável',
      worsened: 'Piora observada',
      no_change: 'Sem mudanças significativas'
    };
    summary.push(progressLabels[session.progress_assessment]);
  }
  
  // Engajamento
  if (session.patient_engagement) {
    summary.push(`Engajamento: ${session.patient_engagement}/10`);
  }
  
  // Tópicos principais
  if (session.main_topics && session.main_topics.length > 0) {
    summary.push(`Temas: ${session.main_topics.slice(0, 3).join(', ')}`);
  }
  
  return summary.join(' | ');
};

/**
 * Validar completude da evolução
 */
const validateEvolutionCompleteness = (evolutionData) => {
  const required = {
    session_notes: 'Notas da sessão são obrigatórias',
    main_topics: 'Pelo menos um tópico principal deve ser informado',
    progress_assessment: 'Avaliação de progresso é obrigatória'
  };
  
  const optional = {
    patient_mood: 'Humor do paciente',
    interventions_used: 'Intervenções utilizadas',
    homework_assigned: 'Tarefas propostas',
    patient_engagement: 'Engajamento do paciente',
    treatment_adherence: 'Adesão ao tratamento',
    next_session_goals: 'Objetivos para próxima sessão'
  };
  
  const missing = [];
  const present = [];
  
  // Verificar campos obrigatórios
  Object.entries(required).forEach(([field, label]) => {
    if (!evolutionData[field] || 
        (Array.isArray(evolutionData[field]) && evolutionData[field].length === 0)) {
      missing.push({ field, label, required: true });
    } else {
      present.push(field);
    }
  });
  
  // Verificar campos opcionais
  Object.entries(optional).forEach(([field, label]) => {
    if (!evolutionData[field] || 
        (Array.isArray(evolutionData[field]) && evolutionData[field].length === 0)) {
      missing.push({ field, label, required: false });
    } else {
      present.push(field);
    }
  });
  
  const completeness = (present.length / (Object.keys(required).length + Object.keys(optional).length)) * 100;
  
  return {
    is_complete: missing.filter(m => m.required).length === 0,
    completeness_percentage: completeness.toFixed(2),
    missing_required: missing.filter(m => m.required),
    missing_optional: missing.filter(m => !m.required),
    filled_fields: present.length,
    total_fields: Object.keys(required).length + Object.keys(optional).length
  };
};

// ============================================
// ANÁLISE DE PROGRESSO
// ============================================

/**
 * Analisar tendência de progresso
 */
const analyzeProgressTrend = (sessions) => {
  if (sessions.length < 2) {
    return {
      trend: 'insufficient_data',
      message: 'Dados insuficientes para análise de tendência'
    };
  }
  
  // Filtrar sessões com avaliação de progresso
  const sessionsWithProgress = sessions.filter(s => s.progress_assessment);
  
  if (sessionsWithProgress.length < 2) {
    return {
      trend: 'insufficient_data',
      message: 'Avaliações de progresso insuficientes'
    };
  }
  
  // Mapear para valores numéricos
  const progressValues = {
    worsened: -1,
    no_change: 0,
    stable: 0,
    improved: 1
  };
  
  const values = sessionsWithProgress.map(s => progressValues[s.progress_assessment] || 0);
  
  // Calcular média móvel
  const recentAvg = values.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, values.length);
  const overallAvg = values.reduce((a, b) => a + b, 0) / values.length;
  
  let trend;
  if (recentAvg > 0.5) trend = 'positive';
  else if (recentAvg < -0.5) trend = 'negative';
  else if (Math.abs(recentAvg) <= 0.2) trend = 'stable';
  else trend = 'fluctuating';
  
  // Contar padrões
  const improved = values.filter(v => v > 0).length;
  const worsened = values.filter(v => v < 0).length;
  const stable = values.filter(v => v === 0).length;
  
  return {
    trend,
    recent_average: recentAvg.toFixed(2),
    overall_average: overallAvg.toFixed(2),
    distribution: {
      improved,
      worsened,
      stable,
      total: values.length
    },
    improvement_rate: ((improved / values.length) * 100).toFixed(2)
  };
};

/**
 * Identificar marcos terapêuticos
 */
const identifyMilestones = (sessions) => {
  const milestones = [];
  
  sessions.forEach((session, index) => {
    // Primeira sessão
    if (index === 0) {
      milestones.push({
        type: 'first_session',
        session_number: session.session_number,
        date: session.session_date,
        description: 'Início do acompanhamento'
      });
    }
    
    // Primeira melhora significativa
    if (index > 0 && session.progress_assessment === 'improved') {
      const previousSession = sessions[index - 1];
      if (previousSession.progress_assessment !== 'improved') {
        milestones.push({
          type: 'first_improvement',
          session_number: session.session_number,
          date: session.session_date,
          description: 'Primeira melhora significativa identificada'
        });
      }
    }
    
    // Engajamento alto consistente
    if (session.patient_engagement >= 8 && index >= 2) {
      const lastTwo = sessions.slice(index - 2, index);
      if (lastTwo.every(s => s.patient_engagement >= 8)) {
        milestones.push({
          type: 'high_engagement',
          session_number: session.session_number,
          date: session.session_date,
          description: 'Engajamento consistentemente alto'
        });
      }
    }
    
    // Marco de 10 sessões
    if (session.session_number === 10) {
      milestones.push({
        type: 'session_milestone',
        session_number: session.session_number,
        date: session.session_date,
        description: 'Marco de 10 sessões completadas'
      });
    }
    
    // Alta terapêutica
    if (session.session_type === 'discharge') {
      milestones.push({
        type: 'discharge',
        session_number: session.session_number,
        date: session.session_date,
        description: 'Alta terapêutica'
      });
    }
  });
  
  return milestones;
};

/**
 * Calcular engajamento médio por período
 */
const calculateEngagementByPeriod = (sessions) => {
  const sessionsByPeriod = {
    initial: sessions.slice(0, 5),
    middle: sessions.slice(5, sessions.length - 5),
    recent: sessions.slice(-5)
  };
  
  const calculateAvg = (sessionList) => {
    const withEngagement = sessionList.filter(s => s.patient_engagement);
    if (withEngagement.length === 0) return null;
    
    const sum = withEngagement.reduce((a, s) => a + s.patient_engagement, 0);
    return (sum / withEngagement.length).toFixed(2);
  };
  
  return {
    initial: calculateAvg(sessionsByPeriod.initial),
    middle: sessionsByPeriod.middle.length > 0 ? calculateAvg(sessionsByPeriod.middle) : null,
    recent: calculateAvg(sessionsByPeriod.recent),
    overall: calculateAvg(sessions)
  };
};

// ============================================
// GERAÇÃO DE RELATÓRIOS
// ============================================

/**
 * Gerar relatório completo de evolução
 */
const generateEvolutionReport = (patient, sessions) => {
  const completedSessions = sessions.filter(s => s.status === 'completed');
  
  return {
    patient_info: {
      id: patient.id,
      name: patient.full_name,
      total_sessions: completedSessions.length,
      first_session: completedSessions[0]?.session_date,
      last_session: completedSessions[completedSessions.length - 1]?.session_date
    },
    
    progress_analysis: analyzeProgressTrend(completedSessions),
    
    engagement_analysis: calculateEngagementByPeriod(completedSessions),
    
    milestones: identifyMilestones(completedSessions),
    
    session_summary: completedSessions.map(s => ({
      number: s.session_number,
      date: s.session_date,
      type: s.session_type,
      progress: s.progress_assessment,
      engagement: s.patient_engagement,
      summary: generateExecutiveSummary(s)
    })),
    
    most_used_interventions: getMostUsedInterventions(completedSessions),
    
    main_themes: getMainThemes(completedSessions)
  };
};

/**
 * Obter intervenções mais utilizadas
 */
const getMostUsedInterventions = (sessions) => {
  const interventionCount = {};
  
  sessions.forEach(s => {
    if (s.interventions_used && Array.isArray(s.interventions_used)) {
      s.interventions_used.forEach(intervention => {
        interventionCount[intervention] = (interventionCount[intervention] || 0) + 1;
      });
    }
  });
  
  return Object.entries(interventionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([intervention, count]) => ({ intervention, count }));
};

/**
 * Obter temas principais abordados
 */
const getMainThemes = (sessions) => {
  const themeCount = {};
  
  sessions.forEach(s => {
    if (s.main_topics && Array.isArray(s.main_topics)) {
      s.main_topics.forEach(topic => {
        themeCount[topic] = (themeCount[topic] || 0) + 1;
      });
    }
  });
  
  return Object.entries(themeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([theme, count]) => ({ theme, count }));
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Templates
  EVOLUTION_TEMPLATES,
  getEvolutionTemplate,
  
  // Intervenções
  INTERVENTIONS_LIBRARY,
  suggestInterventions,
  
  // Formatação
  formatEvolution,
  generateExecutiveSummary,
  validateEvolutionCompleteness,
  
  // Análise
  analyzeProgressTrend,
  identifyMilestones,
  calculateEngagementByPeriod,
  
  // Relatórios
  generateEvolutionReport,
  getMostUsedInterventions,
  getMainThemes
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. OBTER TEMPLATE:
 *    const template = getEvolutionTemplate('therapy_session');
 *    // Retorna seções e tópicos sugeridos
 * 
 * 2. SUGERIR INTERVENÇÕES:
 *    const suggestions = suggestInterventions({
 *      approach: 'cognitive_behavioral',
 *      previous_interventions: ['Reestruturação cognitiva']
 *    });
 * 
 * 3. VALIDAR COMPLETUDE:
 *    const validation = validateEvolutionCompleteness(evolutionData);
 *    // { is_complete, completeness_percentage, missing_required }
 * 
 * 4. ANALISAR PROGRESSO:
 *    const trend = analyzeProgressTrend(sessions);
 *    // { trend: 'positive', improvement_rate: '75.00' }
 * 
 * 5. GERAR RELATÓRIO:
 *    const report = generateEvolutionReport(patient, sessions);
 *    // Relatório completo com todas as análises
 * 
 * INTEGRAÇÃO NO CONTROLLER:
 * 
 * const evolutionHelpers = require('../utils/evolutionHelpers');
 * 
 * const recordEvolution = async (req, res) => {
 *   // Validar completude
 *   const validation = evolutionHelpers.validateEvolutionCompleteness(req.body);
 *   
 *   if (!validation.is_complete) {
 *     return res.status(400).json({
 *       message: 'Campos obrigatórios faltando',
 *       missing: validation.missing_required
 *     });
 *   }
 *   
 *   // Sugerir intervenções para próxima sessão
 *   const suggestions = evolutionHelpers.suggestInterventions({
 *     approach: 'cognitive_behavioral',
 *     previous_interventions: req.body.interventions_used
 *   });
 *   
 *   // Salvar e retornar com sugestões
 *   const session = await Session.create(evolutionData);
 *   
 *   res.json({
 *     success: true,
 *     data: session,
 *     suggestions_next_session: suggestions.primary
 *   });
 * };
 */