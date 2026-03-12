import { useArchitectureStore } from "@/hooks/use-architecture";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  Target, Users, Zap, ArrowRight, RotateCcw, Timer,
  CheckCircle2, Clock, MessageSquare, MousePointerClick,
  BarChart3, ShieldCheck, ChevronRight
} from "lucide-react";
import type { UseCase } from "@shared/schema";

const stageBadgeStyles: Record<string, string> = {
  Current: "bg-slate-100 text-slate-700 border-slate-300",
  Crawl: "bg-amber-50 text-amber-700 border-amber-300",
  Walk: "bg-blue-50 text-blue-700 border-blue-300",
  Run: "bg-emerald-50 text-emerald-700 border-emerald-300",
};

const stageAccentStyles: Record<string, string> = {
  Current: "border-l-slate-400",
  Crawl: "border-l-amber-400",
  Walk: "border-l-blue-500",
  Run: "border-l-emerald-500",
};

const stageAccentBg: Record<string, string> = {
  Current: "bg-slate-50",
  Crawl: "bg-amber-50/30",
  Walk: "bg-blue-50/30",
  Run: "bg-emerald-50/30",
};

function SectionHeader({ number, title, icon: Icon }: { number: number; title: string; icon: typeof Target }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold shrink-0">
        {number}
      </div>
      <Icon className="w-4 h-4 text-slate-500" />
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}

