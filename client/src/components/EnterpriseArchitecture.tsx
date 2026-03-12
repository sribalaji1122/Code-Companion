import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

interface StageNode {
  id: string;
  type: string;
  label: string;
  lane: string;
  tech?: string;
}

interface StageEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

interface EnterpriseArchitectureProps {
  nodes: StageNode[];
  edges: StageEdge[];
  stage: string;
  inputChannels?: string[];
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const COLLECT_KEYWORDS = [
  "website", "mobile app", "social media", "pos", "transactions",
  "iot", "app", "store", "point of sale", "beacon", "chatbot",
  "in-store", "device data", "ad impressions", "call center data",
  "social media engagement", "chatbot interactions"
];

const PROCESS_KEYWORDS = [
  "crm", "cdp", "cms", "marketing automation", "journey orchestration",
  "personalization", "decisioning", "ai", "ml", "experimentation",
  "offer engine", "analytics stack", "marketing stack", "advertising stack",
  "salesforce", "hubspot", "segment", "braze", "adobe", "ga4",
  "google analytics", "amplitude", "mixpanel", "klaviyo", "iterable",
  "optimizely", "dynamic yield", "bloomreach"
];

const ENGAGE_KEYWORDS = [
  "email", "sms", "push", "whatsapp", "paid media", "ads",
  "call center", "on-site", "display", "direct mail", "notification",
  "web personalization", "service", "in-app", "web", "app channel"
];

const DATA_KEYWORDS = [
  "lake", "warehouse", "bi", "reporting", "data services",
  "customer 360", "analytics platform", "data warehouse", "data lake",
  "streaming", "real-time stream", "bigquery", "snowflake", "redshift",
  "databricks", "looker", "tableau", "power bi"
];

function classifyLane(node: StageNode): string {
  let lane = node.lane?.toLowerCase() || "";
  const label = node.label?.toLowerCase() || "";
  const type = node.type || "";

  if (lane === 'activate') lane = 'engage';
  if (lane === 'service') lane = 'engage';
  if (lane === 'data & bi') lane = 'data';

  if (['collect', 'process', 'engage', 'data'].includes(lane)) return lane;

  if (type === 'sourceNode') return 'collect';
  if (type === 'channelNode') return 'engage';
  if (type === 'dataNode') return 'data';

  if (DATA_KEYWORDS.some(s => label.includes(s))) return 'data';
  if (ENGAGE_KEYWORDS.some(s => label.includes(s))) return 'engage';
  if (COLLECT_KEYWORDS.some(s => label.includes(s))) return 'collect';
  if (PROCESS_KEYWORDS.some(s => label.includes(s))) return 'process';

  return 'process';
}

const LANE_LABELS: Record<string, string> = {
  collect: 'COLLECT',
  process: 'PROCESS',
  engage: 'ACTIVATE',
  data: 'DATA & SERVICE',
};

function EdgesSvg({ edges, nodePositions, containerRef }: {
  edges: StageEdge[];
  nodePositions: Map<string, NodePosition>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!containerRef.current || nodePositions.size === 0) return null;

  const containerRect = containerRef.current.getBoundingClientRect();

  const pairCounts = new Map<string, number>();
  const pairIndex = new Map<string, number>();
  edges.forEach(edge => {
    const pairKey = [edge.source, edge.target].sort().join('|');
    pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1);
  });

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <defs>
        <marker
          id="arrow-solid"
          viewBox="0 0 12 8"
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L12,4 L0,8 L3,4 Z" fill="#94a3b8" />
        </marker>
        <marker
          id="arrow-dashed"
          viewBox="0 0 12 8"
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L12,4 L0,8 L3,4 Z" fill="#f59e0b" />
        </marker>
        <marker
          id="arrow-dotted"
          viewBox="0 0 12 8"
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L12,4 L0,8 L3,4 Z" fill="#6366f1" />
        </marker>
      </defs>

