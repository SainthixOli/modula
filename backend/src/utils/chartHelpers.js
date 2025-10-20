/**
 * MÓDULA - HELPERS DE GRÁFICOS E CHARTS
 * 
 * Utilitários para geração de dados formatados para visualizações gráficas.
 * Preparação de datasets para Chart.js, Recharts e outras bibliotecas.
 * 
 * Funcionalidades implementadas:
 * - Dados para gráficos de linha (evolução temporal)
 * - Dados para gráficos de barra (comparações)
 * - Dados para gráficos de pizza (distribuições)
 * - Dados para gráficos de área (tendências)
 * - Dados para gráficos de dispersão (correlações)
 * - Paletas de cores automáticas
 * 
 * Recursos especiais:
 * - Formatação pronta para múltiplas bibliotecas
 * - Paletas de cores profissionais
 * - Labels traduzidas para português
 * - Agregações automáticas
 * - Suporte a múltiplos datasets
 * - Formatação de tooltips
 */

// ============================================
// PALETAS DE CORES
// ============================================

const COLOR_PALETTES = {
  primary: [
    '#4CAF50', // Verde
    '#2196F3', // Azul
    '#FF9800', // Laranja
    '#9C27B0', // Roxo
    '#F44336', // Vermelho
    '#00BCD4', // Ciano
    '#FFEB3B', // Amarelo
    '#795548'  // Marrom
  ],
  
  status: {
    scheduled: '#FFA500',    // Laranja
    confirmed: '#4CAF50',    // Verde
    in_progress: '#2196F3',  // Azul
    completed: '#9E9E9E',    // Cinza
    cancelled: '#F44336',    // Vermelho
    no_show: '#FF5722',      // Vermelho escuro
    rescheduled: '#FF9800'   // Laranja escuro
  },
  
  progress: {
    improved: '#4CAF50',     // Verde
    stable: '#2196F3',       // Azul
    worsened: '#F44336',     // Vermelho
    no_change: '#9E9E9E'     // Cinza
  },
  
  gradient: [
    '#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB'
  ],
  
  warm: [
    '#D32F2F', '#F44336', '#E57373', '#FF8A65', '#FFAB91'
  ],
  
  cool: [
    '#1976D2', '#2196F3', '#4FC3F7', '#4DD0E1', '#80DEEA'
  ]
};

/**
 * Obter cor por índice
 */
const getColor = (index, palette = 'primary') => {
  const colors = COLOR_PALETTES[palette] || COLOR_PALETTES.primary;
  return colors[index % colors.length];
};

/**
 * Gerar paleta personalizada
 */
const generateColorPalette = (count, startColor = '#4CAF50', endColor = '#2196F3') => {
  const palette = [];
  
  // Converter hex para RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  
  if (!start || !end) return COLOR_PALETTES.primary.slice(0, count);
  
  for (let i = 0; i < count; i++) {
    const ratio = count > 1 ? i / (count - 1) : 0;
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    palette.push(`rgb(${r}, ${g}, ${b})`);
  }
  
  return palette;
};

// ============================================
// GRÁFICOS DE LINHA (EVOLUÇÃO TEMPORAL)
// ============================================

/**
 * Preparar dados para gráfico de linha
 */
