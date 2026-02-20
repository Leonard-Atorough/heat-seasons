import { Race } from "shared";
import apiClient from "../apiClient";

export const GetRacesBySeason = async (seasonId: string) => {
  return await apiClient.get<Race[]>(`/races?seasonId=${seasonId}`);
};
