import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Lobby from "./pages/Lobby.tsx";
import Game from "./pages/Game.tsx";
import GuestJoin from "./pages/GuestJoin.tsx";
import GuestBuzzer from "./pages/GuestBuzzer.tsx";
import HostController from "./pages/HostController.tsx";
import AboutUs from "./pages/AboutUs.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game" element={<Game />} />
          <Route path="/join" element={<GuestJoin />} />
          <Route path="/buzzer" element={<GuestBuzzer />} />
          <Route path="/host-controller" element={<HostController />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
