import { EntityRoot } from "./EntityRoot";

export class RaceEntity extends EntityRoot {
  private constructor(
    public id: string | undefined,
    public seasonId: string,
    public raceNumber: number,
    public name: string,
    public date: Date,
    public results: {
      racerId: string;
      position: number;
      points: number;
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
    results: {
      racerId: string;
      position: number;
      points: number;
    }[];
  }): RaceEntity {
    return new RaceEntity(
      undefined,
      data.seasonId,
      data.raceNumber,
      data.name,
      data.date,
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
    results: {
      racerId: string;
      position: number;
      points: number;
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
      data.results,
      data.createdAt,
      data.updatedAt,
    );
  }

  update(
    data: Partial<{
      name: string;
      date: Date;
      results: {
        racerId: string;
        position: number;
        points: number;
      }[];
    }>,
  ): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.date !== undefined) this.date = data.date;
    if (data.results !== undefined) this.results = data.results;
  }
}
