import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Plus } from "lucide-react";
import bcrypt from "bcryptjs";
import { fetchUsuarioPorEmail, criarUsuarioPendente, atualizarUsuario } from "../lib/api";
import "./landing.css";

export function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || (isRegistering && !nome)) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    if (!email.includes("@")) {
      setError("Por favor, insira um e-mail válido");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        const usuarioExistente = await fetchUsuarioPorEmail(email);
        if (usuarioExistente) {
          setError("Este e-mail já está em uso.");
          setIsLoading(false);
          return;
        }
        await criarUsuarioPendente(nome, email, password);
        setSuccess("Cadastro realizado! Esperando autorização do Administrador.");
        setIsRegistering(false);
        setNome("");
        setPassword("");
      } else {
        const usuario = await fetchUsuarioPorEmail(email);
        const isBcrypt = usuario?.senha_hash?.startsWith("$2");
        const senhaCorreta =
          usuario &&
          (isBcrypt
            ? await bcrypt.compare(password, usuario.senha_hash)
            : password === usuario.senha_hash);

        if (!senhaCorreta) {
          setError("Usuário ou senha incorretas.");
          setIsLoading(false);
          return;
        }
        if (!isBcrypt) {
          const novoHash = await bcrypt.hash(password, 10);
          await atualizarUsuario(usuario.id_usuario, { senha_hash: novoHash });
        }
        if (usuario.nome.startsWith("[PENDENTE] ")) {
          setError("Esperando autorização do Administrador.");
          setIsLoading(false);
          return;
        }
        localStorage.setItem("scopemaster_authenticated", "true");
        localStorage.setItem(
          "scopemaster_user",
          JSON.stringify({
            id: usuario.id_usuario,
            name: usuario.nome,
            email: usuario.email,
            role: usuario.perfil,
          })
        );
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Erro ao processar:", err);
      setError("Erro ao conectar ao servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const labelCls = "lp-mono mb-2 block text-[11px] uppercase tracking-[0.16em] text-[#a89fb5]";
  const inputCls =
    "w-full rounded-lg border border-white/10 bg-black/25 px-3.5 py-3 text-sm font-medium text-white placeholder:text-[#a89fb5]/40 outline-none transition focus:border-[#7c3aed]/60 focus:ring-2 focus:ring-[#7c3aed]/20";

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-white"
      style={{
        backgroundColor: "#16141f", // Dark grayish-purple background on the left side
      }}
    >
      {/* ====== Painel direito (estilo CTA card com linhas topográficas e glow centralizado) ====== */}
      <div className="absolute inset-y-0 right-0 hidden lg:block w-[55%] overflow-hidden bg-[#0b0810]">
        {/* Ticks nos cantos */}
        <Ticks />

        {/* Linhas topográficas */}
        <div className="absolute inset-0 opacity-35">
          <div className="sm-topo-track h-full w-full">
            <TopoLines />
            <TopoLines />
          </div>
        </div>

        {/* Glow centralizado */}
        <div className="sm-glow absolute left-1/2 top-1/2 h-72 w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7c3aed]/25 blur-3xl" />

        {/* Gradiente de transição ScopeMaster no lado esquerdo do painel */}
        <div
          className="absolute inset-y-0 left-0 w-64 z-20 pointer-events-none"
          style={{
            background: "linear-gradient(to right, #16141f 0%, rgba(124, 58, 237, 0.35) 35%, rgba(255, 185, 95, 0.1) 70%, transparent 100%)"
          }}
        />

        {/* Logo e Nome centralizados */}
        <div className="relative z-20 flex h-full w-full flex-col items-center justify-center gap-6">
          <img
            src="/ScopeMasterLogoReal.png"
            alt="ScopeMaster"
            className="h-40 w-40 object-contain drop-shadow-[0_8px_30px_rgba(124,58,237,0.5)]"
          />
          <span className="bg-gradient-to-r from-[#ffc27a] via-[#d2bbff] to-[#a06bff] bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            ScopeMaster
          </span>
        </div>
      </div>

      {/* ====== Painel esquerdo: formulário ====== */}
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="w-full px-8 sm:px-16 lg:w-[45%] lg:px-20">
          <div className="mx-auto max-w-md">
            <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-white">
              ScopeMaster
            </h1>
            <p className="mt-2 text-[15px] leading-snug text-[#a89fb5]">
              Bem-vindo de volta, faça login na
              <br />
              sua conta para continuar.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-500/10 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <p className="text-sm text-emerald-300">{success}</p>
                </div>
              )}

              {isRegistering && (
                <div>
                  <label className={labelCls}>Nome completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    disabled={isLoading}
                    className={inputCls}
                  />
                </div>
              )}

              <div>
                <label className={labelCls}>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  disabled={isLoading}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a89fb5] transition hover:text-white"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isRegistering && (
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#a89fb5]">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-black/20 accent-[#7c3aed]"
                    />
                    Lembrar de mim
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Funcionalidade de recuperação de senha não implementada neste protótipo")
                    }
                    className="text-sm font-medium text-[#d2bbff] transition hover:text-white"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-10 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#7c3aed]/30 transition hover:brightness-110 disabled:opacity-70"
                style={{ borderTop: "1px solid rgba(255,255,255,0.22)" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isRegistering ? "Cadastrando" : "Entrando"}
                  </>
                ) : isRegistering ? (
                  "Cadastrar"
                ) : (
                  "Entrar"
                )}
              </button>

              <p className="pt-2 text-sm text-[#a89fb5]">
                {isRegistering ? "Já tem uma conta? " : "Não tem uma conta? "}
                <button
                  type="button"
                  className="font-semibold text-[#d2bbff] transition hover:text-white"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError("");
                    setSuccess("");
                  }}
                >
                  {isRegistering ? "Faça login" : "Cadastre-se"}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
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

/** Linhas topográficas animadas */
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

