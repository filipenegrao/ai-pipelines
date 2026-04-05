import { useState, useRef, useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const TOKENS = {
  colors: {
    primitive: {
      "slate-950": "#0a0f1a",
      "slate-900": "#111827",
      "slate-800": "#1e293b",
      "slate-700": "#334155",
      "slate-400": "#94a3b8",
      "slate-300": "#cbd5e1",
      "slate-100": "#f1f5f9",
      white: "#ffffff",
      "amber-400": "#fbbf24",
      "amber-500": "#f59e0b",
      "emerald-400": "#34d399",
      "red-400": "#f87171",
      "violet-400": "#a78bfa",
      "violet-500": "#8b5cf6",
    },
    semantic: {
      "bg-primary": "var(--slate-950)",
      "bg-surface": "var(--slate-900)",
      "bg-surface-raised": "var(--slate-800)",
      "text-primary": "var(--white)",
      "text-secondary": "var(--slate-400)",
      "text-muted": "var(--slate-700)",
      accent: "var(--amber-400)",
      success: "var(--emerald-400)",
      error: "var(--red-400)",
      interactive: "var(--violet-400)",
    },
  },
  spacing: {
    primitive: {
      4: "4px",
      8: "8px",
      12: "12px",
      16: "16px",
      20: "20px",
      24: "24px",
      32: "32px",
      40: "40px",
      48: "48px",
      64: "64px",
    },
    semantic: {
      "space-xs": "4px",
      "space-sm": "8px",
      "space-md": "16px",
      "space-lg": "24px",
      "space-xl": "32px",
      "space-2xl": "48px",
      "space-section": "64px",
    },
  },
  typography: {
    scale: {
      display: {
        size: "36px",
        weight: 700,
        leading: "1.1",
        tracking: "-0.02em",
      },
      heading: {
        size: "24px",
        weight: 600,
        leading: "1.2",
        tracking: "-0.01em",
      },
      subheading: { size: "16px", weight: 600, leading: "1.4", tracking: "0" },
      body: { size: "14px", weight: 400, leading: "1.5", tracking: "0" },
      caption: {
        size: "12px",
        weight: 400,
        leading: "1.4",
        tracking: "0.01em",
      },
      mono: { size: "13px", weight: 500, leading: "1.4", tracking: "0.02em" },
    },
  },
  radii: { sm: "6px", md: "10px", lg: "16px", full: "9999px" },
};

const AUDIT = [
  {
    type: "pass",
    rule: "Contraste",
    detail: "Texto primário sobre bg-primary → 15.3:1 (AAA)",
  },
  {
    type: "pass",
    rule: "Contraste",
    detail: "Texto secundário sobre bg-surface → 5.2:1 (AA)",
  },
  {
    type: "warn",
    rule: "Contraste",
    detail: "Caption sobre bg-surface-raised → 3.8:1 (AA large only)",
  },
  {
    type: "pass",
    rule: "Escala tipográfica",
    detail: "Razão ~1.25 (Major Third) — consistente",
  },
  {
    type: "pass",
    rule: "Espaçamento",
    detail: "Base 8px detectada — sem valores quebrados",
  },
  {
    type: "warn",
    rule: "Componentes",
    detail: "2 botões com estilos similares mas não idênticos → unificar",
  },
  {
    type: "pass",
    rule: "Tokens",
    detail: "18 cores primitivas → 10 semânticas extraídas",
  },
];

const COMPONENTS = [
  {
    name: "Button",
    variants: ["primary", "secondary", "ghost"],
    sizes: ["sm", "md", "lg"],
    props: "variant, size, disabled, loading, icon, children",
  },
  {
    name: "Card",
    variants: ["default", "raised", "outlined"],
    sizes: ["compact", "default"],
    props: "variant, size, header, footer, children",
  },
  {
    name: "Badge",
    variants: ["success", "warning", "error", "neutral"],
    sizes: ["sm", "md"],
    props: "variant, size, dot, children",
  },
  {
    name: "Input",
    variants: ["default", "error"],
    sizes: ["sm", "md"],
    props: "variant, size, label, helperText, error, disabled",
  },
];

const TAILWIND_CONFIG = `// tailwind.config.ts — gerado a partir dos tokens extraídos

import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        surface: {
          primary: "#0a0f1a",
          DEFAULT: "#111827",
          raised: "#1e293b",
        },
        content: {
          primary: "#ffffff",
          secondary: "#94a3b8",
          muted: "#334155",
        },
        accent: {
          DEFAULT: "#fbbf24",
          hover: "#f59e0b",
        },
        success: "#34d399",
        error: "#f87171",
        interactive: {
          DEFAULT: "#a78bfa",
          hover: "#8b5cf6",
        },
      },
      spacing: {
        xs: "4px", sm: "8px", md: "16px",
        lg: "24px", xl: "32px", "2xl": "48px", section: "64px",
      },
      borderRadius: { sm: "6px", md: "10px", lg: "16px" },
      fontSize: {
        display:    ["36px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        heading:    ["24px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        subheading: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        body:       ["14px", { lineHeight: "1.5" }],
        caption:    ["12px", { lineHeight: "1.4", letterSpacing: "0.01em" }],
        mono:       ["13px", { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "500" }],
      },
    },
  },
};`;

const COMPONENT_CODE = `// components/ui/Button.tsx

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: "bg-accent text-surface-primary hover:bg-accent-hover",
  secondary: "bg-surface-raised text-content-primary border border-content-muted hover:border-content-secondary",
  ghost: "text-content-secondary hover:text-content-primary hover:bg-surface-raised",
};

const sizes = {
  sm: "px-sm py-xs text-caption rounded-sm h-8",
  md: "px-md py-sm text-body rounded-md h-10",
  lg: "px-lg py-md text-subheading rounded-md h-12",
};

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  loading,
  children,
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={\`inline-flex items-center justify-center
        font-medium transition-all duration-150
        \${variants[variant]} \${sizes[size]}
        \${disabled ? "opacity-40 cursor-not-allowed" : ""}
        \${loading ? "animate-pulse" : ""}\`}
    >
      {children}
    </button>
  );
}`;

const FLOW_STEPS = [
  {
    name: "Figma Layout",
    description:
      "Crie seus layouts com liberdade criativa, sem se preocupar com sistematização ainda.",
    steps: [
      "Desenhe as telas principais do produto (home, dashboard, formulários)",
      "Use cores, tipografia e espaçamentos intuitivamente — sem sistema formal",
      "Foque em resolver o problema visual, não em nomear tokens",
      "Exporte o arquivo via Figma API ou plugin de extração (JSON com nós, estilos e variáveis)",
    ],
  },
  {
    name: "Auditoria IA",
    description:
      "A IA analisa seu layout e identifica inconsistências antes de sistematizar.",
    steps: [
      "Passe o JSON exportado do Figma como contexto para a IA",
      "Peça verificação de contraste WCAG (AA mínimo) em todas as combinações texto/fundo",
      "Peça detecção de valores de espaçamento fora da grade (ex: 13px quando a base é 8px)",
      "Peça identificação de componentes duplicados ou quase-idênticos para unificação",
      "Revise os warnings e corrija no Figma antes de prosseguir",
    ],
  },
  {
    name: "Tokens JSON",
    description:
      "A IA extrai os tokens semânticos a partir das decisões visuais do seu layout.",
    steps: [
      "A IA agrupa as cores usadas em primitivos (blue-500, slate-900) e semânticos (bg-primary, text-secondary)",
      "A escala tipográfica é detectada e nomeada (display, heading, body, caption)",
      "Espaçamentos são normalizados para a grade mais próxima (base 4 ou 8)",
      "O output é um JSON no formato W3C Design Token Community Group ou customizado",
    ],
  },
  {
    name: "Tailwind Config",
    description:
      "Os tokens JSON são convertidos em configuração consumível pelo Tailwind.",
    steps: [
      "Cores semânticas viram entries em theme.extend.colors",
      "Tipografia vira theme.extend.fontSize com lineHeight e letterSpacing embutidos",
      "Espaçamentos viram theme.extend.spacing com nomes semânticos",
      "Border-radius e outras decisões viram suas respectivas chaves no config",
      "O arquivo tailwind.config.ts é gerado pronto para colar no projeto Next.js",
    ],
  },
  {
    name: "React Components",
    description:
      "Componentes tipados são gerados consumindo os tokens via classes Tailwind.",
    steps: [
      "Cada componente identificado na auditoria vira um arquivo .tsx",
      "Variantes do Figma mapeiam 1:1 para props tipadas (variant, size, state)",
      "Classes Tailwind usam os tokens semânticos do config (bg-accent, text-content-primary)",
      "Componentes incluem estados (hover, focus, disabled, loading) já estilizados",
      "Exports são compatíveis com a estrutura de um projeto Next.js (components/ui/)",
    ],
  },
];

// ─── Primitive components ─────────────────────────────────────────────────────

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        color: active ? "#fbbf24" : "#94a3b8",
        background: active ? "rgba(251, 191, 36, 0.08)" : "transparent",
        border: "none",
        borderBottom: active ? "2px solid #fbbf24" : "2px solid transparent",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </button>
  );
}

