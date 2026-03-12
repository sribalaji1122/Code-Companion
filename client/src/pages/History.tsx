import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type Architecture } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { ChevronDown, ChevronUp, History as HistoryIcon, Layout, FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Target, Users, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { JourneyDiagram } from "@/components/JourneyDiagram";

export default function HistoryPage() {
  const { data: architectures, isLoading } = useQuery<Architecture[]>({
    queryKey: ["/api/architectures"],
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Architecture History</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 mt-16">
      <div className="flex items-center gap-2 mb-8">
        <HistoryIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Architecture History</h1>
      </div>

      <div className="grid gap-6">
        {architectures?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No architectures found. Generate one to see it here.
            </CardContent>
          </Card>
        ) : (
          architectures?.map((arch) => {
            const output = arch.output as any;
            const maturity = output?.maturity ?? [];
            const useCases = output?.useCases ?? [];
            
            return (
              <Card key={arch.id} className="overflow-hidden shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
                  <div>
                    <CardTitle className="text-xl text-primary">{arch.companyName}</CardTitle>
                    <CardDescription>
                      Generated on {format(new Date(arch.createdAt), "PPP p")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === arch.id ? null : arch.id)}
                    className="gap-2"
                  >
                    {expandedId === arch.id ? (
                      <><ChevronUp className="w-4 h-4" /> Collapse</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" /> View Architecture</>
                    )}
                  </Button>
                </CardHeader>
                
                {expandedId === arch.id && (
                  <CardContent className="p-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {!output ? (
                      <div className="text-center py-8 text-muted-foreground italic">
                        No architecture data available
                      </div>
                    ) : (
                      <>
                        {/* Maturity Tabs */}
                        <Tabs defaultValue="Current" className="w-full">
                          <TabsList className="grid w-full grid-cols-4 mb-6">
                            {["Current", "Crawl", "Walk", "Run"].map((stage) => (
                              <TabsTrigger key={stage} value={stage}>{stage}</TabsTrigger>
                            ))}
                          </TabsList>
                          
                          {maturity.map((stageData: any) => (
                            <TabsContent key={stageData.stage} value={stageData.stage} className="space-y-4">
                              <Card className="border-none shadow-none">
                                <CardHeader className="px-0 pt-0">
                                  <CardTitle className="text-lg">{stageData.stage} State</CardTitle>
                                  <CardDescription>{stageData.description}</CardDescription>
                                </CardHeader>
                                <ArchitectureDiagram nodes={stageData.nodes} edges={stageData.edges} />
                              </Card>
                            </TabsContent>
                          ))}
                        </Tabs>

                        {/* Use Cases */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-secondary" /> Use Cases & Journeys
                          </h3>
                          <div className="grid gap-4">
                            {useCases.map((useCase: any) => (
                              <Card key={useCase.id} className="border-l-4 border-l-secondary">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{useCase.name}</CardTitle>
                                    <Badge variant="secondary">Strategy</Badge>
                                  </div>
                                  <CardDescription>{useCase.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <Accordion type="single" collapsible>
                                    <AccordionItem value="journey" className="border-none">
                                      <AccordionTrigger className="text-sm py-2 hover:no-underline font-medium text-primary">
                                        <Zap className="w-4 h-4 mr-2" /> View Journey Diagram
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <JourneyDiagram journey={useCase.journey} useCase={useCase} />
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Debug Mode */}
                        <Accordion type="single" collapsible>
                          <AccordionItem value="debug" className="border-none">
                            <AccordionTrigger className="text-xs text-muted-foreground py-2 hover:no-underline">
                              <Code className="w-3 h-3 mr-2" /> Debug Mode (Raw JSON)
                            </AccordionTrigger>
                            <AccordionContent>
                              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-[10px] max-h-96">
                                {JSON.stringify(arch, null, 2)}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
