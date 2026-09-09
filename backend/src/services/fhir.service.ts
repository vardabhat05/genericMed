import { orderRepository } from '../repositories/order.repository';
import { pharmacyRepository } from '../repositories/pharmacy.repository';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export interface FhirBundle<T> {
  resourceType: 'Bundle';
  type: 'searchset';
  total: number;
  entry: Array<{
    fullUrl: string;
    resource: T;
  }>;
}

export class FhirService {
  /**
   * Returns HL7 FHIR R4 CapabilityStatement (metadata)
   */
  public getCapabilityStatement(): Record<string, any> {
    return {
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: new Date().toISOString(),
      publisher: 'genericMed Healthcare Operating System',
      kind: 'instance',
      software: {
        name: 'genericMed FHIR Gateway',
        version: '4.0.1',
      },
      fhirVersion: '4.0.1',
      format: ['application/fhir+json', 'application/json'],
      rest: [
        {
          mode: 'server',
          documentation: 'Production HL7 FHIR R4 API for generic medicine prescription and dispensary interchange.',
          resource: [
            {
              type: 'MedicationRequest',
              interaction: [{ code: 'read' }, { code: 'search-type' }],
            },
            {
              type: 'MedicationDispense',
              interaction: [{ code: 'read' }, { code: 'search-type' }],
            },
          ],
        },
      ],
    };
  }

  /**
   * Maps orders into FHIR R4 MedicationRequest Bundle
   */
  public async getMedicationRequests(): Promise<FhirBundle<any>> {
    const orders = await orderRepository.findAll();

    const entries = orders.map((ord) => ({
      fullUrl: `https://api.genericmed.io/fhir/MedicationRequest/${ord.id}`,
      resource: {
        resourceType: 'MedicationRequest',
        id: ord.id,
        identifier: [
          {
            system: 'https://genericmed.io/orders',
            value: ord.orderNumber,
          },
        ],
        status: ord.status === 'dispatched' ? 'completed' : 'active',
        intent: 'order',
        medicationCodeableConcept: {
          text: ord.items.map((i) => `${i.medicineName} (${i.dosage})`).join(', '),
          coding: ord.items.map((i) => ({
            system: 'https://genericmed.io/formulary/sku',
            code: i.scannedBarcode || 'GEN-SKU',
            display: i.medicineName,
          })),
        },
        subject: {
          display: ord.patientName,
          reference: `Patient/${ord.patientName.replace(/\s+/g, '-').toLowerCase()}`,
        },
        requester: {
          display: ord.doctorName,
          identifier: {
            system: 'http://hl7.org/fhir/sid/us-npi',
            value: ord.doctorNpi,
          },
        },
        dosageInstruction: [
          {
            text: 'Take as directed by prescribing physician with meals.',
          },
        ],
        authoredOn: new Date().toISOString(),
      },
    }));

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: entries.length,
      entry: entries,
    };
  }

  /**
   * Returns single FHIR MedicationRequest by ID
   */
  public async getMedicationRequestById(id: string): Promise<any> {
    const ord = await orderRepository.findById(id);
    if (!ord) {
      throw new AppError(
        `FHIR MedicationRequest '${id}' was not found.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    return {
      resourceType: 'MedicationRequest',
      id: ord.id,
      identifier: [
        {
          system: 'https://genericmed.io/orders',
          value: ord.orderNumber,
        },
      ],
      status: ord.status === 'dispatched' ? 'completed' : 'active',
      intent: 'order',
      medicationCodeableConcept: {
        text: ord.items.map((i) => `${i.medicineName} (${i.dosage})`).join(', '),
      },
      subject: {
        display: ord.patientName,
      },
      requester: {
        display: ord.doctorName,
        identifier: {
          system: 'http://hl7.org/fhir/sid/us-npi',
          value: ord.doctorNpi,
        },
      },
      authoredOn: new Date().toISOString(),
    };
  }

  /**
   * Maps dispensary fulfillments into FHIR R4 MedicationDispense Bundle
   */
  public async getMedicationDispenses(): Promise<FhirBundle<any>> {
    const orders = await orderRepository.findAll();
    const telemetry = await pharmacyRepository.getTelemetry();

    const entries: any[] = [];

    for (const ord of orders) {
      ord.items.forEach((item, idx) => {
        entries.push({
          fullUrl: `https://api.genericmed.io/fhir/MedicationDispense/${ord.id}-${idx}`,
          resource: {
            resourceType: 'MedicationDispense',
            id: `${ord.id}-${idx}`,
            status: ord.status === 'dispatched' ? 'completed' : ord.status === 'packaged' ? 'in-progress' : 'preparation',
            medicationCodeableConcept: {
              text: `${item.medicineName} ${item.dosage}`,
            },
            subject: {
              display: ord.patientName,
            },
            performer: [
              {
                actor: {
                  display: ord.pharmacistName || 'Licensed Dispensary Pharmacist',
                  identifier: {
                    system: 'https://genericmed.io/pharmacy/nodes',
                    value: telemetry.nodeId,
                  },
                },
              },
            ],
            authorizingPrescription: [
              {
                reference: `MedicationRequest/${ord.id}`,
              },
            ],
            quantity: {
              value: item.quantity,
              unit: 'unit',
            },
            daysSupply: {
              value: 30,
              unit: 'days',
            },
            whenHandedOver: ord.courierHandoverDone ? new Date().toISOString() : undefined,
          },
        });
      });
    }

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: entries.length,
      entry: entries,
    };
  }
}

export const fhirService = new FhirService();
