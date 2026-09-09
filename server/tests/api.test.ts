import http from 'http';
import { app } from '../app';

let server: http.Server;
let baseUrl: string;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting genericMed Phase 1 Backend Verification Suite...\n');

  // Start app on ephemeral port
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`;
        console.log(`Test server running at ${baseUrl}`);
      }
      resolve();
    });
  });

  let testsPassed = 0;

  try {
    // 1. Health Check
    {
      const res = await fetch(`${baseUrl}/health`);
      assert(res.status === 200, `Health check returned ${res.status}`);
      const json = await res.json();
      assert(json.success === true, 'Health check success flag is true');
      assert(json.data.status === 'healthy', 'Health check status is healthy');
      assert(json.data.activeNodesLive === 142, 'Live nodes report 142');
      console.log('✅ Test 1: GET /health - OK');
      testsPassed++;
    }

    // 2. GET /api/v1/medicines
    {
      const res = await fetch(`${baseUrl}/api/v1/medicines`);
      assert(res.status === 200, `Medicines returned ${res.status}`);
      const json = await res.json();
      assert(json.success === true, 'Medicines response success flag');
      assert(Array.isArray(json.data), 'Medicines data is array');
      assert(json.data.length >= 4, 'Contains at least 4 medicines');
      console.log(`✅ Test 2: GET /api/v1/medicines - Loaded ${json.data.length} medicines`);
      testsPassed++;
    }

    // 3. GET /api/v1/medicines/:id
    {
      const res = await fetch(`${baseUrl}/api/v1/medicines/med-glycomet-500`);
      assert(res.status === 200, `Single medicine returned ${res.status}`);
      const json = await res.json();
      assert(json.data.id === 'med-glycomet-500', 'Medicine ID matches');
      assert(json.data.f2SimilarityMetric === 78.4, 'f2 metric matches 78.4');
      assert(Array.isArray(json.data.dissolutionCurve), 'Dissolution curve is present');
      console.log('✅ Test 3: GET /api/v1/medicines/:id - Glycomet 500 details validated');
      testsPassed++;
    }

    // 4. POST /api/v1/medicines/bioequivalent-search
    {
      const res = await fetch(`${baseUrl}/api/v1/medicines/bioequivalent-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query_brand: 'Glucophage XR',
          dosage_filter: '500 mg',
          max_results: 3,
        }),
      });
      assert(res.status === 200, `Bioequivalent search returned ${res.status}`);
      const json = await res.json();
      assert(json.success === true, 'Search returned success');
      assert(json.data.recommendedGenerics.length > 0, 'Found generic substitutes');
      assert(json.data.recommendedGenerics[0].bioequivalenceScorePct >= 98, 'Bioequivalence score >= 98%');
      console.log(`✅ Test 4: POST /api/v1/medicines/bioequivalent-search - Found ${json.data.recommendedGenerics.length} AB substitutes`);
      testsPassed++;
    }

    // 5. POST /api/v1/orders/checkout (Escrow Pre-Authorization)
    let createdOrderId = '';
    let courierPin = '';
    {
      const res = await fetch(`${baseUrl}/api/v1/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Sarah Jenkins',
          address: '742 Evergreen Terrace, Austin, TX',
          doctorName: 'Dr. Arthur Vance, MD',
          doctorNpi: '1902847119',
          items: [
            { medicineId: 'med-glycomet-500', quantity: 2 },
            { medicineId: 'med-atorva-20', quantity: 1 },
          ],
        }),
      });
      assert(res.status === 201, `Checkout returned ${res.status}`);
      const json = await res.json();
      assert(json.success === true, 'Checkout succeeded');
      assert(json.data.order.status === 'action_required', 'Initial status is action_required');
      assert(json.data.escrow.status === 'escrow_hold_active', 'Escrow status is active');
      assert(json.data.escrow.escrowId.startsWith('ESC-'), 'Escrow ID generated');
      createdOrderId = json.data.order.id;
      courierPin = json.data.order.courierPin;
      console.log(`✅ Test 5: POST /api/v1/orders/checkout - Created #${json.data.order.orderNumber} with escrow vault hold`);
      testsPassed++;
    }

    // 6. POST /api/v1/orders/:id/verify-item
    {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/verify-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIndex: 0 }),
      });
      assert(res.status === 200, `Verify item returned ${res.status}`);
      const json = await res.json();
      assert(json.data.items[0].verified === true, 'Item 0 is verified');
      console.log('✅ Test 6: POST /api/v1/orders/:id/verify-item - Pharmacist barcode verified item 0');
      testsPassed++;
    }

    // 7. POST /api/v1/orders/:id/pharmacist-signoff
    {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/pharmacist-signoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pharmacistName: 'Dr. Arthur Pendelton, R.Ph #49021' }),
      });
      assert(res.status === 200, `Pharmacist signoff returned ${res.status}`);
      const json = await res.json();
      assert(json.data.pharmacistSigned === true, 'Pharmacist signed flag is true');
      assert(json.data.status === 'packaged', 'Order status is packaged');
      console.log('✅ Test 7: POST /api/v1/orders/:id/pharmacist-signoff - 4-Eye signoff complete, status: packaged');
      testsPassed++;
    }

    // 8. POST /api/v1/orders/:id/courier-handover (Escrow Settlement)
    {
      const res = await fetch(`${baseUrl}/api/v1/orders/${createdOrderId}/courier-handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierPin }),
      });
      assert(res.status === 200, `Courier handover returned ${res.status}`);
      const json = await res.json();
      assert(json.data.courierHandoverDone === true, 'Handover flag is true');
      assert(json.data.status === 'dispatched', 'Order status transitioned to dispatched');
      console.log('✅ Test 8: POST /api/v1/orders/:id/courier-handover - PIN verified, status: dispatched, escrow released');
      testsPassed++;
    }

    // 9. Pharmacy Inventory & Barcode Scan
    {
      const scanRes = await fetch(`${baseUrl}/api/v1/pharmacy/scan-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: 'SKU-GM-500-ER', quantity: 50 }),
      });
      assert(scanRes.status === 200, `Scan stock returned ${scanRes.status}`);
      const scanJson = await scanRes.json();
      assert(scanJson.success === true, 'Scan stock succeeded');
      assert(scanJson.data.addedUnits === 50, 'Added 50 units');

      const telRes = await fetch(`${baseUrl}/api/v1/pharmacy/telemetry`);
      assert(telRes.status === 200, 'Telemetry returned 200');
      const telJson = await telRes.json();
      assert(telJson.data.nodeId === 'STORE-NODE-004', 'Dispensary node is STORE-NODE-004');
      assert(telJson.data.coldChainTempCelsius >= 2.0, 'Cold chain temp is safe');
      console.log('✅ Test 9: Pharmacy Inventory & Cold-Chain Telemetry - OK');
      testsPassed++;
    }

    // 10. Manufacturer Dossiers & RFQ Bidding
    {
      const rfqsRes = await fetch(`${baseUrl}/api/v1/manufacturers/rfqs`);
      assert(rfqsRes.status === 200, 'RFQs returned 200');
      const rfqsJson = await rfqsRes.json();
      assert(rfqsJson.data.length > 0, 'Open RFQs available');
      const targetRfq = rfqsJson.data[0];

      // Place competitive bid
      const newBid = parseFloat((targetRfq.targetMaxPrice * 0.85).toFixed(3));
      const bidRes = await fetch(`${baseUrl}/api/v1/manufacturers/rfqs/${targetRfq.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidPrice: newBid, manufacturerName: 'Zydus Lifesciences Ltd' }),
      });
      assert(bidRes.status === 200, `Place bid returned ${bidRes.status}`);
      const bidJson = await bidRes.json();
      assert(bidJson.data.currentLowestBid === newBid, 'Lowest bid updated');
      console.log(`✅ Test 10: Manufacturer RFQ Bidding - Submitted lowest bid $${newBid}/unit`);
      testsPassed++;
    }

    // 11. Operations Exception Triage & Canonical Mapping
    {
      const excRes = await fetch(`${baseUrl}/api/v1/operations/exceptions`);
      assert(excRes.status === 200, 'Exceptions returned 200');
      const excJson = await excRes.json();
      assert(excJson.data.length > 0, 'Exceptions present');

      // Resolve first exception
      const resolveRes = await fetch(`${baseUrl}/api/v1/operations/exceptions/${excJson.data[0].id}/resolve`, {
        method: 'POST',
      });
      assert(resolveRes.status === 200, 'Resolve exception returned 200');
      const resolveJson = await resolveRes.json();
      assert(resolveJson.data.status === 'resolved', 'Exception status is resolved');

      // Add new canonical salt
      const saltRes = await fetch(`${baseUrl}/api/v1/operations/canonical-mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawSearchTerm: 'Rosuvastatin Calcium',
          casNumber: '287714-41-4',
          strength: '10mg Film Coated',
        }),
      });
      assert(saltRes.status === 201, `Add salt returned ${saltRes.status}`);
      console.log('✅ Test 11: Operations Center - Exception resolved & canonical salt indexed');
      testsPassed++;
    }

    // 12. API Gateway Explorer & Kafka Event Emission
    {
      const testRunRes = await fetch(`${baseUrl}/api/v1/gateway/test-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/v1/medicines/bioequivalent-search',
          payload: { query_brand: 'Glucophage XR', max_results: 2 },
        }),
      });
      assert(testRunRes.status === 200, 'Test run returned 200');
      const testRunJson = await testRunRes.json();
      assert(testRunJson.data.recommended_generics.length > 0, 'Explorer generated results');

      const emitRes = await fetch(`${baseUrl}/api/v1/gateway/events/emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'dispensary.prescription.auto_substituted',
          payload: { test: true, timestamp: Date.now() },
        }),
      });
      assert(emitRes.status === 201, 'Emit Kafka event returned 201');
      console.log('✅ Test 12: API Gateway - Interactive Explorer & Kafka event emission verified');
      testsPassed++;
    }

    console.log(`\n🎉 ALL ${testsPassed}/12 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
  } catch (err: any) {
    console.error('\n❌ Test Suite Failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
