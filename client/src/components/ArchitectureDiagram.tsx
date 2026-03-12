import { useMemo } from 'react';
import { ReactFlow, Controls, Background, ConnectionLineType, Node, Edge, Position, MarkerType } from '@xyflow/react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './NodeTypes';

const LANE_X = {
  collect: 100,
  process: 500,
  engage: 900,
};
const DATA_Y_START = 650;
const NODE_WIDTH = 200;
const VERTICAL_SPACING = 100;
const TOP_OFFSET = 80;
const DATA_HORIZONTAL_SPACING = 250;

const collectKeywords = ["website", "mobile app", "social", "pos", "transactions", "iot", "app", "store", "point of sale"];
const engageKeywords = ["email", "sms", "push", "whatsapp", "ads", "call center", "paid media", "on-site", "display", "direct mail", "notification"];
const dataKeywords = ["lake", "warehouse", "bi", "reporting", "data services", "customer 360", "analytics platform", "data warehouse"];

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const laneMap: Record<string, Node[]> = {
    collect: [],
    process: [],
    engage: [],
    data: []
  };

  nodes.forEach(node => {
    let lane = (node.data?.lane as string)?.toLowerCase();
    const type = node.type as string;
    const label = (node.data?.label as string)?.toLowerCase() || "";

    if (lane === 'activate') lane = 'engage';
    if (lane === 'service') lane = 'data';
    if (lane === 'data & bi') lane = 'data';

    if (!lane || !['collect', 'process', 'engage', 'data'].includes(lane)) {
      if (type === 'sourceNode' || collectKeywords.some(s => label.includes(s))) lane = 'collect';
      else if (type === 'channelNode' || engageKeywords.some(s => label.includes(s))) lane = 'engage';
      else if (type === 'dataNode' || dataKeywords.some(s => label.includes(s))) lane = 'data';
      else lane = 'process';
    }

    if (laneMap[lane]) {
      laneMap[lane].push(node);
    } else {
      laneMap['process'].push(node);
    }
  });

  const layoutedNodes: Node[] = [];

  ['collect', 'process', 'engage'].forEach(lane => {
    const laneNodes = laneMap[lane];
    const x = LANE_X[lane as keyof typeof LANE_X];
    laneNodes.forEach((node, idx) => {
      layoutedNodes.push({
        ...node,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        position: { x: x - NODE_WIDTH / 2, y: TOP_OFFSET + idx * VERTICAL_SPACING },
      });
    });
  });

  const dataNodes = laneMap['data'];
  const totalDataWidth = (dataNodes.length - 1) * DATA_HORIZONTAL_SPACING;
  const dataStartX = 500 - totalDataWidth / 2 - NODE_WIDTH / 2;
  dataNodes.forEach((node, idx) => {
    layoutedNodes.push({
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Top,
      position: { x: dataStartX + idx * DATA_HORIZONTAL_SPACING, y: DATA_Y_START },
    });
  });

  return { nodes: layoutedNodes, edges };
};

interface ArchitectureDiagramProps {
  nodes: any[];
  edges: any[];
}

export function ArchitectureDiagram({ nodes: initialNodes, edges: initialEdges }: ArchitectureDiagramProps) {
  const flowNodes = useMemo(() => (initialNodes ?? []).map((n: any) => ({
    id: n.id,
    type: n.type,
    data: { ...n },
    position: { x: 0, y: 0 }
  })), [initialNodes]);

  const flowEdges = useMemo(() => {
    const edges = [...(initialEdges ?? [])];
    return edges.map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: e.type === 'dotted' || e.animated === true,
      style: {
        strokeDasharray: e.type === 'dashed' ? '5,5' : e.type === 'dotted' ? '2,2' : undefined,
        stroke: e.type === 'dotted' ? '#6366f1' : e.type === 'dashed' ? '#f59e0b' : '#94a3b8',
        strokeWidth: 2
      },
      label: e.label,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.type === 'dotted' ? '#6366f1' : e.type === 'dashed' ? '#f59e0b' : '#94a3b8'
      }
    }));
  }, [initialEdges]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(flowNodes as Node[], flowEdges as Edge[]),
    [flowNodes, flowEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useMemo(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[750px] bg-slate-50 rounded-2xl border border-border overflow-hidden relative group">
      <div className="absolute inset-0 pointer-events-none z-[1] flex flex-col">
        <div className="flex flex-1">
          <div className="w-1/3 border-r border-slate-200/60 bg-slate-50/30 flex flex-col">
            <div className="h-10 flex items-center justify-center font-display font-bold text-slate-400 uppercase tracking-widest text-[10px] bg-slate-100/50 border-b border-slate-200">
              COLLECT
            </div>
            <div className="flex-1" />
          </div>
          <div className="w-1/3 border-r border-slate-200/60 bg-white/50 flex flex-col">
            <div className="h-10 flex items-center justify-center font-display font-bold text-slate-400 uppercase tracking-widest text-[10px] bg-slate-50/80 border-b border-slate-200">
              PROCESS
            </div>
            <div className="flex-1" />
          </div>
          <div className="w-1/3 bg-slate-50/30 flex flex-col">
            <div className="h-10 flex items-center justify-center font-display font-bold text-slate-400 uppercase tracking-widest text-[10px] bg-slate-100/50 border-b border-slate-200">
              ENGAGE
            </div>
            <div className="flex-1" />
          </div>
        </div>
        <div className="h-[100px] border-t-2 border-blue-200/60 bg-blue-50/20 flex-shrink-0">
          <div className="h-8 flex items-center justify-center font-display font-bold text-blue-400 uppercase tracking-widest text-[10px] bg-blue-50/50 border-b border-blue-200/40">
            DATA & BI
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        className="bg-transparent"
      >
        <Background color="#cbd5e1" gap={20} size={1} className="opacity-20" />
        <Controls className="!bg-white !border-border !shadow-sm !rounded-lg" />
      </ReactFlow>

      <div className="absolute bottom-[130px] left-4 p-3 bg-white/90 backdrop-blur border border-border rounded-lg shadow-sm text-[10px] space-y-1.5 z-10 min-w-[160px]">
        <div className="font-bold text-slate-500 uppercase tracking-wider mb-1">Architecture Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-slate-400" />
          <span className="text-slate-600">Data Flow (Solid)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 border-t-2 border-dashed border-amber-400" />
          <span className="text-slate-600">Segment Sync (Dashed)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 border-t-2 border-dotted border-indigo-500" />
          <span className="text-slate-600">Real-time Event (Dotted)</span>
        </div>
      </div>
    </div>
  );
}
