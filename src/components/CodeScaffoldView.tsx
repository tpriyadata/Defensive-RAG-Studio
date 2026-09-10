import React, { useState } from 'react';
import { FileCode2, Copy, Check, Terminal, FolderTree, FileText } from 'lucide-react';
import { PYTHON_SCAFFOLD_FILES } from '../data/architecturalData';

export const CodeScaffoldView: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = PYTHON_SCAFFOLD_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                Production Scaffolding
              </span>
              <span className="text-xs text-slate-500">
                Pydantic v2 · Defensive Boundaries · Testing Efficiency
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Production Project Scaffolding Explorer
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Modular, maintainable, and strictly typed Python and Infrastructure code. 
              Each module enforces defensive programming against worst-case schema corruption, timeouts, and hallucinations.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all self-start md:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy {currentFile.filename}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Code Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: File Tree Explorer */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <span>Project File Tree</span>
          </div>

          <div className="space-y-1">
            {PYTHON_SCAFFOLD_FILES.map((file, idx) => {
              const isSelected = selectedFileIndex === idx;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <strong>Architecture Note:</strong> Code is strictly modularized into schemas, pipeline orchestration, individual agents, resilience primitives, and boundary unit tests.
          </div>
        </div>

        {/* Right: Code Editor / Display */}
        <div className="lg:col-span-3 space-y-3">
          {/* File Metadata Header */}
          <div className="bg-slate-900 text-slate-300 rounded-t-2xl p-4 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {currentFile.path}
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">|</span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {currentFile.description}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {currentFile.code.split('\n').length} lines
            </span>
          </div>

          {/* Syntax Highlighted Container */}
          <div className="bg-slate-950 rounded-b-2xl p-4 border-x border-b border-slate-800 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200 max-h-[640px] overflow-y-auto">
            <pre>
              <code>{currentFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
