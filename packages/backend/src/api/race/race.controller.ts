import { Request, Response } from "express";

export class RaceController {
  async getBySeasonId(req: Request, res: Response): Promise<void> {
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

export default new RaceController();
