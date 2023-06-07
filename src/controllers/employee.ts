import { DuplicateError, ManualImportService } from '../services/employee-directory-import/manual-import.service';
import { Request, Response } from 'express';

export const createEmployeeManually = async (req: Request, res: Response): Promise<void> => {
  const importService = new ManualImportService();

  const payload = { ...req.body };

  try {
    await importService.importEmployee(payload);
  } catch (e) {
    if (e instanceof DuplicateError) {
      res.status(409);
      res.send();

      return;
    }
  }

  res.status(201);
  res.send();
};
