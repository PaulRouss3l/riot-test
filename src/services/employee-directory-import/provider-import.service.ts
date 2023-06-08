import { ProviderPayload } from '../../schemas/ProviderPayload.schema';
import { EmployeePayload, createOrUpdate } from '../../models/employee.model';
import ProviderDataJSON from '../../schemas/ProviderData.json';
import { Employee, ProviderData } from '../../schemas/ProviderData.schema';
import axios, { AxiosError } from 'axios';
import Ajv, { Schema } from 'ajv';

export class UnknownProvider extends Error {}
export class InvalidProviderData extends Error {}

export class ProviderImportService {
  public async getDataFromProvider(payload: ProviderPayload): Promise<ProviderData> {
    try {
      const response = await axios.get<ProviderData>(payload.url);
      this.validateProviderData(response.data);

      return response.data;
    } catch (e) {
      if (e instanceof AxiosError) {
        throw new InvalidProviderData();
      }
      throw e;
    }
  }

  private validateProviderData = (data: ProviderData) => {
    // even if axios will catch most of the validation errors, we still need to check the email and the provider
    const ajv = new Ajv();

    ajv.addFormat('email', /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
    ajv.addFormat('provider', /^Slack|Google$/);

    // compile schema
    const validate = ajv.compile(ProviderDataJSON);

    if (!validate(data)) {
      throw new InvalidProviderData();
    }
    return data;
  };

  // DTO from provider to DB
  private static ProviderEmployeeToEmployeePayload(provider: string, employee: Employee): EmployeePayload {
    const response: EmployeePayload = {
      name: employee.name,
      email: '',
      secondary_emails: [],
    };

    // email handling
    if (employee.email) {
      response.email = employee.email;
    } else if (employee.emails) {
      const primaryEmail = employee.emails.find((email) => email.isPrimary);
      if (!primaryEmail) throw new InvalidProviderData();
      response.email = primaryEmail.address;
      const secondaryEmail = employee.emails.filter((email) => !email.isPrimary);
      response.secondary_emails = secondaryEmail.map((email) => email.address);
    } else {
      // we dont have any email, something's wrong
      throw new InvalidProviderData();
    }

    if (provider == 'Google') response.google_user_id = employee.id;
    if (provider == 'Slack') response.slack_user_id = employee.id;

    return response;
  }

  async importEmployees(payload: ProviderPayload): Promise<ProviderData> {
    const data = await this.getDataFromProvider(payload);

    await Promise.all(
      data.employees
        .map((employee) => ProviderImportService.ProviderEmployeeToEmployeePayload(data.provider, employee))
        .map(async (employee) => await createOrUpdate(employee)),
    );

    return data;
  }
}
