export function BlueprintBg() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--copper) 1px, transparent 1px), linear-gradient(to bottom, var(--copper) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Diagonal hairlines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--copper) 0px, var(--copper) 1px, transparent 1px, transparent 22px)",
        }}
      />
      {/* Radial copper glow top-right */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(193,123,63,0.18) 0%, transparent 60%)" }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, rgba(74,14,14,0.35) 0%, transparent 60%)" }}
      />
    </div>
  );
}
