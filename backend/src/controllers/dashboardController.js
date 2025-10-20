/**
 * MÓDULA - CONTROLLER DE DASHBOARD AVANÇADO
 * 
 * Controller especializado para dashboards administrativos com KPIs e métricas.
 * Estatísticas agregadas, indicadores de qualidade e comparativos temporais.
 * 
 * Funcionalidades implementadas:
 * - Dashboard administrativo completo
 * - Produtividade por profissional com ranking
 * - Estatísticas de ocupação da clínica
 * - Relatórios de crescimento temporal
 * - Indicadores de qualidade do atendimento
 * - Comparativos mensais e anuais
 * 
 * Recursos especiais:
 * - Agregações otimizadas
 * - Cache de dados pesados
 * - Filtros por período
 * - Formatação pronta para gráficos
 * - KPIs calculados automaticamente
 */

const statsService = require('../services/statsService');
const chartHelpers = require('../utils/chartHelpers');
const { User, Patient, Session, Anamnesis } = require('../models');
const { Op } = require('sequelize');

// ============================================
// DASHBOARD ADMINISTRATIVO
// ============================================

/**
 * Dashboard principal do administrador
 */
const getAdminDashboard = async (req, res) => {
  try {
    const userId = req.userId;

    // Overview geral da clínica
    const overview = await statsService.getClinicOverview(userId);

    // Tendência de crescimento (últimos 6 meses)
    const growth = await statsService.getGrowthTrend(6);

    // Indicadores de qualidade
    const quality = await statsService.getQualityIndicators();

    // Comparar profissionais
    const professionals = await statsService.compareProfessionalsProductivity();

    // Top 5 profissionais mais produtivos
    const topProfessionals = professionals.professionals.slice(0, 5);

    // Dados para gráficos
    const charts = {
      growth_trend: chartHelpers.prepareGrowthTrendChart(growth.trends),
      professionals_comparison: chartHelpers.prepareProfessionalsComparisonChart(
        topProfessionals,
        'completed_sessions'
      )
    };

    res.json({
      success: true,
      data: {
        overview,
        growth: {
          trends: growth.trends,
          summary: growth.summary
        },
        quality,
        top_professionals: topProfessionals,
        charts
      }
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar dashboard',
      error: error.message
    });
  }
};

// ============================================
// PRODUTIVIDADE POR PROFISSIONAL
// ============================================

/**
 * Ranking de produtividade dos profissionais
 */
const getProfessionalsRanking = async (req, res) => {
  try {
    const { startDate, endDate, sortBy = 'completed_sessions' } = req.query;

    const comparison = await statsService.compareProfessionalsProductivity(
      startDate,
      endDate
    );

    // Ordenar por métrica escolhida
    const sortedProfessionals = [...comparison.professionals].sort((a, b) => {
      return b[sortBy] - a[sortBy];
    });

    // Adicionar posições
    const ranking = sortedProfessionals.map((prof, index) => ({
      position: index + 1,
      ...prof
    }));

    // Gráficos
    const charts = {
      by_sessions: chartHelpers.prepareProfessionalsComparisonChart(
        ranking,
        'completed_sessions'
      ),
      by_hours: chartHelpers.prepareProfessionalsComparisonChart(
        ranking,
        'hours_worked'
      ),
      by_patients: chartHelpers.prepareProfessionalsComparisonChart(
        ranking,
        'active_patients'
      )
    };

    res.json({
      success: true,
      data: {
        ranking,
        totals: comparison.totals,
        averages: comparison.averages,
        charts
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ranking de produtividade',
      error: error.message
    });
  }
};

/**
 * Detalhes de produtividade de um profissional específico
 */
const getProfessionalDetails = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const productivity = await statsService.getProfessionalProductivity(
      professionalId,
      start,
      end
    );

    // Buscar sessões para gráficos detalhados
    const sessions = await Session.findAll({
      where: {
        user_id: professionalId,
        session_date: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      }
    });

    // Gráficos específicos
    const charts = {
      sessions_by_type: chartHelpers.prepareSessionsByTypeChart(sessions),
      status_distribution: chartHelpers.prepareStatusDistributionChart(sessions),
      engagement_over_time: sessions.filter(s => s.patient_engagement).length > 0
        ? chartHelpers.prepareEngagementOverTimeChart(sessions)
        : null
    };

    res.json({
      success: true,
      data: {
        productivity,
        charts
      }
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes',
      error: error.message
    });
  }
};

