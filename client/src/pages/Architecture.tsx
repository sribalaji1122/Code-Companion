import { useArchitectureStore } from "@/hooks/use-architecture";
import { Redirect } from "wouter";
import { EnterpriseArchitecture } from "@/components/EnterpriseArchitecture";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";

const stageColors: Record<string, string> = {
  Current: "border-t-slate-400",
  Crawl: "border-t-amber-400",
  Walk: "border-t-blue-500",
  Run: "border-t-emerald-500",
};

const stageBadgeColors: Record<string, string> = {
  Current: "bg-slate-100 text-slate-700 border-slate-300",
  Crawl: "bg-amber-100 text-amber-700 border-amber-300",
  Walk: "bg-blue-100 text-blue-700 border-blue-300",
  Run: "bg-emerald-100 text-emerald-700 border-emerald-300",
};

const stageDescriptions: Record<string, string> = {
  Current: "Existing ecosystem as-is",
  Crawl: "Connect silos, introduce CDP",
  Walk: "Add orchestration & personalization",
  Run: "Real-time decisioning & AI",
};

export default function Architecture() {
  const { generatedOutput, currentContext } = useArchitectureStore();

  if (!generatedOutput || !currentContext) {
    return <Redirect to="/input" />;
  }

  const stages = ["Current", "Crawl", "Walk", "Run"];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-800" data-testid="text-page-title">
              Architecture Maturity Model
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm">
              Evolution roadmap for <span className="font-semibold text-slate-700">{currentContext.companyName}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs py-1 px-3 bg-white border-slate-200" data-testid="badge-industry">
              {currentContext.industry}
            </Badge>
            <Badge variant="outline" className="text-xs py-1 px-3 bg-white border-slate-200" data-testid="badge-model">
              {currentContext.businessModel}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="Current" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="h-12 p-1 bg-white border border-border/50 shadow-sm rounded-xl">
              {stages.map((stage, idx) => (
                <TabsTrigger
                  key={stage}
                  value={stage}
                  className="px-6 h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium transition-all gap-2"
                  data-testid={`tab-${stage.toLowerCase()}`}
                >
                  <span className="hidden sm:inline text-xs opacity-60">Y{idx}</span>
                  {stage}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            {stages.map((stage) => {
              const stageData = generatedOutput.maturity.find(
                s => s.stage.toLowerCase() === stage.toLowerCase()
              );

              if (!stageData || !stageData.nodes?.length) {
                return (
                  <TabsContent key={stage} value={stage} className="space-y-6 focus-visible:outline-none">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`shadow-sm border border-slate-200 border-t-4 ${stageColors[stage] || 'border-t-primary/20'} overflow-hidden bg-white`}>
                        <CardContent className="p-12 text-center">
                          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500 text-base" data-testid={`text-missing-${stage.toLowerCase()}`}>
                            {stage} state architecture data is not available. Please regenerate.
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                );
              }

              return (
                <TabsContent key={stage} value={stage} className="space-y-6 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`shadow-md border border-slate-200 border-t-4 ${stageColors[stage] || 'border-t-primary/20'} overflow-hidden bg-white`}>
                      <CardHeader className="bg-white border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-slate-800" data-testid={`text-stage-title-${stage.toLowerCase()}`}>
                              {stageData.stage} State Architecture
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-500 mt-1">
                              {stageData.description || stageDescriptions[stage]}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${stageBadgeColors[stage] || ''}`}>
                              {stageData.nodes.length} components
                            </Badge>
                            <Badge variant="outline" className="text-xs border-slate-200">
                              {(stageData.edges || []).length} connections
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <EnterpriseArchitecture
                          nodes={stageData.nodes}
                          edges={stageData.edges || []}
                          stage={stage}
                          inputChannels={currentContext.activationChannels || []}
                        />
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-slate-200 bg-white mt-6">
                      <CardHeader>
                        <CardTitle className="text-base text-slate-800 flex items-center gap-2" data-testid={`text-changes-title-${stage.toLowerCase()}`}>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          {stage === "Current" ? "Current State Assessment" : "Key Changes vs Current"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2" data-testid={`list-changes-${stage.toLowerCase()}`}>
                          {(stageData.keyChanges || []).map((change: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-slate-600 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                              data-testid={`text-change-${stage.toLowerCase()}-${idx}`}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-slate-200 bg-white mt-6">
                      <CardHeader>
                        <CardTitle className="text-base text-slate-800">Maturity Score</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative flex items-center justify-center w-24 h-24">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="48" cy="48" r="40"
                              stroke="currentColor" strokeWidth="8" fill="transparent"
                              className="text-slate-100"
                            />
                            <circle
                              cx="48" cy="48" r="40"
                              stroke="currentColor" strokeWidth="8" fill="transparent"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 - (251.2 * ((stages.indexOf(stage) + 1) * 25)) / 100}
                              className="text-primary transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute text-2xl font-bold text-primary">
                            {(stages.indexOf(stage) + 1) * 25}%
                          </span>
                        </div>
                        <p className="mt-4 text-sm font-medium text-center text-slate-500">
                          {stage === "Current" ? "Baseline Assessment" :
                           stage === "Crawl" ? "Foundation Building" :
                           stage === "Walk" ? "Scaling Capabilities" :
                           "Optimized & Automated"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              );
            })}
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
