/**
 * Minimalni event tracking.
 *
 * Radi s Google Analytics 4 (gtag), Google Tag Managerom (dataLayer) i
 * Plausibleom. Ako nijedan nije postavljen, funkcija tiho ne radi ništa
 * pozivi su uvijek sigurni.
 *
 * Da uključite mjerenje, dodajte JEDAN od ovih u <head> (src/routes/__root.tsx):
 *
 * Plausible (jednostavnije, bez cookie bannera):
 * <script defer data-domain="brickup.hr" src="https://plausible.io/js/script.js"></script>
 *
 * GA4:
 * <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
 */

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: Props) => void;
    dataLayer?: Props[];
    plausible?: (event: string, opts?: { props?: Props }) => void;
  }
}

export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, { props });
    window.gtag?.("event", event, props);
    if (window.dataLayer && !window.gtag) {
      window.dataLayer.push({ event, ...props });
    }
  } catch {
    // mjerenje nikad ne smije srušiti stranicu
  }
}
