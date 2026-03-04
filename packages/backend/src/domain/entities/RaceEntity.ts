import { EntityRoot } from "./entityRoot";

export class RaceEntity extends EntityRoot {
  private constructor(
    public id: string | undefined,
    public seasonId: string,
    public raceNumber: number,
    public name: string,
    public date: Date,
    public completed: boolean,
    public results: {
      racerId: string;
      position: number;
      points: number;
      constructorPoints: number;
      isGhostRacer?: boolean;
    }[],
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(data: {
    seasonId: string;
    raceNumber: number;
    name: string;
    date: Date;
    completed?: boolean;
    results: {
      racerId: string;
      position: number;
      points: number;
      constructorPoints: number;
      isGhostRacer?: boolean;
    }[];
  }): RaceEntity {
    return new RaceEntity(
      undefined,
      data.seasonId,
      data.raceNumber,
      data.name,
      data.date,
      data.completed ?? false,
      data.results,
      undefined,
      undefined,
    );
  }

  static reconstitute(data: {
    id: string;
    seasonId: string;
    raceNumber: number;
    name: string;
    date: Date;
    completed: boolean;
    results: {
      racerId: string;
      position: number;
      points: number;
      constructorPoints: number;
      isGhostRacer?: boolean;
    }[];
    createdAt: Date;
    updatedAt: Date;
  }): RaceEntity {
    return new RaceEntity(
      data.id,
      data.seasonId,
      data.raceNumber,
      data.name,
      data.date,
      data.completed,
      data.results,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(
    data: Partial<{
      name: string;
      date: Date;
      completed: boolean;
      results: {
        racerId: string;
        position: number;
        points: number;
        constructorPoints: number;
        isGhostRacer?: boolean;
      }[];
    }>,
  ): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.date !== undefined) this.date = data.date;
    if (data.completed !== undefined) this.completed = data.completed;
    if (data.results !== undefined) this.results = data.results;
  }
}

