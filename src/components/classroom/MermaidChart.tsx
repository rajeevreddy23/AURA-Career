'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MermaidChartProps {
  chart: string;
  className?: string;
}

export default function MermaidChart({ chart, className = '' }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      if (!chart || !chart.trim()) {
        setIsRendering(false);
        return;
      }

      try {
        setIsRendering(true);
        setError(null);

        // Dynamically import mermaid to avoid SSR issues
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            darkMode: true,
            background: '#090d16',
            primaryColor: '#8b5cf6',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#7c3aed',
            lineColor: '#a78bfa',
            secondaryColor: '#3b82f6',
            tertiaryColor: '#1e293b',
            noteBkgColor: '#1e1b4b',
            noteTextColor: '#c4b5fd',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '13px',
          },
          securityLevel: 'loose',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
          },
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        // Clean up any extra backticks or language annotations
        const cleanedChart = chart
          .replace(/^```(mermaid)?/i, '')
          .replace(/```$/, '')
          .trim();

        const { svg } = await mermaid.render(id, cleanedChart);
        if (isMounted) {
          setSvgContent(svg);
          setIsRendering(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Mermaid render error:', err);
          setError(err?.message || 'Failed to render diagram');
          setIsRendering(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    // Graceful fallback: render clean stylized ASCII/code box
    return (
      <div className="my-4 p-4 rounded-2xl bg-slate-950 border border-purple-900/40 text-xs font-mono text-purple-300">
        <div className="text-[11px] font-bold text-purple-400 mb-2 uppercase tracking-wider flex items-center gap-2">
          <span>📊 Visual Architecture Diagram</span>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      className={`my-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-purple-500/20 shadow-xl overflow-hidden ${className}`}
    >
      <div className="px-4 py-2.5 bg-slate-900/80 border-b border-purple-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold text-purple-300 font-mono tracking-wide">
            Interactive Architecture Flowchart
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Live SVG Diagram</span>
      </div>

      <div className="p-4 flex items-center justify-center min-h-[140px] overflow-x-auto">
        {isRendering ? (
          <div className="flex items-center space-x-2 text-xs text-purple-300 py-6">
            <svg
              className="animate-spin h-4 w-4 text-purple-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Rendering visual architecture flowchart...</span>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto text-slate-100"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : null}
      </div>
    </div>
  );
}