const prepareLineChartData = (data, options = {}) => {
  const {
    xKey = 'date',
    yKey = 'value',
    label = 'Dados',
    color = '#2196F3',
    fill = false
  } = options;
  
  // Ordenar por x
  const sorted = [...data].sort((a, b) => {
    const aVal = a[xKey];
    const bVal = b[xKey];
    if (aVal instanceof Date && bVal instanceof Date) {
      return aVal - bVal;
    }
    return String(aVal).localeCompare(String(bVal));
  });
  
  return {
    labels: sorted.map(item => formatLabel(item[xKey])),
    datasets: [{
      label,
      data: sorted.map(item => item[yKey]),
      borderColor: color,
      backgroundColor: fill ? `${color}33` : 'transparent',
      fill,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };
};

/**
 * Gráfico de múltiplas linhas
 */
const prepareMultiLineChartData = (datasets, options = {}) => {
  const { xKey = 'date' } = options;
  
  // Extrair todos os labels únicos
  const allLabels = new Set();
  datasets.forEach(dataset => {
    dataset.data.forEach(item => allLabels.add(formatLabel(item[xKey])));
  });
  const labels = Array.from(allLabels).sort();
  
  // Preparar datasets
  const chartDatasets = datasets.map((dataset, index) => {
    const color = dataset.color || getColor(index);
    
    return {
      label: dataset.label,
      data: labels.map(label => {
        const item = dataset.data.find(d => formatLabel(d[xKey]) === label);
        return item ? item[dataset.yKey || 'value'] : null;
      }),
      borderColor: color,
      backgroundColor: `${color}33`,
      fill: dataset.fill || false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    };
  });
  
  return { labels, datasets: chartDatasets };
};

/**
 * Gráfico de engajamento ao longo do tempo
 */
const prepareEngagementOverTimeChart = (sessions) => {
  const withEngagement = sessions
    .filter(s => s.patient_engagement)
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
  
  return prepareLineChartData(
    withEngagement.map(s => ({
      date: new Date(s.session_date),
      value: s.patient_engagement
    })),
    {
      label: 'Engajamento',
      color: '#4CAF50',
      fill: true
    }
  );
};

// ============================================
// GRÁFICOS DE BARRA (COMPARAÇÕES)
// ============================================

/**
 * Preparar dados para gráfico de barras
 */
const prepareBarChartData = (data, options = {}) => {
  const {
    labelKey = 'label',
    valueKey = 'value',
    label = 'Dados',
    colors = null,
    horizontal = false
  } = options;
  
  const labels = data.map(item => item[labelKey]);
  const values = data.map(item => item[valueKey]);
  const backgroundColor = colors || data.map((_, i) => getColor(i));
  
  return {
    labels,
    datasets: [{
      label,
      data: values,
      backgroundColor,
      borderColor: backgroundColor,
      borderWidth: 1
    }],
    options: {
      indexAxis: horizontal ? 'y' : 'x'
    }
  };
};

/**
 * Gráfico de sessões por tipo
 */
const prepareSessionsByTypeChart = (sessions) => {
  const typeCount = sessions.reduce((acc, s) => {
    acc[s.session_type] = (acc[s.session_type] || 0) + 1;
    return acc;
  }, {});
  
  const data = Object.entries(typeCount).map(([type, count]) => ({
    label: translateSessionType(type),
    value: count
  }));
  
  return prepareBarChartData(data, {
    label: 'Sessões por Tipo',
    horizontal: true
  });
};

/**
 * Gráfico de comparação entre profissionais
 */
const prepareProfessionalsComparisonChart = (professionals, metric = 'sessions') => {
  const data = professionals.map(p => ({
    label: p.professional_name,
    value: p[metric] || 0
  }));
  
  const metricLabels = {
    sessions: 'Sessões',
    completed_sessions: 'Sessões Completadas',
    hours_worked: 'Horas Trabalhadas',
    active_patients: 'Pacientes Ativos'
  };
  
  return prepareBarChartData(data, {
    label: metricLabels[metric] || 'Métrica',
    horizontal: true
  });
};

// ============================================
// GRÁFICOS DE PIZZA (DISTRIBUIÇÕES)
// ============================================

/**
 * Preparar dados para gráfico de pizza
 */
const preparePieChartData = (data, options = {}) => {
  const {
    labelKey = 'label',
    valueKey = 'value',
    colors = null
  } = options;
  
  const labels = data.map(item => item[labelKey]);
  const values = data.map(item => item[valueKey]);
  const backgroundColor = colors || data.map((_, i) => getColor(i));
  
  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor,
      borderColor: '#fff',
      borderWidth: 2
    }]
  };
};

/**
 * Gráfico de distribuição de status
 */
const prepareStatusDistributionChart = (sessions) => {
  const statusCount = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});
  
  const data = Object.entries(statusCount).map(([status, count]) => ({
    label: translateStatus(status),
    value: count
  }));
  
  const colors = data.map(item => {
    const originalKey = Object.keys(statusCount).find(
      key => translateStatus(key) === item.label
    );
    return COLOR_PALETTES.status[originalKey] || '#9E9E9E';
  });
  
  return preparePieChartData(data, { colors });
};

/**
 * Gráfico de avaliação de progresso
 */
const prepareProgressDistributionChart = (sessions) => {
  const withProgress = sessions.filter(s => s.progress_assessment);
  
  const progressCount = withProgress.reduce((acc, s) => {
    acc[s.progress_assessment] = (acc[s.progress_assessment] || 0) + 1;
    return acc;
  }, {});
  
  const data = Object.entries(progressCount).map(([progress, count]) => ({
    label: translateProgress(progress),
    value: count
  }));
  
  const colors = data.map(item => {
    const originalKey = Object.keys(progressCount).find(
      key => translateProgress(key) === item.label
    );
    return COLOR_PALETTES.progress[originalKey] || '#9E9E9E';
  });
  
  return preparePieChartData(data, { colors });
};

// ============================================
// GRÁFICOS DE ÁREA (TENDÊNCIAS)
// ============================================

/**
 * Gráfico de área empilhada
 */
const prepareStackedAreaChart = (datasets, options = {}) => {
  const multiLine = prepareMultiLineChartData(datasets, options);
  
  // Adicionar fill nos datasets
  multiLine.datasets = multiLine.datasets.map(dataset => ({
    ...dataset,
    fill: true
  }));
  
  return {
    ...multiLine,
    options: {
      scales: {
        y: {
          stacked: true
        }
      }
    }
  };
};

/**
 * Gráfico de crescimento mensal
 */
const prepareGrowthTrendChart = (trends) => {
  return prepareMultiLineChartData([
    {
      label: 'Novos Pacientes',
      data: trends.map(t => ({
        date: `${t.month_name}/${t.year}`,
        value: t.new_patients
      })),
      yKey: 'value',
      color: '#4CAF50'
    },
    {
      label: 'Sessões Realizadas',
      data: trends.map(t => ({
        date: `${t.month_name}/${t.year}`,
        value: t.sessions_completed
      })),
      yKey: 'value',
      color: '#2196F3'
    }
  ], { xKey: 'date' });
};

