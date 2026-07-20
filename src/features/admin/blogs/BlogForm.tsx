import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService } from '@/services/blog.service';
import { Button } from '@/components/shared';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Type, 
  Image as ImageIcon, 
  Quote, 
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import { Blog, BlogSection } from '@/types';
import { getDirectMediaUrl } from '@/utils/media';

export function BlogForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<'classic' | 'sections'>('sections');
  
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '', 
    slug: '', 
    excerpt: '', 
    content: '', 
    coverImage: '',
    category: 'Community', 
    tags: [], 
    author: 'Botanical Living',
    readingTime: '5 min read', 
    published: true, 
    featured: false,
    seo: { title: '', description: '', keywords: [] },
    sections: []
  });

  const [sections, setSections] = useState<BlogSection[]>([]);
  const [originalBlog, setOriginalBlog] = useState<Partial<Blog> | null>(null);

  // Fetch blog data
  useEffect(() => {
    if (isEdit && id) {
      blogService.getBlog(id).then(blog => {
        if (blog) {
          setFormData(blog);
          setOriginalBlog(blog);
          if (blog.sections && blog.sections.length > 0) {
            setSections(blog.sections);
            setEditorMode('sections');
          } else {
            setSections([]);
            setEditorMode('classic');
          }
        }
      });
    } else {
      const defaultVal = {
        title: '', 
        slug: '', 
        excerpt: '', 
        content: '', 
        coverImage: '',
        category: 'Community', 
        tags: [], 
        author: 'Botanical Living',
        readingTime: '5 min read', 
        published: true, 
        featured: false,
        seo: { title: '', description: '', keywords: [] },
        sections: []
      };
      setFormData(defaultVal);
      setOriginalBlog(defaultVal);
      setSections([]);
      setEditorMode('sections');
    }
  }, [id, isEdit]);

  // Dirty check
  const isDirty = !isEdit || (originalBlog && formData ? Object.keys(originalBlog).some(key => {
    const k = key as keyof Blog;
    if (k === 'seo') {
      return JSON.stringify(originalBlog.seo) !== JSON.stringify(formData.seo);
    }
    if (k === 'tags') {
      return JSON.stringify(originalBlog.tags) !== JSON.stringify(formData.tags);
    }
    if (k === 'sections') {
      return JSON.stringify(originalBlog.sections) !== JSON.stringify(sections);
    }
    const orig = originalBlog[k] === undefined || originalBlog[k] === null ? '' : String(originalBlog[k]).trim();
    const curr = formData[k] === undefined || formData[k] === null ? '' : String(formData[k]).trim();
    return orig !== curr;
  }) || JSON.stringify(originalBlog.sections || []) !== JSON.stringify(sections) : false);

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

  // Section modifiers
  const addSection = (type: 'text' | 'image' | 'text-image' | 'quote') => {
    const newSection: BlogSection = {
      id: `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      title: '',
      content: '',
      imageUrl: '',
      imageCaption: '',
      imageLayout: type === 'text-image' ? 'right' : 'full',
      imageUrlSecond: '',
      imageCaptionSecond: ''
    };
    setSections(prev => [...prev, newSection]);
    showToast(`Added a new ${type} section`, 'success');
  };

  const updateSection = (id: string, updates: Partial<BlogSection>) => {
    setSections(prev => prev.map(sec => sec.id === id ? { ...sec, ...updates } : sec));
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(sec => sec.id !== id));
    showToast('Section removed', 'success');
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return list;
    });
  };

  const moveSectionDown = (index: number) => {
    setSections(prev => {
      if (index === prev.length - 1) return prev;
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return list;
    });
  };

  // Auto-parsing converter
  const convertMarkdownToSections = () => {
    if (!formData.content) {
      showToast('No content found in classic editor to convert.', 'error');
      return;
    }
    const lines = formData.content.split('\n');
    const parsedSections: BlogSection[] = [];
    let currentText = '';
    let currentTitle = '';

    const pushCurrentText = () => {
      if (currentText.trim() || currentTitle.trim()) {
        parsedSections.push({
          id: `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}_${parsedSections.length}`,
          type: 'text',
          title: currentTitle.trim(),
          content: currentText.trim()
        });
        currentText = '';
        currentTitle = '';
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('## ')) {
        pushCurrentText();
        currentTitle = line.replace('## ', '').trim();
      } else if (line.startsWith('### ')) {
        pushCurrentText();
        currentTitle = line.replace('### ', '').trim();
      } else if (line.startsWith('> ')) {
        pushCurrentText();
        parsedSections.push({
          id: `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}_${parsedSections.length}`,
          type: 'quote',
          content: line.replace('> ', '').trim()
        });
      } else if (line.startsWith('![') && line.includes('](')) {
        pushCurrentText();
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          parsedSections.push({
            id: `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}_${parsedSections.length}`,
            type: 'image',
            imageUrl: match[2],
            imageCaption: match[1],
            imageLayout: 'full'
          });
        }
      } else {
        currentText += (currentText ? '\n' : '') + lines[i];
      }
    }
    pushCurrentText();

    if (parsedSections.length > 0) {
      setSections(parsedSections);
      setEditorMode('sections');
      showToast('Converted classic content to beautiful visual sections!', 'success');
    } else {
      showToast('Could not convert classic content. Empty or unstructured markdown.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      return showToast('Title and slug are required.', 'error');
    }

    // Save & Compile Content fallbacks
    let compiledContent = formData.content || '';
    if (editorMode === 'sections' && sections.length > 0) {
      compiledContent = sections.map((s, index) => {
        if (s.type === 'text') {
          return `${s.title ? `## ${s.title}\n\n` : ''}${s.content || ''}`;
        } else if (s.type === 'image') {
          if (s.imageLayout === 'grid-two') {
            return `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div class="space-y-2">
    <img src="${s.imageUrl || ''}" alt="${s.imageCaption || ''}" class="rounded-xl shadow-md w-full object-cover max-h-[300px]" />
    ${s.imageCaption ? `<p class="text-xs italic text-text-secondary text-center font-light">${s.imageCaption}</p>` : ''}
  </div>
  <div class="space-y-2">
    <img src="${s.imageUrlSecond || ''}" alt="${s.imageCaptionSecond || ''}" class="rounded-xl shadow-md w-full object-cover max-h-[300px]" />
    ${s.imageCaptionSecond ? `<p class="text-xs italic text-text-secondary text-center font-light">${s.imageCaptionSecond}</p>` : ''}
  </div>
