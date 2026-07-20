import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '@/services/room.service';
import { availabilityService } from '@/services/availability.service';
import { Button } from '@/components/shared';
import { Save, ArrowLeft, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { Room } from '@/types';
import { ConfirmDialog } from '@/components/admin/dialogs/ConfirmDialog';
import { getDirectMediaUrl } from '@/utils/media';

export function RoomForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const defaultFormState: Partial<Room> = {
    title: '', slug: '', shortDescription: '', description: '', coverImage: '', gallery: [],
    price: '', priceSuffix: 'per month', occupancy: '1 Guest', roomSize: '', 
    maxCapacity: 1, currentResidents: 0, totalRooms: 5,
    amenities: [], services: [],
    published: true, featured: false, displayOrder: 0,
    seo: { title: '', description: '', keywords: [] }
  };
  
  const [formData, setFormData] = useState<Partial<Room>>(defaultFormState);
  const [originalRoom, setOriginalRoom] = useState<Partial<Room> | null>(null);
  
  const [pricingRules, setPricingRules] = useState<any>({
    basePrice: 4500,
    weekendPrice: 5500,
    extraAdultPrice: 1500,
    extraChildPrice: 750,
    discountPercent: 0,
    taxesPercent: 12,
    cleaningFee: 500,
    platformFee: 200,
    securityDeposit: 3000,
    advancePercent: 50,
    minimumStay: 1,
    maximumStay: 30,
    cancellationWindow: 24,
    refundRules: 'Cancel before 24 hours of check-in for a full refund.'
  });

  // Gallery Drag and Drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      roomService.getRoom(id).then(room => {
        if (room) {
          const formatted = { ...defaultFormState, ...room };
          setFormData(formatted);
          setOriginalRoom(formatted);
        }
      });
      availabilityService.getPricingRules(id).then(rules => {
        if (rules) {
          setPricingRules({
            basePrice: rules.basePrice ?? 4500,
            weekendPrice: rules.weekendPrice ?? 5500,
            extraAdultPrice: rules.extraAdultPrice ?? 1500,
            extraChildPrice: rules.extraChildPrice ?? 750,
            discountPercent: rules.discountPercent ?? 0,
            taxesPercent: rules.taxesPercent ?? 12,
            cleaningFee: rules.cleaningFee ?? 500,
            platformFee: rules.platformFee ?? 200,
            securityDeposit: rules.securityDeposit ?? 3000,
            advancePercent: rules.advancePercent ?? 50,
            minimumStay: rules.minimumStay ?? 1,
            maximumStay: rules.maximumStay ?? 30,
            cancellationWindow: rules.cancellationWindow ?? 24,
            refundRules: rules.refundRules ?? 'Cancel before 24 hours of check-in for a full refund.'
          });
        }
      });
    } else {
      setOriginalRoom(defaultFormState);
    }
  }, [id, isEdit]);

  const isDirty = !isEdit || (originalRoom && formData ? Object.keys(originalRoom).some(key => {
    const k = key as keyof Room;
    if (k === 'gallery') {
      const origGallery = originalRoom.gallery || [];
      const currGallery = formData.gallery || [];
      return JSON.stringify(origGallery) !== JSON.stringify(currGallery);
    }
    if (k === 'seo') {
      return JSON.stringify(originalRoom.seo) !== JSON.stringify(formData.seo);
    }
    const orig = originalRoom[k] === undefined || originalRoom[k] === null ? '' : String(originalRoom[k]).trim();
    const curr = formData[k] === undefined || formData[k] === null ? '' : String(formData[k]).trim();
    return orig !== curr;
  }) : false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      let numVal = parseInt(value) || 0;
      if (name === 'maxCapacity') {
        numVal = Math.min(2, Math.max(1, numVal));
      }
      setFormData(prev => ({ ...prev, [name]: numVal }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'price') {
        const numericPrice = parseInt(value.replace(/[^0-9]/g, '')) || 0;
        if (numericPrice > 0) {
          setPricingRules(prev => ({ ...prev, basePrice: numericPrice }));
        }
      }
    }
  };

  const handlePricingRulesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setPricingRules(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setPricingRules(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSlugify = () => {
    if (formData.title) {
      setFormData(prev => ({ ...prev, slug: formData.title!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    }
  };
  
  // Gallery URL handlers
  const handleAddGalleryUrl = () => {
    setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ''] }));
  };
  
  const handleGalleryUrlChange = (index: number, value: string) => {
    const newGallery = [...(formData.gallery || [])];
    newGallery[index] = value;
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };
  
  const handleRemoveGalleryUrl = (index: number) => {
    const newGallery = [...(formData.gallery || [])];
    newGallery.splice(index, 1);
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleDragStart = (index: number) => setDraggedIdx(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const newGallery = [...(formData.gallery || [])];
    const draggedItem = newGallery[draggedIdx];
    newGallery.splice(draggedIdx, 1);
    newGallery.splice(index, 0, draggedItem);
    
    setDraggedIdx(index);
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const isFormValid = formData.title && formData.slug && formData.description && formData.coverImage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSaving(true);
    try {
      // Filter out empty gallery urls
      const cleanedData = {
        ...formData,
        gallery: (formData.gallery || []).filter(url => url.trim() !== '')
      };
      
      if (isEdit && id) {
        await roomService.updateRoom(id, cleanedData);
        await availabilityService.savePricingRules({
          ...pricingRules,
          roomId: id
        });
        showToast('Room updated', 'success');
      } else {
        const newRoomId = await roomService.createRoom(cleanedData as Omit<Room, 'id'>);
        await availabilityService.savePricingRules({
          ...pricingRules,
          roomId: newRoomId
        });
        showToast('Room created', 'success');
      }
      navigate('/admin/rooms');
    } catch (error) {
      showToast('Failed to save room', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const confirmClear = () => {
    setFormData(defaultFormState);
    setShowClearConfirm(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <Button variant="ghost" onClick={() => navigate('/admin/rooms')} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2" size={20} /> Back to Rooms
      </Button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Room' : 'New Room'}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <h3 className="font-bold border-b pb-2">Basic Info</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Room Name *</label>
              <input type="text" name="title" value={formData.title || ''} onChange={handleChange} onBlur={!isEdit ? handleSlugify : undefined} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} className="w-full p-2 border rounded bg-stone-50 font-mono text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <textarea name="shortDescription" value={formData.shortDescription || ''} onChange={handleChange} className="w-full p-2 border rounded" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Description (Markdown) *</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-2 border rounded font-mono text-sm" rows={8} required />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <h3 className="font-bold border-b pb-2">Pricing & Capacity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input type="text" name="price" value={formData.price || ''} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price Suffix</label>
                <input type="text" name="priceSuffix" value={formData.priceSuffix || ''} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Capacity (Residents)</label>
                <input type="number" name="maxCapacity" value={formData.maxCapacity || 0} onChange={handleChange} className="w-full p-2 border rounded" min="1" max="2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Residents</label>
                <input type="number" name="currentResidents" value={formData.currentResidents || 0} onChange={handleChange} className="w-full p-2 border rounded" min="0" />
              </div>
              <div className="col-span-2">
                <div className="bg-stone-50 p-3 rounded text-sm text-stone-600 flex justify-between items-center">
                  <span>Available Slots: <strong>{Math.max(0, (formData.maxCapacity || 0) - (formData.currentResidents || 0))}</strong></span>
                  <span>(Used by Booking system to determine availability)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Occupancy (Text)</label>
                <input type="text" name="occupancy" value={formData.occupancy || ''} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Room Size</label>
                <input type="text" name="roomSize" value={formData.roomSize || ''} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Physical Rooms *</label>
                <input type="number" name="totalRooms" value={formData.totalRooms || 5} onChange={handleChange} className="w-full p-2 border rounded" min="1" required />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <h3 className="font-bold border-b pb-2 text-dark-forest">Advanced Booking & Pricing Rules</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Numeric Base Price (INR) *</label>
                <input type="number" name="basePrice" value={pricingRules.basePrice} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="1" required />
                <span className="text-[11px] text-stone-500">Must match display price for calculations</span>
              </div>
              <div>
                <label className="block font-medium mb-1">Weekend Price (INR)</label>
                <input type="number" name="weekendPrice" value={pricingRules.weekendPrice} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="1" />
              </div>
              <div>
                <label className="block font-medium mb-1">Extra Adult Price (INR)</label>
                <input type="number" name="extraAdultPrice" value={pricingRules.extraAdultPrice} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="0" />
              </div>
              <div>
                <label className="block font-medium mb-1">Extra Child Price (INR)</label>
                <input type="number" name="extraChildPrice" value={pricingRules.extraChildPrice} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="0" />
              </div>
              <div>
                <label className="block font-medium mb-1">Taxes Percent (%)</label>
                <input type="number" name="taxesPercent" value={pricingRules.taxesPercent} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="0" max="100" />
              </div>
              <div>
                <label className="block font-medium mb-1">Discount Percent (%)</label>
                <input type="number" name="discountPercent" value={pricingRules.discountPercent} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="0" max="100" />
              </div>
              <div>
                <label className="block font-medium mb-1">Cleaning Fee (INR)</label>
                <input type="number" name="cleaningFee" value={pricingRules.cleaningFee} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="0" />
              </div>
              <div>
                <label className="block font-medium mb-1">Platform Concierge Fee (INR)</label>
                <input type="number" name="platformFee" value={pricingRules.platformFee} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="0" />
              </div>
              <div>
                <label className="block font-medium mb-1">Security Deposit (INR)</label>
                <input type="number" name="securityDeposit" value={pricingRules.securityDeposit} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="0" />
              </div>
              <div>
                <label className="block font-medium mb-1">Advance Percent required (%)</label>
                <input type="number" name="advancePercent" value={pricingRules.advancePercent} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="0" max="100" />
              </div>
              <div>
                <label className="block font-medium mb-1">Minimum Stay (Nights)</label>
                <input type="number" name="minimumStay" value={pricingRules.minimumStay} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="1" />
              </div>
              <div>
                <label className="block font-medium mb-1">Maximum Stay (Nights)</label>
                <input type="number" name="maximumStay" value={pricingRules.maximumStay} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" min="1" />
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-1">Refund Policy / Rules text</label>
                <input type="text" name="refundRules" value={pricingRules.refundRules} onChange={handlePricingRulesChange} className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>
          
          {/* Dynamic Gallery URL Editor */}
          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold">Gallery URLs</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddGalleryUrl}>
                <Plus size={16} className="mr-1" /> Add Image
              </Button>
            </div>
            
            <div className="space-y-3 mt-4">
              {(formData.gallery || []).map((url, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3 bg-stone-50 border rounded group"
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="mt-2 cursor-grab text-stone-400 hover:text-stone-700">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      className="w-full p-2 border rounded text-sm"
                      value={url}
                      onChange={(e) => handleGalleryUrlChange(idx, e.target.value)}
                    />
                  </div>
                  
                  {url ? (
                    <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden border">
                      <img src={getDirectMediaUrl(url)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-12 flex-shrink-0 rounded border border-dashed flex items-center justify-center text-stone-300">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  
                  <button 
                    type="button"
                    onClick={() => handleRemoveGalleryUrl(idx)}
                    className="mt-2 text-stone-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              {(!formData.gallery || formData.gallery.length === 0) && (
                <div className="text-center p-6 border border-dashed rounded text-stone-500 text-sm">
                  No gallery images added yet. Click 'Add Image' to start.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <h3 className="font-bold border-b pb-2">Publishing</h3>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="published" name="published" checked={formData.published !== false} onChange={handleChange} className="w-4 h-4 rounded text-forest" />
              <label htmlFor="published" className="font-medium">Published</label>
            </div>
            <p className="text-xs text-stone-500 ml-6 -mt-3">Uncheck to save as draft.</p>
            
            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" id="featured" name="featured" checked={formData.featured === true} onChange={handleChange} className="w-4 h-4 rounded text-forest" />
              <label htmlFor="featured">Featured Room</label>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-card shadow space-y-4">
            <h3 className="font-bold border-b pb-2">Cover Image</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Cover Image URL *</label>
              <input type="url" name="coverImage" value={formData.coverImage || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
              {formData.coverImage ? (
                <img src={getDirectMediaUrl(formData.coverImage)} alt="Preview" className="mt-2 w-full h-40 object-cover rounded border" />
              ) : (
                <div className="mt-2 w-full h-40 bg-stone-100 rounded border flex items-center justify-center text-stone-400">
                  No Cover Image
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
      
      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t p-4 px-8 flex justify-between items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setShowClearConfirm(true)}>
          Clear Form
        </Button>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/admin/rooms')}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || !isDirty || isSaving}
            className={(!isFormValid || !isDirty) ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Save size={16} className="mr-2" /> 
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
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
