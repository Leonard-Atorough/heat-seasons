import { Race, RaceResult } from "shared";
import apiClient from "../apiClient";

export const GetRacesBySeason = async (seasonId: string) => {
  return await apiClient.get<Race[]>(`/races?seasonId=${seasonId}`);
};

export const GetRaceById = async (raceId: string) => {
  return await apiClient.get<Race>(`/races/${raceId}`);
};

export const CreateRace = async (
  seasonId: string,
  name: string,
  date: string,
  results: RaceResult[],
) => {
  return await apiClient.post<Race>(`/races?seasonId=${seasonId}`, {
    name,
    date,
    results,
  });
};

export const UpdateRace = async (
  raceId: string,
  name: string,
  date: string,
  results: RaceResult[],
) => {
  return await apiClient.put<Race>(`/races/${raceId}`, {
    name,
    date,
    results,
  });
};
