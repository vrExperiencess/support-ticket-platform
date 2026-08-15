import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import BrandMark from "../components/branding/BrandMark";

import {
  useAuth,
} from "../features/auth/useAuth";

const demoUsers = [
  {
    label: "Admin",
    email:
      "admin@support.local",
    password:
      "Admin123!",
  },

  {
    label: "Supervisor",
    email:
      "supervisor@support.local",
    password:
      "Supervisor123!",
  },

  {
    label: "Agent",
    email:
      "agent1@support.local",
    password:
      "Agent123!",
  },
];

export default function LoginPage() {
  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const {
    login,
    isAuthenticated,
    isLoading,
  } =
    useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const from =
    (
      location.state as {
        from?: {
          pathname?: string;
        };
      } | null
    )?.from?.pathname ?? "/";

  useEffect(() => {
    setError(null);
  }, [
    email,
    password,
  ]);

  if (
    !isLoading &&
    isAuthenticated
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      await login({
        email,
        password,
      });

      navigate(from, {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      {/* Corporate section */}

      <section className="relative hidden overflow-hidden bg-auth-gradient px-14 py-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-20 top-20 h-[360px] w-[360px] rounded-full border border-brand-500/20" />

        <div className="absolute -right-6 top-36 h-[260px] w-[260px] rounded-full border border-brand-500/30" />

        <div className="absolute right-24 top-52 h-[140px] w-[140px] rounded-full bg-brand-500/10 blur-3xl" />

        <BrandMark light />

        <div className="relative z-10 my-auto max-w-[620px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-navy-100">
            <ShieldCheck
              size={15}
              className="text-brand-400"
            />

            Internal support platform
          </div>

          <h1 className="max-w-[600px] text-4xl font-extrabold leading-[1.12] tracking-[-0.035em] xl:text-5xl">
            Support operations
            with
            <span className="text-brand-400">
              {" "}
              visibility,
              control and
              traceability.
            </span>
          </h1>

          <p className="mt-6 max-w-[540px] text-sm leading-7 text-navy-200">
            Centralize support
            tickets, assignments,
            priorities and
            operational follow-up
            through a secure
            role-based platform.
          </p>

          <div className="mt-10 grid max-w-[570px] grid-cols-3 gap-3">
            {[
              [
                "RBAC",
                "Access control",
              ],
              [
                "100%",
                "Traceability",
              ],
              [
                "24/7",
                "Visibility",
              ],
            ].map(
              ([
                value,
                label,
              ]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur"
                >
                  <div className="text-xl font-extrabold text-brand-400">
                    {value}
                  </div>

                  <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-navy-300">
                    {label}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <p className="text-[10px] text-navy-400">
          Tech Lead Full Stack
          Challenge · Support
          Ticket Platform
        </p>
      </section>

      {/* Form */}

      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 lg:hidden">
            <BrandMark />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            Welcome
          </span>

          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-navy-900">
            Sign in to your
            workspace
          </h2>

          <p className="mt-3 text-sm leading-6 text-corporate-muted">
            Use your support
            platform credentials
            to continue.
          </p>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-9 space-y-5"
          >
            <div>
              <label className="mb-2 block text-xs font-bold text-navy-800">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target
                        .value,
                    )
                  }
                  placeholder="user@support.local"
                  className="h-12 w-full rounded-xl border border-corporate-border bg-white pl-11 pr-4 text-sm text-navy-900 outline-none transition placeholder:text-navy-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-navy-800">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  value={
                    password
                  }
                  onChange={(event) =>
                    setPassword(
                      event.target
                        .value,
                    )
                  }
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-corporate-border bg-white pl-11 pr-12 text-sm text-navy-900 outline-none transition placeholder:text-navy-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) =>
                        !value,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 transition hover:text-navy-700"
                >
                  {showPassword ? (
                    <EyeOff
                      size={17}
                    />
                  ) : (
                    <Eye
                      size={17}
                    />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              disabled={
                submitting
              }
              className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-extrabold text-white shadow-orange transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <div className="mt-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-corporate-border" />

              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy-300">
                Demo access
              </span>

              <div className="h-px flex-1 bg-corporate-border" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {demoUsers.map(
                (demo) => (
                  <button
                    key={
                      demo.label
                    }
                    type="button"
                    onClick={() => {
                      setEmail(
                        demo.email,
                      );

                      setPassword(
                        demo.password,
                      );
                    }}
                    className="rounded-lg border border-corporate-border px-2 py-2.5 text-[10px] font-bold text-navy-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {
                      demo.label
                    }
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}