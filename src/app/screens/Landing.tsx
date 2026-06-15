import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Minus,
  Star,
  FileText,
  CheckCircle2,
  FileDown,
  Bell,
  BarChart3,
  ShieldCheck,
  FolderKanban,
  Boxes,
  Truck,
  Users,
  ShoppingBag,
} from "lucide-react";
import "./dashboard-glass.css";
import "./landing.css";

const NAV_LINKS = [
  { label: "Recursos", href: "#recursos" },
  { label: "Projetos", href: "#projetos" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "FAQ", href: "#faq" },
];

const MARCAS = ["NEXUS", "LÚMEN", "VÉRTICE", "ONDA", "COBALT", "ATLAS", "PULSE", "ÓRBITA"];

const RECURSOS = [
  { icon: FileText, title: "Gestão de Requisitos", desc: "Requisitos funcionais e não funcionais com códigos únicos por projeto e histórico completo." },
  { icon: CheckCircle2, title: "Validação do Cliente", desc: "Aprovação e rejeição com feedback obrigatório — rastreabilidade do início ao fim." },
  { icon: FileDown, title: "Documentação em PDF", desc: "Geração automática da documentação dos requisitos aprovados, pronta para auditoria." },
  { icon: Bell, title: "Notificações em Tempo Real", desc: "O analista responsável é avisado a cada mudança relevante no projeto." },
  { icon: BarChart3, title: "Dashboard de Métricas", desc: "Taxa de aprovação, atividade da semana e status dos requisitos em um só painel." },
  { icon: ShieldCheck, title: "Controle de Acesso", desc: "Três perfis — Administrador, Desenvolvedor e Cliente — com permissões explícitas." },
];

const PROJETOS = [
  { nome: "Sistema de Controle de Estoque", tag: "Logística", icon: Boxes, grad: "from-[#7c3aed]/30 to-transparent" },
  { nome: "Aplicativo de Entregas", tag: "Mobile", icon: Truck, grad: "from-[#4cd7f6]/25 to-transparent" },
  { nome: "Portal de Recursos Humanos", tag: "Interno", icon: Users, grad: "from-[#ffb95f]/25 to-transparent" },
  { nome: "E-commerce Moda Plus", tag: "Varejo", icon: ShoppingBag, grad: "from-[#ff8a80]/25 to-transparent" },
];

const DEPOIMENTOS = [
  { nome: "Alec Ramirez", cargo: "Product Owner", texto: "Com o ScopeMaster a elicitação deixou de ser caótica. Cada requisito tem dono, status e histórico — a equipe ganhou clareza imediata." },
  { nome: "Sofia Lee", cargo: "Analista de Sistemas", texto: "A validação do cliente com feedback obrigatório acabou com o retrabalho. Aprovamos requisitos em metade do tempo." },
  { nome: "Lucca Rossi", cargo: "Tech Lead", texto: "O dashboard de métricas virou nossa fonte da verdade nas reuniões. Vemos a taxa de aprovação evoluir em tempo real." },
  { nome: "John Kennings", cargo: "Gerente de Projetos", texto: "A documentação automática em PDF economiza horas por sprint. Tudo rastreável e pronto para auditoria." },
];

const FAQS = [
  { q: "O que é o ScopeMaster?", a: "Uma plataforma colaborativa para elicitação, gestão e validação de requisitos de software — do brainstorm à documentação final." },
  { q: "Quais perfis de usuário existem?", a: "Três: Administrador (acesso total), Desenvolvedor (criação técnica) e Cliente (validação e aprovação)." },
  { q: "Como funciona a validação dos requisitos?", a: "O cliente aprova ou rejeita cada requisito. Na rejeição, o feedback é obrigatório, garantindo rastreabilidade." },
  { q: "É possível gerar documentação automaticamente?", a: "Sim. O ScopeMaster gera um PDF com os requisitos aprovados, pronto para compartilhar com a equipe." },
  { q: "Preciso instalar algo para começar?", a: "Não. É 100% web. Crie sua conta, convide a equipe e comece a cadastrar projetos." },
];

