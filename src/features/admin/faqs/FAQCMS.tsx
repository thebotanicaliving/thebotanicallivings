import { useState } from 'react';
import { useFAQ } from '@/hooks/useFAQ';
import { Button } from '@/components/shared';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { faqService } from '@/services/faq.service';
import { useToast } from '@/providers/ToastProvider';
import { ConfirmDialog } from '@/components/admin/dialogs/ConfirmDialog';
import { FAQItem } from '@/types';

export function FAQCMS() {
  const { faqs, loading, refresh } = useFAQ();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQItem>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { showToast } = useToast();

  const isFormValid = formData.question && formData.question.trim() !== '' && 
                      formData.answer && formData.answer.trim() !== '' && 
                      formData.category;

  const originalFAQ = editingId ? faqs.find(f => f.id === editingId) : null;
  const isFormDirty = isAdding
    ? (formData.question?.trim() || formData.answer?.trim())
    : (editingId && originalFAQ ? (
        Object.keys(formData).some(key => {
          const k = key as keyof FAQItem;
          if (k === 'id') return false;
          const orig = originalFAQ[k] === undefined || originalFAQ[k] === null ? '' : String(originalFAQ[k]).trim();
          const curr = formData[k] === undefined || formData[k] === null ? '' : String(formData[k]).trim();
          return orig !== curr;
        })
      ) : false);

  const handleSave = async () => {
    if (!isFormValid) return;
    try {
      if (isAdding) {
        await faqService.createFAQItem({ 
          ...formData, 
          displayOrder: formData.displayOrder ?? faqs.length,
          published: formData.published ?? true,
          category: formData.category || 'general'
        } as Omit<FAQItem, 'id'>);
        showToast('FAQ added', 'success');
      } else if (editingId) {
        await faqService.updateFAQItem(editingId, formData);
        showToast('FAQ updated', 'success');
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
      await faqService.deleteFAQItem(deleteId);
      showToast('FAQ deleted', 'success');
      refresh();
    } catch (error) {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = (item: FAQItem) => {
    setEditingId(item.id!);
    setFormData(item);
    setIsAdding(false);
  };
  
  const handleClear = () => {
    setShowClearConfirm(true);
  }
  
  const confirmClear = () => {
    setFormData({ published: true, category: 'general', displayOrder: faqs.length });
    setShowClearConfirm(false);
  }

  if (loading) return <div className="p-8">Loading FAQs...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FAQ CMS</h1>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); confirmClear(); }}>
          <Plus size={20} className="mr-2" /> Add FAQ
        </Button>
      </div>

      {(isAdding || editingId) && (
        <div className="mb-8 bg-white p-6 rounded-card shadow">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">{isAdding ? 'Add New FAQ' : 'Edit FAQ'}</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Question *</label>
              <input type="text" className="w-full p-2 border rounded" value={formData.question || ''} onChange={(e) => setFormData({...formData, question: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer *</label>
              <textarea className="w-full p-2 border rounded" rows={3} value={formData.answer || ''} onChange={(e) => setFormData({...formData, answer: e.target.value})} required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select className="w-full p-2 border rounded bg-white" value={formData.category || 'general'} onChange={(e) => setFormData({...formData, category: e.target.value as any})}>
                  <option value="general">General</option>
                  <option value="rooms">Rooms</option>
                  <option value="dining">Dining</option>
                  <option value="amenities">Amenities</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.displayOrder || 0} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input type="checkbox" id="published" checked={formData.published !== false} onChange={(e) => setFormData({...formData, published: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-forest" />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
              </div>
            </div>
          </div>
          
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

      <div className="bg-white rounded-card shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-stone-600 w-16">Ord</th>
              <th className="p-4 font-semibold text-stone-600">Question</th>
              <th className="p-4 font-semibold text-stone-600">Category</th>
              <th className="p-4 font-semibold text-stone-600">Status</th>
              <th className="p-4 font-semibold text-stone-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id} className={`border-b hover:bg-stone-50/50 ${faq.published === false ? 'opacity-60' : ''}`}>
                <td className="p-4 text-sm font-mono text-stone-500">{faq.displayOrder || 0}</td>
                <td className="p-4">
                  <div className="font-medium text-dark-forest">{faq.question}</div>
                  <div className="text-sm text-stone-500 truncate max-w-md">{faq.answer}</div>
                </td>
                <td className="p-4 text-sm capitalize">{faq.category}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${faq.published ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-800'}`}>
                    {faq.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(faq)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteId(faq.id!)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-stone-500">
                  No FAQs found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ?"
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
