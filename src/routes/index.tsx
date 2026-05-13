import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  Loader2,
  Sparkles,
  Search,
  AlertTriangle,
  CheckCircle2,
  ScanLine,
  BookOpenCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "VerifyAI — Fake News Detection Powered by Gen AI" },
      {
        name: "description",
        content:
          "Paste any news article or claim and get a forensic AI verification report: real, fake, or misleading — with reasoning, red flags, and trusted sources.",
      },
    ],
  }),
});

type Claim = {
  claim: string;
  assessment: "true" | "false" | "partly_true" | "unverified";
  note: string;
};

type Report = {
  verdict: "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  summary: string;
  reasoning: string[];
  red_flags: string[];
  supporting_signals: string[];
  claims: Claim[];
  recommended_sources: string[];
};

const SAMPLE = `BREAKING: Scientists at Harvard reveal that drinking 3 cups of green tea every morning reverses aging by up to 20 years, according to an anonymous study leaked online. Big Pharma allegedly tried to suppress the findings.`;

function Index() {
  const [content, setContent] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setError(null);
    setReport(null);
    if (content.trim().length < 10) {
      setError("Paste at least a sentence of news to analyze.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analysis failed");
      setReport(data as Report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <ScanLine className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-mono text-sm tracking-widest text-foreground">
            VERIFY<span className="text-primary">.AI</span>
          </span>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur md:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          gen-ai · multi-signal · live
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-12">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> forensic news intelligence
          </div>
          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Is this news{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              real
            </span>{" "}
            or{" "}
            <span className="text-destructive">fabricated</span>?
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Paste any article, headline, or viral post. Our AI inspector
            cross-checks claims, scans for manipulation patterns, and returns a
            full verification report in seconds.
          </p>
        </div>

        {/* analyzer */}
        <div className="relative mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* input */}
          <div className="grain relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6 shadow-[var(--shadow-card)] backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                /input · raw_text
              </label>
              <button
                type="button"
                onClick={() => setContent(SAMPLE)}
                className="font-mono text-[11px] uppercase tracking-widest text-primary hover:underline"
              >
                load sample
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste a news article, headline, tweet, or any claim here…"
              className="h-64 w-full resize-none rounded-lg border border-border bg-background/60 p-4 font-mono text-sm leading-relaxed text-foreground outline-none ring-0 transition focus:border-primary"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                {content.length.toLocaleString()} chars
              </span>
              <button
                onClick={analyze}
                disabled={loading}
                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    analyzing
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    verify news
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* output */}
          <div className="grain relative min-h-[400px] overflow-hidden rounded-2xl border border-border bg-card/70 p-6 shadow-[var(--shadow-card)] backdrop-blur">
            {!report && !loading && <EmptyState />}
            {loading && <LoadingState />}
            {report && <ReportView report={report} />}
          </div>
        </div>

        {/* feature strip */}
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <Feature
            icon={<ScanLine className="h-5 w-5" />}
            title="Linguistic ML signals"
            text="Detects sensational tone, emotional manipulation, anonymous sources, and conspiracy framing."
          />
          <Feature
            icon={<BookOpenCheck className="h-5 w-5" />}
            title="Claim-by-claim audit"
            text="Each factual claim is broken out and assessed individually, not just the article as a whole."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Calibrated confidence"
            text="Honest uncertainty when topics are post-cutoff or niche — no overconfident verdicts."
          />
        </div>

        <footer className="mt-16 border-t border-border/60 pt-6 text-center font-mono text-xs text-muted-foreground">
          VerifyAI is an assistive tool. Always cross-reference with primary
          reporting before sharing.
        </footer>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5 backdrop-blur">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ScanLine className="h-7 w-7" />
      </div>
      <p className="max-w-xs font-mono text-sm text-muted-foreground">
        awaiting input · your verification report will appear here
      </p>
    </div>
  );
}

function LoadingState() {
  const steps = [
    "Parsing claims…",
    "Scanning linguistic signals…",
    "Cross-referencing knowledge base…",
    "Scoring credibility…",
    "Compiling report…",
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3 font-mono text-sm">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-3 text-muted-foreground">
          <Loader2
            className="h-4 w-4 animate-spin text-primary"
            style={{ animationDelay: `${i * 120}ms` }}
          />
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

const VERDICT_META: Record<
  Report["verdict"],
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  REAL: {
    label: "Likely Real",
    color: "text-success",
    bg: "bg-success/10 border-success/40",
    icon: <ShieldCheck className="h-6 w-6" />,
  },
  FAKE: {
    label: "Fake / Fabricated",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/40",
    icon: <ShieldX className="h-6 w-6" />,
  },
  MISLEADING: {
    label: "Misleading",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/40",
    icon: <ShieldAlert className="h-6 w-6" />,
  },
  UNVERIFIED: {
    label: "Unverified",
    color: "text-muted-foreground",
    bg: "bg-muted/40 border-border",
    icon: <HelpCircle className="h-6 w-6" />,
  },
};

function ReportView({ report }: { report: Report }) {
  const meta = VERDICT_META[report.verdict];
  return (
    <div className="flex h-full flex-col gap-5">
      {/* verdict */}
      <div
        className={`flex items-center gap-4 rounded-xl border p-4 ${meta.bg}`}
      >
        <div className={meta.color}>{meta.icon}</div>
        <div className="flex-1">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            verdict
          </div>
          <div className={`text-2xl font-bold ${meta.color}`}>{meta.label}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            confidence
          </div>
          <div className="text-2xl font-bold text-foreground">
            {Math.round(report.confidence)}%
          </div>
        </div>
      </div>

      {/* confidence bar */}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
          style={{ width: `${Math.max(2, Math.round(report.confidence))}%` }}
        />
      </div>

      {/* summary */}
      <div>
        <SectionTitle>Summary</SectionTitle>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {report.summary}
        </p>
      </div>

      {/* reasoning */}
      {report.reasoning?.length > 0 && (
        <div>
          <SectionTitle>Reasoning</SectionTitle>
          <ul className="mt-2 space-y-1.5">
            {report.reasoning.map((r, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* claims */}
      {report.claims?.length > 0 && (
        <div>
          <SectionTitle>Claim breakdown</SectionTitle>
          <div className="mt-2 space-y-2">
            {report.claims.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-background/50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-foreground">{c.claim}</p>
                  <ClaimBadge a={c.assessment} />
                </div>
                {c.note && (
                  <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* signals grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {report.red_flags?.length > 0 && (
          <SignalList
            title="Red flags"
            tone="bad"
            items={report.red_flags}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        )}
        {report.supporting_signals?.length > 0 && (
          <SignalList
            title="Credibility signals"
            tone="good"
            items={report.supporting_signals}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
        )}
      </div>

      {report.recommended_sources?.length > 0 && (
        <div>
          <SectionTitle>Recommended sources</SectionTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            {report.recommended_sources.map((s, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-widest text-primary">
      {children}
    </div>
  );
}

function ClaimBadge({ a }: { a: Claim["assessment"] }) {
  const map = {
    true: { label: "TRUE", cls: "bg-success/15 text-success border-success/30" },
    false: {
      label: "FALSE",
      cls: "bg-destructive/15 text-destructive border-destructive/30",
    },
    partly_true: {
      label: "PARTLY",
      cls: "bg-warning/15 text-warning border-warning/30",
    },
    unverified: {
      label: "UNVERIFIED",
      cls: "bg-muted text-muted-foreground border-border",
    },
  } as const;
  const v = map[a];
  return (
    <span
      className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-wider ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function SignalList({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  tone: "good" | "bad";
}) {
  const cls =
    tone === "good"
      ? "border-success/30 bg-success/5 text-success"
      : "border-destructive/30 bg-destructive/5 text-destructive";
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
        {icon} {title}
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-xs leading-relaxed text-foreground/90">
            • {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
