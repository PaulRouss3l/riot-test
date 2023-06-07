import { Router } from 'express';
import { createEmployeeManually } from '../controllers/employee';
import { validateBody } from '../controllers/dataValidation';
import ManualPayload from '../schemas/ManualPayload.json';

const router = Router();

router.post('/employees', validateBody(ManualPayload), createEmployeeManually);

export default router;
