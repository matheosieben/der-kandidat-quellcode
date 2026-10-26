import { ausgabe } from "@/content/ausgabe";

/**
 * Wortmarke der ersten Ausgabe: „DER ♞ KANDIDAT“, der Springer zwischen den
 * beiden Wörtern. Steht in einem Element mit der Klasse `wordmark`.
 */
export function Wortmarke() {
  const [vorn, ...rest] = ausgabe.titel.split(" ");
  return (
    <>
      <span className="sr-only">{ausgabe.titel}</span>
      <span aria-hidden="true">{vorn}</span>
      <span aria-hidden="true" className="wordmark-springer" />
      <span aria-hidden="true">{rest.join(" ")}</span>
    </>
  );
}