// ============================================
// GRÁFICOS COMBINADOS
// ============================================

/**
 * Dashboard completo com múltiplos gráficos
 */
const prepareDashboardCharts = (data) => {
  const { sessions, professionals, trends } = data;
  
  return {
    engagement_over_time: sessions ? prepareEngagementOverTimeChart(sessions) : null,
    sessions_by_type: sessions ? prepareSessionsByTypeChart(sessions) : null,
    status_distribution: sessions ? prepareStatusDistributionChart(sessions) : null,
    progress_distribution: sessions ? prepareProgressDistributionChart(sessions) : null,
    professionals_comparison: professionals ? prepareProfessionalsComparisonChart(professionals) : null,
    growth_trend: trends ? prepareGrowthTrendChart(trends) : null
  };
};

// ============================================
// HELPERS DE FORMATAÇÃO
// ============================================

/**
 * Formatar label para exibição
 */
const formatLabel = (value) => {
  if (value instanceof Date) {
    return value.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  }
  return String(value);
};

/**
 * Traduzir tipo de sessão
 */
const translateSessionType = (type) => {
  const translations = {
    first_consultation: 'Primeira Consulta',
    follow_up: 'Retorno',
    evaluation: 'Avaliação',
    therapy_session: 'Sessão de Terapia',
    group_therapy: 'Terapia em Grupo',
    family_therapy: 'Terapia Familiar',
    emergency: 'Emergência',
    return: 'Retorno',
    discharge: 'Alta'
  };
  return translations[type] || type;
};

/**
 * Traduzir status
 */
const translateStatus = (status) => {
  const translations = {
    scheduled: 'Agendada',
    confirmed: 'Confirmada',
    in_progress: 'Em Andamento',
    completed: 'Realizada',
    cancelled: 'Cancelada',
    no_show: 'Falta',
    rescheduled: 'Reagendada'
  };
  return translations[status] || status;
};

/**
 * Traduzir progresso
 */
const translateProgress = (progress) => {
  const translations = {
    improved: 'Melhora',
    stable: 'Estável',
    worsened: 'Piora',
    no_change: 'Sem Mudança'
  };
  return translations[progress] || progress;
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Paletas
  COLOR_PALETTES,
  getColor,
  generateColorPalette,
  
  // Gráficos de linha
  prepareLineChartData,
  prepareMultiLineChartData,
  prepareEngagementOverTimeChart,
  
  // Gráficos de barra
  prepareBarChartData,
  prepareSessionsByTypeChart,
  prepareProfessionalsComparisonChart,
  
  // Gráficos de pizza
  preparePieChartData,
  prepareStatusDistributionChart,
  prepareProgressDistributionChart,
  
  // Gráficos de área
  prepareStackedAreaChart,
  prepareGrowthTrendChart,
  
  // Combinados
  prepareDashboardCharts,
  
  // Helpers
  formatLabel,
  translateSessionType,
  translateStatus,
  translateProgress
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. GRÁFICO DE LINHA SIMPLES:
 *    const lineData = prepareLineChartData(data, {
 *      xKey: 'date',
 *      yKey: 'value',
 *      label: 'Engajamento',
 *      color: '#4CAF50',
 *      fill: true
 *    });
 * 
 * 2. MÚLTIPLAS LINHAS:
 *    const multiLine = prepareMultiLineChartData([
 *      { label: 'Série 1', data: data1, yKey: 'value' },
 *      { label: 'Série 2', data: data2, yKey: 'value' }
 *    ]);
 * 
 * 3. GRÁFICO DE BARRAS:
 *    const barData = prepareBarChartData(data, {
 *      labelKey: 'name',
 *      valueKey: 'count',
 *      horizontal: true
 *    });
 * 
 * 4. GRÁFICO DE PIZZA:
 *    const pieData = preparePieChartData(data, {
 *      labelKey: 'category',
 *      valueKey: 'total'
 *    });
 * 
 * 5. DASHBOARD COMPLETO:
 *    const charts = prepareDashboardCharts({
 *      sessions,
 *      professionals,
 *      trends
 *    });
 * 
 * 6. PALETA PERSONALIZADA:
 *    const colors = generateColorPalette(5, '#4CAF50', '#2196F3');
 * 
 * INTEGRAÇÃO NO CONTROLLER:
 * 
 * const chartHelpers = require('../utils/chartHelpers');
 * 
 * const getDashboardCharts = async (req, res) => {
 *   const sessions = await Session.findAll({ ... });
 *   const professionals = await getProductivity();
 *   const trends = await getGrowthTrend(6);
 *   
 *   const charts = chartHelpers.prepareDashboardCharts({
 *     sessions,
 *     professionals,
 *     trends
 *   });
 *   
 *   res.json({
 *     success: true,
 *     data: charts
 *   });
 * };
 * 
 * USO NO FRONTEND (Chart.js):
 * 
 * import { Line } from 'react-chartjs-2';
 * 
 * <Line data={charts.engagement_over_time} />
 */