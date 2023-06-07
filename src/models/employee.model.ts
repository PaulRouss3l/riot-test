import { client, notFoundExn } from '../lib/database';

export class DuplicateError extends Error {}

export interface Employee {
  id: string;
  name: string;
  email: string;
  secondary_emails?: string[];
  googleUserId?: string;
  slackUserId?: string;
}

export interface EmployeePayload {
  name: string;
  email: string;
  secondary_emails?: string[];
  googleUserId?: string;
  slackUserId?: string;
}

export const createEmployee = async (payload: EmployeePayload): Promise<Employee> => {
  const duplicate = await getEmployeeByEmail(payload.email);
  if (duplicate) throw new DuplicateError();

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
  return notFoundExn(await getEmployeeByEmail(payload.email));
};

export const getEmployeeByEmail = async (email: string): Promise<Employee | null> => {
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
