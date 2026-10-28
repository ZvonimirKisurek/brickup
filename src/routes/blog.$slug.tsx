import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { formatPostDate, getPost } from "@/lib/blog";
import { absoluteUrl, business, seo, services } from "@/lib/site";
import { blogPostJsonLd } from "@/lib/structured-data";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { post } = loaderData;
    const url = absoluteUrl(`/blog/${post.slug}`);
    return {
      meta: [
        { title: `${post.title} | ${business.name}` },
        { name: "description", content: post.description },
        { name: "keywords", content: post.keywords.join(", ") },
        { property: "og:type", content: "article" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:url", content: url },
        { property: "og:image", content: absoluteUrl(seo.ogImage) },
        { property: "article:published_time", content: post.date },
        { property: "article:modified_time", content: post.updated ?? post.date },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.description },
        { name: "twitter:image", content: absoluteUrl(seo.ogImage) },
        { "script:ld+json": blogPostJsonLd(post) },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const service = services.find((s) => s.id === post.service);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
            {business.name}
          </Link>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">
            Svi članci
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <article>
          <time dateTime={post.date} className="text-sm text-muted-foreground">
            {formatPostDate(post.date)}
          </time>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-8 space-y-4 leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6">
            {post.content.map((block, i) => {
              if (block.type === "h2") return <h2 key={i}>{block.text}</h2>;
              if (block.type === "ul")
                return (
                  <ul key={i}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              return <p key={i}>{block.text}</p>;
            })}
          </div>

          {post.faq && post.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-bold tracking-tight">Česta pitanja</h2>
              <dl className="mt-4 space-y-5">
                {post.faq.map((entry) => (
                  <div key={entry.q}>
                    <dt className="font-semibold text-foreground">{entry.q}</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">{entry.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </article>

        <aside className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
          <p className="font-display text-lg font-bold tracking-tight">
            {service ? `${service.title}: besplatna ponuda` : "Besplatna ponuda"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Radimo u Zagrebu i Slavoniji. Odgovaramo unutar 24 sata, a ponuda je besplatna i bez
            obveze.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href="/#kontakt"
              className="rounded-md bg-brand px-5 py-2.5 text-brand-foreground hover:brightness-95"
            >
              Zatraži ponudu
            </a>
            <a
              href={`tel:${business.phoneE164}`}
              className="rounded-md border border-border px-5 py-2.5 hover:bg-muted"
            >
              {business.phoneDisplay}
            </a>
          </div>
        </aside>
      </main>
    </div>
  );
}
