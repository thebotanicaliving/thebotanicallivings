import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { useRooms } from '@/hooks/useRooms';
import { Button } from '@/components/shared';
import { Plus, Trash2, Edit2, Star } from 'lucide-react';
import { reviewsService } from '@/services/reviews.service';
import { useToast } from '@/providers/ToastProvider';
import { ConfirmDialog } from '@/components/admin/dialogs/ConfirmDialog';
import { ReviewItem } from '@/types';

export function ReviewCMS() {
  const { reviews, loading, error, refresh } = useReviews();
  const { rooms } = useRooms();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<ReviewItem>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const roomTypes = rooms.length > 0 ? rooms.map(r => r.title) : ['Single Suite', 'Two Sharing', 'Three Sharing', 'Executive Room'];

  const isFormValid = 
    formData.name && formData.name.trim() !== '' && 
    formData.role && formData.role.trim() !== '' && 
    formData.quote && formData.quote.trim() !== '';

  const originalItem = editingId ? reviews.find(item => item.id === editingId) : null;
  const isFormDirty = isAdding 
    ? (formData.name && formData.name.trim() !== '')
    : (editingId && originalItem ? (
        Object.keys(formData).some(key => {
          const k = key as keyof ReviewItem;
          if (k === 'id') return false;
          const orig = originalItem[k] === undefined || originalItem[k] === null ? '' : String(originalItem[k]).trim();
          const curr = formData[k] === undefined || formData[k] === null ? '' : String(formData[k]).trim();
          return orig !== curr;
        })
      ) : false);

  const handleSave = async () => {
    if (!isFormValid) return;
    try {
      const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';
      const date = formData.date || new Date().toISOString().split('T')[0];

      if (isAdding) {
        const itemToSave = {
          ...formData,
          initials: formData.initials || initials,
          date,
          displayOrder: formData.displayOrder ?? reviews.length + 1,
          published: formData.published ?? true,
          rating: formData.rating ?? 5,
          stayType: formData.stayType || roomTypes[0]
        } as Omit<ReviewItem, 'id'>;
        
        await reviewsService.createReview(itemToSave);
        showToast('Review added successfully', 'success');
      } else if (editingId) {
        await reviewsService.updateReview(editingId, {
          ...formData,
          initials: formData.initials || initials,
          date
        });
        showToast('Review updated successfully', 'success');
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({});
      refresh();
    } catch (error) {
      showToast('Failed to save review', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await reviewsService.deleteReview(deleteId);
      showToast('Review deleted successfully', 'success');
      refresh();
    } catch (error) {
      showToast('Failed to delete review', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = (item: ReviewItem) => {
    setEditingId(item.id!);
    setFormData(item);
    setIsAdding(false);
  };
  
  const handleClear = () => {
    setShowClearConfirm(true);
  };
  
  const confirmClear = () => {
    setFormData({
      published: true,
      rating: 5,
      date: new Date().toISOString().split('T')[0],
      stayType: roomTypes[0],
      displayOrder: reviews.length + 1
    });
    setShowClearConfirm(false);
  };

  if (loading) return <div className="p-8">Loading reviews...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reviews & Testimonials CMS</h1>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); confirmClear(); }}>
          <Plus size={20} className="mr-2" /> Add New Review
        </Button>
      </div>

      {(isAdding || editingId) && (
        <div className="mb-8 bg-white p-6 rounded-card shadow">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">
            {isAdding ? 'Add New Review Card' : 'Edit Review Card'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Author Name *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    value={formData.name || ''} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                    placeholder="e.g. Rahul V."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author Role / Profession *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    value={formData.role || ''} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                    required
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Review Quote *</label>
                <textarea 
                  className="w-full p-2 border rounded h-24" 
                  value={formData.quote || ''} 
                  onChange={(e) => setFormData({...formData, quote: e.target.value})} 
                  required
                  placeholder="Paste the resident's testimonial here..."
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Room Type</label>
                  <select 
                    className="w-full p-2 border rounded bg-white" 
                    value={formData.stayType || roomTypes[0]} 
                    onChange={(e) => setFormData({...formData, stayType: e.target.value})}
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating Stars</label>
                  <select 
                    className="w-full p-2 border rounded bg-white" 
                    value={formData.rating || 5} 
                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value) || 5})}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    value={formData.displayOrder || 0} 
                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Initials (Auto-Gen if empty)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    value={formData.initials || ''} 
                    onChange={(e) => setFormData({...formData, initials: e.target.value.toUpperCase().slice(0, 2)})} 
                    placeholder="e.g. RV"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={formData.published !== false} 
                    onChange={(e) => setFormData({...formData, published: e.target.checked})} 
                    className="w-4 h-4 rounded border-gray-300 text-forest" 
                  />
                  <span className="text-sm font-medium text-gray-700">Published</span>
                </label>
              </div>
            </div>
          </div>
          
          {(formData.name || formData.quote) && (
            <div className="mb-6 border-t pt-4">
              <label className="block text-sm font-medium mb-2">Live Card Preview</label>
              <div className="w-[380px] bg-white border border-border/40 rounded-[20px] p-6 flex flex-col justify-between h-[230px] shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-gold-accent">
                    {[...Array(formData.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-current" />
                    ))}
                  </div>
                </div>
                <p className="font-sans text-stone-700 text-xs leading-relaxed font-light italic mt-3 mb-4 flex-grow line-clamp-4">
                  "{formData.quote || 'Review text will appear here...'}"
                </p>
                <div className="flex items-center space-x-3 pt-3 border-t border-border/20">
                  <div className="h-10 w-10 rounded-full bg-olive/10 text-olive text-xs font-semibold flex items-center justify-center shrink-0">
                    {formData.initials || (formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??')}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif text-sm text-dark-forest font-semibold truncate">
                      {formData.name || 'Author Name'}
                    </h4>
                    <span className="font-sans text-[11px] text-stone-500 block truncate">
                      {formData.role || 'Role'} • <span className="text-gold-accent">{formData.stayType || roomTypes[0]}</span>
                    </span>
                  </div>
                </div>
              </div>
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
                Save Review
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reviews.map((item) => (
          <div key={item.id} className={`bg-white rounded-card shadow-sm border p-6 flex flex-col justify-between h-[280px] relative group ${item.published === false ? 'opacity-60 border-dashed border-stone-300' : 'border-transparent'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-gold-accent">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-current" />
                ))}
              </div>
              <span className="text-[10px] text-stone-500 font-mono">Order: {item.displayOrder}</span>
            </div>

            <p className="font-sans text-stone-700 text-xs leading-relaxed font-light italic mt-3 mb-4 flex-grow line-clamp-4">
              "{item.quote}"
            </p>

            <div className="flex items-center space-x-3 pt-3 border-t border-border/20">
              <div className="h-10 w-10 rounded-full bg-olive/10 text-olive text-xs font-semibold flex items-center justify-center shrink-0">
                {item.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-serif text-sm text-dark-forest font-semibold truncate">
                  {item.name}
                </h4>
                <span className="font-sans text-[11px] text-stone-500 block truncate">
                  {item.role} • <span className="text-gold-accent">{item.stayType}</span>
                </span>
              </div>
            </div>

            {/* Admin Controls Overlay on Hover */}
            <div className="absolute inset-0 bg-black/60 rounded-card opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-black" onClick={() => startEdit(item)}>
                <Edit2 size={16} />
              </Button>
              <Button variant="outline" className="bg-red-500/10 text-white border-red-500/20 hover:bg-red-500" onClick={() => setDeleteId(item.id!)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
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
export default ReviewCMS;
