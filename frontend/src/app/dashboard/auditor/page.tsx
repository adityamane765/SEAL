import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Auditors_Dash } from "@/components/dashboard/Auditors_Dash";

export default function AuditorDashboardPage() {
  return (
    <div className="min-h-[100svh] w-full bg-[#f5f5f0] text-[#05058a]">
      <DashboardNavbar />
      <main className="mx-auto max-w-[1440px] px-6 pb-24 pt-28 md:pt-32">
        <Auditors_Dash />
      </main>
    </div>
  );
}

