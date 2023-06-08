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
  google_user_id?: string;
  slack_user_id?: string;
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
    const params = [];
    const updateClauses = [];
    let offset = 1;
    for (const k in employee) {
      const param = employee[k as keyof EmployeePayload];
      // remove null fields, primary email and id as we don't want to change thoses data
      if (param != null && !['email', 'id'].includes(k) && !(typeof param == 'object' && param.length == 0)) {
        updateClauses.push(`${k}=$${offset++}`);
        params.push(param);
      }
    }
    params.push(employee.email);

    await client.query(
      `
    UPDATE employees SET ${updateClauses.join(', ')}
    WHERE email=$${offset}
    `,
      params,
    );
  } else {
    const params = [
      employee.name,
      employee.email,
      employee.secondary_emails || [],
      employee.google_user_id || null,
      employee.slack_user_id || null,
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

  return result.rows[0] || null;
};
