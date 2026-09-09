import { Router } from 'express';
import authRoutes from './auth.routes';
import aiRoutes from './ai.routes';
import fhirRoutes from './fhir.routes';
import telemetryRoutes from './telemetry.routes';
import medicineRoutes from './medicine.routes';
import orderRoutes from './order.routes';
import pharmacyRoutes from './pharmacy.routes';
import manufacturerRoutes from './manufacturer.routes';
import operationsRoutes from './operations.routes';
import gatewayRoutes from './gateway.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/prescriptions', aiRoutes);
apiRouter.use('/fhir', fhirRoutes);
apiRouter.use('/telemetry', telemetryRoutes);
apiRouter.use('/medicines', medicineRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/pharmacy', pharmacyRoutes);
apiRouter.use('/manufacturers', manufacturerRoutes);
apiRouter.use('/operations', operationsRoutes);
apiRouter.use('/gateway', gatewayRoutes);

export default apiRouter;
