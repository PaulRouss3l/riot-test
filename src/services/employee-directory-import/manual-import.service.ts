import { ManualPayload } from '../../schemas/ManualPayload.schema';
import { Employee, createEmployee } from '../../models/employee.model';

export class ManualImportService {
  async importEmployee(payload: ManualPayload): Promise<Employee> {
    return await createEmployee(payload);
  }
}
