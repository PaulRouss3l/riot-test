import { ProviderPayload } from '../../schemas/ProviderPayload.schema';
import { EmployeePayload, createOrUpdate } from '../../models/employee.model';
import ProviderDataJSON from '../../schemas/ProviderData.json';
import { ProviderData } from '../../schemas/ProviderData.schema';
import axios, { AxiosError } from 'axios';
import Ajv, { Schema } from 'ajv';

interface ProviderEmployee {
  id: string;
  name: string;
  email: string;
}

export class UnknownProvider extends Error {}
export class InvalidProviderData extends Error {}

export class ProviderImportService {
  private async getDataFromProvider(payload: ProviderPayload): Promise<ProviderData> {
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

  private static ProviderPayloadPayload(provider: string, employee: ProviderEmployee): EmployeePayload {
    const response: EmployeePayload = {
      name: employee.name,
      email: employee.email,
      secondary_emails: [],
    };
    if (provider == 'Google') response.googleUserId = employee.id;
    if (provider == 'Slack') response.slackUserId = employee.id;
    return response;
  }

  async importEmployees(payload: ProviderPayload): Promise<ProviderData> {
    const data = await this.getDataFromProvider(payload);

    await Promise.all(
      data.employees
        .map((employee) => ProviderImportService.ProviderPayloadPayload(data.provider, employee))
        .map(async (employee) => await createOrUpdate(employee)),
    );

    return data;
  }
}
