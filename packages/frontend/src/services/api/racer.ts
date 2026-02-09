import { RacerWithStats } from "@shared/models";
import apiClient from "../apiClient";

export const getAllRacers = async () => {
  return await apiClient.get<RacerWithStats[]>("/racers");
}