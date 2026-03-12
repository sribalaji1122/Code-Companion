import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Database, 
  Server, 
  Globe, 
  Share2, 
  User, 
  Box, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Layout,
  Mail,
  BarChart3,
  Cpu,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const baseNodeStyle = "px-4 py-3 rounded-xl border-2 shadow-sm min-w-[160px] transition-all duration-300 hover:shadow-md bg-white";
const handleStyle = "w-2 h-2 !bg-slate-400 border-2 border-white transition-colors hover:!bg-primary";

const getIcon = (type: string, tech?: string, label?: string) => {
  const l = label?.toLowerCase() || "";
  const t = tech?.toLowerCase() || "";
  
  if (l.includes("website")) return Globe;
  if (l.includes("mobile")) return Layout;
  if (l.includes("crm") || l.includes("salesforce")) return Users;
  if (l.includes("cdp") || l.includes("segment")) return Database;
  if (l.includes("email") || l.includes("braze")) return Mail;
  if (l.includes("analytics") || l.includes("adobe")) return BarChart3;
  if (l.includes("ai") || l.includes("ml") || l.includes("decisioning")) return Cpu;
  if (l.includes("orchestration") || l.includes("journey")) return Zap;
  
  if (t.includes("database") || type === "dataNode") return Database;
  if (t.includes("api") || type === "systemNode") return Server;
  if (type === "sourceNode") return Globe;
  if (type === "channelNode") return Share2;
  if (type === "entryNode") return User;
  if (type === "actionNode") return Zap;
  if (type === "decisionNode") return ShieldCheck;
  if (type === "exitNode") return ArrowRight;
  return Box;
};

export function SystemNode({ data }: NodeProps) {
  const Icon = getIcon("systemNode", data.tech as string | undefined, data.label as string | undefined);
  
  return (
    <div className={cn(baseNodeStyle, "border-slate-200 hover:border-primary group")}>
      <Handle type="target" position={Position.Left} className={handleStyle} />
      
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            {data.lane === 'process' ? 'Process' : 'System'}
          </div>
          <div className="font-bold text-sm text-slate-900 leading-tight">{String(data.label ?? '')}</div>
          {data.tech ? <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{String(data.tech)}</div> : null}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
}

export function DataNode({ data }: NodeProps) {
  const Icon = getIcon("dataNode", data.tech as string | undefined, data.label as string | undefined);
  return (
    <div className={cn(baseNodeStyle, "border-blue-100 bg-blue-50/30 hover:border-blue-400 group")}>
      <Handle type="target" position={Position.Left} className={handleStyle} />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Foundation</div>
          <div className="font-bold text-sm text-slate-900">{String(data.label ?? '')}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
}

export function ChannelNode({ data }: NodeProps) {
  const Icon = getIcon("channelNode", data.tech as string | undefined, data.label as string | undefined);
  return (
    <div className={cn(baseNodeStyle, "border-orange-100 bg-orange-50/30 hover:border-orange-400 group")}>
      <Handle type="target" position={Position.Left} className={handleStyle} />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Channel</div>
          <div className="font-bold text-sm text-slate-900">{String(data.label ?? '')}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={handleStyle} />
    </div>
  );
}

export function JourneyStepNode({ data }: NodeProps) {
  const isDecision = data.type === 'decisionNode';
  
  return (
    <div className={cn(
      baseNodeStyle, 
      isDecision ? "border-yellow-400 bg-yellow-50 rotate-0" : "border-border",
      "min-w-[180px] text-center"
    )}>
      <Handle type="target" position={Position.Top} className={handleStyle} />
      
      <div className="flex flex-col items-center gap-2">
        {data.channel ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
            {String(data.channel)}
          </span>
        ) : null}
        <span className="font-medium text-sm">{String(data.label ?? '')}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className={handleStyle} />
    </div>
  );
}

export const nodeTypes = {
  systemNode: SystemNode,
  dataNode: DataNode,
  channelNode: ChannelNode,
  sourceNode: SystemNode,
  decisionNode: JourneyStepNode,
  actionNode: JourneyStepNode,
  entryNode: JourneyStepNode,
  exitNode: JourneyStepNode
};