function Avatar({ nome }: { nome: string }) {
  return (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[3px] bg-gradient-to-br from-[#7c3aed] to-[#4cd7f6] text-sm font-semibold text-white">
      {nome.charAt(0).toUpperCase()}
    </span>
  );
}

function Eyebrow({ n, children }: { n?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-7 bg-[#7c3aed]" />
      <span className="lp-eyebrow">
        {n && <span className="lp-ink-subtle">{n} / </span>}
        {children}
      </span>
    </div>
  );
}

/** Marcas de "blueprint" nos 4 cantos */
function Ticks() {
  const c = "pointer-events-none absolute h-2.5 w-2.5 text-white/25";
  return (
    <>
      <Plus className={`${c} -left-1.5 -top-1.5`} />
      <Plus className={`${c} -right-1.5 -top-1.5`} />
      <Plus className={`${c} -bottom-1.5 -left-1.5`} />
      <Plus className={`${c} -bottom-1.5 -right-1.5`} />
    </>
  );
}

export function Landing() {
  const [openDepo, setOpenDepo] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="sm-landing">
      {/* ============================ NAVBAR ============================ */}
      <header className="sm-nav sticky top-0 z-50">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <a href="#topo" className="flex items-center gap-2.5">
            <img
              src="/ScopeMasterLogoReal.png"
              alt="ScopeMaster"
              className="h-8 w-8 object-contain"
            />
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
              Scope<span className="text-[#b6a0ff]">Master</span>
            </span>
          </a>
          <div className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm tracking-tight text-[#a89fb5] transition hover:text-white">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="lp-mono hidden text-[11px] lp-ink-subtle sm:inline">v1.0</span>
            <Link to="/login" className="lp-btn flex items-center gap-2 px-4 py-2 text-sm">
              Começar agora <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <main id="topo" className="mx-auto max-w-6xl px-6">
        {/* ============================ HERO ============================ */}
        <section className="relative grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="lp-grid pointer-events-none absolute inset-x-[-20%] inset-y-[-10%] -z-0" />
          <div className="relative">
            <Eyebrow n="00">Plataforma de Requisitos</Eyebrow>
            <h1 className="mt-6 text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[56px] lg:text-[64px]">
              Transforme ideias em <span className="text-[#b6a0ff]">requisitos</span> aprovados.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed lp-ink-muted">
              O ScopeMaster dá à sua equipe um fluxo rastreável para elicitar, gerenciar e validar
              requisitos de software — do brainstorm à documentação final.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/login" className="lp-btn flex items-center gap-2 px-5 py-3 text-sm">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#recursos" className="lp-btn-ghost px-5 py-3 text-sm font-medium">
                Explorar recursos
              </a>
            </div>
            <div className="lp-mono mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] lp-ink-subtle">
              <span className="flex items-center gap-2">
                <span className="lp-blink h-1.5 w-1.5 rounded-full bg-emerald-400" /> 50+ equipes ativas
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="flex items-center gap-1.5">
                <span className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-[#ffb95f] text-[#ffb95f]" />
                  ))}
                </span>
                4.9 / 5
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span>12k+ requisitos gerenciados</span>
            </div>
          </div>

          {/* Painel-produto (estilo screenshot) com cantos técnicos */}
          <div className="sm-float relative">
            <Ticks />
            <div className="lp-card overflow-hidden p-0">
              <div className="flex items-center justify-between border-b lp-hair px-4 py-2.5">
                <span className="lp-mono text-[11px] lp-ink-subtle">~/scopemaster/painel</span>
                <span className="flex items-center gap-1.5">
                  <span className="lp-blink h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="lp-mono text-[10px] lp-ink-subtle">ao vivo</span>
                </span>
              </div>
              <div className="p-5">
                <div className="border lp-hair bg-[#0c0a0f] p-4">
                  <p className="lp-mono text-[11px] uppercase tracking-[0.15em] lp-ink-subtle">
                    Evolução de Requisitos
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">
                    +23 <span className="text-sm font-normal lp-ink-muted">este mês</span>
                  </p>
                  <svg viewBox="0 0 300 90" className="mt-3 h-24 w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lpArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="lpLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4cd7f6" />
                        <stop offset="50%" stopColor="#d2bbff" />
                        <stop offset="100%" stopColor="#ffb95f" />
                      </linearGradient>
                    </defs>
                    <path d="M0,70 Q40,68 70,55 T140,45 T210,22 T300,30 L300,90 L0,90 Z" fill="url(#lpArea)" />
                    <path d="M0,70 Q40,68 70,55 T140,45 T210,22 T300,30" fill="none" stroke="url(#lpLine)" strokeWidth="2" />
                  </svg>
                </div>
                <div className="mt-px grid grid-cols-3 border lp-hair">
                  {[
                    { v: "98%", l: "Aprovação" },
                    { v: "23", l: "Requisitos" },
                    { v: "6", l: "Projetos" },
                  ].map((s, i) => (
                    <div key={s.l} className={`bg-[#0c0a0f] px-4 py-4 ${i > 0 ? "border-l lp-hair" : ""}`}>
                      <p className="text-xl font-semibold tabular-nums text-white">{s.v}</p>
                      <p className="lp-mono mt-1 text-[10px] uppercase tracking-[0.12em] lp-ink-subtle">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-rule" />

        {/* ============================ TRUSTED BY ============================ */}
        <section className="py-10">
          <p className="lp-mono mb-7 text-center text-[11px] uppercase tracking-[0.22em] lp-ink-subtle">
            Confiado por equipes em todo o Brasil
          </p>
          <div className="sm-marquee-mask overflow-hidden">
            <div className="sm-marquee-track items-center gap-12 pr-12">
              {[...MARCAS, ...MARCAS].map((m, i) => (
                <span key={i} className="lp-mono flex items-center gap-3 whitespace-nowrap text-sm tracking-[0.15em] text-white/35">
                  <FolderKanban className="h-4 w-4" />
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-rule" />

        {/* ============================ SOBRE / STATS ============================ */}
        <section className="py-24">
          <Eyebrow n="01">Sobre a plataforma</Eyebrow>
          <div className="mt-7 grid items-end gap-10 lg:grid-cols-2">
            <h2 className="max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px]">
              Clareza e controle em cada etapa do projeto.
            </h2>
            <p className="text-[15px] leading-relaxed lp-ink-muted">
              Unimos um fluxo de requisitos rastreável a uma interface densa e precisa, para sua
              equipe entregar software alinhado às expectativas do cliente — com menos retrabalho e
              mais previsibilidade.
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-px overflow-hidden border lp-hair bg-white/[0.09] lg:grid-cols-2">
            <div className="relative flex items-center justify-center bg-[#0c0a0f] py-16">
              <Ticks />
              <FolderKanban className="h-24 w-24 text-white/15" strokeWidth={1} />
            </div>
            <div className="grid grid-cols-3 bg-white/[0.09]">
              {[
                { v: "500+", l: "Projetos" },
                { v: "98%", l: "Aprovação" },
                { v: "12k+", l: "Requisitos" },
              ].map((s, i) => (
                <div key={s.l} className={`flex flex-col justify-center bg-[#0c0a0f] px-5 py-10 ${i > 0 ? "ml-px" : ""}`}>
                  <p className="text-3xl font-semibold tracking-[-0.03em] tabular-nums text-white sm:text-4xl">{s.v}</p>
                  <p className="lp-mono mt-2 text-[11px] uppercase tracking-[0.15em] lp-ink-subtle">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-rule" />

        {/* ============================ RECURSOS ============================ */}
        <section id="recursos" className="py-24">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow n="02">Recursos</Eyebrow>
              <h2 className="mt-6 max-w-lg text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px]">
                Tudo que sua equipe precisa.
              </h2>
            </div>
            <Link to="/login" className="lp-btn-ghost inline-flex w-fit items-center gap-2 px-5 py-2.5 text-sm font-medium">
              Começar agora <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px border lp-hair bg-white/[0.09] sm:grid-cols-2 lg:grid-cols-3">
            {RECURSOS.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="lp-cell p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[3px] border lp-hair text-[#b6a0ff]">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <span className="lp-mono text-[11px] lp-ink-subtle">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-base font-semibold tracking-tight text-white">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed lp-ink-muted">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="lp-rule" />

        {/* ============================ PROJETOS ============================ */}
        <section id="projetos" className="py-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <Eyebrow n="03">Casos de uso</Eyebrow>
              <h2 className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px]">
                Equipes que confiam no ScopeMaster.
              </h2>
            </div>
            <Link to="/login" className="lp-btn-ghost hidden items-center gap-2 px-5 py-2.5 text-sm font-medium sm:inline-flex">
              Ver todos <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-px border lp-hair bg-white/[0.09] sm:grid-cols-2">
            {PROJETOS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={p.nome} className="group bg-[#0c0a0f]">
                  <div className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${p.grad}`}>
                    <span className="lp-mono absolute left-4 top-4 text-[11px] tracking-[0.1em] text-white/40">
                      P-0{i + 1}
                    </span>
                    <Icon className="h-16 w-16 text-white/40 transition group-hover:text-white/70" strokeWidth={1} />
                  </div>
                  <div className="flex items-center justify-between border-t lp-hair px-6 py-5">
                    <h3 className="text-[15px] font-semibold tracking-tight text-white">{p.nome}</h3>
                    <span className="lp-mono text-[11px] uppercase tracking-[0.12em] lp-ink-subtle">{p.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="lp-rule" />

        {/* ============================ DEPOIMENTOS ============================ */}
        <section id="depoimentos" className="py-24">
          <Eyebrow n="04">Depoimentos</Eyebrow>
          <h2 className="mt-6 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px]">
            O que dizem nossos clientes.
          </h2>

          <div className="mt-10 border-t lp-hair">
            {DEPOIMENTOS.map((d, i) => {
              const open = openDepo === i;
              return (
                <div key={d.nome} className="border-b lp-hair">
                  <button onClick={() => setOpenDepo(open ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                    <span className="flex items-center gap-4">
                      <span className="lp-mono w-6 text-[11px] lp-ink-subtle">0{i + 1}</span>
                      <Avatar nome={d.nome} />
                      <span>
                        <span className="block text-sm font-semibold tracking-tight text-white">{d.nome}</span>
                        <span className="lp-mono block text-[11px] lp-ink-subtle">{d.cargo}</span>
                      </span>
                    </span>
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[3px] border transition ${open ? "border-[#7c3aed] bg-[#7c3aed] text-white" : "lp-hair text-[#a89fb5]"}`}>
                      {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div className={`sm-acc ${open ? "open" : ""}`}>
                    <div>
                      <p className="max-w-2xl pb-6 pl-16 text-[15px] leading-relaxed lp-ink-muted">"{d.texto}"</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="lp-rule" />

        {/* ============================ FAQ ============================ */}
        <section id="faq" className="py-24">
          <Eyebrow n="05">Dúvidas</Eyebrow>
          <h2 className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px]">
            Perguntas frequentes.
          </h2>

          <div className="mt-10 border-t lp-hair">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="border-b lp-hair">
                  <button onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
                    <span className="flex items-center gap-5">
                      <span className="lp-mono text-[11px] lp-ink-subtle">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[15px] font-medium tracking-tight text-white">{f.q}</span>
                    </span>
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[3px] border lp-hair text-[#a89fb5]">
                      {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div className={`sm-acc ${open ? "open" : ""}`}>
                    <div>
                      <p className="max-w-2xl pb-6 pl-12 text-sm leading-relaxed lp-ink-muted">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================ CTA ANIMADO ============================ */}
        <section className="pb-24">
          <div className="relative overflow-hidden border lp-hair bg-[#0b0810] px-6 py-20 text-center">
            <Ticks />
            <div className="absolute inset-0 opacity-35">
              <div className="sm-topo-track">
                <TopoLines />
                <TopoLines />
              </div>
            </div>
            <div className="sm-glow absolute left-1/2 top-1/2 h-72 w-[28rem] rounded-full bg-[#7c3aed]/25 blur-3xl" />

            <div className="relative">
              <div className="flex justify-center">
                <Eyebrow>Comece agora</Eyebrow>
              </div>
              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[52px]">
                Pronto para organizar seus requisitos?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] lp-ink-muted">
                Crie sua conta, convide a equipe e comece a transformar ideias em entregas validadas.
              </p>
              <Link to="/login" className="lp-btn mx-auto mt-8 inline-flex items-center gap-2 px-7 py-3.5 text-sm">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t lp-hair">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/ScopeMasterLogoReal.png" alt="ScopeMaster" className="h-8 w-8 object-contain" />
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
                Scope<span className="text-[#b6a0ff]">Master</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed lp-ink-muted">
              Plataforma colaborativa para elicitação, gestão e validação de requisitos de software.
            </p>
          </div>
          <div>
            <p className="lp-mono mb-4 text-[11px] uppercase tracking-[0.18em] lp-ink-subtle">Produto</p>
            <ul className="space-y-3 text-sm lp-ink-muted">
              <li><a href="#recursos" className="transition hover:text-white">Recursos</a></li>
              <li><a href="#projetos" className="transition hover:text-white">Projetos</a></li>
              <li><a href="#faq" className="transition hover:text-white">FAQ</a></li>
              <li><Link to="/login" className="transition hover:text-white">Entrar</Link></li>
            </ul>
          </div>
          <div>
            <p className="lp-mono mb-4 text-[11px] uppercase tracking-[0.18em] lp-ink-subtle">Redes</p>
            <ul className="space-y-3 text-sm lp-ink-muted">
              {["Facebook", "Instagram", "Twitter/X", "LinkedIn"].map((s) => (
                <li key={s}>
                  <a href="#topo" className="flex items-center justify-between transition hover:text-white">
                    {s} <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t lp-hair">
          <p className="lp-mono mx-auto max-w-6xl px-6 py-5 text-center text-[11px] tracking-[0.1em] lp-ink-subtle">
            © 2026 SCOPEMASTER — PROJETO INTEGRADOR, SENAI TAUBATÉ
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Linhas topográficas (metade da faixa animada) */
function TopoLines() {
  return (
    <svg viewBox="0 0 600 360" preserveAspectRatio="none" fill="none">
      {Array.from({ length: 7 }).map((_, i) => (
        <path
          key={i}
          d={`M0,${40 + i * 45} C150,${10 + i * 45} 300,${80 + i * 45} 450,${30 + i * 45} S750,${
            60 + i * 45
          } 900,${40 + i * 45}`}
          stroke="#b6a0ff"
          strokeOpacity="0.22"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
