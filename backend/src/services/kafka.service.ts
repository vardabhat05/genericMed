export interface KafkaMessage {
  id: string;
  topic: string;
  key?: string;
  partition: number;
  offset: number;
  timestamp: string;
  payload: Record<string, any>;
  headers?: Record<string, string>;
  status: 'published' | 'delivered' | 'dlq_routed';
  dlqReason?: string;
  retryCount?: number;
}

export class KafkaBrokerService {
  private eventLog: KafkaMessage[] = [];
  private dlqLog: KafkaMessage[] = [];
  private topicSubscribers: Map<string, ((msg: KafkaMessage) => Promise<void>)[]> = new Map();
  private offsetCounter: number = 1000;

  constructor() {
    this.seedDefaultEvents();
  }

  private seedDefaultEvents() {
    this.eventLog = [
      {
        id: 'evt-101',
        topic: 'dispensary.prescription.auto_substituted',
        key: 'patient-sarah-jenkins',
        partition: 0,
        offset: 1001,
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        payload: {
          originatorBrand: 'Glucophage XR 500mg',
          genericBrand: 'Glycomet 500mg ER',
          f2Similarity: 78.4,
          savingsPct: 79,
        },
        status: 'delivered',
      },
      {
        id: 'evt-102',
        topic: 'orders.escrow.authorized',
        key: 'ord-98241',
        partition: 1,
        offset: 1002,
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        payload: {
          orderId: 'ord-98241',
          escrowVaultId: 'ESC-904128',
          amountUsd: 13.94,
          nodeId: 'STORE-NODE-004',
        },
        status: 'delivered',
      },
      {
        id: 'evt-103',
        topic: 'pharmacy.coldchain.excursion',
        key: 'STORE-NODE-004',
        partition: 2,
        offset: 1003,
        timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        payload: {
          nodeId: 'STORE-NODE-004',
          temperatureC: 4.8,
          thresholdC: 6.0,
          status: 'nominal',
        },
        status: 'delivered',
      },
    ];
  }

  public async emitEvent(
    topic: string,
    payload: Record<string, any>,
    key?: string,
    headers?: Record<string, string>
  ): Promise<KafkaMessage> {
    this.offsetCounter++;
    const message: KafkaMessage = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      topic,
      key,
      partition: Math.floor(Math.random() * 4),
      offset: this.offsetCounter,
      timestamp: new Date().toISOString(),
      payload,
      headers: headers || { 'content-type': 'application/json', 'source': 'genericmed-core' },
      status: 'published',
      retryCount: 0,
    };

    this.eventLog.unshift(message);

    // Route to registered consumers
    const subscribers = this.topicSubscribers.get(topic) || [];
    for (const sub of subscribers) {
      try {
        await sub(message);
        message.status = 'delivered';
      } catch (err: any) {
        // Consumer failure triggers Dead Letter Queue (DLQ) routing
        message.status = 'dlq_routed';
        message.dlqReason = err?.message || 'Consumer processing failure';
        message.retryCount = (message.retryCount || 0) + 1;
        this.dlqLog.unshift({ ...message, topic: `dlq.${topic}` });
      }
    }

    if (subscribers.length === 0) {
      message.status = 'delivered';
    }

    return message;
  }

  public subscribe(topic: string, handler: (msg: KafkaMessage) => Promise<void>): () => void {
    if (!this.topicSubscribers.has(topic)) {
      this.topicSubscribers.set(topic, []);
    }
    this.topicSubscribers.get(topic)!.push(handler);

    return () => {
      const list = this.topicSubscribers.get(topic) || [];
      this.topicSubscribers.set(topic, list.filter(h => h !== handler));
    };
  }

  public getEvents(topicFilter?: string): KafkaMessage[] {
    if (topicFilter) {
      return this.eventLog.filter(e => e.topic === topicFilter);
    }
    return [...this.eventLog];
  }

  public getDlqMessages(topicFilter?: string): KafkaMessage[] {
    if (topicFilter) {
      return this.dlqLog.filter(e => e.topic === topicFilter || e.topic === `dlq.${topicFilter}`);
    }
    return [...this.dlqLog];
  }

  public async retryDlqMessage(dlqMessageId: string): Promise<boolean> {
    const idx = this.dlqLog.findIndex(m => m.id === dlqMessageId);
    if (idx === -1) return false;

    const dlqItem = this.dlqLog[idx];
    const originalTopic = dlqItem.topic.replace(/^dlq\./, '');
    
    // Re-emit to original topic
    await this.emitEvent(originalTopic, dlqItem.payload, dlqItem.key);
    this.dlqLog.splice(idx, 1);
    return true;
  }
}

export const kafkaBroker = new KafkaBrokerService();
