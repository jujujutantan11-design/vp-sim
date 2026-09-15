import { TopBar } from "@/components/ui/TopBar";
import { StagePanel } from "@/components/ui/StagePanel";
import { DiagnosticsPanel } from "@/components/ui/DiagnosticsPanel";
import { StageView } from "@/components/views/StageView";

export default function App() {
  return (
    <div className="flex h-screen w-screen flex-col bg-vp-bg text-neutral-200">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <StagePanel />
        <div className="relative min-w-0 flex-1">
          <StageView />
        </div>
        <DiagnosticsPanel />
      </div>
    </div>
  );
}
