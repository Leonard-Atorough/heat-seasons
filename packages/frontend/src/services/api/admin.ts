import { Racer, User } from "shared";
import apiClient from "../apiClient";

export interface AdminUser extends User {
  lastLoginAt?: string;
  loginCount: number;
}

export const adminListUsers = async (): Promise<AdminUser[]> => {
  return await apiClient.get<AdminUser[]>("/admin/users");
};

export const adminPromoteUser = async (userId: string): Promise<AdminUser> => {
  return await apiClient.post<AdminUser>("/admin/promote", { userId });
};

export const adminDemoteUser = async (userId: string): Promise<AdminUser> => {
  return await apiClient.post<AdminUser>("/admin/demote", { userId });
};

export interface AdminCreateRacerInput {
  name: string;
  team: string;
  teamColor: string;
  nationality: string;
  age: number;
  active?: boolean;
  badgeUrl?: string;
  profileUrl?: string;
  /** Optional: assign racer to a specific user account */
  userId?: string;
}

export const adminCreateRacer = async (data: AdminCreateRacerInput): Promise<Racer> => {
  return await apiClient.post<Racer>("/admin/racers", data);
};
