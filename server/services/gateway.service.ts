import { ApiGatewayClient, WebhookKafkaEvent } from '../../src/types';
import { gatewayRepository, GatewayRepository } from '../repositories/gateway.repository';
import { medicineService } from './medicine.service';
import { AppError } from '../middleware/errorHandler';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export class GatewayService {
  constructor(private repo: GatewayRepository = gatewayRepository) {}

  public async getAllClients(): Promise<ApiGatewayClient[]> {
    return this.repo.findAllClients();
  }

  public async getClientById(id: string): Promise<ApiGatewayClient> {
    const client = await this.repo.findClientById(id);
    if (!client) {
      throw new AppError(
        `API client '${id}' was not found.`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }
    return client;
  }

  public async getKafkaEvents(topic?: string): Promise<WebhookKafkaEvent[]> {
    return this.repo.findAllEvents(topic);
  }

  public async emitKafkaEvent(
    topic: string,
    payload: Record<string, any>
  ): Promise<WebhookKafkaEvent> {
    if (!topic || !topic.trim()) {
      throw new AppError(
        'Kafka topic name is required.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }
    return this.repo.emitEvent(topic, payload || {});
  }

  public async runApiExplorerTest(
    endpoint: string,
    payload: Record<string, any> = {}
  ): Promise<{ status: string; data: any; executionTimeMs: number }> {
    const start = Date.now();

    if (endpoint === '/v1/medicines/bioequivalent-search') {
      const queryBrand = payload.query_brand || payload.query || 'Glucophage XR';
      const dosage = payload.dosage_filter || '500mg';
      const results = await medicineService.searchBioequivalentGenerics(queryBrand, dosage, 3);
      const executionTimeMs = Math.max(12, Date.now() - start);

      return {
        status: 'success',
        data: {
          canonical_salt: results.canonicalSalt,
          brand_query: results.brandQuery,
          reference_innovator_price_usd: results.referenceInnovatorPriceUsd,
          recommended_generics: results.recommendedGenerics.map((g) => ({
            generic_name: g.genericName,
            manufacturer: g.manufacturer,
            bioequivalence_score_pct: g.bioequivalenceScorePct,
            f2_similarity_metric: g.f2SimilarityMetric,
            fda_rating: g.fdaRating,
            price_usd: g.priceUsd,
            savings_pct: g.savingsPct,
            in_stock_local_hubs: 142,
          })),
          telemetry: {
            cache_hit: true,
            cluster_node: 'us-central1-gmed-01',
            execution_time_ms: executionTimeMs,
          },
        },
        executionTimeMs,
      };
    }

    if (endpoint === '/v1/orders/escrow/pre-authorize') {
      const executionTimeMs = Math.max(14, Date.now() - start);
      return {
        status: 'escrow_hold_active',
        data: {
          escrow_id: `ESC-${Math.floor(100000 + Math.random() * 900000)}`,
          authorized_amount_usd: payload.amount || 13.94,
          target_dispensary_node: 'STORE-NODE-004',
          settlement_trigger: 'PHARMACIST_QUALITY_SIGNOFF',
          courier_handshake_pin: '8492',
        },
        executionTimeMs,
      };
    }

    // Default /v1/dispensary/nearby-nodes
    const executionTimeMs = Math.max(11, Date.now() - start);
    return {
      status: 'success',
      data: {
        dispensary_nodes_within_5_miles: 4,
        nearest_node: {
          id: 'STORE-NODE-004',
          name: 'Apollo Pharmacy - Downtown Hub',
          distance_miles: 0.8,
          eta_minutes: 35,
          skus_in_stock: ['GM-500-ER', 'ATV-020-CL', 'AUG-625-DX'],
        },
      },
      executionTimeMs,
    };
  }
}

export const gatewayService = new GatewayService();
