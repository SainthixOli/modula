import api from './api';

export interface ReportSummary {
  totalPatients: number;
  activeSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  newPatients: number;
  attendanceRate: string;
}

export interface ReportDistribution {
  gender: Record<string, number>;
  ageRanges: Record<string, number>;
}

export interface ReportData {
  summary: ReportSummary;
  distribution: ReportDistribution;
  period: {
    type: string;
    startDate: string;
    endDate: string;
  };
}

export interface ActivityData {
  current: {
    patients: number;
    sessions: number;
  };
  previous: {
    patients: number;
    sessions: number;
  };
  trends: {
    patients: {
      value: number;
      isPositive: boolean;
    };
    sessions: {
      value: number;
      isPositive: boolean;
    };
  };
  period: {
    type: string;
    current: { startDate: string; endDate: string };
    previous: { startDate: string; endDate: string };
  };
}

export interface MonthlySessionData {
  month: string;
  total: number;
  completed: number;
  cancelled: number;
}

export const reportsService = {
  async getPatientSummary(period: string = 'month'): Promise<ReportData> {
    const response = await api.get('/professional/reports/patient-summary', {
      params: { period }
    });
    return response.data.data;
  },

  async getActivityReport(period: string = 'month'): Promise<ActivityData> {
    const response = await api.get('/professional/reports/activity', {
      params: { period }
    });
    return response.data.data;
  },

  async getMonthlySessions(months: number = 6): Promise<MonthlySessionData[]> {
    const response = await api.get('/professional/reports/monthly-sessions', {
      params: { months }
    });
    return response.data.data;
  },

  async exportReport(period: string = 'month', format: string = 'pdf'): Promise<Blob> {
    const response = await api.get('/professional/reports/export', {
      params: { period, format },
      responseType: 'blob'
    });
    return response.data;
  }
};
