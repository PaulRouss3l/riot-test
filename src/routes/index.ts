import { Router } from 'express';
import { createEmployeeFromProvider, createEmployeeManually } from '../controllers/employee';
import { validateBody } from '../controllers/dataValidation';
import ManualPayload from '../schemas/ManualPayload.json';
import ProviderPayload from '../schemas/ProviderPayload.json';

const router = Router();

router.post('/employees', validateBody(ManualPayload), createEmployeeManually);
router.post('/import', validateBody(ProviderPayload), createEmployeeFromProvider);

export default router;
