"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";
import { loginAction } from "@/lib/actions/auth";
import { applyFieldErrors, requestJson } from "@/lib/client-api";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
} from "@/lib/validations/schemas";

function CustomerAuthModalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const { isOpen, tab, setTab, closeModal } = useAuthModal();

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  // Status states
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Forms
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
    reset: resetLoginForm,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    setError: setRegError,
    formState: { errors: regErrors, isSubmitting: isRegistering },
    reset: resetRegForm,
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    setError: setForgotFormError,
    formState: { errors: forgotErrors, isSubmitting: isSendingForgot },
    reset: resetForgotForm,
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  if (!isOpen) return null;

  // Handle Login Submit
  async function onLogin(values: LoginInput) {
    setLoginError(null);
    const res = await loginAction(values, { portal: "customer" });

    if (!res.ok) {
      setLoginError(res.message);
      return;
    }

    setAuthSuccess("Logged in successfully! Loading your session…");
    setTimeout(() => {
      closeModal();
      resetLoginForm();
      if (typeof document !== "undefined") { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; document.body.classList.remove("modal-open"); }
      setAuthSuccess(null);
      if (nextParam && !nextParam.startsWith("/admin") && !nextParam.startsWith("/manager")) {
        router.push(nextParam);
      } else {
        router.refresh();
      }
    }, 800);
  }

  // Handle Register Submit
  async function onRegister(values: RegisterInput) {
    setRegisterError(null);
    const res = await requestJson("/api/auth/register", "POST", values);

    if (!res.ok) {
      applyFieldErrors(setRegError, res.fields);
      setRegisterError(res.message);
      return;
    }

    // Auto sign-in new customer
    const login = await loginAction(
      { email: values.email, password: values.password },
      { portal: "customer" }
    );

    if (!login.ok) {
      setTab("login");
      setLoginError("Account created! Please sign in with your password.");
      return;
    }

    setAuthSuccess("Account created successfully! Welcome to RMAX.");
    setTimeout(() => {
      closeModal();
      resetRegForm();
      if (typeof document !== "undefined") { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; document.body.classList.remove("modal-open"); }
      setAuthSuccess(null);
      if (nextParam && !nextParam.startsWith("/admin") && !nextParam.startsWith("/manager")) {
        router.push(nextParam);
      } else {
        router.refresh();
      }
    }, 800);
  }

  // Handle Forgot Password Submit
  async function onForgot(values: ForgotPasswordInput) {
    setForgotError(null);
    setForgotSuccess(null);
    const res = await requestJson<{ email: string }>("/api/auth/forgot-password", "POST", values);

    if (res.ok) {
      setForgotSuccess(res.data.email);
    } else {
      applyFieldErrors(setForgotFormError, res.fields);
      setForgotError(res.message);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A214B]/60 backdrop-blur-xs overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(10,33,75,0.28)] border border-slate-100 p-6 sm:p-8 my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/images/logo-navy.png"
            alt="RMAX Solutions"
            width={1155}
            height={371}
            className="h-10 sm:h-11 w-auto object-contain mb-3"
            priority
          />
          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-extrabold text-[#0A2656]">
            {tab === "login"
              ? "Customer Login"
              : tab === "register"
              ? "Create Customer Account"
              : "Reset Password"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-[320px]">
            {tab === "login"
              ? "Access your quotation history, track deliveries, and manage account details."
              : tab === "register"
              ? "Join institutions across India using automated sanitary hygiene systems."
              : "Enter your registered email to receive password recovery instructions."}
          </p>
        </div>

        {/* Global Success Banner */}
        {authSuccess && (
          <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold">{authSuccess}</span>
          </div>
        )}

        {/* Segmented Pill Tabs for Login / Register */}
        {tab !== "forgot" && (
          <div className="flex p-1 mb-6 rounded-2xl bg-slate-100/90 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setLoginError(null);
                setRegisterError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-action transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-card text-navy shadow-sm"
                  : "text-muted hover:text-charcoal"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setLoginError(null);
                setRegisterError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-action transition-all cursor-pointer ${
                tab === "register"
                  ? "bg-card text-navy shadow-sm"
                  : "text-muted hover:text-charcoal"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ========================================================
            TAB 1: CUSTOMER LOGIN
            ======================================================== */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit(onLogin)} noValidate className="flex flex-col gap-4">
            {loginError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-red-700 animate-in fade-in duration-150">
                <AlertCircle className="size-4.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{loginError}</p>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label htmlFor="customer-login-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-slate-400 size-4 pointer-events-none" />
                <input
                  id="customer-login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@organization.org"
                  {...loginRegister("email")}
                  className={`w-full h-11 rounded-input border bg-card pl-10 pr-3.5 text-sm text-charcoal placeholder:text-muted/60 outline-none transition-all ${
                    loginErrors.email
                      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
                      : "border-line focus:border-navy focus:bg-card focus:ring-2 focus:ring-navy/20"
                  }`}
                />
              </div>
              {loginErrors.email && (
                <p className="mt-1 text-xs text-danger font-medium">{loginErrors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="customer-login-password" className="text-xs font-bold text-charcoal">
                  Password <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab("forgot");
                    setForgotError(null);
                    setForgotSuccess(null);
                  }}
                  className="text-xs font-semibold text-navy hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-muted/60 size-4 pointer-events-none" />
                <input
                  id="customer-login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...loginRegister("password")}
                  className={`w-full h-11 rounded-input border bg-card pl-10 pr-10 text-sm text-charcoal placeholder:text-muted/60 outline-none transition-all ${
                    loginErrors.password
                      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
                      : "border-line focus:border-navy focus:bg-card focus:ring-2 focus:ring-navy/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted hover:text-charcoal p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {loginErrors.password && (
                <p className="mt-1 text-xs text-danger font-medium">{loginErrors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="customer-remember"
                type="checkbox"
                {...loginRegister("remember")}
                className="size-4 rounded-xs border-line text-navy focus:ring-navy cursor-pointer"
              />
              <label htmlFor="customer-remember" className="text-xs text-muted font-medium cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-2 w-full h-11 rounded-action bg-linear-to-r from-navy to-navy-600 hover:brightness-110 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,41,112,0.25)] transition-all cursor-pointer disabled:opacity-70"
            >
              {isLoggingIn ? (
                <>
                  <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Sign In to Account</span>
              )}
            </button>

            {/* Legal Agreement Notice */}
            <div className="mt-4 pt-3.5 border-t border-line text-center">
              <p className="text-xs text-muted leading-relaxed">
                By signing in or submitting, you agree to RMAX&apos;s{" "}
                <Link
                  href="/terms-and-conditions"
                  onClick={closeModal}
                  className="font-semibold text-navy hover:underline"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  onClick={closeModal}
                  className="font-semibold text-navy hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </form>
        )}

        {/* ========================================================
            TAB 2: CUSTOMER REGISTRATION
            ======================================================== */}
        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit(onRegister)} noValidate className="flex flex-col gap-3.5">
            {registerError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-red-700 animate-in fade-in duration-150">
                <AlertCircle className="size-4.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{registerError}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 text-slate-400 size-4 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Dr. Rajesh Sharma"
                  {...regRegister("name")}
                  className={`w-full h-10.5 rounded-input border bg-card pl-10 pr-3.5 text-sm text-charcoal placeholder:text-muted/60 outline-none transition-all ${
                    regErrors.name
                      ? "border-danger focus:border-danger"
                      : "border-line focus:border-navy focus:bg-card"
                  }`}
                />
              </div>
              {regErrors.name && (
                <p className="mt-1 text-xs text-danger font-medium">{regErrors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-charcoal mb-1">
                Email Address <span className="text-danger">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-muted/60 size-4 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@organization.org"
                  {...regRegister("email")}
                  className={`w-full h-10.5 rounded-input border bg-card pl-10 pr-3.5 text-sm text-charcoal placeholder:text-muted/60 outline-none transition-all ${
                    regErrors.email
                      ? "border-danger focus:border-danger"
                      : "border-line focus:border-navy focus:bg-card"
                  }`}
                />
              </div>
              {regErrors.email && (
                <p className="mt-1 text-xs text-danger font-medium">{regErrors.email.message}</p>
              )}
            </div>

            {/* Mobile Number & Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-bold text-charcoal mb-1">
                  Mobile Number <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 text-muted/60 size-3.5 pointer-events-none" />
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="10-digit number"
                    {...regRegister("phone")}
                    className={`w-full h-10.5 rounded-input border bg-card pl-9 pr-3 text-xs sm:text-sm text-charcoal placeholder:text-muted/60 outline-none transition-all ${
                      regErrors.phone
                        ? "border-danger focus:border-danger"
                        : "border-line focus:border-navy focus:bg-card"
                    }`}
                  />
                </div>
                {regErrors.phone && (
                  <p className="mt-1 text-[11px] text-danger font-medium">{regErrors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-org" className="block text-xs font-bold text-charcoal mb-1">
                  Organization <span className="text-muted/60 font-normal">(Optional)</span>
                </label>
                <div className="relative flex items-center">
                  <Building2 className="absolute left-3 text-muted/60 size-3.5 pointer-events-none" />
                  <input
                    id="reg-org"
                    type="text"
                    autoComplete="organization"
                    placeholder="School / College / Co."
                    {...regRegister("organization")}
                    className="w-full h-10.5 rounded-input border border-line bg-card pl-9 pr-3 text-xs sm:text-sm text-charcoal placeholder:text-muted/60 outline-none focus:border-navy focus:bg-card transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-charcoal mb-1">
                Password <span className="text-danger">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-muted/60 size-4 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  {...regRegister("password")}
                  className={`w-full h-10.5 rounded-input border bg-card pl-10 pr-10 text-sm text-charcoal placeholder:text-muted/60 outline-none transition-all ${
                    regErrors.password
                      ? "border-danger focus:border-danger"
                      : "border-line focus:border-navy focus:bg-card"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted hover:text-charcoal p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {regErrors.password && (
                <p className="mt-1 text-xs text-danger font-medium">{regErrors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-charcoal mb-1">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-muted/60 size-4 pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  {...regRegister("confirmPassword")}
                  className={`w-full h-10.5 rounded-input border bg-card pl-10 pr-10 text-sm text-charcoal placeholder:text-muted/60 outline-none transition-all ${
                    regErrors.confirmPassword
                      ? "border-danger focus:border-danger"
                      : "border-line focus:border-navy focus:bg-card"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-muted hover:text-charcoal p-1 cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {regErrors.confirmPassword && (
                <p className="mt-1 text-xs text-danger font-medium">
                  {regErrors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 mt-1">
              <input
                id="reg-terms"
                type="checkbox"
                {...regRegister("terms")}
                className="mt-0.5 size-4 rounded-xs border-line text-navy focus:ring-navy cursor-pointer"
              />
              <label htmlFor="reg-terms" className="text-xs text-muted leading-snug cursor-pointer">
                I agree to the{" "}
                <Link
                  href="/terms-and-conditions"
                  target="_blank"
                  className="font-semibold text-navy underline"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="font-semibold text-navy underline"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {regErrors.terms && (
              <p className="text-xs text-danger font-medium">{regErrors.terms.message}</p>
            )}

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={isRegistering}
              className="mt-2 w-full h-11 rounded-action bg-linear-to-r from-navy to-navy-600 hover:brightness-110 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,41,112,0.25)] transition-all cursor-pointer disabled:opacity-70"
            >
              {isRegistering ? (
                <>
                  <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Customer Account</span>
              )}
            </button>
          </form>
        )}

        {/* ========================================================
            TAB 3: FORGOT PASSWORD
            ======================================================== */}
        {tab === "forgot" && (
          <div>
            {forgotSuccess ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Password Reset Instructions Sent</h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      If an account exists for <strong>{forgotSuccess}</strong>, reset instructions
                      have been dispatched. Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="mt-4 w-full h-10 rounded-action bg-navy hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit(onForgot)} noValidate className="flex flex-col gap-4">
                {forgotError && (
                  <div className="rounded-input bg-danger-soft border border-danger/20 p-3.5 flex items-start gap-2.5 text-danger animate-in fade-in duration-150">
                    <AlertCircle className="size-4.5 text-danger shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold leading-relaxed">{forgotError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-bold text-charcoal mb-1.5">
                    Account Email Address <span className="text-danger">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 text-muted/60 size-4 pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@organization.org"
                      {...forgotRegister("email")}
                      className={`w-full h-11 rounded-input border bg-card pl-10 pr-3.5 text-sm text-charcoal placeholder:text-muted/60 outline-none transition-all ${
                        forgotErrors.email
                          ? "border-danger focus:border-danger"
                          : "border-line focus:border-navy focus:bg-card"
                      }`}
                    />
                  </div>
                  {forgotErrors.email && (
                    <p className="mt-1 text-xs text-danger font-medium">{forgotErrors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSendingForgot}
                  className="w-full h-11 rounded-action bg-linear-to-r from-navy to-navy-600 hover:brightness-110 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,41,112,0.25)] transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSendingForgot ? (
                    <>
                      <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Sending instructions...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="text-xs font-bold text-muted hover:text-navy transition-colors cursor-pointer"
                  >
                    &larr; Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function CustomerAuthModal() {
  return (
    <Suspense fallback={null}>
      <CustomerAuthModalContent />
    </Suspense>
  );
}
