import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedPostBySlug } from "@/lib/posts-public";
import { renderMarkdown } from "@/lib/render-markdown";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  // TipTap (admin WYSIWYG) emits HTML. Older posts authored via the previous
  // Markdown textarea get parsed through `renderMarkdown` as a fallback. The
  // detection check looks for a leading block-level HTML tag — Markdown
  // headings start with `#`, so they won't match.
  const isHtmlContent = /^\s*<(p|h[1-6]|ul|ol|blockquote|pre|figure|img|div|article|section)\b/i.test(
    post.content,
  );
  const html = isHtmlContent ? post.content : renderMarkdown(post.content);
  const authorName = post.author
    ? [post.author.firstName, post.author.lastName].filter(Boolean).join(" ") ||
      "Gifthub Team"
    : null;

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="mb-6 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>{" "}
            <span className="mx-1">/</span>
            <span className="text-gray-900">Blog</span>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              {post.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
              {authorName && (
                <>
                  <span>·</span>
                  <span>By {authorName}</span>
                </>
              )}
              {post.tags.length > 0 && (
                <>
                  <span>·</span>
                  <ul className="flex flex-wrap gap-1.5">
                    {post.tags.map((t) => (
                      <li
                        key={t.id}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                      >
                        {t.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </header>

          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="mb-8 w-full rounded-lg border border-gray-200 object-cover"
            />
          )}

          <div
            className="prose prose-slate max-w-none text-gray-800 leading-relaxed [&_a]:text-[#ff6b6b] [&_a]:underline [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3 [&_li]:list-disc [&_li]:ml-6 [&_ol_li]:list-decimal [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-900 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
