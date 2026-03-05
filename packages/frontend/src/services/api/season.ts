import { Season, SeasonParticipant } from "shared";
import apiClient from "../apiClient";

export const getSeasons = async () => {
  return await apiClient.get<Season[]>("/seasons");
};

export const getSeasonById = async (seasonId: string) => {
  return await apiClient.get<Season>(`/seasons/${seasonId}`);
};

export const createSeason = async (name: string, startDate: string, endDate?: string) => {
  return await apiClient.post<Season>("/seasons", {
    name,
    startDate,
    endDate,
  });
};

export const updateSeason = async (
  seasonId: string,
  fields: { name?: string; status?: string; startDate?: string },
) => {
  const body = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
  return await apiClient.put<Season>(`/seasons/${seasonId}`, body);
};

export const deleteSeason = async (seasonId: string) => {
  return await apiClient.delete(`/seasons/${seasonId}`);
};

export const getSeasonParticipants = async (seasonId: string) => {
  return await apiClient.get<SeasonParticipant[]>(`/seasons/${seasonId}/participants`);
};

export const joinSeason = async (seasonId: string, racerId: string) => {
  return await apiClient.post<SeasonParticipant>(`/seasons/${seasonId}/join/${racerId}`, {});
};
