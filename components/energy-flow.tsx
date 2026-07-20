export function EnergyFlow({ className = "" }: { className?: string }) {
  return (
    <div className={`energy-flow ${className}`} aria-hidden="true">
      <span className="energy-orb energy-orb-aqua" />
      <span className="energy-orb energy-orb-flame" />
      <span className="energy-rings" />
    </div>
  );
}
