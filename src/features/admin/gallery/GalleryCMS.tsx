import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { useState } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { Button } from '@/components/shared';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { galleryService } from '@/services/gallery.service';
import { useToast } from '@/providers/ToastProvider';
import { ConfirmDialog } from '@/components/admin/dialogs/ConfirmDialog';
import { GalleryItem } from '@/types';

export function GalleryCMS() {
  const { gallery, loading, error, refresh } = useGallery();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Helper to map video URLs to a gorgeous botanical thumbnail
  const getVideoThumbnail = (title: string, category: string) => {
    const t = (title || category || '').toLowerCase();
    if (t.includes('courtyard')) {
      return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600&auto=format&fit=crop';
    }
    if (t.includes('greenhouse') || t.includes('garden')) {
      return 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600&auto=format&fit=crop';
    }
    if (t.includes('kitchen') || t.includes('dining')) {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600&auto=format&fit=crop';
  };

  const isFormValid = formData.imageUrl && formData.imageUrl.trim() !== '' && formData.category;

  const originalItem = editingId ? gallery.find(item => item.id === editingId) : null;
  const isFormDirty = isAdding 
    ? (formData.imageUrl && formData.imageUrl.trim() !== '')
    : (editingId && originalItem ? (
        Object.keys(formData).some(key => {
          const k = key as keyof GalleryItem;
          if (k === 'id') return false;
          const orig = originalItem[k] === undefined || originalItem[k] === null ? '' : String(originalItem[k]).trim();
          const curr = formData[k] === undefined || formData[k] === null ? '' : String(formData[k]).trim();
          return orig !== curr;
        })
      ) : false);

  const handleSave = async () => {
    if (!isFormValid) return;
    try {
      if (isAdding) {
        const itemToSave = {
          ...formData,
          displayOrder: formData.displayOrder ?? gallery.length + 1,
          published: formData.published ?? true,
          type: formData.type ?? 'image',
          category: formData.category || 'Exterior',
        } as Omit<GalleryItem, 'id'>;
        
        await galleryService.createGalleryItem(itemToSave);
        showToast('Image added', 'success');
      } else if (editingId) {
        await galleryService.updateGalleryItem(editingId, formData);
        showToast('Image updated', 'success');
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({});
      refresh();
    } catch (error) {
      showToast('Failed to save', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await galleryService.deleteGalleryItem(deleteId);
      showToast('Image deleted', 'success');
      refresh();
    } catch (error) {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id!);
    setFormData(item);
    setIsAdding(false);
  };
  
  const handleClear = () => {
    setShowClearConfirm(true);
  }
  
  const confirmClear = () => {
    setFormData({
      published: true,
      category: 'Exterior',
      type: 'image',
      displayOrder: gallery.length + 1
    });
    setShowClearConfirm(false);
  }

  if (loading) return <div className="p-8">Loading gallery...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery CMS</h1>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); confirmClear(); }}>
          <Plus size={20} className="mr-2" /> Add Image URL
        </Button>
      </div>

      {(isAdding || editingId) && (
        <div className="mb-8 bg-white p-6 rounded-card shadow">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">{isAdding ? 'Add New Image' : 'Edit Image'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL *</label>
                <input type="url" className="w-full p-2 border rounded" value={formData.imageUrl || ''} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title (Optional)</label>
                  <input type="text" className="w-full p-2 border rounded" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Caption (Optional)</label>
                  <input type="text" className="w-full p-2 border rounded" value={formData.caption || ''} onChange={(e) => setFormData({...formData, caption: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select className="w-full p-2 border rounded bg-white" value={formData.category || 'Exterior'} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="Exterior">Exterior</option>
                  <option value="Interior">Interior</option>
                  <option value="Common Areas">Common Areas</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Rooms">Rooms</option>
                  <option value="Dining">Dining</option>
                  <option value="Cafe">Cafe</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Media Type</label>
                  <select className="w-full p-2 border rounded bg-white" value={formData.type || 'image'} onChange={(e) => setFormData({...formData, type: e.target.value as any})}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input type="number" className="w-full p-2 border rounded" value={formData.displayOrder || 0} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.published !== false} onChange={(e) => setFormData({...formData, published: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-forest" />
                  <span className="text-sm font-medium text-gray-700">Published</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.featured === true} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-forest" />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          </div>
          
          {formData.imageUrl && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Preview</label>
              {formData.type === 'video' ? (
                <VideoPlayer url={formData.imageUrl} autoPlay={false} controls={true} className="w-full h-48 rounded-image object-cover border" />
              ) : (
                <img src={formData.imageUrl} alt="Preview" className="h-48 rounded-image object-cover border" />
              )}
            </div>
          )}

          <div className="flex justify-between items-center border-t pt-4">
            <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={handleClear}>Clear Form</Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={!isFormValid || !isFormDirty}
                className={(!isFormValid || !isFormDirty) ? "opacity-50 cursor-not-allowed" : ""}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <div key={item.id} className={`bg-white rounded-card shadow overflow-hidden group border ${item.published === false ? 'opacity-60 border-dashed' : 'border-transparent'}`}>
            <div className="aspect-[4/3] relative bg-stone-100">
              {item.type === 'video' ? (
                <div className="w-full h-full relative">
                  <img src={getVideoThumbnail(item.title || '', item.category || '')} alt={item.caption || item.category} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>VIDEO</span>
                  </div>
                </div>
              ) : (
                <img src={item.imageUrl} alt={item.caption || item.category} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
              
              {!item.published && (
                <div className="absolute top-2 left-2 bg-stone-800 text-white text-xs px-2 py-1 rounded font-medium">
                  Draft
                </div>
              )}
              {item.featured && (
                <div className="absolute top-2 right-2 bg-gold-accent text-dark-forest text-xs px-2 py-1 rounded font-bold">
                  Featured
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-black" onClick={() => startEdit(item)}>
                  <Edit2 size={16} />
                </Button>
                <Button variant="outline" className="bg-red-500/10 text-white border-red-500/20 hover:bg-red-500" onClick={() => setDeleteId(item.id!)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-forest/10 px-2 py-1 rounded">{item.category}</span>
                    <span className="text-[10px] text-stone-500 font-mono">Ord: {item.displayOrder || 0}</span>
                  </div>
                  <h4 className="font-medium text-sm text-dark-forest line-clamp-1">{item.title || 'Untitled'}</h4>
                  <p className="mt-1 text-xs text-stone-500 line-clamp-2">{item.caption || 'No caption'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Image"
        message="Are you sure you want to remove this media from the gallery?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDestructive={true}
      />
      
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Form"
        message="Are you sure you want to clear all form fields? This cannot be undone."
        onConfirm={confirmClear}
        onCancel={() => setShowClearConfirm(false)}
        isDestructive={true}
      />
    </div>
  );
}
