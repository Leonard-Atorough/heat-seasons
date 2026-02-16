import { UserEntity } from "../entities/UserEntity";
import { RacerEntity } from "../entities/RacerEntity";

export class UserAggregate {
  constructor(
    private user: UserEntity,
    private racer: RacerEntity | null,
  ) {}

  getUser(): UserEntity {
    return this.user;
  }

  getRacer(): RacerEntity | null {
    return this.racer;
  }

  assignRacer(racer: RacerEntity): void {
    if (racer.userId && racer.userId !== this.user.id) {
      throw new Error("Racer is already assigned to another user");
    }
    this.racer = racer;
    this.user.racerId = racer.id;
    racer.userId = this.user.id;
  }
}
