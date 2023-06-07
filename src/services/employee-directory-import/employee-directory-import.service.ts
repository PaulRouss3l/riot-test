import { ManualPayload } from '../../schemas/ManualPayload.schema';

export interface Employee {
  id: string;
  name: string;
  email: string;
  secondary_emails?: string[];
  googleUserId?: string;
  slackUserId?: string;
}

type EmployeePayload = ManualPayload;

export interface EmployeeDirectoryImportService {
  importEmployee(payload: EmployeePayload): Promise<Employee>;

  importEmployees(): void;
}
