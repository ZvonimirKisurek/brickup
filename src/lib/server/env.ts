// Reads an env var from process.env first (works locally and on most
// Node-compatible hosts). Falls back to Cloudflare Workers' native
// `cloudflare:workers` bindings module for deployments where process.env
// isn't populated. The specifier is built at runtime (not a static string)
// so Vite's dev server never tries to resolve it ahead of time.
export async function resolveEnvVar(name: string): Promise<string | undefined> {
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name];
  }
  try {
    const specifier = ["cloudflare", "workers"].join(":");
    const cf = (await import(/* @vite-ignore */ specifier)) as {
      env?: Record<string, string | undefined>;
    };
    return cf.env?.[name];
  } catch {
    return undefined;
  }
}
