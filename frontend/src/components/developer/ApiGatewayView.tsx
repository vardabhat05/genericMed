import React, { useState } from 'react';
import { 
  Code2, 
  Key, 
  Send, 
  Terminal, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  Radio, 
  ShieldCheck, 
  Activity, 
  Play, 
  FileCode, 
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { ApiGatewayClient, WebhookKafkaEvent } from '../../types';
import { API_GATEWAY_CLIENTS, MOCK_KAFKA_EVENTS } from '../../data/mockData';
import { apiClient } from '../../services/apiClient';

export const ApiGatewayView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clients' | 'explorer' | 'webhooks'>('clients');
  const [clients, setClients] = useState<ApiGatewayClient[]>(API_GATEWAY_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>('client-1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API Explorer state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/v1/medicines/bioequivalent-search');
  const [requestPayload, setRequestPayload] = useState<string>(
    JSON.stringify(
      {
        query_brand: "Glucophage XR",
        dosage_filter: "500mg",
        max_results: 3,
        include_pk_curve: true
      },
      null,
      2
    )
  );
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

  // Kafka events state
  const [kafkaEvents, setKafkaEvents] = useState<WebhookKafkaEvent[]>(MOCK_KAFKA_EVENTS);

  // Load clients and events on mount
  React.useEffect(() => {
    apiClient.gateway.getClients().then(res => {
      if (res?.data && res.data.length > 0) {
        setClients(res.data);
      }
    }).catch(() => {});

    apiClient.gateway.getEvents().then(res => {
      if (res?.data && res.data.length > 0) {
        setKafkaEvents(res.data);
      }
    }).catch(() => {});
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunApiTest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setResponseTimeMs(null);

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(requestPayload);
    } catch {
      parsedPayload = requestPayload;
    }

    try {
      const res = await apiClient.gateway.runExplorerTest(selectedEndpoint, parsedPayload, 'POST');
      setApiResponse(res.response);
      setResponseTimeMs(res.durationMs);
    } catch (err: any) {
      setApiResponse({ error: err.message, status: 'error' });
      setResponseTimeMs(15);
    } finally {
      setApiLoading(false);
    }
  };

  const handleEmitTestKafkaEvent = async () => {
    const topic = 'dispensary.prescription.auto_substituted';
    const payload = {
      eventId: 'SIM-' + Math.floor(Math.random() * 10000),
      originator: 'Lipitor 20mg',
      substitutedGeneric: 'Atorva 20mg (Zydus)',
      savingsDollars: 32.30,
      patientConsentHash: 'SHA256:4b20a91f',
    };

    try {
      const res = await apiClient.gateway.emitEvent(topic, payload);
      if (res?.data) {
        setKafkaEvents([res.data, ...kafkaEvents]);
        return;
      }
    } catch {
      // Fallback to local
    }

    const newEvent: WebhookKafkaEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      topic,
      timestamp: new Date().toISOString().slice(11, 23) + ' UTC',
      partition: Math.floor(Math.random() * 4),
      payload,
      status: 'delivered',
    };
    setKafkaEvents([newEvent, ...kafkaEvents]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Developer Header */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-500/40">
                API GATEWAY v3.1
              </span>
              <span className="text-slate-400 text-xs font-mono">OAuth 2.0 • HL7 FHIR R4 Compliant</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
              <Code2 className="w-7 h-7 text-cyan-400" />
              API Gateway & Developer Integration Console
            </h1>
            <p className="text-xs text-slate-400">
              Manage client credentials for Telehealth EHRs, PBM formularies, and retail POS bridges with live interactive sandbox explorer and Kafka webhook stream.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'clients'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registered Clients ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'explorer'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sandbox API Explorer
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'webhooks'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kafka Webhook Streams ({kafkaEvents.length})
            </button>
          </div>
        </div>

        {/* 5-Card Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Total Invocations</span>
            <p className="text-xl font-bold text-white font-mono mt-1">4.28M</p>
            <span className="text-[10px] text-cyan-400">Monthly Volume</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Active Client Apps</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">8</p>
            <span className="text-[10px] text-slate-400">EHRs, PBMs, Retail</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">Token Success Rate</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">99.98%</p>
            <span className="text-[10px] text-slate-400">Mutual TLS Enforced</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl">
            <span className="text-slate-400 text-xs font-mono">P99 Gateway Latency</span>
            <p className="text-xl font-bold text-cyan-400 font-mono mt-1">18ms</p>
            <span className="text-[10px] text-slate-400">Envoy Service Mesh</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-slate-400 text-xs font-mono">Rate Limit Quota</span>
            <p className="text-xl font-bold text-amber-400 font-mono mt-1">42.8%</p>
            <span className="text-[10px] text-slate-400">Aggregated Ceiling</span>
          </div>
        </div>

        {/* TAB 1: REGISTERED CLIENTS & KEY INFRASTRUCTURE */}
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Clients List (1 col) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>CLIENT APPLICATIONS</span>
                <span>TYPE</span>
              </div>

              <div className="space-y-2.5">
                {clients.map((cli) => {
                  const isSelected = cli.id === selectedClientId;
                  return (
                    <div
                      key={cli.id}
                      onClick={() => setSelectedClientId(cli.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500 shadow-md'
                          : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white">{cli.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-700 text-cyan-300 uppercase text-[10px]">
                          {cli.clientType}
                        </span>
                      </div>

                      <p className="text-xs font-mono text-slate-400 mt-1">{cli.apiKeyMasked}</p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/60 text-[11px] font-mono">
                        <span className="text-slate-400">{cli.currentRpm} / {cli.requestsPerMinLimit} RPM</span>
                        <span className="text-emerald-400 font-bold">ACTIVE</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Client Inspection Console (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-700 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 font-bold uppercase">{selectedClient.clientType} INTEGRATION</span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-xs text-slate-300">ID: {selectedClient.id}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-0.5">{selectedClient.name}</h2>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400">Monthly Usage</span>
                    <p className="text-base font-bold text-cyan-400">
                      {selectedClient.monthlyCalls.toLocaleString()} calls
                    </p>
                  </div>
                </div>

                {/* API Key Credentials */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                    Client Secret Key & Auth Header
                  </label>
                  <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-700 font-mono text-xs">
                    <Key className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300 flex-1">{selectedClient.apiKeyMasked}</span>
                    <button
                      onClick={() => handleCopy(selectedClient.apiKeyMasked)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition"
                    >
                      {copiedKey === selectedClient.apiKeyMasked ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === selectedClient.apiKeyMasked ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Include as: <code className="text-cyan-300 font-mono">Authorization: Bearer {selectedClient.apiKeyMasked}</code>
                  </p>
                </div>

                {/* OAuth 2.0 Scopes */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                    Authorized OAuth 2.0 Scopes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.activeScopes.map((scope, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-mono text-xs"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Webhook Sink */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                    Configured Webhook Destination
                  </label>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 font-mono text-xs text-slate-300 flex items-center justify-between">
                    <span>{selectedClient.webhookUrl}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">200 OK (Healthy)</span>
                  </div>
                </div>

                {/* Traffic Volume Bar */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Current Rate Limit Consumption</span>
                    <span className="text-white font-bold">{selectedClient.currentRpm} / {selectedClient.requestsPerMinLimit} RPM</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${(selectedClient.currentRpm / selectedClient.requestsPerMinLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE SANDBOX API EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Request Pane */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  API Request Builder
                </h3>
                <span className="text-xs font-mono text-slate-400">Sandbox Environment</span>
              </div>

              {/* Endpoint Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Endpoint Route</label>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-2 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs">
                    {selectedEndpoint.startsWith('/v1/pharmacies') ? 'GET' : 'POST'}
                  </span>
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="/v1/medicines/bioequivalent-search">POST /v1/medicines/bioequivalent-search</option>
                    <option value="/v1/orders/escrow/pre-authorize">POST /v1/orders/escrow/pre-authorize</option>
                    <option value="/v1/pharmacies/nearby-stock">GET /v1/pharmacies/nearby-stock</option>
                  </select>
                </div>
              </div>

              {/* Editable JSON Payload */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>JSON Body Payload</span>
                  <span className="text-[10px]">application/json</span>
                </div>
                <textarea
                  rows={8}
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <button
                onClick={handleRunApiTest}
                disabled={apiLoading}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                {apiLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Send Test Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Pane */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Response Output
                  </h3>
                  {responseTimeMs !== null && (
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-emerald-400 font-bold">200 OK</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-400">{responseTimeMs}ms</span>
                    </div>
                  )}
                </div>

                {apiResponse ? (
                  <div className="relative">
                    <pre className="p-4 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 font-mono text-xs space-y-2">
                    <FileCode className="w-8 h-8 mx-auto text-slate-600" />
                    <p>Click "Send Test Request" to execute against the sandbox gateway.</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-700 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Spec: OpenAPI 3.1 & HL7 FHIR R4</span>
                <span className="text-emerald-400">Strict TLS 1.3</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: KAFKA WEBHOOK EVENT STREAMS */}
        {activeTab === 'webhooks' && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Live Kafka Webhook Event Dispatcher
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time event stream emitting order lifecycle changes, cold-chain temperature alerts, and inventory reorders.
                </p>
              </div>

              <button
                onClick={handleEmitTestKafkaEvent}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Emit Test Event</span>
              </button>
            </div>

            {/* Event List */}
            <div className="space-y-3">
              {kafkaEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 font-mono text-xs space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400">{evt.topic}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Partition {evt.partition}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{evt.timestamp}</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {evt.status}
                      </span>
                    </div>
                  </div>

                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 text-[11px] overflow-x-auto">
                    {JSON.stringify(evt.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
