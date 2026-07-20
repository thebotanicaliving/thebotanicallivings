import { useState } from 'react';
import { useBlogs } from '@/hooks/useBlogs';
import { Button } from '@/components/shared';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { blogService } from '@/services/blog.service';
import { useToast } from '@/providers/ToastProvider';
import { ConfirmDialog } from '@/components/admin/dialogs/ConfirmDialog';

export function BlogsList() {
  const { blogs, loading, refresh } = useBlogs(true); // true to include unpublished
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await blogService.deleteBlog(deleteId);
      showToast('Blog deleted', 'success');
      refresh();
    } catch (error) {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      await blogService.updateBlog(id, { published: !published });
      showToast(!published ? 'Published' : 'Unpublished', 'success');
      refresh();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading blogs...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <Button onClick={() => navigate('/admin/blogs/new')}>
          <Plus size={20} className="mr-2" /> New Blog
        </Button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-card shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-card shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-stone-600">Title</th>
              <th className="p-4 font-semibold text-stone-600">Category</th>
              <th className="p-4 font-semibold text-stone-600">Status</th>
              <th className="p-4 font-semibold text-stone-600">Date</th>
              <th className="p-4 font-semibold text-stone-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-stone-500">No blogs found.</td></tr>
            ) : filtered.map((blog) => (
              <tr key={blog.id} className="border-b hover:bg-stone-50/50">
                <td className="p-4">
                  <div className="font-medium">{blog.title}</div>
                  <div className="text-sm text-stone-500">{blog.author}</div>
                </td>
                <td className="p-4 text-sm">{blog.category}</td>
                <td className="p-4">
                  <button 
                    onClick={() => handleTogglePublish(blog.id!, blog.published)}
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      blog.published ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {blog.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="p-4 text-sm">{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/blogs/${blog.id}/edit`)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteId(blog.id!)}>
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Blog"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDestructive={true}
      />
    </div>
  );
}
