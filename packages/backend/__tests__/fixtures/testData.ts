import { Race, Racer, Season, User } from "../../../shared/src/index";
import { races } from "./race.fixture";
import { racers } from "./racer.fixture";
import { seasons } from "./season.fixture";
import { users } from "./user.fixture";

export { createUser, createUserList, users } from "./user.fixture";
export { createRacer, createRacerList, racers } from "./racer.fixture";
export { createSeason, createSeasonList, seasons } from "./season.fixture";
export { createRace, createRaceList, createRaceResult, races } from "./race.fixture";

export const testUsers: Record<string, User> = {
  admin: users.admin(),
  user: users.user(),
};

export const testRacers: Record<string, Racer> = {
  john: racers.john(),
  jane: racers.jane(),
};

export const testSeasons: Record<string, Season> = {
  active: seasons.active(),
};

export const testRaces: Record<string, Race> = {
  race1: races.race1(),
};
