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
    [payload.name, payload.email],
  );
  return notFoundExn(await getEmployeeByEmail(payload.email));
};

export const createOrUpdate = async (employee: EmployeePayload) => {
  const duplicate = await getEmployeeByEmail(employee.email);
  if (duplicate) {
    await client.query(
      `
    UPDATE employees SET
      name=$1,
      secondary_emails=$2,
      google_user_id=$3,
      slack_user_id=$4
    WHERE email=$5
    `,
      [
        employee.name,
        employee.secondary_emails || [],
        employee.googleUserId || null,
        employee.slackUserId || null,
        employee.email,
      ],
    );
  } else {
    const params = [
      employee.name,
      employee.email,
      employee.secondary_emails || [],
      employee.googleUserId || null,
      employee.slackUserId || null,
    ];
    await client.query(
      `
    INSERT INTO employees(
      name, email, secondary_emails, google_user_id, slack_user_id
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      params,
    );
  }
  return notFoundExn(await getEmployeeByEmail(employee.email));
};

export const getEmployeeByEmail = async (email: string): Promise<Employee | null> => {
  const result = await client.query(
    `
    SELECT id, name, email, secondary_emails, google_user_id as googleUserId, slack_user_id as slackUserId
    FROM employees
    WHERE email=$1
  `,
    [email],
  );

  return result.rows[0];
};
