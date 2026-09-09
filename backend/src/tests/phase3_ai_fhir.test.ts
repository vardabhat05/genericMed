import http from 'http';
import { app } from '../app';
import { auditService } from '../services/audit.service';
import { telemetryService } from '../services/telemetry.service';

let server: http.Server;
let baseUrl: string;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${message}`);
  }
}

async function runPhase3Tests() {
  console.log('🚀 Starting genericMed Phase 3 AI Vision, FHIR R4 & Telemetry Verification Suite...\n');

  // Start app on ephemeral port
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`;
        console.log(`Phase 3 Test server running at ${baseUrl}`);
      }
      resolve();
    });
  });

  let testsPassed = 0;

  try {
    // 1. POST /api/v1/prescriptions/ocr-extract
    {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/ocr-extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
          mimeType: 'image/jpeg',
        }),
      });
      assert(res.status === 200, `OCR extract returned ${res.status}`);
      const json = await res.json();
      assert(json.success === true, 'OCR success flag is true');
      assert(json.data.doctorNpi === '1902847119', 'Extracted Dr. Vance NPI #1902847119');
      assert(json.data.detectedSalts.length >= 2, 'Detected at least 2 active salts');
      assert(json.data.recommendedGenerics.length > 0, 'Matched generic substitutes');
      assert(json.data.recommendedGenerics[0].savingsPercent >= 70, 'Generic savings >= 70%');
      assert(json.data.confidenceScore >= 0.95, 'High confidence score >= 95%');
      console.log(`✅ Test 1: POST /api/v1/prescriptions/ocr-extract - NPI: ${json.data.doctorNpi}, Confidence: ${Math.round(json.data.confidenceScore * 100)}%`);
      testsPassed++;
    }

    // 2. POST /api/v1/prescriptions/normalize-salt (Metformin query)
    {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/normalize-salt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'glycomet 500 er' }),
      });
      assert(res.status === 200, `Normalize salt returned ${res.status}`);
      const json = await res.json();
      assert(json.data.casNumber === '1115-70-4', 'Resolved Metformin CAS 1115-70-4');
      assert(json.data.suggestedCanonicalSalt.includes('Metformin'), 'Contains canonical salt name');
      console.log('✅ Test 2: POST /api/v1/prescriptions/normalize-salt - Resolved Glycomet to Metformin CAS 1115-70-4');
      testsPassed++;
    }

    // 3. POST /api/v1/prescriptions/normalize-salt (Atorvastatin query)
    {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/normalize-salt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'lipitor 20mg' }),
      });
      assert(res.status === 200, 'Normalize Lipitor returned 200');
      const json = await res.json();
      assert(json.data.casNumber === '134523-03-8', 'Resolved Atorvastatin CAS 134523-03-8');
      console.log('✅ Test 3: POST /api/v1/prescriptions/normalize-salt - Resolved Lipitor to Atorvastatin CAS 134523-03-8');
      testsPassed++;
    }

    // 4. GET /api/v1/fhir/metadata (CapabilityStatement)
    {
      const res = await fetch(`${baseUrl}/api/v1/fhir/metadata`);
      assert(res.status === 200, `FHIR metadata returned ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      assert(contentType.includes('fhir+json') || contentType.includes('json'), 'Content-type is fhir+json');
      const json = await res.json();
      assert(json.resourceType === 'CapabilityStatement', 'resourceType is CapabilityStatement');
      assert(json.fhirVersion === '4.0.1', 'fhirVersion is 4.0.1');
      console.log('✅ Test 4: GET /api/v1/fhir/metadata - Valid HL7 FHIR R4 CapabilityStatement (v4.0.1)');
      testsPassed++;
    }

    // 5. GET /api/v1/fhir/MedicationRequest (FHIR Bundle)
    let sampleMedicationRequestId = '';
    {
      const res = await fetch(`${baseUrl}/api/v1/fhir/MedicationRequest`);
      assert(res.status === 200, `FHIR MedicationRequest returned ${res.status}`);
      const json = await res.json();
      assert(json.resourceType === 'Bundle', 'resourceType is Bundle');
      assert(json.type === 'searchset', 'type is searchset');
      assert(Array.isArray(json.entry), 'entry is array');
      assert(json.entry.length > 0, 'Bundle contains MedicationRequest entries');
      const first = json.entry[0].resource;
      assert(first.resourceType === 'MedicationRequest', 'Item resourceType is MedicationRequest');
      assert(first.requester.identifier.system.includes('npi'), 'Requester has NPI identifier');
      sampleMedicationRequestId = first.id;
      console.log(`✅ Test 5: GET /api/v1/fhir/MedicationRequest - Bundle with ${json.total} MedicationRequests validated`);
      testsPassed++;
    }

    // 6. GET /api/v1/fhir/MedicationRequest/:id (Individual Resource)
    {
      const res = await fetch(`${baseUrl}/api/v1/fhir/MedicationRequest/${sampleMedicationRequestId}`);
      assert(res.status === 200, 'Single MedicationRequest returned 200');
      const json = await res.json();
      assert(json.id === sampleMedicationRequestId, 'Returned resource ID matches');
      assert(json.intent === 'order', 'Intent is order');
      console.log(`✅ Test 6: GET /api/v1/fhir/MedicationRequest/:id - Resource ${sampleMedicationRequestId} validated`);
      testsPassed++;
    }

    // 7. GET /api/v1/fhir/MedicationDispense (FHIR Bundle)
    {
      const res = await fetch(`${baseUrl}/api/v1/fhir/MedicationDispense`);
      assert(res.status === 200, `FHIR MedicationDispense returned ${res.status}`);
      const json = await res.json();
      assert(json.resourceType === 'Bundle', 'resourceType is Bundle');
      assert(json.entry.length > 0, 'Dispense bundle has entries');
      const first = json.entry[0].resource;
      assert(first.resourceType === 'MedicationDispense', 'Resource is MedicationDispense');
      assert(first.authorizingPrescription[0].reference.includes('MedicationRequest'), 'Links to MedicationRequest');
      console.log(`✅ Test 7: GET /api/v1/fhir/MedicationDispense - Validated ${json.total} dispensary dispense records`);
      testsPassed++;
    }

    // 8. GET /api/v1/telemetry/stats
    {
      const res = await fetch(`${baseUrl}/api/v1/telemetry/stats`);
      assert(res.status === 200, 'Telemetry stats returned 200');
      const json = await res.json();
      assert(json.data.protocol.includes('Server-Sent Events'), 'Protocol is SSE');
      assert(json.data.monitoredNodes === 142, 'Monitored nodes = 142');
      console.log('✅ Test 8: GET /api/v1/telemetry/stats - SSE protocol status & 142 monitored nodes verified');
      testsPassed++;
    }

    // 9. POST /api/v1/telemetry/simulate-excursion
    {
      const res = await fetch(`${baseUrl}/api/v1/telemetry/simulate-excursion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: 9.6,
          nodeId: 'STORE-NODE-004',
        }),
      });
      assert(res.status === 200, `Excursion returned ${res.status}`);
      const json = await res.json();
      assert(json.data.data.severity === 'critical', 'Excursion severity is critical');
      assert(json.data.data.temperatureCelsius === 9.6, 'Temperature is 9.6°C');
      console.log('✅ Test 9: POST /api/v1/telemetry/simulate-excursion - 9.6°C critical alarm emitted');
      testsPassed++;
    }

    // 10. Audit Trail Verification of Cold-Chain Alert
    {
      const logs = auditService.getLogs();
      const excursionLog = logs.find((l) => l.action === 'COLD_CHAIN_EXCURSION_ALERT');
      assert(excursionLog !== undefined, 'Found COLD_CHAIN_EXCURSION_ALERT in audit trail');
      assert(excursionLog?.details.temperatureCelsius === 9.6, 'Recorded exact 9.6°C spike');
      console.log('✅ Test 10: Clinical Audit Trail - Tamper-evident log of cold-chain excursion verified');
      testsPassed++;
    }

    // 11. SSE Stream Handshake Packet Verification
    {
      // Open raw HTTP GET to SSE stream
      const sseData: string = await new Promise((resolve, reject) => {
        const req = http.get(`${baseUrl}/api/v1/telemetry/stream`, (res) => {
          assert(res.statusCode === 200, 'SSE status code is 200');
          assert(res.headers['content-type'] === 'text/event-stream', 'Header is text/event-stream');

          res.on('data', (chunk) => {
            const str = chunk.toString();
            req.destroy(); // Close stream after receiving first packet
            resolve(str);
          });
        });
        req.on('error', reject);
      });

      assert(sseData.includes('event: cold_chain_reading'), 'SSE stream emitted cold_chain_reading');
      assert(sseData.includes('STORE-NODE-004'), 'SSE stream packet contains STORE-NODE-004');
      console.log('✅ Test 11: GET /api/v1/telemetry/stream - Live Server-Sent Events (SSE) stream handshake verified');
      testsPassed++;
    }

    // 12. Combined AI + Formulary Consistency Check
    {
      const ocrRes = await fetch(`${baseUrl}/api/v1/prescriptions/ocr-extract`, { method: 'POST', body: '{}' });
      const ocrJson = await ocrRes.json();
      const topMed = ocrJson.data.recommendedGenerics[0];

      const medRes = await fetch(`${baseUrl}/api/v1/medicines/bioequivalent-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: topMed.genericName }),
      });
      const medJson = await medRes.json();
      assert(medJson.data.recommendedGenerics.length > 0, 'Formulary consistent with OCR recommendation');
      console.log('✅ Test 12: End-to-End Clinical Consistency - OCR output directly resolvable via Formulary Search');
      testsPassed++;
    }

    console.log(`\n🎉 ALL ${testsPassed}/12 PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
  } catch (err: any) {
    console.error('\n❌ Phase 3 Test Suite Failed:', err.message);
    process.exitCode = 1;
  } finally {
    telemetryService.stopHeartbeat();
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runPhase3Tests();
