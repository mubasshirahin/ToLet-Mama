export default function InfoPageShell({ eyebrow, title, intro, children }) {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header className="glass-pane rounded-3xl p-6 lg:p-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A89880]">{eyebrow}</p>
        <h1 className="font-serif text-3xl font-black tracking-tight text-[#2C1810] lg:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5C3A21]">{intro}</p>
      </header>
      {children}
    </div>
  );
}
