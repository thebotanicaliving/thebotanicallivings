import { useState, useEffect, useCallback } from 'react';
import { Blog } from '@/types';
import { blogService } from '@/services/blog.service';

export function useBlogs(includeUnpublished: boolean = false) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = blogService.subscribeBlogs((data) => {
      const filtered = includeUnpublished ? data : data.filter((b) => b.published === true);
      setBlogs(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [includeUnpublished]);

  const featuredBlog = blogs.find(b => b.featured) || blogs[0] || null;

  return { blogs, featuredBlog, loading, error, refresh: () => {} };
}
