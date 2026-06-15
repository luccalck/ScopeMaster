import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Mapa pontilhado do Brasil. Cada "bolinha" representa um projeto (uma empresa
 * que usa o ScopeMaster), posicionada sobre uma capital brasileira.
 *
 * Interações:
 *  - Segurar o BOTÃO DIREITO do mouse e mover  → gira o mapa.
 *  - Segurar o BOTÃO DIREITO e rolar o scroll   → dá zoom.
 *  - Passar o mouse sobre um ponto              → popup com nome do projeto
 *    e a contagem de aprovados / pendentes / rejeitados.
 * O menu de contexto do navegador é desativado dentro do card.
 */

export interface MapaProjeto {
  id: string;
  nome: string;
  aprovados: number;
  pendentes: number;
  rejeitados: number;
}

const VIEW = 440;

// Silhueta aproximada do Brasil (lon/lat projetados para o viewBox 440×440).
const BRAZIL_PATH =
  "M90,49 L120,28 L160,20 L200,51 L250,30 L260,71 L320,97 L380,107 L410,128 " +
  "L412,153 L390,184 L370,225 L360,277 L350,302 L300,318 L275,333 L270,364 " +
  "L260,389 L225,417 L190,379 L185,328 L215,318 L180,277 L180,235 L160,210 " +
  "L110,184 L60,184 L25,169 L35,143 L60,112 L65,82 Z";

// Capitais (lon,lat) já projetadas para o mesmo sistema do path.
const CIDADES: { x: number; y: number }[] = [
  { x: 294, y: 313 }, // São Paulo
  { x: 328, y: 306 }, // Rio de Janeiro
  { x: 281, y: 233 }, // Brasília
  { x: 375, y: 204 }, // Salvador
  { x: 375, y: 110 }, // Fortaleza
  { x: 411, y: 154 }, // Recife
  { x: 160, y: 103 }, // Manaus
  { x: 275, y: 86 }, // Belém
  { x: 248, y: 379 }, // Porto Alegre
  { x: 267, y: 332 }, // Curitiba
  { x: 321, y: 276 }, // Belo Horizonte
  { x: 268, y: 242 }, // Goiânia
  { x: 214, y: 281 }, // Campo Grande
  { x: 199, y: 231 }, // Cuiabá
  { x: 408, y: 131 }, // Natal
  { x: 275, y: 355 }, // Florianópolis
];

