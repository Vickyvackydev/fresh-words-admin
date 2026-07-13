import { api } from "./client";

export interface LoginResponse {
  token: string;
  email: string;
}

export interface DashboardStats {
  total_feedback: number;
  unread_feedback: number;
  published_packages: number;
  total_devotionals: number;
  db_storage_usage: string;
  active_packages?: any[];
  total_active_reads?: number;
  active_reads_percentage_change?: string;
  daily_analytics?: { day: string; reads: number; feedback: number }[];
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface FeedbackPaginated {
  data: {
    items: Feedback[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface Settings {
  id?: string;
  church_name: string;
  app_logo_url: string;
  support_email: string;
  privacy_policy_url: string;
  terms_of_service_url: string;
  about_us: string;

  daily_deliverance_enabled: boolean;
  daily_deliverance_time: string;
  daily_deliverance_randomize: boolean;

  holiness_enabled: boolean;
  holiness_time: string;
  holiness_randomize: boolean;

  prayer_enabled: boolean;
  prayer_time: string;
  prayer_randomize: boolean;

  yearly_devotional_enabled: boolean;
  yearly_devotional_time: string;
  yearly_devotional_randomize: boolean;
}

export interface Devotional {
  id: string;
  package_id: string;
  category: string;
  title: string;
  scripture_quote: string;
  scripture_reference: string;
  body: string;
  prayer: string;
  reflection: string;
  action_points: string; // JSON string
  default_day: number;
  created_at: string;
}

export interface ValidationIssue {
  day_of_year: number;
  date_text: string;
  severity: "error" | "warning";
  message: string;
}

export interface UploadResponse {
  package_id: string;
  total_parsed: number;
  is_valid: boolean;
  issues: ValidationIssue[];
}

export interface Package {
  id: string;
  category: string;
  year: number;
  status: "draft" | "published" | "archived";
  file_name: string;
  uploaded_at: string;
  devotionals?: Devotional[];
}

export const adminService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/admin/dashboard");
    return response.data.data;
  },

  getFeedback: async (
    page: number,
    limit: number,
  ): Promise<FeedbackPaginated> => {
    const response = await api.get("/admin/feedback", {
      params: { page, limit },
    });
    return response.data;
  },

  markFeedbackRead: async (id: string): Promise<Feedback> => {
    const response = await api.put(`/admin/feedback/${id}/read`);
    return response.data.data;
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await api.delete(`/admin/feedback/${id}`);
  },

  getSettings: async (): Promise<Settings> => {
    const response = await api.get("/admin/settings");
    return response.data.data;
  },

  updateSettings: async (settings: Settings): Promise<Settings> => {
    const response = await api.put("/admin/settings", settings);
    return response.data.data;
  },

  uploadPackage: async (
    category: string,
    year: number,
    file: File,
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("category", category);
    formData.append("year", year.toString());
    formData.append("file", file);

    const response = await api.post("/admin/packages/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  publishPackage: async (packageId: string): Promise<Package> => {
    const response = await api.post("/admin/packages/publish", {
      package_id: packageId,
    });
    return response.data.data;
  },

  rollbackPackage: async (packageId: string): Promise<Package> => {
    const response = await api.post("/admin/packages/rollback", {
      package_id: packageId,
    });
    return response.data.data;
  },

  getPackageHistory: async (category: string): Promise<Package[]> => {
    const response = await api.get("/admin/packages/history", {
      params: { category },
    });
    return response.data.data;
  },
};