// ============================================
// ESTATÍSTICAS DE OCUPAÇÃO
// ============================================

/**
 * Estatísticas de ocupação da clínica
 */
const getOccupancyStats = async (req, res) => {
  try {
    const { year, month } = req.query;

    const targetDate = new Date();
    if (year) targetDate.setFullYear(parseInt(year));
    if (month) targetDate.setMonth(parseInt(month) - 1);

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Buscar todas as sessões do mês
    const sessions = await Session.findAll({
      where: {
        session_date: {
          [Op.gte]: startOfMonth,
          [Op.lte]: endOfMonth
        }
      }
    });

    // Calcular ocupação por dia
    const occupancyByDay = {};
    const daysInMonth = endOfMonth.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), day);
      const dateKey = dayDate.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.session_date).toISOString().split('T')[0];
        return sessionDate === dateKey;
      });

      const totalMinutes = daySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const workingMinutes = 8 * 60; // 8 horas de trabalho
      const occupancyRate = (totalMinutes / workingMinutes) * 100;

      occupancyByDay[dateKey] = {
        date: dateKey,
        day_of_week: dayDate.getDay(),
        sessions_count: daySessions.length,
        total_minutes: totalMinutes,
        total_hours: (totalMinutes / 60).toFixed(2),
        occupancy_rate: occupancyRate.toFixed(2),
        status: occupancyRate >= 80 ? 'full' : occupancyRate >= 60 ? 'busy' : occupancyRate >= 30 ? 'moderate' : 'light'
      };
    }

    // Calcular médias
    const occupancyValues = Object.values(occupancyByDay);
    const avgOccupancy = occupancyValues.reduce((sum, day) => sum + parseFloat(day.occupancy_rate), 0) / occupancyValues.length;

    // Distribuição por nível de ocupação
    const distribution = {
      full: occupancyValues.filter(d => d.status === 'full').length,
      busy: occupancyValues.filter(d => d.status === 'busy').length,
      moderate: occupancyValues.filter(d => d.status === 'moderate').length,
      light: occupancyValues.filter(d => d.status === 'light').length
    };

    res.json({
      success: true,
      data: {
        period: {
          year: targetDate.getFullYear(),
          month: targetDate.getMonth() + 1,
          days_in_month: daysInMonth
        },
        summary: {
          total_sessions: sessions.length,
          avg_occupancy_rate: avgOccupancy.toFixed(2),
          busiest_day: Object.values(occupancyByDay)
            .sort((a, b) => b.occupancy_rate - a.occupancy_rate)[0]?.date,
          distribution
        },
        occupancy_by_day: occupancyByDay
      }
    });
  } catch (error) {
    console.error('Erro ao calcular ocupação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao calcular estatísticas de ocupação',
      error: error.message
    });
  }
};

// ============================================
// RELATÓRIOS DE CRESCIMENTO
// ============================================

/**
 * Relatório de crescimento temporal
 */
