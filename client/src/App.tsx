import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/Home";
import InputForm from "@/pages/InputForm";
import Architecture from "@/pages/Architecture";
import UseCases from "@/pages/UseCases";
import HistoryPage from "@/pages/History";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navigation />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/input" component={InputForm} />
          <Route path="/architecture" component={Architecture} />
          <Route path="/use-cases" component={UseCases} />
          <Route path="/history" component={HistoryPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
