export function textstellenLink(url: string, anfang: string, ende?: string) {
  const fragment = encodeURIComponent(anfang);
  const bereich = ende ? `,${encodeURIComponent(ende)}` : "";
  const trenner = url.includes("#") ? ":~:text=" : "#:~:text=";
  return `${url}${trenner}${fragment}${bereich}`;
}
