import mermaid from "mermaid";
import { useEffect, useState, useRef } from "react";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "inherit",
});

interface MermaidProps {
  chart: string;
}

export const Mermaid = ({ chart }: MermaidProps) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      if (!chart) return;
      
      // Reset state
      setError(null);
      
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (isMounted) {
          setError("Failed to render diagram.");
        }
      }
    };

    renderChart();
    
    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
     return (
        <div className="text-red-500 text-xs p-2 bg-red-50 rounded border border-red-100 my-2 font-mono whitespace-pre-wrap">
           <p className="font-bold">Mermaid Error:</p>
           {error}
        </div>
     );
  }

  if (!svg) {
      return (
          <div className="flex justify-center p-4 my-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="animate-pulse bg-slate-200 h-32 w-full rounded"></div>
          </div>
      );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container flex justify-center overflow-x-auto w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
