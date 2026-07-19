import { notFound } from "next/navigation";

interface ModulePageProps {
  params: Promise<{
    domain: string;
    moduleId: string;
  }>;
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { domain, moduleId } = await params;

  // In a real implementation, we would fetch the JSON file for this domain and moduleId
  // For now, we stub this out to demonstrate the routing structure.
  
  if (!domain || !moduleId) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4 capitalize">{domain} Module: {moduleId}</h1>
      <p className="text-gray-600 mb-8">
        This is a placeholder for the domain-agnostic interactive learning module.
      </p>
      
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Challenge Area</h2>
        <p className="italic text-gray-500">Interactive gamified components will mount here based on the parsed JSON schema.</p>
      </div>
    </div>
  );
}
