import { Season } from "shared";
import apiClient from "../apiClient";

export const getCurrentSeason = async () => {
  return await apiClient.get<Season>("/seasons/current");
};

export const getSeasons = async () => {
  return await apiClient.get<Season[]>("/seasons");
};
