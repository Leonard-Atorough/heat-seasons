import { Leaderboard } from "@shared/index";
import apiClient from "../apiClient";

export const getCurrentLeaderboard = async (): Promise<Leaderboard> => {
  return await apiClient.get<Leaderboard>("/leaderboard/current");
};
