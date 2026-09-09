import { PharmacyOrder } from '../types';
import { orderRepository, OrderRepository } from '../repositories/order.repository';
import { medicineRepository } from '../repositories/medicine.repository';
import { auditService } from './audit.service';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export interface CheckoutItemRequest {
  medicineId: string;
  quantity: number;
}

export interface CheckoutRequest {
  patientName: string;
  address: string;
  doctorName?: string;
  doctorNpi?: string;
  items: CheckoutItemRequest[];
  paymentMethod?: 'apple_pay' | 'card' | 'hsa';
}

export interface CheckoutResult {
  order: PharmacyOrder;
  escrow: {
    escrowId: string;
    authorizedAmountUsd: number;
    status: 'escrow_hold_active';
    settlementTrigger: string;
    courierPin: string;
  };
}

export class OrderService {
  constructor(private repo: OrderRepository = orderRepository) {}

  public async getAllOrders(status?: string): Promise<PharmacyOrder[]> {
    return this.repo.findAll(status);
  }

  public async getOrderById(id: string): Promise<PharmacyOrder> {
    const order = await this.repo.findById(id);
    if (!order) {
      throw new AppError(
        `Order '${id}' was not found.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }
    return order;
  }

  public async checkout(req: CheckoutRequest): Promise<CheckoutResult> {
    if (!req.items || req.items.length === 0) {
      throw new AppError(
        'Cart must contain at least one medicine item to checkout.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    let subtotalGeneric = 0;
    let subtotalBrand = 0;
    const orderItems: PharmacyOrder['items'] = [];

    for (const cartItem of req.items) {
      const med = await medicineRepository.findById(cartItem.medicineId);
      if (!med) {
        throw new AppError(
          `Medicine with ID '${cartItem.medicineId}' is no longer available.`,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }

      const qty = Math.max(1, cartItem.quantity);
      subtotalGeneric += med.genericPrice * qty;
      subtotalBrand += med.brandPrice * qty;

      orderItems.push({
        medicineName: `${med.brandName}`,
        dosage: med.dosage,
        quantity: qty,
        batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}-${med.id.slice(-3).toUpperCase()}`,
        shelfLocation: `Bay ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(1 + Math.random() * 8)}`,
        verified: false,
        scannedBarcode: `SKU-${med.id.toUpperCase()}`,
      });
    }

    const genericDiscount = 3.0;
    const dispensingFee = 1.14;
    const totalAmount = parseFloat(Math.max(0, subtotalGeneric - genericDiscount + dispensingFee).toFixed(2));
    const savingsAmount = parseFloat((subtotalBrand - subtotalGeneric).toFixed(2));

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `ORD-${randomSuffix}`;
    const courierPin = Math.floor(1000 + Math.random() * 9000).toString();
    const escrowId = `ESC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = await this.repo.create({
      orderNumber,
      patientName: req.patientName,
      address: req.address || 'Austin, TX 78701',
      doctorName: req.doctorName || 'Dr. Arthur Vance, MD',
      doctorNpi: req.doctorNpi || '1902847119',
      timestamp: 'Just now',
      items: orderItems,
      totalAmount,
      savingsAmount,
      status: 'action_required',
      prescriptionVerified: false,
      pharmacistSigned: false,
      courierName: 'FlashMed Logistics Node #4',
      courierPin,
      courierHandoverDone: false,
    });

    auditService.logEvent({
      tenantId: 'tenant-patient-001',
      userId: req.patientName,
      userRole: 'customer',
      action: 'ESCROW_HOLD_AUTHORIZED',
      resource: 'orders',
      resourceId: newOrder.id,
      details: { orderNumber, totalAmount, escrowId, itemsCount: orderItems.length },
    });

    return {
      order: newOrder,
      escrow: {
        escrowId,
        authorizedAmountUsd: totalAmount,
        status: 'escrow_hold_active',
        settlementTrigger: 'COURIER_HANDOVER_CONFIRMED',
        courierPin,
      },
    };
  }

  public async toggleItemVerification(orderId: string, itemIdx: number): Promise<PharmacyOrder> {
    const order = await this.getOrderById(orderId);
    if (!order.items[itemIdx]) {
      throw new AppError(
        `Item at index ${itemIdx} does not exist on order '${orderId}'.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    const updatedItems = [...order.items];
    updatedItems[itemIdx].verified = !updatedItems[itemIdx].verified;

    const allVerified = updatedItems.every((i) => i.verified);
    const newStatus = allVerified && order.status === 'action_required' ? 'dispensing' : order.status;

    const updated = await this.repo.update(order.id, {
      items: updatedItems,
      status: newStatus,
    });

    return updated!;
  }

  public async pharmacistSignoff(
    orderId: string,
    pharmacistName: string = 'Dr. Arthur Pendelton, R.Ph #49021'
  ): Promise<PharmacyOrder> {
    const order = await this.getOrderById(orderId);

    if (order.status === 'dispatched') {
      throw new AppError(
        `Order '${orderId}' has already been dispatched.`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.CONFLICT
      );
    }

    const updated = await this.repo.update(order.id, {
      pharmacistSigned: true,
      prescriptionVerified: true,
      pharmacistName,
      status: 'packaged',
    });

    auditService.logEvent({
      tenantId: 'node-apollo-4',
      userId: pharmacistName,
      userRole: 'pharmacy',
      action: 'PHARMACIST_QUALITY_SIGNOFF',
      resource: 'orders',
      resourceId: order.id,
      details: { orderNumber: order.orderNumber, pharmacistName, status: 'packaged' },
    });

    return updated!;
  }

  public async courierHandover(orderId: string, enteredPin?: string): Promise<PharmacyOrder> {
    const order = await this.getOrderById(orderId);

    if (!order.pharmacistSigned) {
      throw new AppError(
        'Cannot dispatch order before licensed pharmacist quality sign-off.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.FORBIDDEN
      );
    }

    if (enteredPin && order.courierPin && enteredPin.trim() !== order.courierPin.trim()) {
      throw new AppError(
        'Invalid courier handover PIN entered.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const updated = await this.repo.update(order.id, {
      courierHandoverDone: true,
      status: 'dispatched',
    });

    auditService.logEvent({
      tenantId: 'node-apollo-4',
      userId: 'courier-flashmed',
      userRole: 'pharmacy',
      action: 'COURIER_HANDOVER_DISPATCHED',
      resource: 'orders',
      resourceId: order.id,
      details: { orderNumber: order.orderNumber, status: 'dispatched', escrowSettled: true },
    });

    return updated!;
  }
}

export const orderService = new OrderService();
