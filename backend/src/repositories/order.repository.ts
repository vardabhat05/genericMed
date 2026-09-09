import { PharmacyOrder } from '../types';
import { INITIAL_ORDERS } from '../data/mockData';

export class OrderRepository {
  private orders: PharmacyOrder[];

  constructor() {
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  }

  public async findAll(status?: string): Promise<PharmacyOrder[]> {
    if (!status || status === 'all') {
      return [...this.orders];
    }
    return this.orders.filter((o) => o.status === status);
  }

  public async findById(id: string): Promise<PharmacyOrder | null> {
    const order = this.orders.find((o) => o.id === id || o.orderNumber === id);
    return order ? { ...order } : null;
  }

  public async create(orderData: Omit<PharmacyOrder, 'id'> & { id?: string }): Promise<PharmacyOrder> {
    const id = orderData.id || `ord-${Date.now().toString().slice(-5)}`;
    const newOrder: PharmacyOrder = {
      ...orderData,
      id,
    };
    this.orders.unshift(newOrder);
    return { ...newOrder };
  }

  public async update(id: string, partial: Partial<PharmacyOrder>): Promise<PharmacyOrder | null> {
    const index = this.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (index === -1) return null;

    this.orders[index] = {
      ...this.orders[index],
      ...partial,
    };
    return { ...this.orders[index] };
  }

  public async count(): Promise<number> {
    return this.orders.length;
  }
}

export const orderRepository = new OrderRepository();
