import ApiClient from './apiClient';

interface DateRangeParams {
  startDate: string;
  endDate: string;
}

interface ReportOptions {
  format?: 'pdf' | 'excel' | 'csv';
  includeDetails?: boolean;
  groupBy?: string;
}

// Define types for report data structure
interface ReportDataPoint {
  [key: string]: string | number | boolean | Date | null | undefined;
}

interface ReportSummary {
  [key: string]: string | number | boolean | Date | null | undefined;
}

interface ReportData {
  title: string;
  description?: string;
  generatedAt: string;
  data: ReportDataPoint[] | Record<string, ReportDataPoint[]>;
  summary?: ReportSummary;
}

class ReportService {
  static baseEndpoint = 'reports';

  // Raporty finansowe
  static async getFinancialReport(params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/financial`, { ...params, ...options });
  }

  static async getRevenueByClient(params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/revenue-by-client`, { ...params, ...options });
  }

  static async getRevenueByMonth(year: number, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/revenue-by-month`, { year, ...options });
  }

  // Raporty dotyczące floty
  static async getFleetUtilizationReport(params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/fleet-utilization`, { ...params, ...options });
  }

  static async getMaintenanceCostsReport(params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/maintenance-costs`, { ...params, ...options });
  }

  static async getVehiclePerformanceReport(busId: string, params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/vehicle-performance`, { busId, ...params, ...options });
  }

  // Raporty dotyczące kierowców
  static async getDriverWorkingHoursReport(params: DateRangeParams, driverId?: string, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/driver-working-hours`, { ...params, driverId, ...options });
  }

  static async getDriverPerformanceReport(params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/driver-performance`, { ...params, ...options });
  }

  // Raporty dotyczące rezerwacji i wycieczek
  static async getBookingsReport(params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/bookings`, { ...params, ...options });
  }

  static async getTripsReport(params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/trips`, { ...params, ...options });
  }

  static async getDestinationPopularityReport(year: number, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/destination-popularity`, { year, ...options });
  }

  // Raporty dotyczące klientów
  static async getCustomerActivityReport(params: DateRangeParams, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/customer-activity`, { ...params, ...options });
  }

  static async getTopCustomersReport(params: DateRangeParams, limit?: number, options?: ReportOptions): Promise<ReportData> {
    return ApiClient.post(`${this.baseEndpoint}/top-customers`, { ...params, limit: limit || 10, ...options });
  }

  // Eksport raportów
  static async exportReport(reportType: string, params: Record<string, unknown>, format: ReportOptions['format'] = 'pdf'): Promise<{ fileUrl: string }> {
    return ApiClient.post(`${this.baseEndpoint}/export/${reportType}`, { ...params, format });
  }

  // Podsumowanie dla dashboardu
  static async getDashboardSummary(): Promise<{
    totalRevenue: number;
    activeBookings: number;
    upcomingTrips: number;
    availableBuses: number;
    fleetUtilization: number;
    pendingMaintenance: number;
    monthlyComparison: Array<{
      month: string;
      revenue: number;
      bookings: number;
      year?: number;
    }>;
  }> {
    return ApiClient.get(`${this.baseEndpoint}/dashboard-summary`);
  }
  
  // Trendy i prognozy
  static async getBookingTrends(months: number = 6): Promise<ReportData> {
    return ApiClient.get(`${this.baseEndpoint}/booking-trends?months=${months}`);
  }
  
  static async getRevenueForecast(months: number = 3): Promise<ReportData> {
    return ApiClient.get(`${this.baseEndpoint}/revenue-forecast?months=${months}`);
  }
}

export default ReportService;