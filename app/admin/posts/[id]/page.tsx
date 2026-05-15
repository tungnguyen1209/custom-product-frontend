"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostForm from "../../_components/PostForm";
import { AdminPost, postsAdminApi } from "@/lib/posts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: PageProps) {
  // Next.js 15+ params are async — use the `use()` hook to unwrap.
  const { id: idStr } = use(params);
  const id = parseInt(idStr, 10);
  const router = useRouter();
  const [post, setPost] = useState<AdminPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      router.replace("/admin/posts");
      return;
    }
    let cancelled = false;
    postsAdminApi
      .get(id)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </div>
    );
  }
  if (!post) {
    return <div className="text-sm text-slate-400">Loading post…</div>;
  }
  return <PostForm initial={post} />;
}
