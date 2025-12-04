export default function AnimatedBackground() {
  return (
    <div id="animated-bg" className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" style={{
      background: `
        radial-gradient(1200px 600px at 50% 110%, rgba(245, 158, 11, 0.12), transparent 60%),
        radial-gradient(1000px 500px at 10% -10%, rgba(245, 158, 11, 0.08), transparent 60%),
        linear-gradient(180deg, #000, #0a0a0a 60%, #000)
      `
    }}>
      <style jsx>{`
        @keyframes swirl {
          to {
            transform: rotate(360deg) translateY(0);
          }
        }
        @keyframes float {
          0% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(20px);
          }
        }
        @keyframes pulse {
          0% {
            opacity: 0.35;
          }
          100% {
            opacity: 0.55;
          }
        }
        .gold-wave {
          animation: swirl 10s linear infinite, float 6s ease-in-out infinite alternate;
        }
        .glow {
          animation: pulse 8s ease-in-out infinite alternate;
        }
      `}</style>
      <div className="glow absolute inset-[-20%]" style={{
        background: 'radial-gradient(600px 300px at 60% 70%, rgba(245, 158, 11, 0.25), transparent 70%)'
      }} />
      <div className="gold-wave absolute left-[-10%] right-[-10%] h-[60%] top-[40%]" style={{
        filter: 'blur(22px)',
        opacity: 0.5,
        background: 'conic-gradient(from 210deg, rgba(245, 158, 11, 0), rgba(245, 158, 11, 0.45), rgba(245, 158, 11, 0))'
      }} />
    </div>
  );
}
