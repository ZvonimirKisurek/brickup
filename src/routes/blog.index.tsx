import { createFileRoute, Link } from "@tanstack/react-router";

import { formatPostDate, publishedPosts } from "@/lib/blog";
import { absoluteUrl, business, seo } from "@/lib/site";

// /blog: nije povezan iz izbornika ni podnožja, ali je indeksiran (sitemap, llms.txt).

const title = `Blog: savjeti o elektroinstalacijama, podovima i adaptaciji | ${business.name}`;
const description =
  "Savjeti majstora za Zagreb i Slavoniju: elektroinstalacije, gletanje, bojanje te postavljanje laminata i vinila.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: absoluteUrl("/blog") },
      { property: "og:image", content: absoluteUrl(seo.ogImage) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog") }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
            {business.name}
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Natrag na početnu
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>

        <ul className="mt-10 space-y-4">
          {publishedPosts.map((post) => (
            <li key={post.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="block rounded-xl border border-border bg-card p-6 transition hover:border-brand hover:shadow-lg"
              >
                <time dateTime={post.date} className="text-xs text-muted-foreground">
                  {formatPostDate(post.date)}
                </time>
                <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