function AuditItem({ item }) {
  const colors = { pass: "#34d399", warn: "#fbbf24", fail: "#f87171" };
  const labels = { pass: "✓", warn: "!", fail: "✗" };
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px solid #1e293b",
        listStyle: "none",
      }}
    >
      {/* Status icon — ✓ pass (green) / ! warn (amber) / ✗ fail (red) */}
      <span
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          flexShrink: 0,
          marginTop: "1px",
          background: `${colors[item.type]}15`,
          color: colors[item.type],
        }}
      >
        {labels[item.type]}
      </span>

      {/* Rule label + detail text */}
      <div>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#cbd5e1",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {item.rule}
        </span>
        <p
          style={{
            fontSize: "13px",
            color: "#94a3b8",
            margin: "2px 0 0",
            lineHeight: 1.4,
          }}
        >
          {item.detail}
        </p>
      </div>
    </li>
  );
}

function TokenGrid({ label }) {
  if (label === "Cores") {
    return (
      <div>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "12px",
          }}
        >
          Primitivos → Semânticos
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {Object.entries(TOKENS.colors.semantic).map(([name, ref]) => {
            const refName = ref.replace("var(--", "").replace(")", "");
            const hex = TOKENS.colors.primitive[refName] || "#000";
            return (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  background: "#1e293b",
                  borderRadius: "8px",
                }}
              >
                {/* Color token row — swatch + name + hex */}
                {/* Color swatch */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: hex,
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                />
                <div>
                  {/* Semantic token name */}
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#cbd5e1",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {name}
                  </div>
                  {/* Resolved hex value */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {hex}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (label === "Tipografia") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Object.entries(TOKENS.typography.scale).map(([name, val]) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              padding: "8px 10px",
              background: "#1e293b",
              borderRadius: "8px",
            }}
          >
            <span
              style={{
                fontSize: val.size,
                fontWeight: val.weight,
                color: "#f1f5f9",
                lineHeight: val.leading,
                letterSpacing: val.tracking,
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {val.size} / {val.weight}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {Object.entries(TOKENS.spacing.semantic).map(([name, val]) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 10px",
            background: "#1e293b",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              width: val,
              height: "14px",
              background: "rgba(167,139,250,0.35)",
              borderRadius: "3px",
              minWidth: "4px",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#cbd5e1",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {name}
          </span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ code }) {
  return (
    <pre
      style={{
        background: "#0a0f1a",
        borderRadius: "10px",
        padding: "20px",
        fontSize: "12px",
        lineHeight: 1.6,
        color: "#cbd5e1",
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        overflow: "auto",
        border: "1px solid #1e293b",
        maxHeight: "460px",
      }}
    >
      {code}
    </pre>
  );
}

function ComponentCard({ comp }) {
  return (
    <div
      style={{ background: "#1e293b", borderRadius: "10px", padding: "16px" }}
    >
      {/* Component name */}
      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "#f1f5f9",
          marginBottom: "8px",
        }}
      >
        {comp.name}
      </div>

      {/* Variant badges (amber) + size badges (violet) */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: "10px",
        }}
      >
        {comp.variants.map((v) => (
          <span
            key={v}
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "5px",
              background: "rgba(251,191,36,0.1)",
              color: "#fbbf24",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {v}
          </span>
        ))}
        {comp.sizes.map((s) => (
          <span
            key={s}
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "5px",
              background: "rgba(167,139,250,0.1)",
              color: "#a78bfa",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Props signature */}
      <div
        style={{
          fontSize: "11px",
          color: "#64748b",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.5,
        }}
      >
        props: {comp.props}
      </div>
    </div>
  );
}

// ─── Section components ───────────────────────────────────────────────────────

function PipelineHeader() {
  return (
    <header style={{ marginBottom: "32px" }}>
      {/* Status badge — green pulsing dot + "Pipeline ativo" label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#34d399",
            boxShadow: "0 0 8px #34d39966",
          }}
        />
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#34d399",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Pipeline ativo
        </span>
      </div>

      {/* Page title */}
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          margin: 0,
          color: "#ffffff",
        }}
      >
        Design → Auditoria → Tokens → Código
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: "14px",
          color: "#64748b",
          margin: "8px 0 0",
          lineHeight: 1.5,
        }}
      >
        Fluxo completo: a IA audita seu layout, extrai tokens semânticos e gera
        componentes tipados para Next.js + Tailwind.
      </p>
    </header>
  );
}

function FlowStep({
  step,
  index,
  isActive,
  onToggle,
  defaultColor,
  defaultBg,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {/* Clickable step pill — toggles the detail panel */}
      <button
        onClick={() => onToggle(index)}
        aria-expanded={isActive}
        aria-controls="flow-detail-panel"
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          whiteSpace: "nowrap",
          background: isActive ? "rgba(251,191,36,0.18)" : defaultBg,
          color: isActive ? "#fbbf24" : defaultColor,
          border: isActive
            ? "1px solid rgba(251,191,36,0.4)"
            : "1px solid transparent",
          cursor: "pointer",
          transition: "all 150ms ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          if (!isActive)
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = defaultBg;
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(251,191,36,0.4)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {step.name}
      </button>
      {/* Arrow separator — hidden after the last step */}
      {index < 4 && (
        <span style={{ color: "#334155", margin: "0 6px", fontSize: "14px" }}>
          →
        </span>
      )}
    </div>
  );
}

function FlowBar({ steps, activeStep, onStepClick }) {
  return (
    <nav
      aria-label="Etapas do pipeline"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0",
        padding: "16px",
        background: "#111827",
        borderRadius: activeStep !== null ? "12px 12px 0 0" : "12px",
        border: "1px solid #1e293b",
        borderBottom: activeStep !== null ? "none" : "1px solid #1e293b",
        overflowX: "auto",
        transition: "border-radius 200ms ease",
      }}
    >
      {steps.map((step, i) => {
        const defaultColor =
          i === 0 ? "#fbbf24" : i === 4 ? "#34d399" : "#94a3b8";
        const defaultBg =
          i === 0
            ? "rgba(251,191,36,0.12)"
            : i === 4
              ? "rgba(52,211,153,0.12)"
              : "rgba(148,163,184,0.08)";
        return (
          <FlowStep
            key={step.name}
            step={step}
            index={i}
            isActive={activeStep === i}
            onToggle={onStepClick}
            defaultColor={defaultColor}
            defaultBg={defaultBg}
          />
        );
      })}
    </nav>
  );
}

