export function ZitatKommentar({ text }: { text: string }) {
  return (
    <div className="mt-3 border-l-2 border-opinion pl-3 font-sans text-[0.78rem] leading-relaxed text-ink-2">
      <p className="mb-1 font-semibold text-ink">Mein Kommentar</p>
      <p>{text}</p>
    </div>
  );
}
