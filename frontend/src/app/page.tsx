import {
  ArchitectureSection,
  ComparisonSection,
  Hero,
  PipelineSection,
  ProblemSection,
  RevealDemo,
  SiteFooter,
  SiteHeader,
  SolutionSection,
  SponsorsSection,
  UseCasesSection,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <PipelineSection />
      <ArchitectureSection />
      <UseCasesSection />
      <RevealDemo />
      <SponsorsSection />
      <ComparisonSection />
      <SiteFooter />
    </div>
  );
}