      {edges.map(edge => {
        const srcPos = nodePositions.get(edge.source);
        const tgtPos = nodePositions.get(edge.target);
        if (!srcPos || !tgtPos) return null;

        const sx = srcPos.x + srcPos.width / 2 - containerRect.left;
        const sy = srcPos.y + srcPos.height / 2 - containerRect.top;
        const tx = tgtPos.x + tgtPos.width / 2 - containerRect.left;
        const ty = tgtPos.y + tgtPos.height / 2 - containerRect.top;

        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return null;

        const nodeRadius = 24;
        const startX = sx + (dx / dist) * nodeRadius;
        const startY = sy + (dy / dist) * nodeRadius;
        const endX = tx - (dx / dist) * nodeRadius;
        const endY = ty - (dy / dist) * nodeRadius;

        const pairKey = [edge.source, edge.target].sort().join('|');
        const totalForPair = pairCounts.get(pairKey) || 1;
        const currentIdx = pairIndex.get(pairKey) || 0;
        pairIndex.set(pairKey, currentIdx + 1);

        let offsetMultiplier = 0;
        if (totalForPair > 1) {
          offsetMultiplier = (currentIdx - (totalForPair - 1) / 2) * 20;
        }

        const midX = (startX + endX) / 2;
        const baseCurvature = Math.abs(dx) > Math.abs(dy) ? dy * 0.25 : dx * 0.25;
        const perpX = -(endY - startY) / dist;
        const perpY = (endX - startX) / dist;
        const ctrlX = midX + perpX * offsetMultiplier + (Math.abs(dx) > Math.abs(dy) ? 0 : baseCurvature);
        const ctrlY = (startY + endY) / 2 + perpY * offsetMultiplier + (Math.abs(dx) > Math.abs(dy) ? baseCurvature : 0);

        const pathD = `M${startX},${startY} Q${ctrlX},${ctrlY} ${endX},${endY}`;

        let stroke = '#94a3b8';
        let strokeWidth = 2;
        let dashArray = 'none';
        let markerEnd = 'url(#arrow-solid)';

        if (edge.type === 'dashed') {
          stroke = '#f59e0b';
          strokeWidth = 2;
          dashArray = '8,5';
          markerEnd = 'url(#arrow-dashed)';
        } else if (edge.type === 'dotted') {
          stroke = '#6366f1';
          strokeWidth = 2;
          dashArray = '3,4';
          markerEnd = 'url(#arrow-dotted)';
        }

        return (
          <path
            key={edge.id}
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            markerEnd={markerEnd}
            opacity={0.85}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

export function EnterpriseArchitecture({ nodes, edges, stage, inputChannels = [] }: EnterpriseArchitectureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());

  const lanes = useMemo(() => {
    const result: Record<string, StageNode[]> = {
      collect: [],
      process: [],
      engage: [],
      data: [],
    };

    nodes.forEach(node => {
      const lane = classifyLane(node);
      result[lane].push(node);
    });

    const existingEngageLabels = new Set(
      result.engage.map(n => n.label.toLowerCase().trim())
    );

    inputChannels.forEach(channel => {
      const channelLower = channel.toLowerCase().trim();
      if (!existingEngageLabels.has(channelLower)) {
        const syntheticId = `engage_${channel.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
        result.engage.push({
          id: syntheticId,
          type: 'channelNode',
          label: channel,
          lane: 'engage',
        });
        existingEngageLabels.add(channelLower);
      }
    });

    return result;
  }, [nodes, inputChannels]);

  const allNodeIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(lanes).forEach(laneNodes => {
      laneNodes.forEach(n => ids.add(n.id));
    });
    return ids;
  }, [lanes]);

  const validEdges = useMemo(() => {
    return edges.filter(e => allNodeIds.has(e.source) && allNodeIds.has(e.target));
  }, [edges, allNodeIds]);

  const measureNodes = useCallback(() => {
    if (!containerRef.current) return;
    const positions = new Map<string, NodePosition>();
    const nodeEls = containerRef.current.querySelectorAll('[data-node-id]');
    nodeEls.forEach(el => {
      const id = el.getAttribute('data-node-id');
      if (id) {
        const rect = (el as HTMLElement).getBoundingClientRect();
        positions.set(id, { x: rect.left, y: rect.top, width: rect.width, height: rect.height });
      }
    });
    setNodePositions(positions);
  }, []);

  useEffect(() => {
    const timer = setTimeout(measureNodes, 50);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(measureNodes);
    });
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [measureNodes, lanes, stage]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => measureNodes());
    ro.observe(containerRef.current);
    window.addEventListener('resize', measureNodes);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureNodes);
    };
  }, [measureNodes]);

  const renderNode = (node: StageNode, laneKey: string) => {
    const techLabel = node.tech && node.tech !== 'N/A' ? node.tech : null;
    const isEngage = laneKey === 'engage';

    return (
      <div
        key={node.id}
        data-node-id={node.id}
        data-testid={`node-${node.id}`}
        className={`rounded-xl shadow-sm px-5 py-3.5 min-w-[180px] transition-all cursor-default w-full text-center ${
          isEngage
            ? 'bg-white border border-orange-200'
            : 'bg-white border border-slate-200'
        }`}
      >
        <div className={`font-semibold text-sm ${isEngage ? 'text-orange-600' : 'text-slate-800'}`}>
          {node.label}
        </div>
        {techLabel && (
          <div className={`text-xs mt-1 ${isEngage ? 'text-orange-500/70' : 'text-slate-400'}`}>{techLabel}</div>
        )}
      </div>
    );
  };

  const renderLaneColumn = (laneKey: string) => {
    const laneNodes = lanes[laneKey];
    const label = LANE_LABELS[laneKey];
    const isEngage = laneKey === 'engage';

    return (
      <div
        className={`flex flex-col rounded-xl p-4 ${
          isEngage ? 'bg-orange-50 border border-orange-200' : ''
        }`}
        data-testid={`lane-${laneKey}`}
      >
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${
            isEngage
              ? 'bg-orange-100 text-orange-600'
              : 'bg-slate-100 text-slate-500'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {label}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {laneNodes.length > 0 ? (
            laneNodes.map(n => renderNode(n, laneKey))
          ) : (
            <div className="text-slate-400 text-xs italic py-10 text-center">No components</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="bg-slate-50 min-h-[600px] p-6 md:p-8 rounded-b-2xl"
      data-testid={`diagram-${stage.toLowerCase()}`}
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
            Enterprise Architecture Blueprint
          </span>
          <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
            {stage} State
          </span>
        </div>

        <div className="relative" ref={containerRef}>
          <div className="grid grid-cols-3 gap-6 relative">
            <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-slate-200 opacity-60" style={{ marginLeft: '-0.75rem' }} />
            <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-slate-200 opacity-60" style={{ marginLeft: '-0.75rem' }} />

            {renderLaneColumn('collect')}
            {renderLaneColumn('process')}
            {renderLaneColumn('engage')}
          </div>

          <div className="mt-8">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {LANE_LABELS.data}
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {lanes.data.length > 0 ? (
                  lanes.data.map(n => (
                    <div
                      key={n.id}
                      data-node-id={n.id}
                      data-testid={`node-${n.id}`}
                      className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-sm shadow-sm transition-all cursor-default text-center min-w-[140px]"
                    >
                      <div className="font-semibold text-sm text-slate-800">{n.label}</div>
                      {n.tech && n.tech !== 'N/A' && (
                        <div className="text-xs mt-1 text-slate-400">{n.tech}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs italic py-4">No data components</div>
                )}
              </div>
            </div>
          </div>

          <EdgesSvg
            edges={validEdges}
            nodePositions={nodePositions}
            containerRef={containerRef}
          />
        </div>

        <div className="mt-8 pt-5 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Legend</span>
            <div className="flex items-center gap-2">
              <svg width="32" height="10" viewBox="0 0 32 10">
                <line x1="0" y1="5" x2="22" y2="5" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                <polygon points="22,1.5 30,5 22,8.5 24,5" fill="#94a3b8" />
              </svg>
              <span className="text-slate-500">Data Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="32" height="10" viewBox="0 0 32 10">
                <line x1="0" y1="5" x2="22" y2="5" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,3" strokeLinecap="round" />
                <polygon points="22,1.5 30,5 22,8.5 24,5" fill="#f59e0b" />
              </svg>
              <span className="text-slate-500">Segment Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="32" height="10" viewBox="0 0 32 10">
                <line x1="0" y1="5" x2="22" y2="5" stroke="#6366f1" strokeWidth="2" strokeDasharray="2,4" strokeLinecap="round" />
                <polygon points="22,1.5 30,5 22,8.5 24,5" fill="#6366f1" />
              </svg>
              <span className="text-slate-500">Real-Time Event</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200" />
                <span className="text-slate-500">Collect</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200" />
                <span className="text-slate-500">Process</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-orange-50 border border-orange-200" />
                <span className="text-slate-500">Activate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-200" />
                <span className="text-slate-500">Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
