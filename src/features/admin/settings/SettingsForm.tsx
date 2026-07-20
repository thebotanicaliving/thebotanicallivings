import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/shared';
import { Save } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { BusinessSettings } from '@/services/settings.service';

export function SettingsForm() {
  const { settings, loading, updateSettings } = useSettings();
  const [formData, setFormData] = useState<BusinessSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const isDirty = formData && settings ? Object.keys(settings).some(key => {
    const k = key as keyof BusinessSettings;
    if (k === 'heroVideoUrl') return false; // Ignore heroVideoUrl completely in Business Settings
    const originalValue = settings[k] === undefined || settings[k] === null ? '' : String(settings[k]).trim();
    const currentValue = formData[k] === undefined || formData[k] === null ? '' : String(formData[k]).trim();
    return originalValue !== currentValue;
  }) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    try {
      await updateSettings(formData);
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !formData) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Business Settings</h1>
        <Button onClick={handleSubmit} disabled={isSaving || !isDirty} className={(!isDirty ? "opacity-50 cursor-not-allowed" : "")}>
          <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <section className="bg-white p-6 rounded-card shadow">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hotel Name</label>
              <input type="text" name="hotelName" value={formData.hotelName || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <input type="text" name="tagline" value={formData.tagline || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Primary Email</label>
              <input type="email" name="primaryEmail" value={formData.primaryEmail || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
              <input type="text" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Business Hours</label>
              <input type="text" name="businessHours" value={formData.businessHours || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea name="address" value={formData.address || ''} onChange={handleChange} className="w-full p-2 border rounded" rows={2} required />
            </div>
          </div>
        </section>

        {/* Branding & Media */}
        <section className="bg-white p-6 rounded-card shadow">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Branding, Media & Social URLs</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL (Icon)</label>
                <input type="url" name="logoUrl" value={formData.logoUrl || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Wordmark URL (Text Logo)</label>
                <input type="url" name="wordmarkUrl" value={formData.wordmarkUrl || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Virtual Tour URL</label>
                <input type="url" name="virtualTour" value={formData.virtualTour || ''} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Google Maps Embed URL</label>
                <input type="url" name="googleMapsEmbed" value={formData.googleMapsEmbed || ''} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
            </div>
            
            {/* Social Media Fields */}
            <div className="border-t border-border/40 pt-4 mt-2 space-y-4">
              <h3 className="text-md font-semibold text-dark-forest">Social Media Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram URL</label>
                  <input type="url" name="instagram" value={formData.instagram || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook URL</label>
                  <input type="url" name="facebook" value={formData.facebook || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                  <input type="url" name="linkedin" value={formData.linkedin || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">YouTube URL</label>
                  <input type="url" name="youtube" value={formData.youtube || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Twitter/X URL</label>
                  <input type="url" name="twitter" value={formData.twitter || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://twitter.com/..." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Defaults */}
        <section className="bg-white p-6 rounded-card shadow">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">SEO Defaults</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website Title</label>
              <input type="text" name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea name="seoDescription" value={formData.seoDescription || ''} onChange={handleChange} className="w-full p-2 border rounded" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keywords</label>
              <input type="text" name="seoKeywords" value={formData.seoKeywords || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
        </section>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || !isDirty} className={(!isDirty ? "opacity-50 cursor-not-allowed" : "")}>
            <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
