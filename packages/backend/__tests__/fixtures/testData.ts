import { User, Racer, Season, Race } from "../../../shared/src/index";

export const testUsers = {
  admin: {
    id: "admin-1",
    googleId: "google-admin-1",
    email: "admin@test.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  } as User,

  user: {
    id: "user-1",
    googleId: "google-user-1",
    email: "user@test.com",
    name: "Test User",
    role: "user",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  } as User,
};

export const testRacers = {
  john: {
    id: "racer-1",
    name: "John Doe",
    active: true,
    joinDate: new Date("2026-01-01"),
    team: "Team A",
    teamColor: "#FF0000",
    nationality: "USA",
    age: 30,
  } as Racer,

  jane: {
    id: "racer-2",
    name: "Jane Smith",
    active: true,
    joinDate: new Date("2026-01-01"),
    team: "Team B",
    teamColor: "#0000FF",
    nationality: "USA",
    age: 28,
  } as Racer,
};

export const testSeasons = {
  active: {
    id: "season-1",
    name: "Season 1 2026",
    status: "active",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-06-30"),
    totalRaces: 10,
    racesCompleted: 5,
    totalParticipants: 20,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  } as Season,
};

export const testRaces = {
  race1: {
    id: "race-1",
    seasonId: "season-1",
    name: "Race 1",
    raceNumber: 1,
    date: new Date("2026-01-15"),
    results: [
      { racerId: "racer-1", position: 1, points: 10 },
      { racerId: "racer-2", position: 2, points: 8 },
    ],
  } as Race,
};
