import { Racer, RacerWithStats } from "shared";
import apiClient from "../apiClient";

export const getAllRacers = async () => {
  return await apiClient.get<RacerWithStats[]>("/racers");
};

export const getRacerById = async (racerId: string) => {
  return await apiClient.get<RacerWithStats>(`/racers/${racerId}`);
};

/** Fetch the racer profile linked to the currently authenticated user. */
export const getMyRacer = async () => {
  return await apiClient.get<RacerWithStats>("/racers/me");
};

export const createRacer = async (data: {
  name: string;
  team: string;
  teamColor: string;
  nationality: string;
  age: number;
  active?: boolean;
  badgeUrl?: string;
}) => {
  return await apiClient.post<Racer>("/racers", data);
};

export const updateRacer = async (
  racerId: string,
  data: Partial<Omit<Racer, "id" | "joinDate">>,
) => {
  return await apiClient.put<Racer>(`/racers/${racerId}`, data);
};
