import { ApiGatewayClient, WebhookKafkaEvent } from '../../src/types';
import { API_GATEWAY_CLIENTS, MOCK_KAFKA_EVENTS } from '../../src/data/mockData';

export class GatewayRepository {
  private clients: ApiGatewayClient[];
  private kafkaEvents: WebhookKafkaEvent[];

  constructor() {
    this.clients = JSON.parse(JSON.stringify(API_GATEWAY_CLIENTS));
    this.kafkaEvents = JSON.parse(JSON.stringify(MOCK_KAFKA_EVENTS));
  }

  public async findAllClients(): Promise<ApiGatewayClient[]> {
    return [...this.clients];
  }

  public async findClientById(id: string): Promise<ApiGatewayClient | null> {
    const client = this.clients.find((c) => c.id === id);
    return client ? { ...client } : null;
  }

  public async findAllEvents(topic?: string): Promise<WebhookKafkaEvent[]> {
    if (!topic || topic === 'all') {
      return [...this.kafkaEvents];
    }
    return this.kafkaEvents.filter((e) => e.topic === topic);
  }

  public async emitEvent(
    topic: string,
    payload: Record<string, any>
  ): Promise<WebhookKafkaEvent> {
    const newEvent: WebhookKafkaEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      topic,
      timestamp: new Date().toISOString().slice(11, 23) + ' UTC',
      partition: Math.floor(Math.random() * 4),
      payload,
      status: 'delivered',
    };
    this.kafkaEvents.unshift(newEvent);
    return { ...newEvent };
  }
}

export const gatewayRepository = new GatewayRepository();
