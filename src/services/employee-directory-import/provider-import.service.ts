import { ProviderPayload } from '../../schemas/ProviderPayload.schema';
import { Employee, createEmployee, getEmployeeByEmail } from '../../models/employee.model';
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

  async importEmployees(payload: ProviderPayload): Promise<ProviderData> {
    const employees = await this.getDataFromProvider(payload);

    // create employees

    return employees;
  }
}
