import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class OrderController {
  public async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const orders = await orderService.getAllOrders(status);
      successResponse(res, orders, 'Orders retrieved successfully', HTTP_STATUS.OK, {
        total: orders.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      successResponse(res, order);
    } catch (err) {
      next(err);
    }
  }

  public async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.checkout(req.body);
      successResponse(
        res,
        result,
        `Order #${result.order.orderNumber} placed & escrow hold authorized.`,
        HTTP_STATUS.CREATED
      );
    } catch (err) {
      next(err);
    }
  }

  public async verifyOrderItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { itemIndex } = req.body;
      const index = parseInt(itemIndex ?? req.body.itemIdx ?? '0', 10);
      const updated = await orderService.toggleItemVerification(id, index);
      successResponse(res, updated, 'Order item verification status toggled');
    } catch (err) {
      next(err);
    }
  }

  public async pharmacistSignoff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { pharmacistName } = req.body;
      const updated = await orderService.pharmacistSignoff(id, pharmacistName);
      successResponse(
        res,
        updated,
        `Order #${updated.orderNumber} digitally signed by ${updated.pharmacistName}. Status: Packaged.`
      );
    } catch (err) {
      next(err);
    }
  }

  public async courierHandover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { courierPin } = req.body;
      const updated = await orderService.courierHandover(id, courierPin);
      successResponse(
        res,
        updated,
        `Order #${updated.orderNumber} successfully handed to courier. Escrow payout released!`
      );
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