function FlowDetailPanel({ steps, displayStep, isOpen, panelRef }) {
  return (
    <div
      ref={panelRef}
      id="flow-detail-panel"
      role="region"
      aria-label={steps[displayStep].name}
      aria-hidden={!isOpen}
      style={{
        maxHeight: isOpen ? "600px" : "0",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 250ms ease, opacity 200ms ease",
        marginBottom: "32px",
      }}
    >
      <div
        style={{
          background: "#111827",
          border: "1px solid #1e293b",
          borderTop: "1px solid rgba(251,191,36,0.2)",
          borderRadius: "0 0 12px 12px",
          padding: "20px 24px",
        }}
      >
        {/* Step title */}
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#f1f5f9",
            marginBottom: "4px",
          }}
        >
          {steps[displayStep].name}
        </div>

        {/* Step one-line description */}
        <p
          style={{
            fontSize: "13px",
            color: "#94a3b8",
            margin: "0 0 16px",
            lineHeight: 1.5,
          }}
        >
          {steps[displayStep].description}
        </p>

        {/* Numbered steps list */}
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {steps[displayStep].steps.map((s, i) => (
            <li
              key={i}
              style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
            >
              {/* Amber step number badge */}
              <span
                style={{
                  flexShrink: 0,
                  width: "22px",
                  height: "22px",
                  borderRadius: "6px",
                  background: "rgba(251,191,36,0.12)",
                  color: "#fbbf24",
                  fontSize: "11px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "1px",
                }}
              >
                {i + 1}
              </span>
              {/* Step text */}
              <span
                style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <nav
      aria-label="Seções do pipeline"
      style={{
        display: "flex",
        gap: "0",
        borderBottom: "1px solid #1e293b",
        marginBottom: "24px",
        overflowX: "auto",
      }}
    >
      {tabs.map((t) => (
        <TabButton
          key={t.id}
          active={activeTab === t.id}
          onClick={() => onTabChange(t.id)}
        >
          {t.label}
        </TabButton>
      ))}
    </nav>
  );
}

function AuditSummary({ message }) {
  return (
    <div
      style={{
        marginTop: "16px",
        padding: "12px 16px",
        borderRadius: "10px",
        background: "rgba(251,191,36,0.06)",
        border: "1px solid rgba(251,191,36,0.15)",
        fontSize: "13px",
        color: "#fbbf24",
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}

function AuditTab({ items }) {
  return (
    <section aria-label="Resultado da auditoria">
      {/* Intro description */}
      <p
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "16px",
          lineHeight: 1.5,
        }}
      >
        A IA analisou o layout exportado do Figma e verificou contraste,
        consistência tipográfica, espaçamento e padrões de componentes.
      </p>

      {/* Audit results list — each row is an AuditItem */}
      <ul
        style={{
          background: "#111827",
          borderRadius: "12px",
          padding: "0 16px",
          border: "1px solid #1e293b",
          margin: 0,
        }}
      >
        {items.map((item, i) => (
          <AuditItem key={i} item={item} />
        ))}
      </ul>

      {/* Warning summary banner */}
      <AuditSummary message="⚡ 2 warnings encontrados. Recomendação: aumentar o peso do caption para 500 e unificar os 2 estilos de botão antes de gerar tokens." />
    </section>
  );
}

function TokenSection({ label }) {
  return (
    <div>
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#cbd5e1",
          marginBottom: "12px",
        }}
      >
        {label}
      </h3>
      <TokenGrid label={label} />
    </div>
  );
}

