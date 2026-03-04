/**
 * Domain Errors
 *
 * Place domain-specific exceptions here - errors that represent violations
 * of business rules and domain invariants.
 *
 * Example:
 * - AgeInvalidError
 * - InvalidRacerStateError
 * - SeasonNotActiveError
 */
export {
  ApplicationError,
  ForbiddenError,
  NotFoundError,
  NotImplemented,
  UnauthorisedError,
} from "./application";

export {
  SeasonNotActiveError,
  SeasonAlreadyExistsError,
  SeasonNotFoundError,
  InvalidSeasonStateError,
} from "./seasonErrors";
