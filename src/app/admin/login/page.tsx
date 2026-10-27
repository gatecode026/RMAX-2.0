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
import styles from "./login.module.css";

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
      const res = await loginAction({
        email: email.trim(),
        password,
        remember: rememberMe,
      });

      if (!res.ok) {
        setFormError(res.message);
        setIsSubmitting(false);
        return;
      }

      // Successful login -> Redirect to admin dashboard
      router.push(nextUrl);
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
    <div className={styles.pageRoot}>
      <div className={styles.loginWrapper}>
        {/* ========================================================
            LEFT PROMOTIONAL PANEL
            ======================================================== */}
        <section className={styles.promoPanel} aria-label="RMAX Institutional Solutions">
          <div className={styles.ambientGlow} />

          {/* Top Branding & Messaging */}
          <div className={styles.promoHeader}>
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo-white.png"
                alt="RMAX Solutions"
                width={120}
                height={36}
                priority
                className={styles.logoWhite}
              />
            </div>

            <span className={styles.sectionBadge}>
              Institutional Hygiene Solutions
            </span>

            <h1 className={styles.promoHeading}>
              Cleaner Campuses.<br />
              Healthier Communities.
            </h1>

            <p className={styles.promoDescription}>
              RMAX provides advanced sanitary napkin incinerators and hygiene solutions for schools, colleges, hospitals and institutions across India.
            </p>

            {/* 3 Key Benefits */}
            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <div className={styles.benefitIconCircle}>
                  <ShieldCheck className="size-5 stroke-[2.2]" />
                </div>
                <div className={styles.benefitText}>
                  <span className={styles.benefitTitle}>Safe &amp; Hygienic Disposal</span>
                  <span className={styles.benefitSubtitle}>Environment-friendly solutions</span>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div className={styles.benefitIconCircle}>
                  <Building2 className="size-5 stroke-[2.2]" />
                </div>
                <div className={styles.benefitText}>
                  <span className={styles.benefitTitle}>Trusted by 20K+ Institutions</span>
                  <span className={styles.benefitSubtitle}>Across India</span>
                </div>
              </div>

              <div className={styles.benefitItem}>
                <div className={styles.benefitIconCircle}>
                  <Leaf className="size-5 stroke-[2.2]" />
                </div>
                <div className={styles.benefitText}>
                  <span className={styles.benefitTitle}>Sustainable &amp; Compliant</span>
                  <span className={styles.benefitSubtitle}>Supports cleaner, greener campuses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Cluster & Machine Visual */}
          <div className={styles.trustCluster}>
            <div className={styles.avatarGroup} aria-hidden="true">
              <div className={styles.avatarCircle} style={{ backgroundColor: "#2563EB" }}>SC</div>
              <div className={styles.avatarCircle} style={{ backgroundColor: "#0D9488" }}>CL</div>
              <div className={styles.avatarCircle} style={{ backgroundColor: "#7C3AED" }}>HP</div>
            </div>
            <div className={styles.trustInfo}>
              <span className={styles.trustTitle}>20,000+ institutions trust RMAX</span>
              <span className={styles.trustSubtitle}>Schools &bull; Colleges &bull; Hospitals &bull; Offices</span>
            </div>
          </div>

          {/* Machine on Pedestal (Right Bottom) */}
          <div className={styles.productVisual} aria-hidden="true">
            <Image
              src="/images/auth/login-pedestal-product.png"
              alt="RMAX Commercial Incinerator on pedestal"
              width={260}
              height={340}
              className={styles.productImage}
              priority
            />
          </div>
        </section>

        {/* ========================================================
            RIGHT LOGIN CARD
            ======================================================== */}
        <main className={styles.loginCard} aria-labelledby="admin-login-title">
          <div className="flex justify-center mb-1">
            <Image
              src="/images/logo.png"
              alt="RMAX"
              width={110}
              height={32}
              className={styles.cardLogo}
              priority
            />
          </div>

          <h2 id="admin-login-title" className={styles.cardTitle}>
            Welcome Back
          </h2>
          <p className={styles.cardSubtitle}>
            Login to your RMAX Admin Panel
          </p>

          {/* Error Banner */}
          {formError && (
            <div role="alert" className={styles.errorBanner} style={{ marginBottom: "16px" }}>
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className={styles.loginForm}>
            {/* Email Address */}
            <div className={styles.fieldGroup}>
              <label htmlFor="admin-email" className={styles.fieldLabel}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIconLeft} />
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
                  className={`${styles.inputField} ${validationErrors.email ? styles.inputError : ""}`}
                  aria-invalid={Boolean(validationErrors.email)}
                  aria-describedby={validationErrors.email ? "admin-email-error" : undefined}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.email && (
                <span id="admin-email-error" className={styles.fieldErrorMessage}>
                  {validationErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <label htmlFor="admin-password" className={styles.fieldLabel}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIconLeft} />
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
                  className={`${styles.inputField} ${validationErrors.password ? styles.inputError : ""}`}
                  aria-invalid={Boolean(validationErrors.password)}
                  aria-describedby={validationErrors.password ? "admin-password-error" : undefined}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={styles.passwordToggle}
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
                <span id="admin-password-error" className={styles.fieldErrorMessage}>
                  {validationErrors.password}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className={styles.optionsRow}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkboxInput}
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
                className={styles.forgotLink}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.loginButton}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.buttonSpinner} />
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
          <div className={styles.dividerRow}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine} />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => setGoogleNoticeOpen(true)}
            className={styles.googleButton}
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
          <footer className={styles.cardFooter}>
            &copy; 2026 RMAX Solutions. All rights reserved.
          </footer>
        </main>
      </div>

      {/* ========================================================
          FORGOT PASSWORD MODAL (Accessible & Secure)
          ======================================================== */}
      {forgotModalOpen && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
          onClick={() => setForgotModalOpen(false)}
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 id="forgot-modal-title" className={styles.modalTitle}>
                Recover Password
              </h3>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className={styles.closeButton}
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className={styles.modalText}>
              Enter your registered administrative email address. A password recovery link will be sent to reset your credentials.
            </p>

            {forgotSuccess ? (
              <div>
                <div className={styles.successBanner}>
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
                  className={styles.loginButton}
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                {forgotError && (
                  <div className={styles.errorBanner} style={{ marginBottom: "12px" }}>
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className={styles.fieldGroup} style={{ marginBottom: "16px" }}>
                  <label htmlFor="recovery-email" className={styles.fieldLabel}>
                    Email Address
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIconLeft} />
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      placeholder="Enter your administrative email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={styles.inputField}
                      disabled={forgotLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className={styles.loginButton}
                >
                  {forgotLoading ? (
                    <>
                      <div className={styles.buttonSpinner} />
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
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-modal-title"
          onClick={() => setGoogleNoticeOpen(false)}
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 id="google-modal-title" className={styles.modalTitle}>
                Google Authentication
              </h3>
              <button
                type="button"
                onClick={() => setGoogleNoticeOpen(false)}
                className={styles.closeButton}
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className={styles.modalText}>
              Google OAuth is managed through institutional Single Sign-On (SSO). To access the RMAX Admin Dashboard, please sign in with your authorized admin email address and password.
            </p>

            <button
              type="button"
              onClick={() => setGoogleNoticeOpen(false)}
              className={styles.loginButton}
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
    <Suspense fallback={<div className={styles.pageRoot} />}>
      <AdminLoginForm />
    </Suspense>
  );
}

