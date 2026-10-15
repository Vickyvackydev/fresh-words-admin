import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService, Settings } from "./services";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminService.getDashboardStats,
    refetchInterval: 30000,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: any) => adminService.login(email, password),
  });
}

export function useFeedbackList(page: number, limit: number) {
  return useQuery({
    queryKey: ["admin", "feedback", page, limit],
    queryFn: () => adminService.getFeedback(page, limit),
  });
}

export function useMarkFeedbackRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.markFeedbackRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: adminService.getSettings,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<Settings>) => adminService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}

export function useUploadPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      category,
      year,
      file,
      packageId,
      onProgress,
      signal,
    }: {
      category: string;
      year: number;
      file: File;
      packageId?: string;
      onProgress?: (percent: number) => void;
      signal?: AbortSignal;
    }) => adminService.uploadPackage(category, year, file, packageId, onProgress, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });
}

export function usePublishPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packageId: string) => adminService.publishPackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useRollbackPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packageId: string) => adminService.rollbackPackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });
}

export function usePackageHistory(category: string) {
  return useQuery({
    queryKey: ["admin", "packages", "history", category],
    queryFn: () => adminService.getPackageHistory(category),
    enabled: !!category,
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packageId: string) => adminService.deletePackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateDevotional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ devotionalId, data }: {
      devotionalId: string;
      data: {
        title: string;
        scripture_reference?: string;
        scripture_quote?: string;
        body: string;
        prayer?: string;
        reflection?: string;
      };
    }) => adminService.updateDevotional(devotionalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });
}

// Hymn hooks
export function useHymnsList(page = 1, limit = 1000, q = "", category = "", book = "english") {
  return useQuery({
    queryKey: ["admin", "hymns", page, limit, q, category, book],
    queryFn: () => adminService.getHymns(page, limit, q, category, book),
  });
}

export function useCreateHymn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, book = "english" }: { data: any; book?: string }) => adminService.createHymn(data, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hymns"] });
    },
  });
}

export function useUpdateHymn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, book = "english" }: { id: string; data: any; book?: string }) => adminService.updateHymn(id, data, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hymns"] });
    },
  });
}

export function useDeleteHymn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, book = "english" }: { id: string; book?: string }) => adminService.deleteHymn(id, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hymns"] });
    },
  });
}

export function useBulkUploadHymns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileOrData, lang = "en", book = "english" }: { fileOrData: File | any[]; lang?: string; book?: string }) =>
      adminService.bulkUploadHymns(fileOrData, lang, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hymns"] });
    },
  });
}

export function useHymnTranslation(id: string, lang = "yo") {
  return useQuery({
    queryKey: ["admin", "hymns", id, "translation", lang],
    queryFn: () => adminService.getHymnTranslation(id, lang),
    enabled: !!id,
  });
}

export function useSaveHymnTranslation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminService.saveHymnTranslation(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hymns", vars.id, "translation"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "hymns"] });
    },
  });
}

export function useDevotionalTranslation(id: string, lang = "yo") {
  return useQuery({
    queryKey: ["admin", "devotionals", id, "translation", lang],
    queryFn: () => adminService.getDevotionalTranslation(id, lang),
    enabled: !!id,
  });
}

export function useSaveDevotionalTranslation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminService.saveDevotionalTranslation(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "devotionals", vars.id, "translation"] });
    },
  });
}

export function useGenerateDevotionalAIDraft() {
  return useMutation({
    mutationFn: ({ id, lang = "yo" }: { id: string; lang?: string }) =>
      adminService.generateDevotionalAIDraft(id, lang),
  });
}


