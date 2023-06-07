import { Employee } from 'src/services/employee-directory-import/employee-directory-import.service';
import { client } from '../lib/database';

export interface EmployeePayload {
  name: string;
  email: string;
  secondary_emails?: string[];
  googleUserId?: string;
  slackUserId?: string;
}

export const createEmployee = async (payload: EmployeePayload): Promise<Employee> => {
  await client.query(
    `
  INSERT INTO employees(
    name, email
    )
    VALUES ($1, $2)
    `,
    [
      payload.name,
      payload.email,
      // payload.secondary_emails || [],
      // payload.googleUserId || null,
      // payload.slackUserId || null
    ],
  );

  return getEmployeeByEmail(payload.email);
};

export const getEmployeeByEmail = async (email: string): Promise<Employee> => {
  const result = await client.query(
    `
    SELECT *
    FROM employees
    WHERE email=$1
  `,
    [email],
  );

  return result.rows[0];
};