const getGrowthReport = async (req, res) => {
  try {
    const { months = 12 } = req.query;

    const growth = await statsService.getGrowthTrend(parseInt(months));

    // Gráficos de crescimento
    const charts = {
      growth_trend: chartHelpers.prepareGrowthTrendChart(growth.trends),
      new_patients_chart: chartHelpers.prepareLineChartData(
        growth.trends.map(t => ({
          date: `${t.month_name}/${t.year}`,
          value: t.new_patients
        })),
        {
          label: 'Novos Pacientes',
          color: '#4CAF50',
          fill: true
        }
      ),
      sessions_chart: chartHelpers.prepareLineChartData(
        growth.trends.map(t => ({
          date: `${t.month_name}/${t.year}`,
          value: t.sessions_completed
        })),
        {
          label: 'Sessões Realizadas',
          color: '#2196F3',
          fill: true
        }
      )
    };

    res.json({
      success: true,
      data: {
        trends: growth.trends,
        summary: growth.summary,
        charts
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de crescimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de crescimento',
      error: error.message
    });
  }
};

// ============================================
// INDICADORES DE QUALIDADE
// ============================================

/**
 * Dashboard de indicadores de qualidade
 */
const getQualityDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const quality = await statsService.getQualityIndicators(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    // Buscar dados adicionais para análise
    const sessions = await Session.findAll({
      where: {
        status: 'completed',
        session_date: {
          [Op.gte]: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          [Op.lte]: endDate ? new Date(endDate) : new Date()
        }
      }
    });

    // Distribuição de progresso
    const progressDistribution = chartHelpers.prepareProgressDistributionChart(
      sessions.filter(s => s.progress_assessment)
    );

    // Análise de engajamento
    const withEngagement = sessions.filter(s => s.patient_engagement);
    const engagementDistribution = {
      high: withEngagement.filter(s => s.patient_engagement >= 8).length,
      medium: withEngagement.filter(s => s.patient_engagement >= 5 && s.patient_engagement < 8).length,
      low: withEngagement.filter(s => s.patient_engagement < 5).length
    };

    res.json({
      success: true,
      data: {
        quality,
        distributions: {
          progress: progressDistribution,
          engagement: engagementDistribution
        },
        sessions_analyzed: sessions.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar indicadores de qualidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar indicadores de qualidade',
      error: error.message
    });
  }
};

// ============================================
// COMPARATIVOS MENSAIS
// ============================================

/**
 * Comparativo entre meses
 */
const getMonthlyComparison = async (req, res) => {
  try {
    const { year, months = 3 } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const comparisons = [];

    for (let i = 0; i < parseInt(months); i++) {
      const month = new Date().getMonth() - i + 1; // +1 porque getMonth() retorna 0-11
      
      const stats = await statsService.getMonthlyStats(
        targetYear,
        month > 0 ? month : 12 + month
      );

      comparisons.push({
        month: stats.period.month,
        year: stats.period.year,
        month_name: new Date(targetYear, month - 1).toLocaleString('pt-BR', { month: 'long' }),
        summary: stats.summary,
        professionals_count: stats.by_professional.length
      });
    }

    // Calcular variações
    for (let i = 1; i < comparisons.length; i++) {
      const current = comparisons[i - 1];
      const previous = comparisons[i];

      current.variation = {
        sessions: ((current.summary.total_sessions - previous.summary.total_sessions) / previous.summary.total_sessions * 100).toFixed(2),
        patients: ((current.summary.new_patients - previous.summary.new_patients) / previous.summary.new_patients * 100).toFixed(2)
      };
    }

    res.json({
      success: true,
      data: {
        comparisons: comparisons.reverse(),
        chart: chartHelpers.prepareLineChartData(
          comparisons.map(c => ({
            date: c.month_name,
            value: c.summary.total_sessions
          })),
          {
            label: 'Sessões por Mês',
            color: '#4CAF50'
          }
        )
      }
    });
  } catch (error) {
    console.error('Erro ao gerar comparativo mensal:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar comparativo mensal',
      error: error.message
    });
  }
};

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  getAdminDashboard,
  getProfessionalsRanking,
  getProfessionalDetails,
  getOccupancyStats,
  getGrowthReport,
  getQualityDashboard,
  getMonthlyComparison
};

/**
 * DOCUMENTAÇÃO DE USO:
 * 
 * 1. DASHBOARD PRINCIPAL:
 *    GET /api/dashboard/admin
 *    // Retorna overview, growth, quality, top professionals e charts
 * 
 * 2. RANKING DE PROFISSIONAIS:
 *    GET /api/dashboard/professionals/ranking?sortBy=completed_sessions
 *    // Retorna ranking ordenado com posições
 * 
 * 3. DETALHES DO PROFISSIONAL:
 *    GET /api/dashboard/professionals/:professionalId?startDate=...&endDate=...
 *    // Retorna produtividade e charts específicos
 * 
 * 4. OCUPAÇÃO:
 *    GET /api/dashboard/occupancy?year=2025&month=10
 *    // Retorna ocupação dia a dia com status
 * 
 * 5. CRESCIMENTO:
 *    GET /api/dashboard/growth?months=12
 *    // Retorna tendências e charts
 * 
 * 6. QUALIDADE:
 *    GET /api/dashboard/quality?startDate=...&endDate=...
 *    // Retorna indicadores e distribuições
 * 
 * 7. COMPARATIVO MENSAL:
 *    GET /api/dashboard/monthly-comparison?year=2025&months=3
 *    // Retorna comparação com variações
 */