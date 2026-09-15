import { TopBar } from "@/components/ui/TopBar";
import { StagePanel } from "@/components/ui/StagePanel";
import { CameraPanel } from "@/components/ui/CameraPanel";
import { LensPanel } from "@/components/ui/LensPanel";
import { AnalysisPanel } from "@/components/ui/AnalysisPanel";
import { DiagnosticsPanel } from "@/components/ui/DiagnosticsPanel";
import { StageView } from "@/components/views/StageView";

export default function App() {
  return (
    <div className="flex h-screen w-screen flex-col bg-vp-bg text-neutral-200">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-vp-border bg-vp-panel">
          <StagePanel />
          <CameraPanel />
          <LensPanel />
        </div>
        <div className="relative min-w-0 flex-1">
          <StageView />
        </div>
        <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-vp-border bg-vp-panel">
          <AnalysisPanel />
          <DiagnosticsPanel />
        </div>
      </div>
    </div>
  );
}
