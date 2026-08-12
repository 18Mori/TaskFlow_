export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-zinc-700/80 bg-zinc-800/60 px-1.5 font-mono text-[10px] font-medium tracking-tight text-zinc-400 tabular-nums">
      {children}
    </kbd>
  );
}