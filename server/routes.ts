import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { companyContextSchema } from "@shared/schema";

/* ------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------ */

type Stage = "Current" | "Crawl" | "Walk" | "Run";

const STAGE_TARGET: Record<Stage, number> = {
  Current: 3,
  Crawl: 1,
  Walk: 1,
  Run: 1
};

/* ------------------------------------------------ */
/* OPENAI CLIENT */
/* ------------------------------------------------ */

function getOpenAIClient() {

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  return new OpenAI({ apiKey });

}

/* ------------------------------------------------ */
/* ROUTES */
/* ------------------------------------------------ */

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.architecture.generate.path, async (req, res) => {

    try {

      const input = companyContextSchema.parse(req.body);

      const openai = getOpenAIClient();

      const aiOutput = await generateArchitecture(openai, input);

      ensureStages(aiOutput);

      await rebalanceUseCases(openai, aiOutput, input);

      await generateJourneys(openai, aiOutput, input);

      const saved = await storage.createArchitecture({
        companyName: input.companyName,
        context: input,
        output: aiOutput
      });

      res.json(aiOutput);

    } catch (err) {

      console.error(err);

      if (err instanceof z.ZodError) {

        return res.status(400).json({
          message: "Invalid input",
          errors: err.errors
        });

      }

      res.status(500).json({
        message: "Architecture generation failed"
      });

    }

  });

  app.get(api.architecture.list.path, async (_, res) => {

    const list = await storage.listArchitectures();
    res.json(list);

  });

  app.get(api.architecture.get.path, async (req, res) => {

    const id = parseInt(req.params.id);

    const arch = await storage.getArchitecture(id);

    if (!arch) {
      return res.status(404).json({ message: "Architecture not found" });
    }

    res.json(arch);

  });

  return httpServer;

}

/* ------------------------------------------------ */
/* GENERATE ARCHITECTURE */
/* ------------------------------------------------ */

async function generateArchitecture(openai: OpenAI, input: any) {

  const systemPrompt = `
You are an enterprise marketing architecture strategist.

Generate architecture maturity stages and marketing use cases.

Rules:
- Exactly 6 use cases
- Stage distribution:
  Current:3
  Crawl:1
  Walk:1
  Run:1

Return JSON:

{
 "maturity": [],
 "useCases": []
}
`;

  const completion = await openai.chat.completions.create({

    model: "gpt-4o-mini",

    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(input) }
    ],

    response_format: { type: "json_object" }

  });

  const content = completion.choices?.[0]?.message?.content;

  if (!content) throw new Error("AI returned empty response");

  const output = JSON.parse(content);

  if (!Array.isArray(output.useCases)) output.useCases = [];
  if (!Array.isArray(output.maturity)) output.maturity = [];

  return output;

}

/* ------------------------------------------------ */
/* ENSURE STAGES */
/* ------------------------------------------------ */

function ensureStages(aiOutput: any) {

  const required: Stage[] = ["Current","Crawl","Walk","Run"];

  const existing = aiOutput.maturity.map((s:any)=>s.stage);

  for (const stage of required) {

    if (!existing.includes(stage)) {

      aiOutput.maturity.push({
        stage,
        description:`${stage} architecture`,
        keyChanges:[],
        nodes:[],
        edges:[]
      });

    }

  }

}

/* ------------------------------------------------ */
/* NORMALIZE STAGE */
/* ------------------------------------------------ */

function normalizeStage(stage:string):Stage|null{

  if(!stage) return null;

  const s = stage.toLowerCase();

  if(s.includes("current")) return "Current";
  if(s.includes("crawl")) return "Crawl";
  if(s.includes("walk")) return "Walk";
  if(s.includes("run")) return "Run";

  return null;

}

/* ------------------------------------------------ */
/* USE CASE REBALANCER */
/* ------------------------------------------------ */

async function rebalanceUseCases(
  openai:OpenAI,
  aiOutput:any,
  input:any
){

  const buckets:Record<Stage,any[]> = {
    Current:[],
    Crawl:[],
    Walk:[],
    Run:[]
  };

  for(const uc of aiOutput.useCases || []){

    const stage = normalizeStage(uc.stage);

    if(!stage) continue;

    uc.stage = stage;

    buckets[stage].push(uc);

  }

  for(const stage of Object.keys(STAGE_TARGET) as Stage[]){

    while(buckets[stage].length < STAGE_TARGET[stage]){

      const newUC = await generateSingleUseCase(openai,stage,input);

      newUC.stage = stage;

      buckets[stage].push(newUC);

    }

  }

  aiOutput.useCases = [
    ...buckets.Current.slice(0,3),
    ...buckets.Crawl.slice(0,1),
    ...buckets.Walk.slice(0,1),
    ...buckets.Run.slice(0,1)
  ];

}

/* ------------------------------------------------ */
/* GENERATE SINGLE USE CASE */
/* ------------------------------------------------ */

async function generateSingleUseCase(
  openai:OpenAI,
  stage:Stage,
  input:any
){

  const prompt = `
Generate ONE enterprise marketing use case.

Stage: ${stage}

Industry: ${input.industry}

Available Channels:
${(input.activationChannels || []).join(", ")}

Available Data Sources:
${(input.dataSources || []).join(", ")}

Return JSON:

{
"id":"string",
"name":"string",
"stage":"${stage}",
"description":"string",
"goals":[],
"audience":"string",
"benefits":[],
"channels":[],
"dataRequired":[],
"measures":[],
"challenges":[],
"architectureComponentsUsed":[]
}
`;

  const completion = await openai.chat.completions.create({

    model:"gpt-4o-mini",

    messages:[
      {role:"system",content:"Enterprise marketing strategist"},
      {role:"user",content:prompt}
    ],

    response_format:{type:"json_object"}

  });

  const content = completion.choices?.[0]?.message?.content;

  if(!content) throw new Error("Use case generation failed");

  return JSON.parse(content);

}

/* ------------------------------------------------ */
/* GENERATE JOURNEYS */
/* ------------------------------------------------ */

async function generateJourneys(
  openai:OpenAI,
  aiOutput:any,
  input:any
){

  for(const uc of aiOutput.useCases){

    const prompt = `
You are an enterprise marketing journey architect.

Company: ${input.companyName}
Industry: ${input.industry}

Use Case:
${uc.name}

Audience:
${uc.audience}

Available Channels:
${(uc.channels || input.activationChannels || []).join(", ")}

Design a realistic marketing journey.

Rules:
- 5 to 6 steps
- Messaging must be highly specific to the use case
- CTA must represent a real business action
- No generic wording
- Each message must align with enterprise marketing execution

Return JSON:

{
"touchpoints":[
{
"stepName":"",
"channel":"",
"timingGap":"",
"keyMessaging":"",
"primaryCTA":"",
"secondaryCTA":""
}
]
}
`;

    const completion = await openai.chat.completions.create({

      model:"gpt-4o-mini",

      messages:[
        {role:"system",content:"Enterprise marketing journey designer"},
        {role:"user",content:prompt}
      ],

      response_format:{type:"json_object"}

    });

    const content = completion.choices?.[0]?.message?.content;

    if(!content){
      throw new Error("Journey generation failed");
    }

    const data = JSON.parse(content);

    uc.journey = {

      touchpoints:data.touchpoints,

      controlRules:{
        entryCriteria:"Customer meets segmentation criteria",
        exitCriteria:"Journey objective achieved",
        reEntryRules:"Allowed after 30 days",
        frequencyCap:"Max 3 contacts per week",
        kpis:[
          "Engagement Rate",
          "Conversion Rate",
          "Customer Retention"
        ]
      }

    };

  }

}