import { useState } from "react";
import { CreditCard, CheckCircle2, Shield, Zap, Star } from "lucide-react";
import { GlassSidebar } from "../components/GlassSidebar";
import "./dashboard-glass.css";

const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    preco: "R$ 49,90",
    periodo: "/mês",
    icone: <Shield className="h-6 w-6 text-[#d2bbff]" />,
    destaque: false,
    recursos: [
      "Até 3 projetos simultâneos",
      "Suporte por e-mail",
      "Acesso aos relatórios básicos",
      "1 usuário administrador",
    ],
  },
  {
    id: "pro",
    nome: "Profissional",
    preco: "R$ 99,90",
    periodo: "/mês",
    icone: <Zap className="h-6 w-6 text-[#4cd7f6]" />,
    destaque: true,
    recursos: [
      "Projetos ilimitados",
      "Suporte prioritário 24/7",
      "Relatórios avançados e exportação",
      "Até 5 usuários administradores",
      "Personalização de marca",
    ],
  },
  {
    id: "enterprise",
    nome: "Empresarial",
    preco: "R$ 249,90",
    periodo: "/mês",
    icone: <Star className="h-6 w-6 text-[#ffb95f]" />,
    destaque: false,
    recursos: [
      "Tudo do plano Profissional",
      "Servidor dedicado",
      "Gerente de conta exclusivo",
      "Usuários ilimitados",
      "API de integração",
      "Treinamento presencial",
    ],
  },
];

export function Pagamentos() {
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null);

  const handleAssinar = (id: string) => {
    setPlanoSelecionado(id);
    setTimeout(() => {
      alert("Redirecionando para o ambiente seguro do Mercado Pago...");
      setPlanoSelecionado(null);
    }, 1500);
  };

  return (
    <div className="sm-dash">
      <GlassSidebar />

      <main className="sm-noscroll relative z-0 flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
          <div className="mb-10 text-center sm:mb-14">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-[#7c3aed]/15 p-3">
              <CreditCard className="h-7 w-7 text-[#d2bbff]" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
              Escolha o plano ideal para você
            </h1>
            <p className="mx-auto max-w-2xl text-base text-[#ccc3d8] sm:text-lg">
              Evolua a gestão de requisitos dos seus projetos. Pague com segurança usando
              nossa integração Mercado Pago.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {PLANOS.map((plano) => (
              <div
                key={plano.id}
                className={`sm-panel sm-panel-hover relative flex flex-col p-6 sm:p-8 ${
                  plano.destaque
                    ? "border-[#7c3aed]/60 md:scale-105 md:z-10"
                    : "mt-4 md:mt-0"
                }`}
              >
                {plano.destaque && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                    <span className="sm-primary-btn rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    {plano.icone}
                  </div>
                  <h3 className="text-xl font-bold text-white">{plano.nome}</h3>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-white sm:text-4xl">
                    {plano.preco}
                  </span>
                  <span className="font-medium text-[#ccc3d8]">{plano.periodo}</span>
                </div>

                <ul className="mb-8 flex-1 space-y-4">
                  {plano.recursos.map((recurso, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#ccc3d8]">
                      <CheckCircle2
                        className={`h-5 w-5 flex-shrink-0 ${
                          plano.destaque ? "text-[#4cd7f6]" : "text-emerald-400"
                        }`}
                      />
                      <span>{recurso}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleAssinar(plano.id)}
                  disabled={planoSelecionado !== null}
                  className={`mt-auto w-full rounded-xl py-3.5 text-base font-semibold transition disabled:opacity-60 ${
                    plano.destaque
                      ? "sm-primary-btn text-white hover:brightness-110"
                      : "sm-glass-btn text-white"
                  }`}
                >
                  {planoSelecionado === plano.id ? "Processando..." : "Assinar agora"}
                </button>

                <div className="mt-4 flex justify-center">
                  <span className="text-xs font-medium text-[#ccc3d8]/60">
                    Pague via Mercado Pago
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