</div>`;
          }
          return `![${s.imageCaption || ''}](${s.imageUrl || ''})\n\n${s.imageCaption ? `*${s.imageCaption}*` : ''}`;
        } else if (s.type === 'text-image') {
          const alignment = s.imageLayout === 'left' ? 'left' : 'right';
          return `<div class="flex flex-col ${alignment === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 my-8 items-center">
  <div class="md:w-1/2">
    <img src="${s.imageUrl || ''}" alt="${s.imageCaption || ''}" class="rounded-2xl shadow-lg w-full object-cover max-h-[400px]" />
    ${s.imageCaption ? `<p class="text-xs italic text-text-secondary text-center mt-2 font-light">${s.imageCaption}</p>` : ''}
  </div>
  <div class="md:w-1/2 space-y-4">
    ${s.title ? `### ${s.title}\n\n` : ''}${s.content || ''}
  </div>
</div>`;
        } else if (s.type === 'quote') {
          return `> ${s.content || ''}\n${s.title ? `> — *${s.title}*` : ''}`;
        }
        return '';
      }).join('\n\n');
    }

    if (!compiledContent && editorMode === 'classic') {
      return showToast('Content (Markdown) is required in Classic Mode', 'error');
    }

    setIsSaving(true);
    try {
      const submissionPayload = {
        ...formData,
        content: compiledContent,
        sections: editorMode === 'sections' ? sections : []
      };

      if (isEdit && id) {
        await blogService.updateBlog(id, submissionPayload);
        showToast('Blog updated successfully', 'success');
      } else {
        await blogService.createBlog(submissionPayload as Omit<Blog, 'id'>);
        showToast('Blog created successfully', 'success');
      }
      navigate('/admin/blogs');
    } catch (error) {
      showToast('Failed to save blog post', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/admin/blogs')} className="-ml-4 text-xs tracking-wider uppercase font-semibold">
        <ArrowLeft className="mr-2" size={16} /> Back to Journal List
      </Button>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-200/50 pb-6">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-widest text-gold-accent block mb-1">
            Editorial Management
          </span>
          <h1 className="text-3xl font-light text-dark-forest tracking-tight">
            {isEdit ? 'Edit Journal Entry' : 'Draft New Journal Entry'}
          </h1>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSaving || !isDirty} 
          className={`text-xs uppercase tracking-widest py-3 px-6 ${!isDirty ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Save size={14} className="mr-2" /> {isSaving ? 'Publishing...' : 'Publish Entry'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[24px] border border-stone-200/40 shadow-subtle space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1.5">Article Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                onBlur={!isEdit ? handleSlugify : undefined} 
                placeholder="e.g. Harmonizing Biophilic Architecture in Premium Worksuites"
                className="w-full p-3 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-xl text-lg font-light text-dark-forest placeholder-stone-300" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1.5">Permalink Slug</label>
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  placeholder="e.g. biophilic-architecture-worksuites"
                  className="w-full p-3 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-xl font-mono text-xs text-text-secondary bg-stone-50" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1.5">Short Excerpt (Summary)</label>
                <textarea 
                  name="excerpt" 
                  value={formData.excerpt} 
                  onChange={handleChange} 
                  rows={2}
                  placeholder="Write a brief, high-level summary of this journal entry (1-2 sentences)..."
                  className="w-full p-3 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-xl text-xs font-light text-text-secondary" 
                  required 
                />
              </div>
            </div>

            {/* TAB SELECTOR FOR WRITING MODE */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
                  Content Builder Method
                </label>
                
                <div className="inline-flex rounded-lg bg-stone-100 p-1">
                  <button
                    type="button"
                    onClick={() => setEditorMode('sections')}
                    className={`px-3 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 ${
                      editorMode === 'sections' 
                        ? 'bg-white text-dark-forest shadow-sm' 
                        : 'text-text-secondary hover:text-dark-forest'
                    }`}
                  >
                    <Layers size={12} /> Rich Sections
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('classic')}
                    className={`px-3 py-1 text-xs rounded-md font-semibold transition-all flex items-center gap-1 ${
                      editorMode === 'classic' 
                        ? 'bg-white text-dark-forest shadow-sm' 
                        : 'text-text-secondary hover:text-dark-forest'
                    }`}
                  >
                    <FileText size={12} /> Classic Markdown
                  </button>
                </div>
              </div>

              {/* CLASSIC MARKDOWN EDITOR */}
              {editorMode === 'classic' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center bg-stone-50 p-4 rounded-xl border border-stone-200/50">
                    <p className="text-xs text-text-secondary font-light">
                      Write raw Markdown directly in this block. You can also automatically generate rich structural sections from this text!
                    </p>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={convertMarkdownToSections}
                      className="text-[10px] uppercase tracking-widest py-1.5 px-3 border-gold-accent text-gold-accent hover:bg-gold-accent/5 flex items-center gap-1"
                    >
                      <Sparkles size={11} /> Parse to Sections
                    </Button>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1.5">Raw Markdown Content</label>
                    <textarea 
                      name="content" 
                      value={formData.content} 
                      onChange={handleChange} 
                      rows={16}
                      placeholder="Write your article in Markdown..."
                      className="w-full p-3 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-xl font-mono text-xs leading-relaxed" 
                      required={editorMode === 'classic'} 
                    />
                  </div>
                </div>
              )}

              {/* SECTIONS BUILDER */}
              {editorMode === 'sections' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {sections.length === 0 ? (
                    <div className="border-2 border-dashed border-stone-200 rounded-[20px] p-10 text-center space-y-4 bg-stone-50/50">
                      <div className="w-12 h-12 bg-gold-accent/10 text-gold-accent rounded-full flex items-center justify-center mx-auto">
                        <Layers size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-heading text-sm font-medium text-dark-forest">Build Section-by-Section Content</h4>
                        <p className="text-xs text-text-secondary max-w-sm mx-auto font-light leading-relaxed">
                          Create beautiful editorial layouts, side-by-side galleries, quotes, and biophilic text sections within your article text.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button 
                          type="button" 
                          onClick={() => addSection('text')}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-text-primary hover:border-gold-accent transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Type size={12} className="text-stone-400" /> Text Block
                        </button>
                        <button 
                          type="button" 
                          onClick={() => addSection('image')}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-text-primary hover:border-gold-accent transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon size={12} className="text-stone-400" /> Image Block
                        </button>
                        <button 
                          type="button" 
                          onClick={() => addSection('text-image')}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-text-primary hover:border-gold-accent transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles size={12} className="text-stone-400" /> Split Text/Image
                        </button>
                        <button 
                          type="button" 
                          onClick={() => addSection('quote')}
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-text-primary hover:border-gold-accent transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Quote size={12} className="text-stone-400" /> Pull Quote
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-text-secondary font-medium">
                          {sections.length} Editorial Section{sections.length > 1 ? 's' : ''} Configured
                        </p>
                        {formData.content && (
                          <button 
                            type="button"
                            onClick={() => {
                              if(window.confirm("Warning: Initializing sections from classic content will overwrite your current sections. Continue?")) {
                                convertMarkdownToSections();
                              }
                            }}
                            className="text-[10px] text-gold-accent hover:underline uppercase font-bold tracking-wider"
                          >
                            Re-import from Markdown
                          </button>
                        )}
                      </div>

                      <div className="space-y-5">
                        {sections.map((sec, index) => {
                          return (
                            <div 
                              key={sec.id} 
                              className="border border-stone-200/70 rounded-2xl bg-stone-50/20 p-5 md:p-6 shadow-sm hover:shadow-subtle transition-all duration-200 space-y-4 group relative"
                            >
                              {/* Header tools */}
                              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-text-secondary">
                                    {index + 1}
                                  </span>
                                  {sec.type === 'text' && (
                                    <span className="text-xs font-bold text-dark-forest flex items-center gap-1.5">
                                      <Type size={13} className="text-gold-accent" /> Text Block
                                    </span>
                                  )}
                                  {sec.type === 'image' && (
                                    <span className="text-xs font-bold text-dark-forest flex items-center gap-1.5">
                                      <ImageIcon size={13} className="text-gold-accent" /> Single/Dual Image Block
                                    </span>
                                  )}
                                  {sec.type === 'text-image' && (
                                    <span className="text-xs font-bold text-dark-forest flex items-center gap-1.5">
                                      <Sparkles size={13} className="text-gold-accent" /> Split Text/Image Block
                                    </span>
                                  )}
                                  {sec.type === 'quote' && (
                                    <span className="text-xs font-bold text-dark-forest flex items-center gap-1.5">
                                      <Quote size={13} className="text-gold-accent" /> Editorial Pull Quote
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveSectionUp(index)}
                                    disabled={index === 0}
                                    title="Move Section Up"
                                    className="p-1 rounded bg-white hover:bg-stone-100 border border-stone-100 text-text-secondary hover:text-dark-forest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveSectionDown(index)}
                                    disabled={index === sections.length - 1}
                                    title="Move Section Down"
                                    className="p-1 rounded bg-white hover:bg-stone-100 border border-stone-100 text-text-secondary hover:text-dark-forest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteSection(sec.id)}
                                    title="Delete Section"
                                    className="p-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-500 hover:text-rose-600 transition-colors ml-1"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Form Fields for Section based on type */}
                              {sec.type === 'text' && (
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Section Heading (Optional)</label>
                                    <input 
                                      type="text"
                                      value={sec.title || ''}
                                      onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                                      placeholder="e.g. Navigating Biophilic Elements"
                                      className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Text Body Content</label>
                                    <textarea 
                                      value={sec.content || ''}
                                      onChange={(e) => updateSection(sec.id, { content: e.target.value })}
                                      placeholder="Write your paragraphs here. Supports standard markdown rules like **bold**, *italics*, and lists..."
                                      rows={6}
                                      className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs font-light leading-relaxed font-sans"
                                      required
                                    />
                                  </div>
                                </div>
                              )}

                              {sec.type === 'image' && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Image Layout Style</label>
                                      <select
                                        value={sec.imageLayout || 'full'}
                                        onChange={(e) => updateSection(sec.id, { imageLayout: e.target.value as any })}
                                        className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs bg-white"
                                      >
                                        <option value="full">Single Editorial Centerpiece Image</option>
                                        <option value="grid-two">Two Images Side-by-Side (Dual Grid)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Primary Image URL</label>
                                      <input 
                                        type="url"
                                        value={sec.imageUrl || ''}
                                        onChange={(e) => updateSection(sec.id, { imageUrl: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs"
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Primary Caption / Alt Text</label>
                                      <input 
                                        type="text"
                                        value={sec.imageCaption || ''}
                                        onChange={(e) => updateSection(sec.id, { imageCaption: e.target.value })}
                                        placeholder="e.g. Sunlight diffusing through the indoor Ficus tree in premium suite"
                                        className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs font-light"
                                      />
                                    </div>
                                    {sec.imageUrl && (
                                      <div className="border border-stone-100 rounded-lg overflow-hidden h-20 bg-stone-50 flex items-center justify-center">
                                        <img src={getDirectMediaUrl(sec.imageUrl)} alt="Preview 1" className="h-full w-full object-cover" />
                                      </div>
                                    )}
                                  </div>

                                  {/* DUAL IMAGE GRID SECTION */}
                                  {sec.imageLayout === 'grid-two' && (
                                    <div className="pt-4 border-t border-dashed border-stone-100 space-y-4">
                                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-gold-accent">Second Image Specifications</h5>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Second Image URL</label>
                                          <input 
                                            type="url"
                                            value={sec.imageUrlSecond || ''}
                                            onChange={(e) => updateSection(sec.id, { imageUrlSecond: e.target.value })}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Second Caption / Alt Text</label>
                                          <input 
                                            type="text"
                                            value={sec.imageCaptionSecond || ''}
                                            onChange={(e) => updateSection(sec.id, { imageCaptionSecond: e.target.value })}
                                            placeholder="e.g. Crafted teak wood furniture close-up details"
                                            className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs font-light"
                                          />
                                        </div>
                                      </div>

                                      {sec.imageUrlSecond && (
                                        <div className="border border-stone-100 rounded-lg overflow-hidden h-24 max-w-xs bg-stone-50">
                                          <img src={getDirectMediaUrl(sec.imageUrlSecond)} alt="Preview 2" className="h-full w-full object-cover" />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {sec.type === 'text-image' && (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Image Placement</label>
                                      <select
                                        value={sec.imageLayout || 'right'}
                                        onChange={(e) => updateSection(sec.id, { imageLayout: e.target.value as any })}
                                        className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs bg-white"
                                      >
                                        <option value="left">Place Image on LEFT, Text on RIGHT</option>
                                        <option value="right">Place Text on LEFT, Image on RIGHT</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Image URL</label>
                                      <input 
                                        type="url"
                                        value={sec.imageUrl || ''}
                                        onChange={(e) => updateSection(sec.id, { imageUrl: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs"
                                        required
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Sub-heading (Optional)</label>
                                        <input 
                                          type="text"
                                          value={sec.title || ''}
                                          onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                                          placeholder="e.g. Restorative Biophilic Lighting"
                                          className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Image Caption</label>
                                        <input 
                                          type="text"
                                          value={sec.imageCaption || ''}
                                          onChange={(e) => updateSection(sec.id, { imageCaption: e.target.value })}
                                          placeholder="e.g. Ambient floor lamps casting warm lights"
                                          className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs font-light"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex flex-col justify-between">
                                      <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Sub-section Text Body</label>
                                      <textarea 
                                        value={sec.content || ''}
                                        onChange={(e) => updateSection(sec.id, { content: e.target.value })}
                                        placeholder="Write split text details here..."
                                        rows={4}
                                        className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs font-light font-sans"
                                        required
                                      />
                                    </div>
                                  </div>

                                  {sec.imageUrl && (
                                    <div className="border border-stone-100 rounded-lg overflow-hidden h-24 max-w-sm bg-stone-50">
                                      <img src={getDirectMediaUrl(sec.imageUrl)} alt="Split Preview" className="h-full w-full object-cover" />
                                    </div>
                                  )}
                                </div>
                              )}

                              {sec.type === 'quote' && (
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Quote Text</label>
                                    <textarea 
                                      value={sec.content || ''}
                                      onChange={(e) => updateSection(sec.id, { content: e.target.value })}
                                      placeholder="'True wellness begins when we step away from screen cycles and align with nature\'s circadian rhythms...'"
                                      rows={3}
                                      className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs font-light italic"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Author / Source / Citation</label>
                                    <input 
                                      type="text"
                                      value={sec.title || ''}
                                      onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                                      placeholder="e.g. Evelyn Vance, Creative Director"
                                      className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* ADD SECTION TRIGGER BUTTON BAR */}
                      <div className="pt-4 border-t border-stone-100">
                        <span className="block text-[9px] uppercase tracking-widest font-bold text-center text-gold-accent mb-3">
                          + APPEND AN EDITORIAL SECTION
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
                          <button
                            type="button"
                            onClick={() => addSection('text')}
                            className="p-3 bg-warm-cream hover:bg-stone-100 border border-border/20 rounded-xl text-[11px] font-semibold text-dark-forest flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Type size={16} className="text-gold-accent" />
                            <span>Add Text Block</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => addSection('image')}
                            className="p-3 bg-warm-cream hover:bg-stone-100 border border-border/20 rounded-xl text-[11px] font-semibold text-dark-forest flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <ImageIcon size={16} className="text-gold-accent" />
                            <span>Add Image Block</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => addSection('text-image')}
                            className="p-3 bg-warm-cream hover:bg-stone-100 border border-border/20 rounded-xl text-[11px] font-semibold text-dark-forest flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Sparkles size={16} className="text-gold-accent" />
                            <span>Split Text & Image</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => addSection('quote')}
                            className="p-3 bg-warm-cream hover:bg-stone-100 border border-border/20 rounded-xl text-[11px] font-semibold text-dark-forest flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <Quote size={16} className="text-gold-accent" />
                            <span>Add Pull Quote</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column pane - Publishing Settings & Cover Media */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] border border-stone-200/40 shadow-subtle space-y-5">
            <h3 className="font-heading text-sm font-medium text-dark-forest border-b border-stone-100 pb-2">Publishing Controls</h3>
            
            <div className="flex items-center space-x-2.5">
              <input 
                type="checkbox" 
                id="published" 
                name="published" 
                checked={formData.published} 
                onChange={handleChange} 
                className="w-4 h-4 text-gold-accent border-stone-300 rounded focus:ring-gold-accent" 
              />
              <label htmlFor="published" className="text-xs font-semibold text-text-primary cursor-pointer select-none">Mark as Published (Publicly Visible)</label>
            </div>
            
            <div className="flex items-center space-x-2.5">
              <input 
                type="checkbox" 
                id="featured" 
                name="featured" 
                checked={formData.featured} 
                onChange={handleChange} 
                className="w-4 h-4 text-gold-accent border-stone-300 rounded focus:ring-gold-accent" 
              />
              <label htmlFor="featured" className="text-xs font-semibold text-text-primary cursor-pointer select-none">Feature on Homepage</label>
            </div>
            
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1.5">Article Author</label>
                <input 
                  type="text" 
                  name="author" 
                  value={formData.author} 
                  onChange={handleChange} 
                  className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1.5">Est. Reading Time</label>
                <input 
                  type="text" 
                  name="readingTime" 
                  value={formData.readingTime} 
                  onChange={handleChange} 
                  className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs" 
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1.5">Journal Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs bg-white"
                >
                  <option value="Community">Community & Workspaces</option>
                  <option value="Lifestyle">Eco-Luxury Lifestyle</option>
                  <option value="Wellness">Mindful Living & Wellness</option>
                  <option value="News">Botanical News & Events</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-stone-200/40 shadow-subtle space-y-4">
            <h3 className="font-heading text-sm font-medium text-dark-forest border-b border-stone-100 pb-2">Cover Media</h3>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1.5">Cover Image URL</label>
              <input 
                type="url" 
                name="coverImage" 
                value={formData.coverImage} 
                onChange={handleChange} 
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full p-2.5 border border-stone-200 focus:border-gold-accent focus:outline-none rounded-lg text-xs" 
                required 
              />
              {formData.coverImage && (
                <div className="mt-3 border border-stone-100 rounded-xl overflow-hidden shadow-sm">
                  <img src={getDirectMediaUrl(formData.coverImage)} alt="Preview" className="w-full h-36 object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
