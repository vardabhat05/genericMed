import { Request, Response, NextFunction } from 'express';
import { gatewayService } from '../services/gateway.service';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../constants/http';

export class GatewayController {
  public async getClients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await gatewayService.getAllClients();
      successResponse(res, clients, 'API Gateway clients retrieved', HTTP_STATUS.OK, {
        total: clients.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getClientById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const client = await gatewayService.getClientById(id);
      successResponse(res, client);
    } catch (err) {
      next(err);
    }
  }

  public async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = req.query.topic as string | undefined;
      const events = await gatewayService.getKafkaEvents(topic);
      successResponse(res, events, 'Kafka webhook events retrieved', HTTP_STATUS.OK, {
        total: events.length,
      });
    } catch (err) {
      next(err);
    }
  }

  public async emitEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, payload } = req.body;
      const event = await gatewayService.emitKafkaEvent(topic, payload);
      successResponse(res, event, `Event emitted to topic '${topic}'`, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  public async runApiExplorerTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { endpoint, payload } = req.body;
      const result = await gatewayService.runApiExplorerTest(endpoint, payload);
      successResponse(res, result.data, 'API test executed', HTTP_STATUS.OK, {
        executionTimeMs: result.executionTimeMs,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const gatewayController = new GatewayController();
