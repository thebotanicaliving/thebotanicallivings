import { useState, useEffect, useCallback } from 'react';
import { Blog } from '@/types';
import { blogService } from '@/services/blog.service';

export function useBlog(slug: string | undefined) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBlog = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await blogService.getBlogBySlug(slug);
      setBlog(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch blog: ${slug}`));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  return { blog, loading, error, retry: fetchBlog };
}
