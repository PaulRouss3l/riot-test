import {
  InvalidProviderData,
  ProviderImportService,
} from '../services/employee-directory-import/provider-import.service';
import { ManualImportService } from '../services/employee-directory-import/manual-import.service';
import { Request, Response } from 'express';
import { DuplicateError, getEmployees as getEmployeesFromDB } from '../models/employee.model';

export const createEmployeeManually = async (req: Request, res: Response): Promise<void> => {
  const importService = new ManualImportService();

  const payload = { ...req.body };

  try {
    await importService.importEmployee(payload);
  } catch (e) {
    if (e instanceof DuplicateError) {
      res.status(409);
    } else {
      res.status(500);
    }
    res.send();
    return;
  }

  res.status(201);
  res.send();
};

export const createEmployeeFromProvider = async (req: Request, res: Response): Promise<void> => {
  const importService = new ProviderImportService();

  const payload = { ...req.body };

  try {
    const result = await importService.importEmployees(payload);
    res.status(201);
    res.send(result);
    return;
  } catch (e) {
    if (e instanceof DuplicateError) {
      res.status(409);
    } else if (e instanceof InvalidProviderData) {
      res.status(400);
    } else {
      res.status(500);
    }
  }
  res.send();
};

export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getEmployeesFromDB();
    res.status(200);
    res.send(result);
    return;
  } catch (e) {
    res.status(500);
  }
  res.send();
};
