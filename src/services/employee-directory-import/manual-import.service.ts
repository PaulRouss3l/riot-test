import { ManualPayload } from '../../schemas/ManualPayload.schema';
import { createEmployee } from '../../models/employee.model';
import { Employee, EmployeeDirectoryImportService } from './employee-directory-import.service';

export class DuplicateError extends Error {}

export class ManualImportService implements EmployeeDirectoryImportService {
  async importEmployee(payload: ManualPayload): Promise<Employee> {
    try {
      return await createEmployee(payload);
    } catch (e) {
      throw new DuplicateError();
    }
  }

  importEmployees(): void {
    // not needed yet for manual import
    throw new Error('Method not implemented.');
  }
}