const STATUS_COLORS = {
  aprovados: "#4cd7f6",
  pendentes: "#ffb95f",
  rejeitados: "#ff8a80",
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

type Dot = MapaProjeto & { x: number; y: number };
type Hover = { dot: Dot; px: number; py: number } | null;

export function BrazilProjectsMap({ projetos }: { projetos: MapaProjeto[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [spin, setSpin] = useState(0); // rotateZ (graus)
  const [tilt, setTilt] = useState(0); // rotateX (graus)
  const [zoom, setZoom] = useState(1);
  const [rotating, setRotating] = useState(false);
  const [hover, setHover] = useState<Hover>(null);

  const rightDown = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Distribui projetos sobre as capitais; quando vários caem na mesma cidade,
  // eles são espalhados num pequeno anel para ficarem "levemente separados".
  const dots = useMemo<Dot[]>(() => {
    const byCity = new Map<number, MapaProjeto[]>();
    projetos.forEach((p) => {
      const ci = hash(p.id || p.nome) % CIDADES.length;
      if (!byCity.has(ci)) byCity.set(ci, []);
      byCity.get(ci)!.push(p);
    });
    const out: Dot[] = [];
    byCity.forEach((list, ci) => {
      const base = CIDADES[ci];
      list.forEach((p, k) => {
        if (list.length === 1) {
          out.push({ ...p, x: base.x, y: base.y });
        } else {
          const ang = k * 2.399963; // ângulo áureo → espalhamento uniforme
          const rad = 8 + k * 5;
          out.push({
            ...p,
            x: base.x + Math.cos(ang) * rad,
            y: base.y + Math.sin(ang) * rad,
          });
        }
      });
    });
    return out;
  }, [projetos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!rightDown.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setSpin((s) => s + dx * 0.45);
      setTilt((t) => clamp(t - dy * 0.25, -55, 55));
    };
    const onUp = (e: MouseEvent) => {
      if (e.button === 2) {
        rightDown.current = false;
        setRotating(false);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Wheel não-passivo para podermos cancelar o scroll ao dar zoom.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!rightDown.current) return; // só dá zoom segurando o botão direito
      e.preventDefault();
      setZoom((z) => clamp(z * (e.deltaY < 0 ? 1.12 : 0.89), 0.55, 4));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      rightDown.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      setRotating(true);
      setHover(null);
    }
  };

  const onDotHover = (dot: Dot, e: React.MouseEvent) => {
    if (rightDown.current) return; // não mostra popup enquanto gira
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({
      dot,
      px: clamp(e.clientX - rect.left, 80, rect.width - 80),
      py: e.clientY - rect.top,
    });
  };

  const hoveredId = hover?.dot.id;

  return (
    <div
      ref={stageRef}
      className={`sm-map-stage relative h-full w-full ${rotating ? "is-rotating" : ""}`}
      onMouseDown={onMouseDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="sm-map-world absolute inset-0 flex items-center justify-center"
        style={{ transform: `rotateX(${tilt}deg) rotateZ(${spin}deg) scale(${zoom})` }}
      >
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="h-full w-full max-h-[320px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="sm-dots" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="3.5" cy="3.5" r="1.15" fill="#cdb8ff" opacity="0.28" />
            </pattern>
            <clipPath id="sm-brazil">
              <path d={BRAZIL_PATH} />
            </clipPath>
            <radialGradient id="sm-dot-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eaddff" />
              <stop offset="60%" stopColor="#d2bbff" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
          </defs>

          {/* preenchimento pontilhado dentro do Brasil */}
          <g clipPath="url(#sm-brazil)">
            <rect x="0" y="0" width={VIEW} height={VIEW} fill="url(#sm-dots)" />
          </g>
          {/* contorno */}
          <path
            d={BRAZIL_PATH}
            fill="rgba(124,58,237,0.06)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* projetos */}
          {dots.map((d) => {
            const active = d.id === hoveredId;
            return (
              <g
                key={d.id}
                className="sm-dot-glow cursor-pointer"
                onMouseEnter={(e) => onDotHover(d, e)}
                onMouseMove={(e) => onDotHover(d, e)}
                onMouseLeave={() => setHover(null)}
              >
                {/* halo pulsante */}
                <circle cx={d.x} cy={d.y} r={active ? 10 : 8} fill="#d2bbff" opacity="0.12">
                  <animate
                    attributeName="r"
                    values="6;11;6"
                    dur="2.6s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.16;0;0.16"
                    dur="2.6s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* área de toque (transparente) p/ facilitar o hover */}
                <circle cx={d.x} cy={d.y} r="9" fill="transparent" />
                {/* anel de destaque no hover */}
                {active && (
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r="7"
                    fill="none"
                    stroke="#eaddff"
                    strokeWidth="1.4"
                    opacity="0.9"
                  />
                )}
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={active ? 5.2 : 4}
                  fill="url(#sm-dot-grad)"
                  stroke="#1c1a22"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* popup de hover (estilo card da print) */}
      {hover && !rotating && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2"
          style={{ left: hover.px, top: hover.py }}
        >
          <div
            style={{
              transform: hover.py < 120 ? "translateY(14px)" : "translateY(calc(-100% - 14px))",
            }}
          >
            <div className="min-w-[180px] rounded-xl border border-white/10 bg-[#201e27]/95 px-3 py-2.5 shadow-2xl shadow-black/60 backdrop-blur">
              <p className="truncate text-sm font-semibold text-white">{hover.dot.nome}</p>
              <div className="mt-2 space-y-1.5">
                {[
                  { label: "Aprov.", value: hover.dot.aprovados, color: STATUS_COLORS.aprovados },
                  { label: "Pend.", value: hover.dot.pendentes, color: STATUS_COLORS.pendentes },
                  { label: "Rejeit.", value: hover.dot.rejeitados, color: STATUS_COLORS.rejeitados },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-6 text-xs">
                    <span className="flex items-center gap-2 text-[#ccc3d8]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.label}
                    </span>
                    <span className="font-semibold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* dica de interação */}
      <p className="pointer-events-none absolute bottom-2 left-3 text-[10px] text-[#ccc3d8]/70">
        Botão direito: girar · segure + scroll: zoom
      </p>
      {zoom !== 1 || spin !== 0 || tilt !== 0 ? (
        <button
          onClick={() => {
            setSpin(0);
            setTilt(0);
            setZoom(1);
          }}
          className="absolute bottom-2 right-3 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-[#ccc3d8] transition hover:bg-white/10"
        >
          Reset
        </button>
      ) : null}
    </div>
  );
}
