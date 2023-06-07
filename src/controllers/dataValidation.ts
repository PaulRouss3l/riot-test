import Ajv, { Schema } from 'ajv';
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const validateBody = (schema: Schema) => {
  const ajv = new Ajv();

  ajv.addFormat("email", /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)

  // compile schema
  const validate = ajv.compile(schema);

  // middleware that returns error if schema is not ok
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!validate(req.body)) {
      res.status(400).json(validate.errors);

      return;
    }
    next();
  };
};
