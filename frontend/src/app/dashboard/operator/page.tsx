import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Operators_Dash } from "@/components/dashboard/Operators_Dash";

export default function OperatorDashboardPage() {
  return (
    <div className="min-h-[100svh] w-full bg-[#f5f5f0] text-[#05058a]">
      <DashboardNavbar />
      <main className="mx-auto max-w-[1440px] px-6 pb-24 pt-28 md:pt-32">
        <Operators_Dash />
      </main>
    </div>
  );
}

