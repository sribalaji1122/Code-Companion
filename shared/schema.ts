import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ============================================================
   DATABASE TABLE
============================================================ */

export const architectures = pgTable("architectures", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  context: jsonb("context").notNull(),
  output: jsonb("output").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertArchitectureSchema = createInsertSchema(architectures).omit({
  id: true,
  createdAt: true,
});

export type Architecture = typeof architectures.$inferSelect;
export type InsertArchitecture = z.infer<typeof insertArchitectureSchema>;

/* ============================================================
   COMPANY CONTEXT INPUT
============================================================ */

export const companyContextSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  businessModel: z.enum(["B2B", "B2C", "Both"]),
  region: z.string().optional(),

  /* ---------- DATA SOURCES ---------- */
  dataSources: z.array(z.string()),

  /* ---------- TECH STACK ---------- */
  toolsUsed: z.object({
    crm: z.string().optional(),
    marketingAutomation: z.string().optional(),
    analytics: z.string().optional(),
    dataWarehouse: z.string().optional(),
    cms: z.string().optional(),
    cdp: z.string().optional(),
    personalization: z.string().optional(),
  }),

  /* ---------- ACTIVATION ---------- */
  activationChannels: z.array(z.string()),

  /* ---------- DATA SOURCE → TOOL MAPPING ---------- */
  dataSourceConnections: z
    .array(
      z.object({
        source: z.string(),
        targets: z.array(z.string()),
      })
    )
    .optional(),

  /* ---------- TOOL → CHANNEL MAPPING ---------- */
  activationConnections: z
    .array(
      z.object({
        source: z.string(),
        targets: z.array(z.string()),
      })
    )
    .optional(),

  /* ---------- BUSINESS OBJECTIVES ---------- */
  currentlyUsingUseCases: z.array(z.string()).optional(),
  currentUseCases: z.string().optional(),
  expectedOutcomes: z.string().optional(),
});

export type CompanyContext = z.infer<typeof companyContextSchema>;

/* ============================================================
   ARCHITECTURE NODES
============================================================ */

export const nodeSchema = z.object({
  id: z.string(),
  type: z.enum([
    "sourceNode",
    "systemNode",
    "channelNode",
    "dataNode",
    "decisionNode",
    "entryNode",
    "actionNode",
    "exitNode",
  ]),
  label: z.string(),
  lane: z.enum(["collect", "process", "engage", "data"]),
  description: z.string().optional(),
  tech: z.string().optional(),
});

export type StageNode = z.infer<typeof nodeSchema>;

export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.enum(["solid", "dashed", "dotted"]),
  label: z.string().optional(),
});

export type StageEdge = z.infer<typeof edgeSchema>;

/* ============================================================
   MATURITY MODEL
============================================================ */

export const maturityStageSchema = z.object({
  stage: z.enum(["Current", "Crawl", "Walk", "Run"]),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  keyChanges: z.array(z.string()),
  description: z.string(),
});

export type MaturityStage = z.infer<typeof maturityStageSchema>;

/* ============================================================
   USE CASE JOURNEY
============================================================ */

export const touchpointSchema = z.object({
  stepName: z.string(),
  channel: z.string(),
  timingGap: z.string(),
  keyMessaging: z.string(),
  primaryCTA: z.string(),
  secondaryCTA: z.string().optional(),
});

export type Touchpoint = z.infer<typeof touchpointSchema>;

export const controlRulesSchema = z.object({
  entryCriteria: z.string(),
  exitCriteria: z.string(),
  reEntryRules: z.string(),
  frequencyCap: z.string(),
  kpis: z.array(z.string()),
});

export type ControlRules = z.infer<typeof controlRulesSchema>;

export const useCaseJourneySchema = z.object({
  touchpoints: z.array(touchpointSchema),
  controlRules: controlRulesSchema,
});

export const useCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  stage: z.enum(["Current", "Crawl", "Walk", "Run"]),
  description: z.string(),
  goals: z.array(z.string()),
  audience: z.string(),
  benefits: z.array(z.string()),
  channels: z.array(z.string()),
  dataRequired: z.array(z.string()),
  measures: z.array(z.string()),
  challenges: z.array(z.string()),
  architectureComponentsUsed: z.array(z.string()).optional(),
  journey: useCaseJourneySchema,
});

export type UseCase = z.infer<typeof useCaseSchema>;

/* ============================================================
   FINAL AI OUTPUT
============================================================ */

export const aiOutputSchema = z.object({
  maturity: z.array(maturityStageSchema),
  useCases: z.array(useCaseSchema),
});

export type AiOutput = z.infer<typeof aiOutputSchema>;