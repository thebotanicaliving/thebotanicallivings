import { useState, useEffect, useCallback } from 'react';
import { Blog } from '@/types';
import { blogService } from '@/services/blog.service';

export function useBlogs(includeUnpublished: boolean = false) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBlogsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allBlogs = await blogService.getBlogs(includeUnpublished);
      setBlogs(allBlogs);
      const featured = await blogService.getFeaturedBlog();
      setFeaturedBlog(featured);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch blogs'));
    } finally {
      setLoading(false);
    }
  }, [includeUnpublished]);

  useEffect(() => {
    fetchBlogsData();
  }, [fetchBlogsData]);

  return { blogs, featuredBlog, loading, error, refresh: fetchBlogsData };
}
