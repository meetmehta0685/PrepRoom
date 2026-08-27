"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { BracesIcon, TextCursorInputIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { codeLanguageValues, type CodeLanguage } from "@/lib/ai-interviewer";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const languages: Array<{ value: CodeLanguage; label: string }> = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

export function CodeEditor({
  value,
  language,
  onChange,
  onLanguageChange,
  disabled,
}: {
  value: string;
  language: CodeLanguage;
  onChange: (value: string) => void;
  onLanguageChange: (language: CodeLanguage) => void;
  disabled?: boolean;
}) {
  const [plainTextMode, setPlainTextMode] = useState(false);

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden border border-foreground bg-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-background/25 px-4 py-3 text-background">
        <div className="flex items-center gap-2">
          <BracesIcon className="size-4 text-accent" />
          <span className="text-sm font-semibold">Solution</span>
          <Badge className="border-background/25 bg-background/10 text-background">AI reviewed</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPlainTextMode((current) => !current)} disabled={disabled}>
            <TextCursorInputIcon data-icon="inline-start" />
            {plainTextMode ? "Use code editor" : "Use plain text"}
          </Button>
          <Select value={language} onValueChange={(next) => next && onLanguageChange(next as CodeLanguage)} disabled={disabled}>
            <SelectTrigger className="w-36 border-background/25 bg-foreground text-background" aria-label="Programming language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {languages.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      {plainTextMode ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label="Plain-text code answer"
          spellCheck={false}
          className="h-[370px] w-full resize-y bg-foreground p-5 font-mono text-sm leading-6 text-background outline-none placeholder:text-background/45 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/70"
          placeholder="Write your solution here..."
        />
      ) : (
        <MonacoEditor
          height="370px"
          language={codeLanguageValues.includes(language) ? language : "javascript"}
          value={value}
          onChange={(next) => onChange(next ?? "")}
          theme="vs-dark"
          loading={<div className="flex h-[370px] items-center justify-center font-mono text-xs uppercase tracking-[0.12em] text-background/60">Loading editor</div>}
          options={{
            readOnly: disabled,
            minimap: { enabled: false },
            fontFamily: "JetBrains Mono Variable, ui-monospace, SFMono-Regular, monospace",
            fontSize: 14,
            lineHeight: 23,
            padding: { top: 18, bottom: 18 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            accessibilitySupport: "auto",
            ariaLabel: "Code answer editor",
          }}
        />
      )}
    </div>
  );
}
