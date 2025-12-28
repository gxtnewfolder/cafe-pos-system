import { getFeatureFlags } from "@/lib/features-server";
import DashboardSidebar from "./components/DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Fetch features on server before render - no flash!
  const features = await getFeatureFlags();

  return (
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Sidebar with pre-loaded features */}
      <DashboardSidebar initialFeatures={features} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
