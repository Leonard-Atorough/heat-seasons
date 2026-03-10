import { Racer } from "shared";
import apiClient from "../apiClient";
import { AdminUser, AdminCreateRacerInput } from "../../models";

// Re-export types for backward compatibility
export type { AdminUser, AdminCreateRacerInput } from "../../models";

export const adminListUsers = async (): Promise<AdminUser[]> => {
  return await apiClient.get<AdminUser[]>("/admin/users");
};

export const adminPromoteUser = async (userId: string): Promise<AdminUser> => {
  return await apiClient.post<AdminUser>("/admin/promote", { userId });
};

export const adminDemoteUser = async (userId: string): Promise<AdminUser> => {
  return await apiClient.post<AdminUser>("/admin/demote", { userId });
};

export const adminListRacers = async (): Promise<Racer[]> => {
  return await apiClient.get<Racer[]>("/admin/racers");
};

export const adminCreateRacer = async (data: AdminCreateRacerInput): Promise<Racer> => {
  return await apiClient.post<Racer>("/admin/racers", data);
};

export const adminUpdateRacer = async (
  racerId: string,
  data: Partial<AdminCreateRacerInput>,
): Promise<Racer> => {
  return await apiClient.put<Racer>(`/admin/racers/${racerId}`, data);
};

export const adminDeleteRacer = async (racerId: string): Promise<void> => {
  return await apiClient.delete<void>(`/admin/racers/${racerId}`);
};
