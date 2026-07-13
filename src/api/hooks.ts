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
    mutationFn: (settings: Settings) => adminService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}

export function useUploadPackage() {
  return useMutation({
    mutationFn: ({
      category,
      year,
      file,
    }: {
      category: string;
      year: number;
      file: File;
    }) => adminService.uploadPackage(category, year, file),
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
