import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '@/hooks/useBlog';
import { blogService } from '@/services/blog.service';
import { Button } from '@/components/shared';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { Blog } from '@/types';

export function BlogForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '', slug: '', excerpt: '', content: '', coverImage: '',
    category: 'Community', tags: [], author: 'Botanical Living',
    readingTime: '5 min read', published: true, featured: false,
    seo: { title: '', description: '', keywords: [] }
  });
  const [originalBlog, setOriginalBlog] = useState<Partial<Blog> | null>(null);

  // Use raw effect for fetching to keep this simple
  useEffect(() => {
    if (isEdit && id) {
      blogService.getBlog(id).then(blog => {
        if (blog) {
          setFormData(blog);
          setOriginalBlog(blog);
        }
      });
    } else {
      setOriginalBlog({
        title: '', slug: '', excerpt: '', content: '', coverImage: '',
        category: 'Community', tags: [], author: 'Botanical Living',
        readingTime: '5 min read', published: true, featured: false,
        seo: { title: '', description: '', keywords: [] }
      });
    }
  }, [id, isEdit]);

  const isDirty = !isEdit || (originalBlog && formData ? Object.keys(originalBlog).some(key => {
    const k = key as keyof Blog;
    if (k === 'seo') {
      return JSON.stringify(originalBlog.seo) !== JSON.stringify(formData.seo);
    }
    if (k === 'tags') {
      return JSON.stringify(originalBlog.tags) !== JSON.stringify(formData.tags);
    }
    const orig = originalBlog[k] === undefined || originalBlog[k] === null ? '' : String(originalBlog[k]).trim();
    const curr = formData[k] === undefined || formData[k] === null ? '' : String(formData[k]).trim();
    return orig !== curr;
  }) : false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSlugify = () => {
    if (formData.title) {
      setFormData(prev => ({ ...prev, slug: formData.title!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) return showToast('Title, slug and content are required', 'error');
    setIsSaving(true);
    try {
      if (isEdit && id) {
        await blogService.updateBlog(id, formData);
        showToast('Blog updated', 'success');
      } else {
        await blogService.createBlog(formData as Omit<Blog, 'id'>);
        showToast('Blog created', 'success');
      }
      navigate('/admin/blogs');
    } catch (error) {
      showToast('Failed to save blog', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/admin/blogs')} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2" size={20} /> Back to Blogs
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Blog' : 'New Blog'}</h1>
        <Button onClick={handleSubmit} disabled={isSaving || !isDirty} className={(!isDirty ? "opacity-50 cursor-not-allowed" : "")}>
          <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save Blog'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} onBlur={!isEdit ? handleSlugify : undefined} className="w-full p-2 border rounded text-lg font-medium" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full p-2 border rounded bg-stone-50 font-mono text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} className="w-full p-2 border rounded" rows={2} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
              <textarea name="content" value={formData.content} onChange={handleChange} className="w-full p-2 border rounded font-mono text-sm" rows={15} required />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <h3 className="font-bold border-b pb-2">Publishing</h3>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="published" name="published" checked={formData.published} onChange={handleChange} className="w-4 h-4" />
              <label htmlFor="published">Published</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} className="w-4 h-4" />
              <label htmlFor="featured">Featured Post</label>
            </div>
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium mb-1">Author</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reading Time</label>
              <input type="text" name="readingTime" value={formData.readingTime} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                <option value="Community">Community</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Wellness">Wellness</option>
                <option value="News">News</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <h3 className="font-bold border-b pb-2">Media</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image URL</label>
              <input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full p-2 border rounded" required />
              {formData.coverImage && (
                <img src={formData.coverImage} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
