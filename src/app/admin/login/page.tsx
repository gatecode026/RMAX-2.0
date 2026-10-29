"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Leaf,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin/dashboard";

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Google OAuth Notice Modal State
  const [googleNoticeOpen, setGoogleNoticeOpen] = useState(false);

  // Validate form before submission
  function validate() {
    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Handle Login Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await loginAction(
        {
          email: email.trim(),
          password,
          remember: rememberMe,
        },
        { portal: "admin" }
      );

      if (!res.ok) {
        setFormError(res.message);
        setIsSubmitting(false);
        return;
      }

      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.body.classList.remove("modal-open");
      }

      // Successful login -> Direct routing based on exact role
      if (res.role === "manager") {
        router.push("/manager/dashboard");
        router.refresh();
        return;
      }
      if (res.role === "super_admin" || res.role === "admin") {
        const dest =
          nextUrl &&
          !nextUrl.startsWith("/account") &&
          nextUrl !== "/admin/login" &&
          nextUrl !== "/login"
            ? nextUrl
            : "/admin/dashboard";
        router.push(dest);
        router.refresh();
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setFormError("Unable to connect to authentication server. Please check your connection.");
      setIsSubmitting(false);
    }
  }

  // Handle Forgot Password Request
  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);

    const trimmed = forgotEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (res.ok) {
        setForgotSuccess(true);
      } else {
        setForgotError("Unable to submit recovery request. Please try again.");
      }
    } catch {
      setForgotError("Network error. Please try again later.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans text-[#10213F]"
      style={{
        background:
          "radial-gradient(circle at 8% 12%, rgba(190, 222, 255, 0.45) 0%, transparent 45%), radial-gradient(circle at 92% 88%, rgba(195, 225, 255, 0.45) 0%, transparent 45%), #EAF3FF",
      }}
    >
      <div className="w-full max-w-[1140px] mx-auto flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 lg:gap-9">
        {/* ========================================================
            LEFT PROMOTIONAL PANEL
            ======================================================== */}
        <section
          className="hidden lg:flex flex-col justify-between flex-1 min-w-0 max-w-[610px] rounded-[28px] bg-gradient-to-br from-[#0C4394] via-[#09377C] to-[#072558] shadow-[0_20px_50px_-10px_rgba(9,43,96,0.28)] relative overflow-hidden p-9 xl:p-11 text-white"
          aria-label="RMAX Institutional Solutions"
        >
          {/* Subtle ambient glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.22)_0%,transparent_70%)] pointer-events-none" />

          {/* Top Branding & Messaging */}
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo-white.png"
                alt="RMAX Solutions"
                width={120}
                height={36}
                priority
                className="h-9 w-auto object-contain"
              />
            </div>

            <span className="inline-block mt-6 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs">
              Institutional Hygiene Solutions
            </span>

            <h1 className="text-white text-3xl xl:text-4xl font-extrabold leading-[1.15] tracking-tight mt-4 mb-3">
              Cleaner Campuses.<br />
              Healthier Communities.
            </h1>

            <p className="text-blue-100/90 text-sm leading-relaxed max-w-[340px] mb-7 font-normal">
              RMAX provides advanced sanitary napkin incinerators and hygiene solutions for schools, colleges, hospitals and institutions across India.
            </p>

            {/* 3 Key Benefits */}
            <div className="flex flex-col gap-4 relative z-10 max-w-[320px]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 backdrop-blur-xs shadow-xs">
                  <ShieldCheck className="size-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[14px] font-bold leading-tight">Safe &amp; Hygienic Disposal</span>
                  <span className="text-blue-200/80 text-[12px] mt-0.5">Environment-friendly solutions</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 backdrop-blur-xs shadow-xs">
                  <Building2 className="size-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[14px] font-bold leading-tight">Trusted by 20K+ Institutions</span>
                  <span className="text-blue-200/80 text-[12px] mt-0.5">Across India</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 backdrop-blur-xs shadow-xs">
                  <Leaf className="size-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[14px] font-bold leading-tight">Sustainable &amp; Compliant</span>
                  <span className="text-blue-200/80 text-[12px] mt-0.5">Supports cleaner, greener campuses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Cluster */}
          <div className="flex items-center gap-3 mt-8 relative z-10">
            <div className="flex items-center -space-x-2" aria-hidden="true">
              <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-white shadow-xs bg-[#2563EB]">
                SC
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-white shadow-xs bg-[#0D9488]">
                CL
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-white shadow-xs bg-[#7C3AED]">
                HP
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-[12.5px] font-bold leading-tight">20,000+ institutions trust RMAX</span>
              <span className="text-blue-200/80 text-[11px] leading-tight mt-0.5">Schools &bull; Colleges &bull; Hospitals &bull; Offices</span>
            </div>
          </div>

          {/* Machine Showcase (Right Bottom) */}
          <div className="absolute right-2 bottom-3 w-[44%] max-w-[250px] pointer-events-none z-5 flex flex-col items-center justify-end" aria-hidden="true">
            {/* Ambient Cyan Glow */}
            <div className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.30)_0%,transparent_75%)] blur-xl pointer-events-none" />
            <Image
              src="/images/products/promax-transparent.png"
              alt="RMAX Pro Max Commercial Incinerator"
              width={240}
              height={300}
              className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.45)]"
              priority
            />
            {/* Glass badge tag */}
            <div className="relative z-10 -mt-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">Auto-Cut Ceramic</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            RIGHT LOGIN CARD
            ======================================================== */}
        <main
          className="w-full lg:flex-1 max-w-[480px] bg-white rounded-[24px] shadow-[0_10px_40px_-10px_rgba(16,70,155,0.12),0_2px_8px_rgba(0,0,0,0.03)] border border-[#EBF1F8] p-7 sm:p-10 flex flex-col justify-center"
          aria-labelledby="admin-login-title"
        >
          <div className="flex justify-center mb-1">
            <Image
              src="/images/logo-navy.png"
              alt="RMAX Solutions"
              width={1155}
              height={371}
              className="h-9 sm:h-10 w-auto mx-auto object-contain"
              priority
            />
          </div>

          <h2 id="admin-login-title" className="text-[#0A2656] text-2xl sm:text-[26px] font-extrabold text-center mt-4 mb-0 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-[#71819D] text-[13.5px] text-center mt-1 mb-6 font-medium">
            Login to your RMAX Admin Panel
          </p>

          {/* Error Banner */}
          {formError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-semibold p-3 rounded-xl flex items-center gap-2 mb-4">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 w-full">
            {/* Email Address */}
            <div className="flex flex-col">
              <label htmlFor="admin-email" className="text-[12.5px] font-semibold text-[#10213F] mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center w-full">
                <Mail className="absolute left-3.5 text-slate-400 pointer-events-none size-4.5" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`w-full h-11.5 rounded-xl border ${
                    validationErrors.email
                      ? "border-red-500 bg-red-50/50 focus:ring-red-500/15"
                      : "border-[#D7E1EF] bg-slate-50/80 focus:border-[#104BA8] focus:bg-white focus:ring-[#104BA8]/10"
                  } pl-10 pr-3.5 text-[13.5px] text-slate-900 placeholder:text-slate-400 transition-all focus:ring-3 outline-none`}
                  aria-invalid={Boolean(validationErrors.email)}
                  aria-describedby={validationErrors.email ? "admin-email-error" : undefined}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.email && (
                <span id="admin-email-error" className="text-red-600 text-[11.5px] font-medium mt-1">
                  {validationErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label htmlFor="admin-password" className="text-[12.5px] font-semibold text-[#10213F] mb-1.5">
                Password
              </label>
              <div className="relative flex items-center w-full">
                <Lock className="absolute left-3.5 text-slate-400 pointer-events-none size-4.5" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`w-full h-11.5 rounded-xl border ${
                    validationErrors.password
                      ? "border-red-500 bg-red-50/50 focus:ring-red-500/15"
                      : "border-[#D7E1EF] bg-slate-50/80 focus:border-[#104BA8] focus:bg-white focus:ring-[#104BA8]/10"
                  } pl-10 pr-10 text-[13.5px] text-slate-900 placeholder:text-slate-400 transition-all focus:ring-3 outline-none`}
                  aria-invalid={Boolean(validationErrors.password)}
                  aria-describedby={validationErrors.password ? "admin-password-error" : undefined}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <span id="admin-password-error" className="text-red-600 text-[11.5px] font-medium mt-1">
                  {validationErrors.password}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-0.5 mb-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer text-[12.5px] font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-[#104BA8] accent-[#104BA8] cursor-pointer"
                  disabled={isSubmitting}
                />
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSuccess(false);
                  setForgotError(null);
                  setForgotModalOpen(true);
                }}
                className="text-[#104BA8] font-semibold text-[12.5px] hover:underline hover:text-[#092B60] transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#104BA8] to-[#092B60] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(16,75,168,0.25)] hover:shadow-[0_8px_22px_rgba(16,75,168,0.35)] hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-3.5 text-center">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => setGoogleNoticeOpen(true)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.24c-.25-.72-.39-1.49-.39-2.24s.14-1.52.39-2.24V6.61H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.39l4.01-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Footer Note */}
          <footer className="text-center text-[11.5px] text-slate-400 mt-6 font-medium">
            &copy; 2026 RMAX Solutions. All rights reserved.
          </footer>
        </main>
      </div>

      {/* ========================================================
          FORGOT PASSWORD MODAL (Accessible & Secure)
          ======================================================== */}
      {forgotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0A214B]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
          onClick={() => setForgotModalOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-7 relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 id="forgot-modal-title" className="text-[19px] font-extrabold text-[#0A2656]">
                Recover Password
              </h3>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Enter your registered administrative email address. A password recovery link will be sent to reset your credentials.
            </p>

            {forgotSuccess ? (
              <div>
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-medium p-3.5 rounded-xl mb-4 leading-snug">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <strong>Recovery Request Received</strong>
                      <p className="mt-1 text-xs text-emerald-700">
                        If an administrative account matches <strong>{forgotEmail}</strong>, instructions to reset your password have been sent.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full h-11 rounded-xl bg-[#104BA8] hover:bg-[#092B60] text-white text-[14px] font-bold transition-colors cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                {forgotError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-semibold p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="flex flex-col">
                  <label htmlFor="recovery-email" className="text-[12.5px] font-semibold text-[#10213F] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative flex items-center w-full">
                    <Mail className="absolute left-3.5 text-slate-400 pointer-events-none size-4.5" />
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      placeholder="Enter your administrative email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full h-11 rounded-xl border border-[#D7E1EF] bg-slate-50/80 pl-10 pr-3.5 text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:border-[#104BA8] focus:bg-white focus:ring-3 focus:ring-[#104BA8]/10 outline-none transition-all"
                      disabled={forgotLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full h-11.5 rounded-xl bg-gradient-to-r from-[#104BA8] to-[#092B60] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(16,75,168,0.25)] hover:shadow-[0_8px_22px_rgba(16,75,168,0.35)] transition-all cursor-pointer disabled:opacity-70"
                >
                  {forgotLoading ? (
                    <>
                      <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <span>Send Recovery Link</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          GOOGLE OAUTH INFORMATION MODAL
          ======================================================== */}
      {googleNoticeOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0A214B]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-modal-title"
          onClick={() => setGoogleNoticeOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-7 relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 id="google-modal-title" className="text-[19px] font-extrabold text-[#0A2656]">
                Google Authentication
              </h3>
              <button
                type="button"
                onClick={() => setGoogleNoticeOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Google OAuth is managed through institutional Single Sign-On (SSO). To access the RMAX Admin Dashboard, please sign in with your authorized admin email address and password.
            </p>

            <button
              type="button"
              onClick={() => setGoogleNoticeOpen(false)}
              className="w-full h-11.5 rounded-xl bg-gradient-to-r from-[#104BA8] to-[#092B60] text-white text-[14px] font-bold transition-all shadow-md cursor-pointer"
            >
              Sign In with Credentials
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen w-full flex items-center justify-center bg-[#EAF3FF]"
          style={{
            background:
              "radial-gradient(circle at 8% 12%, rgba(190, 222, 255, 0.45) 0%, transparent 45%), radial-gradient(circle at 92% 88%, rgba(195, 225, 255, 0.45) 0%, transparent 45%), #EAF3FF",
          }}
        >
          <div className="size-10 animate-spin rounded-full border-3 border-[#10469B] border-t-transparent" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
