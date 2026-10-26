export function istMobilgeraet() {
  const mobil = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  // iPadOS meldet sich im Desktopmodus als Mac, unterstützt aber Multitouch.
  const ipad = /Mac/i.test(navigator.platform) && navigator.maxTouchPoints > 1;
  const touch =
    navigator.maxTouchPoints > 0 &&
    window.matchMedia("(pointer: coarse) and (hover: none)").matches;

  return mobil || ipad || touch;
}
