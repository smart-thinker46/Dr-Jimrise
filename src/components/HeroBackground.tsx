const equations = [
  "∂u/∂t = D∇²u + f(u)",
  "dR/dt = βSI − γR",
  "∫ e^{−x²} dx",
  "λ₁,₂ = (−b ± √Δ)/2a",
  "∇ · E = ρ/ε₀",
  "Σ aₙxⁿ",
  "x_{n+1} = rx_n(1 − x_n)",
  "ℒ{f(t)} = ∫₀^∞ e^{−st}f(t)dt",
];

const extraEquations = [
  "S(t)+I(t)+R(t)=N",
  "∇²φ = 0",
  "Re = ρuL/μ",
  "P(X=x)=λˣe^{-λ}/x!",
  "∂C/∂t = D∂²C/∂x² − v∂C/∂x",
  "min z = cᵀx",
  "A⃗ = ∇ × B⃗",
  "K = rN(1−N/K)",
  "∑ᵢ pᵢ log pᵢ",
  "J(θ)=1/m∑L(hθ(x),y)",
];

export function HeroBackground({ dense = false, medium = false }: { dense?: boolean; medium?: boolean }) {
  const visibleEquations = dense
    ? [...equations, ...extraEquations]
    : medium
      ? [...equations, ...extraEquations.slice(0, 4)]
      : equations;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.05),transparent_55%)]" />
      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cream" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Floating equations */}
      {visibleEquations.map((eq, i) => (
        <span
          key={i}
          className="absolute font-serif italic text-gold/35 select-none animate-float"
          style={{
            top: `${(i * 11 + 8) % 84}%`,
            left: `${(i * 17 + 5) % 92}%`,
            fontSize: `${0.75 + (i % 4) * 0.2}rem`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${6 + (i % 4)}s`,
          }}
        >
          {eq}
        </span>
      ))}
      {/* Nodes */}
      <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden="true">
        <g className="text-gold">
          <line x1="10%" y1="20%" x2="30%" y2="35%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="30%" y1="35%" x2="55%" y2="25%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="55%" y1="25%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="0.5" />
          <line x1="30%" y1="35%" x2="45%" y2="70%" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="10%" cy="20%" r="3" fill="currentColor" />
          <circle cx="30%" cy="35%" r="4" fill="currentColor" />
          <circle cx="55%" cy="25%" r="3" fill="currentColor" />
          <circle cx="80%" cy="50%" r="4" fill="currentColor" />
          <circle cx="45%" cy="70%" r="3" fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}
