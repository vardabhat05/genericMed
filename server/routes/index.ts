import { Router } from 'express';
import medicineRoutes from './medicine.routes';
import orderRoutes from './order.routes';
import pharmacyRoutes from './pharmacy.routes';
import manufacturerRoutes from './manufacturer.routes';
import operationsRoutes from './operations.routes';
import gatewayRoutes from './gateway.routes';

const apiRouter = Router();

apiRouter.use('/medicines', medicineRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/pharmacy', pharmacyRoutes);
apiRouter.use('/manufacturers', manufacturerRoutes);
apiRouter.use('/operations', operationsRoutes);
apiRouter.use('/gateway', gatewayRoutes);

export default apiRouter;
