import { useState, useEffect } from 'react';
import { useHomepage } from '@/hooks/useHomepage';
import { Button } from '@/components/shared';
import { Save } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { HomepageConfig } from '@/services/homepage.service';

export function HomepageCMS() {
  const { config, loading, updateConfig } = useHomepage();
  const [formData, setFormData] = useState<HomepageConfig | null>(null);
  const [highlightsText, setHighlightsText] = useState('');
  const [services, setServices] = useState<{ id: string; title: string; description: string; icon: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (config) {
      setFormData(config);
      setHighlightsText((config.diningHighlights || []).join('\n'));
      setServices(config.services || []);
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const isDirty = formData && config ? (
    Object.keys(config).some(key => {
      const k = key as keyof HomepageConfig;
      if (k === 'diningHighlights') {
        const currentHighlights = highlightsText.split('\n').map(h => h.trim()).filter(Boolean);
        const originalHighlights = config.diningHighlights || [];
        return JSON.stringify(currentHighlights) !== JSON.stringify(originalHighlights);
      }
      if (k === 'services') {
        return JSON.stringify(services) !== JSON.stringify(config.services || []);
      }
      const originalValue = config[k] === undefined || config[k] === null ? '' : String(config[k]).trim();
      const currentValue = formData[k] === undefined || formData[k] === null ? '' : String(formData[k]).trim();
      return originalValue !== currentValue;
    })
  ) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    try {
      const updatedConfig = {
        ...formData,
        diningHighlights: highlightsText.split('\n').map(h => h.trim()).filter(Boolean),
        services: services
      };
      await updateConfig(updatedConfig);
      showToast('Homepage updated successfully', 'success');
    } catch (error: any) {
      showToast('Failed to update homepage: ' + (error.message || error), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !formData) return <div className="p-8 text-center text-text-secondary">Loading Homepage Configuration...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-heading text-dark-forest font-medium">Homepage Editor</h1>
          <p className="text-sm text-text-secondary mt-1">Adjust and publish all content on the Botanical Living homepage</p>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving || !isDirty} className={`shadow-md ${!isDirty ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. HERO SECTION */}
        <section className="bg-white p-6 rounded-card border border-border/40 shadow-sm space-y-5">
          <h2 className="text-lg font-heading text-dark-forest font-semibold border-b border-border/40 pb-2">1. Hero Cinematic Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Hero Title</label>
              <input type="text" name="heroTitle" value={formData.heroTitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Hero Subtitle</label>
              <textarea name="heroSubtitle" value={formData.heroSubtitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" rows={2} required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Hero Cinematic Video URL</label>
              <input type="text" name="heroVideoUrl" value={formData.heroVideoUrl || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" placeholder="Paste direct .mp4, YouTube, Vimeo, or Google Drive URL" required />
              <p className="text-[10px] text-text-secondary/60 mt-1">Supports direct .mp4/webm links, YouTube watch/embed links, Vimeo, and Google Drive sharing previews.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Primary Button Text</label>
                <input type="text" name="heroPrimaryBtnText" value={formData.heroPrimaryBtnText || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Secondary Button Text</label>
                <input type="text" name="heroSecondaryBtnText" value={formData.heroSecondaryBtnText || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
            </div>
          </div>
        </section>

        {/* 2. OUR STORY SECTION */}
        <section className="bg-white p-6 rounded-card border border-border/40 shadow-sm space-y-5">
          <h2 className="text-lg font-heading text-dark-forest font-semibold border-b border-border/40 pb-2">2. Our Story / Philosophy</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Section Title</label>
                <input type="text" name="storyTitle" value={formData.storyTitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Section Subtitle</label>
                <input type="text" name="storySubtitle" value={formData.storySubtitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Story Paragraph 1</label>
              <textarea name="storyParagraph1" value={formData.storyParagraph1 || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" rows={3} required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Story Paragraph 2 (Optional)</label>
              <textarea name="storyParagraph2" value={formData.storyParagraph2 || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Story Illustration/Image URL</label>
              <input type="url" name="storyImageUrl" value={formData.storyImageUrl || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
            </div>
          </div>
        </section>

        {/* 3. ORGANIC DINING SECTION */}
        <section className="bg-white p-6 rounded-card border border-border/40 shadow-sm space-y-5">
          <h2 className="text-lg font-heading text-dark-forest font-semibold border-b border-border/40 pb-2">3. Gastronomy & Dining</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Dining Section Title</label>
                <input type="text" name="diningTitle" value={formData.diningTitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Dining Section Subtitle</label>
                <input type="text" name="diningSubtitle" value={formData.diningSubtitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Dining Description</label>
              <textarea name="diningDescription" value={formData.diningDescription || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" rows={3} required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Dining Highlights (One per line)</label>
              <textarea value={highlightsText} onChange={e => setHighlightsText(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm font-mono" rows={4} placeholder="e.g.&#10;Freshly Prepared Homely Meals Daily&#10;Nutritionally Balanced Diet Plans&#10;6 Days Premium Non-Veg Dishes Weekly" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Dining Showcase Image URL</label>
              <input type="url" name="diningImageUrl" value={formData.diningImageUrl || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
            </div>
          </div>
        </section>

        {/* 4. INCLUDED SERVICES */}
        <section className="bg-white p-6 rounded-card border border-border/40 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-border/40 pb-2">
            <h2 className="text-lg font-heading text-dark-forest font-semibold">4. Included Services Cards</h2>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setServices([...services, { id: String(Date.now()), title: 'New Service', description: 'Service description...', icon: 'sparkles' }])}
            >
              + Add Service
            </Button>
          </div>
          
          <div className="space-y-4">
            {services.map((srv, idx) => (
              <div key={srv.id || idx} className="p-4 border border-border/40 rounded-lg bg-stone-50 space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => setServices(services.filter(s => s.id !== srv.id))}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-xs font-semibold outline-none"
                >
                  Delete Card
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Service Title</label>
                    <input 
                      type="text" 
                      value={srv.title} 
                      onChange={(e) => {
                        const updated = [...services];
                        updated[idx].title = e.target.value;
                        setServices(updated);
                      }}
                      className="w-full p-2 border rounded bg-white text-sm" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Icon wrapper Name</label>
                    <select 
                      value={srv.icon} 
                      onChange={(e) => {
                        const updated = [...services];
                        updated[idx].icon = e.target.value;
                        setServices(updated);
                      }}
                      className="w-full p-2 border rounded bg-white text-sm"
                    >
                      <option value="sparkles">sparkles</option>
                      <option value="wifi">wifi</option>
                      <option value="coffee">coffee</option>
                      <option value="shield">shield</option>
                      <option value="heart">heart</option>
                      <option value="tv">tv</option>
                      <option value="key">key</option>
                      <option value="utensils">utensils</option>
                      <option value="wind">wind (AC)</option>
                      <option value="bath">bath</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Service Description</label>
                  <input 
                    type="text" 
                    value={srv.description} 
                    onChange={(e) => {
                      const updated = [...services];
                      updated[idx].description = e.target.value;
                      setServices(updated);
                    }}
                    className="w-full p-2 border rounded bg-white text-sm" 
                    required 
                  />
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-sm text-text-secondary italic text-center py-4">No services defined. Click "Add Service" to create one.</p>
            )}
          </div>
        </section>

        {/* 5. LOCATION & MAP SECTION */}
        <section className="bg-white p-6 rounded-card border border-border/40 shadow-sm space-y-5">
          <h2 className="text-lg font-heading text-dark-forest font-semibold border-b border-border/40 pb-2">5. Location Oasis & Connectivity</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Location Title</label>
                <input type="text" name="locationTitle" value={formData.locationTitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Location Subtitle</label>
                <input type="text" name="locationSubtitle" value={formData.locationSubtitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Physical Address</label>
              <input type="text" name="locationAddress" value={formData.locationAddress || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Google Maps Embed URL (iframe src)</label>
              <input type="text" name="locationMapEmbedUrl" value={formData.locationMapEmbedUrl || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              <p className="text-[10px] text-text-secondary/60 mt-1">Provide the src attribute of the Google Maps iframe embed code.</p>
            </div>
          </div>
        </section>

        {/* 6. VIRTUAL TOUR SECTION */}
        <section className="bg-white p-6 rounded-card border border-border/40 shadow-sm space-y-5">
          <h2 className="text-lg font-heading text-dark-forest font-semibold border-b border-border/40 pb-2">6. Virtual Tour</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Tour Title</label>
                <input type="text" name="tourTitle" value={formData.tourTitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Tour Subtitle</label>
                <input type="text" name="tourSubtitle" value={formData.tourSubtitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">Tour Video/Showcase Media URL</label>
              <input type="text" name="tourVideoUrl" value={formData.tourVideoUrl || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" placeholder="Direct .mp4, YouTube, Vimeo or virtual tour embed URL" required />
              <p className="text-[10px] text-text-secondary/60 mt-1">This video showcases the virtual walkthrough of your suites.</p>
            </div>
          </div>
        </section>

        {/* 7. CALL TO ACTION SECTION */}
        <section className="bg-white p-6 rounded-card border border-border/40 shadow-sm space-y-5">
          <h2 className="text-lg font-heading text-dark-forest font-semibold border-b border-border/40 pb-2">7. Final Call to Action</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">CTA Title</label>
                <input type="text" name="ctaTitle" value={formData.ctaTitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">CTA Button Text</label>
                <input type="text" name="ctaButtonText" value={formData.ctaButtonText || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">CTA Subtitle</label>
              <textarea name="ctaSubtitle" value={formData.ctaSubtitle || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-gold-accent outline-none text-sm" rows={2} required />
            </div>
          </div>
        </section>

      </form>
    </div>
  );
}
export default HomepageCMS;
