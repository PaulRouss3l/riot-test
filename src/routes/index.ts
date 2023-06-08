import { Router } from 'express';
import { createEmployeeFromProvider, createEmployeeManually, getEmployees } from '../controllers/employee';
import { validateBody } from '../controllers/dataValidation';
import ManualPayload from '../schemas/ManualPayload.json';
import ProviderPayload from '../schemas/ProviderPayload.json';

const router = Router();

router.post('/employees', validateBody(ManualPayload), createEmployeeManually);
router.get('/employees', getEmployees);
router.post('/import', validateBody(ProviderPayload), createEmployeeFromProvider);

export default router;
