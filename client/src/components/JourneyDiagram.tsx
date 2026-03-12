import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, MousePointerClick, ChevronRight } from "lucide-react";

interface JourneyDiagramProps {
  journey: any;
  useCase?: any;
}

export function JourneyDiagram({ journey, useCase }: JourneyDiagramProps) {
  const touchpoints = journey?.touchpoints || [];
  const controlRules = journey?.controlRules;

  const legacySteps = journey?.steps || useCase?.journeys?.[0]?.steps || [];
  const derivedTouchpoints = touchpoints.length > 0 ? touchpoints : legacySteps.map((step: any, si: number) => ({
    stepName: `Step ${si + 1}: ${step.label || 'Touchpoint'}`,
    channel: step.channel || 'N/A',
    timingGap: si === 0 ? 'Immediate' : `+${(si * 2) + 1} days`,
    keyMessaging: step.label || 'Engage customer',
    primaryCTA: 'Learn More',
  }));

  if (derivedTouchpoints.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 text-sm italic">
        No journey touchpoints available.
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch gap-0 min-w-max">
          {derivedTouchpoints.map((tp: any, idx: number) => (
            <div key={idx} className="flex items-stretch">
              <div className="w-48 bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5 py-0 font-mono w-fit">
                  {tp.channel}
                </Badge>
                <p className="text-xs font-semibold text-slate-800">{tp.stepName}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  {tp.timingGap}
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{tp.keyMessaging}</p>
                {tp.primaryCTA && (
                  <div className="mt-auto pt-1 border-t border-dashed border-slate-100">
                    <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-medium">
                      <MousePointerClick className="w-2.5 h-2.5" />
                      {tp.primaryCTA}
                    </div>
                  </div>
                )}
              </div>
              {idx < derivedTouchpoints.length - 1 && (
                <div className="flex items-center px-1 shrink-0">
                  <div className="w-4 border-t border-dashed border-slate-300" />
                  <ArrowRight className="w-3 h-3 text-slate-400 -ml-0.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {controlRules && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
          <div className="bg-slate-50 rounded border border-slate-200 p-2">
            <span className="text-slate-400 font-semibold uppercase">Entry</span>
            <p className="text-slate-600 mt-0.5">{controlRules.entryCriteria || "N/A"}</p>
          </div>
          <div className="bg-slate-50 rounded border border-slate-200 p-2">
            <span className="text-slate-400 font-semibold uppercase">Exit</span>
            <p className="text-slate-600 mt-0.5">{controlRules.exitCriteria || "N/A"}</p>
          </div>
          <div className="bg-slate-50 rounded border border-slate-200 p-2">
            <span className="text-slate-400 font-semibold uppercase">Re-entry</span>
            <p className="text-slate-600 mt-0.5">{controlRules.reEntryRules || "N/A"}</p>
          </div>
          <div className="bg-slate-50 rounded border border-slate-200 p-2">
            <span className="text-slate-400 font-semibold uppercase">Freq. Cap</span>
            <p className="text-slate-600 mt-0.5">{controlRules.frequencyCap || "N/A"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
