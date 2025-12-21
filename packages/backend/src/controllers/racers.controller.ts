import { Request, Response } from "express";
import { RacerService, RacerServiceInterface } from "../services/racers.service";

export class RacerController {
  constructor(private racerService: RacerServiceInterface) {
    this.racerService = racerService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getById(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async create(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async update(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async delete(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}

export default new RacerController(new RacerService());
