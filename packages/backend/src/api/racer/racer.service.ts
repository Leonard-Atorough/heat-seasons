export interface Racer {
  id: string;
  name: string;
  email: string;
  active: boolean;
  joinDate: Date;
}

export class RacerService {
  async getAll(filters?: { active?: boolean }): Promise<Racer[]> {
    throw new Error("Not implemented");
  }

  async getById(id: string): Promise<Racer | null> {
    throw new Error("Not implemented");
  }

  async create(data: Omit<Racer, "id" | "joinDate">): Promise<Racer> {
    throw new Error("Not implemented");
  }

  async update(id: string, data: Partial<Racer>): Promise<Racer> {
    throw new Error("Not implemented");
  }

  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getStats(id: string): Promise<any> {
    throw new Error("Not implemented");
  }
}

export default new RacerService();

export interface RacerServiceInterface {
  getAll(filters?: { active?: boolean }): Promise<Racer[]>;
  getById(id: string): Promise<Racer | null>;
  create(data: Omit<Racer, "id" | "joinDate">): Promise<Racer>;
  update(id: string, data: Partial<Racer>): Promise<Racer>;
  delete(id: string): Promise<void>;
  getStats(id: string): Promise<any>;
}
