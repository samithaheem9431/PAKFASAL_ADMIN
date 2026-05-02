/**
 * UIGradients-style vivid mesh backgrounds (CSS-only, no external assets).
 * `auth` — login / marketing hero. `admin` — subtle shell behind authenticated UI.
 */
export function MeshGradient({ variant = "auth" }) {
  if (variant === "admin") {
    return (
      <div className="mesh-bg">
        <div className="absolute inset-0 bg-admin-shell" />
        <div className="mesh-bg__layer -left-24 top-0 h-80 w-80 bg-emerald-400/25 animate-blob" />
        <div
          className="mesh-bg__layer right-0 bottom-0 h-72 w-72 bg-cyan-400/20 animate-blob-slow delay-2000"
          aria-hidden
        />
        <div
          className="mesh-bg__layer left-1/3 top-1/2 h-56 w-56 -translate-x-1/2 bg-teal-300/15 animate-blob delay-3000"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="mesh-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-200/40 via-fuchsia-100/30 to-emerald-200/45" />
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/20 via-transparent to-cyan-100/25" />
      <div
        className="mesh-bg__layer -left-24 top-[-8%] h-[28rem] w-[28rem] bg-violet-400/40 animate-blob"
        aria-hidden
      />
      <div
        className="mesh-bg__layer -right-16 top-[15%] h-[24rem] w-[24rem] bg-fuchsia-400/35 animate-blob-slow delay-2000"
        aria-hidden
      />
      <div
        className="mesh-bg__layer left-[20%] bottom-[-12%] h-[22rem] w-[22rem] bg-emerald-400/35 animate-blob delay-3000"
        aria-hidden
      />
      <div
        className="mesh-bg__layer right-[25%] top-[55%] h-[18rem] w-[18rem] bg-cyan-400/30 animate-blob delay-1000"
        aria-hidden
      />
      <div
        className="mesh-bg__layer left-[45%] top-[30%] h-[14rem] w-[14rem] bg-amber-300/25 animate-blob-slow"
        style={{ animationDelay: "4s" }}
        aria-hidden
      />
    </div>
  );
}
