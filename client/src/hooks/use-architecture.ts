import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CompanyContext, type AiOutput } from "@shared/schema";
import { useLocation } from "wouter";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ==========================================
// CLIENT STORE (Persist generated data)
// ==========================================

interface ArchitectureStore {
  currentContext: CompanyContext | null;
  generatedOutput: AiOutput | null;
  setContext: (ctx: CompanyContext) => void;
  setOutput: (output: AiOutput) => void;
  reset: () => void;
}

export const useArchitectureStore = create<ArchitectureStore>()(
  persist(
    (set) => ({
      currentContext: null,
      generatedOutput: null,
      setContext: (ctx) => set({ currentContext: ctx }),
      setOutput: (output) => set({ generatedOutput: output }),
      reset: () => set({ currentContext: null, generatedOutput: null }),
    }),
    {
      name: 'arc-storage',
    }
  )
);

// ==========================================
// API HOOKS
// ==========================================

export function useArchitectures() {
  return useQuery({
    queryKey: ['/api/architectures'],
    queryFn: async () => {
      const res = await fetch('/api/architectures');
      if (!res.ok) throw new Error("Failed to fetch architectures");
      return res.json();
    },
  });
}

export function useGenerateArchitecture() {
  const store = useArchitectureStore();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: CompanyContext) => {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate architecture");
      }
      
      return res.json() as Promise<AiOutput>;
    },
    onSuccess: (data, variables) => {
      console.log("Frontend: Generation successful, data:", data);
      store.setContext(variables);
      store.setOutput(data);
      console.log("Frontend: Redirecting to /architecture");
      setLocation('/architecture');
    },
  });
}