function TouchpointFlow({ touchpoints }: { touchpoints: any[] }) {
  if (!touchpoints || touchpoints.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch gap-0 min-w-max">
        {touchpoints.map((tp: any, idx: number) => (
          <div key={idx} className="flex items-stretch">
            <div
              className="w-52 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-shadow"
              data-testid={`touchpoint-card-${idx}`}
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5 py-0 font-mono">
                  {tp.channel}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-snug">{tp.stepName}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                {tp.timingGap}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{tp.keyMessaging}</p>
              <div className="mt-auto pt-1.5 border-t border-dashed border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                  <MousePointerClick className="w-3 h-3" />
                  {tp.primaryCTA}
                </div>
                {tp.secondaryCTA && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ChevronRight className="w-3 h-3" />
                    {tp.secondaryCTA}
                  </div>
                )}
              </div>
            </div>
            {idx < touchpoints.length - 1 && (
              <div className="flex items-center px-1.5 shrink-0">
                <div className="w-6 border-t-2 border-dashed border-slate-300" />
                <ArrowRight className="w-4 h-4 text-slate-400 -ml-1" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagingTable({ touchpoints }: { touchpoints: any[] }) {
  if (!touchpoints || touchpoints.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs" data-testid="table-messaging">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Touchpoint</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Key Messaging</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Primary CTA</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Secondary CTA</th>
          </tr>
        </thead>
        <tbody>
          {touchpoints.map((tp: any, idx: number) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
              <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 text-[10px] px-1.5 py-0">
                    {tp.channel}
                  </Badge>
                  <span>{tp.stepName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600 max-w-xs">{tp.keyMessaging}</td>
              <td className="px-4 py-3 text-indigo-600 font-medium whitespace-nowrap">{tp.primaryCTA}</td>
              <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{tp.secondaryCTA || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UseCaseSlide({ useCase, index }: { useCase: UseCase; index: number }) {
  const stage = useCase.stage || "Current";
  const journey = useCase.journey;
  const touchpoints = journey?.touchpoints || [];
  const controlRules = journey?.controlRules;
  const journeyKpis = controlRules?.kpis || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Card
        className={`overflow-hidden border-l-4 ${stageAccentStyles[stage] || "border-l-slate-300"} shadow-sm hover:shadow-md transition-shadow`}
        data-testid={`card-usecase-${useCase.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-1">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 ${stageBadgeStyles[stage] || ""}`}
              data-testid={`badge-stage-${useCase.id}`}
            >
              {stage}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold text-slate-800" data-testid={`text-usecase-name-${useCase.id}`}>
            {useCase.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pt-0">
          <div className={`rounded-xl p-5 ${stageAccentBg[stage] || "bg-slate-50"}`}>
            <SectionHeader number={1} title="Use Case Summary" icon={Target} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Objective</p>
                <p className="text-sm text-slate-700 leading-relaxed" data-testid={`text-objective-${useCase.id}`}>
                  {useCase.description}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Audience</p>
                <p className="text-sm text-slate-700 leading-relaxed" data-testid={`text-audience-${useCase.id}`}>
                  {useCase.audience || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Goals</p>
                <ul className="space-y-1" data-testid={`list-goals-${useCase.id}`}>
                  {(useCase.goals ?? []).map((g, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader number={2} title="Journey Flow" icon={ArrowRight} />
            <TouchpointFlow touchpoints={touchpoints} />
          </div>

          <Accordion type="multiple" className="w-full space-y-3">
            <AccordionItem value="messaging" className="border rounded-xl bg-white px-5">
              <AccordionTrigger className="hover:no-underline py-3.5" data-testid={`trigger-messaging-${useCase.id}`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold shrink-0">3</div>
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Messaging Table</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 pb-4">
                  <MessagingTable touchpoints={touchpoints} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="control" className="border rounded-xl bg-white px-5">
              <AccordionTrigger className="hover:no-underline py-3.5" data-testid={`trigger-control-${useCase.id}`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold shrink-0">4</div>
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Control Rules</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5 pt-2 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2">
                        <ArrowRight className="w-3 h-3" /> Entry Criteria
                      </div>
                      <p className="text-slate-700 leading-relaxed" data-testid={`text-entry-${useCase.id}`}>
                        {controlRules?.entryCriteria || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2">
                        <ArrowRight className="w-3 h-3 rotate-180" /> Exit Criteria
                      </div>
                      <p className="text-slate-700 leading-relaxed" data-testid={`text-exit-${useCase.id}`}>
                        {controlRules?.exitCriteria || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2">
                        <RotateCcw className="w-3 h-3" /> Re-entry Rules
                      </div>
                      <p className="text-slate-700 leading-relaxed" data-testid={`text-reentry-${useCase.id}`}>
                        {controlRules?.reEntryRules || "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2">
                        <Timer className="w-3 h-3" /> Frequency Cap
                      </div>
                      <p className="text-slate-700 leading-relaxed" data-testid={`text-freqcap-${useCase.id}`}>
                        {controlRules?.frequencyCap || "N/A"}
                      </p>
                    </div>
                  </div>

                  {journeyKpis.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3" /> Journey KPIs
                      </p>
                      <div className="flex flex-wrap gap-2" data-testid={`list-journey-kpis-${useCase.id}`}>
                        {journeyKpis.map((k: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(useCase.measures ?? []).length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Zap className="w-3 h-3" /> Measures of Success
                      </p>
                      <ul className="space-y-1.5" data-testid={`list-measures-${useCase.id}`}>
                        {(useCase.measures ?? []).map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <Zap className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function UseCases() {
  const { generatedOutput } = useArchitectureStore();

  if (!generatedOutput) {
    return <Redirect to="/input" />;
  }

  const useCases = generatedOutput?.useCases ?? [];

  const stageOrder = ["Current", "Crawl", "Walk", "Run"];
  const grouped = stageOrder
    .map(stage => ({
      stage,
      cases: useCases.filter(uc => (uc as any).stage === stage),
    }))
    .filter(g => g.cases.length > 0);

  const ungrouped = useCases.filter(uc => !stageOrder.includes((uc as any).stage));

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-800" data-testid="text-page-title">
              Strategic Use Cases
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm">
              Consulting-grade journey slides derived from your architecture.
            </p>
          </div>
          <div className="flex gap-2">
            {stageOrder.map(s => {
              const count = useCases.filter(uc => (uc as any).stage === s).length;
              if (count === 0) return null;
              return (
                <Badge
                  key={s}
                  variant="outline"
                  className={`text-[10px] ${stageBadgeStyles[s]}`}
                  data-testid={`badge-count-${s.toLowerCase()}`}
                >
                  {s}: {count}
                </Badge>
              );
            })}
          </div>
        </div>

        {useCases.length === 0 ? (
          <div className="text-center py-16 text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm" data-testid="text-empty">
            No use cases generated. Submit company context to begin.
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ stage, cases }) => (
              <div key={stage}>
                <div className="flex items-center gap-3 mb-5">
                  <Badge
                    variant="outline"
                    className={`text-xs uppercase tracking-wider px-3 py-1 ${stageBadgeStyles[stage]}`}
                  >
                    {stage} Stage
                  </Badge>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="space-y-6">
                  {cases.map((uc, idx) => (
                    <UseCaseSlide key={uc.id} useCase={uc as UseCase} index={idx} />
                  ))}
                </div>
              </div>
            ))}

            {ungrouped.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <Badge variant="outline" className="text-xs uppercase tracking-wider px-3 py-1">
                    General
                  </Badge>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
                <div className="space-y-6">
                  {ungrouped.map((uc, idx) => (
                    <UseCaseSlide key={uc.id} useCase={uc as UseCase} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
