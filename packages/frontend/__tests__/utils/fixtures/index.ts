/**
 * Test Fixtures
 *
 * Centralized test data builders and pre-built scenarios for consistent, maintainable tests.
 * All factories support optional overrides for customization.
 *
 * @example
 * // Use a default fixture
 * const user = createUser();
 *
 * // Override specific fields
 * const admin = createUser({ role: "admin" });
 *
 * // Use pre-built scenarios
 * const activeAdmin = users.admin();
 *
 * // Create lists of fixtures
 * const userList = createUserList(5);
 *
 * // Chain overrides with scenarios
 * const customAdmin = users.admin({ name: "Super Admin" });
 */

// User fixtures
export {
  createUser,
  createUserList,
  users,
} from "./user.fixture";

// Racer fixtures
export {
  createRacer,
  createRacerWithStats,
  createRacerList,
  createRacerWithStatsList,
  createRacerMap,
  racers,
} from "./racer.fixture";

// Season fixtures
export {
  createSeason,
  createSeasonRequest,
  createSeasonList,
  seasons,
} from "./season.fixture";

// Race fixtures
export {
  createRace,
  createRaceList,
  races,
} from "./race.fixture";

// Admin fixtures
export {
  createAdminUser,
  createAdminUserList,
  adminUsers,
  createAdminRacerInput,
  createAdminRacerInputList,
  racerInputs,
} from "./admin.fixture";