function TokensTab() {
  return (
    <section
      aria-label="Tokens extraídos"
      style={{ display: "flex", flexDirection: "column", gap: "28px" }}
    >
      <TokenSection label="Cores" />
      <TokenSection label="Tipografia" />
      <TokenSection label="Espaçamento" />
    </section>
  );
}

function ComponentsTab({ components }) {
  return (
    <section aria-label="Componentes mapeados">
      <p
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "16px",
          lineHeight: 1.5,
        }}
      >
        Componentes identificados no layout com suas variantes e props mapeadas.
        Cada variante no Figma corresponde 1:1 a uma prop no React.
      </p>
      <div style={{ display: "grid", gap: "12px" }}>
        {components.map((c) => (
          <ComponentCard key={c.name} comp={c} />
        ))}
      </div>
    </section>
  );
}

function CodeTab({ description, code }) {
  return (
    <section aria-label="Código gerado">
      <p
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "16px",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      <CodeBlock code={code} />
    </section>
  );
}

function PipelineFooter() {
  return (
    <footer
      style={{
        marginTop: "40px",
        padding: "16px",
        background: "#111827",
        borderRadius: "12px",
        border: "1px solid #1e293b",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          color: "#64748b",
          margin: 0,
          lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Metodologia: Design-first → AI Audit → Token Extraction → Code
        Generation
        <br />
        Stack: Figma → JSON → tailwind.config.ts → React/Next.js
      </p>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignSystemPipeline() {
  const [tab, setTab] = useState("audit");
  const [activeStep, setActiveStep] = useState(null);
  const [displayStep, setDisplayStep] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveStep(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (activeStep !== null && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeStep]);

  const handleStepClick = (i) => {
    if (activeStep === i) {
      setActiveStep(null);
    } else {
      setDisplayStep(i);
      setActiveStep(i);
    }
  };

  const tabs = [
    { id: "audit", label: "Auditoria" },
    { id: "tokens", label: "Tokens" },
    { id: "components", label: "Componentes" },
    { id: "tailwind", label: "tailwind.config" },
    { id: "code", label: "Button.tsx" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0f1a",
        color: "#f1f5f9",
        fontFamily: "-apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px" }}
      >
        {/* ── 1. HEADER — status badge + title + subtitle ── */}
        <PipelineHeader />

        {/* ── 2. FLOW BAR — horizontal clickable step pills ── */}
        <FlowBar
          steps={FLOW_STEPS}
          activeStep={activeStep}
          onStepClick={handleStepClick}
        />

        {/* ── 3. FLOW DETAIL PANEL — collapses open below the flow bar ── */}
        <FlowDetailPanel
          steps={FLOW_STEPS}
          displayStep={displayStep}
          isOpen={activeStep !== null}
          panelRef={panelRef}
        />

        {/* ── 4. TAB BAR — Auditoria / Tokens / Componentes / tailwind.config / Button.tsx ── */}
        <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} />

        {/* ── 5. TAB CONTENT — one section rendered at a time ── */}
        {tab === "audit"      && <AuditTab items={AUDIT} />}
        {tab === "tokens"     && <TokensTab />}
        {tab === "components" && <ComponentsTab components={COMPONENTS} />}
        {tab === "tailwind"   && (
          <CodeTab
            description="Configuração gerada automaticamente a partir dos tokens extraídos. Cole no seu projeto Next.js."
            code={TAILWIND_CONFIG}
          />
        )}
        {tab === "code"       && (
          <CodeTab
            description="Componente Button tipado, consumindo os tokens via classes Tailwind semânticas. Props mapeiam diretamente para as variantes do Figma."
            code={COMPONENT_CODE}
          />
        )}

        {/* ── 6. FOOTER — methodology + stack line ── */}
        <PipelineFooter />
      </div>
    </main>
  );
}
