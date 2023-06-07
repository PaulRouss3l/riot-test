import { ProviderPayload } from '../../schemas/ProviderPayload.schema';
import { Employee, createEmployee } from '../../models/employee.model';

export class ProviderImportService {
  async importEmployee(payload: ProviderPayload): Promise<Employee> {
    // not needed yet for provider import
    throw new Error('Method not implemented.');

  }

  importEmployees(payload: ProviderPayload): void {
    throw new Error('Method not implemented.');
  }
}
