import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '@/hooks/useBlog';
import { useBlogs } from '@/hooks/useBlogs';
import Markdown from 'react-markdown';
import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { Button } from '@/components/shared/Button';
import { IconWrapper } from '@/components/shared/IconWrapper';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { Image } from '@/components/shared/Image';

export function BlogDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { blog, loading, error } = useBlog(slug);
  const { blogs } = useBlogs();
  const [copied, setCopied] = useState(false);

  // Extract headings for Table of Contents (both sections and markdown fallback)
  const [toc, setToc] = useState<string[]>([]);

  useEffect(() => {
    if (blog) {
      if (blog.sections && blog.sections.length > 0) {
        const h2s: string[] = [];
        blog.sections.forEach(sec => {
          if (sec.type === 'text' && sec.title) {
            h2s.push(sec.title);
          } else if (sec.type === 'text-image' && sec.title) {
            h2s.push(sec.title);
          }
        });
        setToc(h2s);
      } else {
        const h2s = blog.content
          .split('\n')
          .filter((line) => line.trim().startsWith('## '))
          .map((line) => line.replace('## ', '').trim());
        setToc(h2s);
      }
    }
  }, [blog]);

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-warm-cream space-y-4">
        <div className="w-12 h-12 border-4 border-gold-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-text-secondary">Rendering journal pages...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-warm-cream p-5">
        <div className="bg-white p-8 rounded-[24px] border border-border/30 max-w-md text-center space-y-4 shadow-subtle">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-lg font-bold">!</div>
          <Heading level={3} className="text-lg font-medium text-dark-forest">Article Not Found</Heading>
          <Paragraph size="sm" className="text-text-secondary">We could not load this specific journal entry. It may have been drafts, archived or deleted.</Paragraph>
          <Link to="/blog">
            <Button variant="primary" className="mt-2 text-xs uppercase tracking-widest py-2 px-5">Back to Journal</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Related articles (matching categories or other published)
  const relatedBlogs = blogs
    .filter((b) => b.id !== blog.id)
    .slice(0, 2);

  return (
    <div className="pt-14 md:pt-16 min-h-screen bg-warm-cream pb-24">
      <Breadcrumb 
        items={[
          { label: 'Journal', href: '/blog' },
          { label: blog.title }
        ]} 
        className="py-3.5 bg-warm-cream/50 border-b border-stone/10"
      />

      {/* Editorial Cover Banner */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-black">
        <Image
          src={blog.coverImage}
          alt={blog.title}
          radius="none"
          className="w-full h-full object-cover opacity-80 brightness-75 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-forest/90 via-dark-forest/20 to-transparent" />
        
        {/* Breadcrumb & Intro header overlay */}
        <div className="absolute bottom-0 left-0 right-0 py-8 md:py-12">
          <Container className="max-w-[1100px]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-warm-cream/80 text-xs font-semibold uppercase tracking-wider">
                <Link to="/blog" className="hover:text-gold-accent flex items-center gap-1 transition-colors">
                  Journal
                </Link>
                <span>/</span>
                <span className="text-gold-accent">{blog.category}</span>
              </div>
              
              <Heading level={1} className="text-2xl md:text-4xl font-light text-warm-cream tracking-tight max-w-4xl leading-tight">
                {blog.title}
              </Heading>

              <div className="flex items-center gap-4 text-warm-cream/80 text-xs font-light pt-2">
                <span className="flex items-center gap-1.5">
                  <IconWrapper name="sparkles" size={11} />
                  By {blog.author}
                </span>
                <span>•</span>
                <span>
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span>•</span>
                <span>{blog.readingTime}</span>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Article Content Layout */}
      <Section variant="cream" className="!py-12 md:!py-16">
        <Container className="max-w-[1100px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Markdown content body */}
            <div className="lg:col-span-8 bg-white border border-border/30 rounded-[28px] p-6 md:p-10 shadow-subtle space-y-6">
              
              {/* Dynamic Markdown Content with custom styling wrapper */}
              <div className="markdown-body prose prose-stone prose-sm md:prose-base text-text-primary leading-relaxed font-light space-y-5">
                <style dangerouslySetInnerHTML={{__html: `
                  .markdown-body h1 {
                    font-family: var(--font-heading);
                    font-size: 1.875rem;
                    font-weight: 300;
                    color: var(--color-dark-forest);
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  .markdown-body h2 {
                    font-family: var(--font-heading);
                    font-size: 1.5rem;
                    font-weight: 300;
                    color: var(--color-dark-forest);
                    margin-top: 1.75rem;
                    margin-bottom: 0.75rem;
                    border-bottom: 1px solid var(--color-border);
                    padding-bottom: 0.25rem;
                  }
                  .markdown-body h3 {
                    font-family: var(--font-heading);
                    font-size: 1.25rem;
                    font-weight: 400;
                    color: var(--color-primary-forest);
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                  }
                  .markdown-body p {
                    margin-bottom: 1.25rem;
                    line-height: 1.7;
                  }
                  .markdown-body strong {
                    font-weight: 600;
                    color: var(--color-text-primary);
                  }
                  .markdown-body ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1.25rem;
                    space-y: 0.5rem;
                  }
                  .markdown-body li {
                    margin-bottom: 0.4rem;
                  }
                  .markdown-body img:not(.section-img) { max-width: 100%; height: auto; border-radius: 12px; margin: 2rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                  .markdown-body blockquote {
                    border-left: 3px solid var(--color-gold-accent);
                    padding-left: 1rem;
                    font-style: italic;
                    color: var(--color-text-secondary);
                    margin: 1.5rem 0;
                  }
                `}} />
                
                {blog.sections && blog.sections.length > 0 ? (
                  <div className="space-y-8">
                    {blog.sections.map((section, idx) => {
                      if (section.type === 'text') {
                        return (
                          <div key={section.id || idx} className="space-y-3 animate-fadeIn">
                            {section.title && (
                              <h2 className="font-heading text-xl md:text-2xl font-light text-dark-forest border-b border-stone-100 pb-2 mt-6">
                                {section.title}
                              </h2>
                            )}
                            <div className="text-text-primary leading-relaxed font-light text-sm md:text-base space-y-3 font-sans">
                              <Markdown>{section.content}</Markdown>
                            </div>
                          </div>
                        );
                      }

                      if (section.type === 'image') {
                        if (section.imageLayout === 'grid-two') {
                          return (
                            <div key={section.id || idx} className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 animate-fadeIn">
                              <div className="space-y-2 group">
                                <div className="overflow-hidden rounded-2xl border border-stone-100 shadow-sm bg-white">
                                  <img 
                                    src={section.imageUrl} 
                                    alt={section.imageCaption || ''} 
                                    className="section-img w-full h-auto block hover:scale-[1.02] transition-transform duration-500" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                {section.imageCaption && (
                                  <p className="text-[11px] italic text-text-secondary text-center font-light leading-relaxed">
                                    {section.imageCaption}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2 group">
                                <div className="overflow-hidden rounded-2xl border border-stone-100 shadow-sm bg-white">
                                  <img 
                                    src={section.imageUrlSecond} 
                                    alt={section.imageCaptionSecond || ''} 
                                    className="section-img w-full h-auto block hover:scale-[1.02] transition-transform duration-500" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                {section.imageCaptionSecond && (
                                  <p className="text-[11px] italic text-text-secondary text-center font-light leading-relaxed">
                                    {section.imageCaptionSecond}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={section.id || idx} className="space-y-2.5 my-8 group animate-fadeIn">
                            <div className="overflow-hidden rounded-[20px] border border-stone-200/45 shadow-md bg-white">
                              <img 
                                src={section.imageUrl} 
                                alt={section.imageCaption || ''} 
                                className="section-img w-full h-auto block hover:scale-[1.01] transition-transform duration-700" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            {section.imageCaption && (
                              <p className="text-xs italic text-text-secondary text-center font-light leading-relaxed max-w-xl mx-auto">
                                {section.imageCaption}
                              </p>
                            )}
                          </div>
                        );
                      }

                      if (section.type === 'text-image') {
                        const isLeft = section.imageLayout === 'left';
                        return (
                          <div 
                            key={section.id || idx} 
                            className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-10 my-10 items-center animate-fadeIn`}
                          >
                            <div className="w-full md:w-1/2 space-y-2.5 group">
                              <div className="overflow-hidden rounded-[20px] border border-stone-100 shadow-md bg-white">
                                <img 
                                  src={section.imageUrl} 
                                  alt={section.imageCaption || ''} 
                                  className="section-img w-full h-auto block hover:scale-[1.02] transition-transform duration-500" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {section.imageCaption && (
                                <p className="text-[11px] italic text-text-secondary text-center font-light leading-relaxed">
                                  {section.imageCaption}
                                </p>
                              )}
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                              {section.title && (
                                <h3 className="font-heading text-xl font-normal text-dark-forest tracking-tight">
                                  {section.title}
                                </h3>
                              )}
                              <div className="text-text-primary leading-relaxed font-light text-sm md:text-base space-y-3 font-sans">
                                <Markdown>{section.content}</Markdown>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (section.type === 'quote') {
                        return (
                          <div 
                            key={section.id || idx} 
                            className="my-10 bg-warm-cream/35 border-l-4 border-gold-accent p-6 md:p-8 rounded-r-2xl shadow-subtle space-y-3 animate-fadeIn"
                          >
                            <p className="font-heading text-base md:text-lg italic text-dark-forest leading-relaxed font-light">
                              "{section.content}"
                            </p>
                            {section.title && (
                              <p className="text-xs font-semibold text-gold-accent uppercase tracking-wider text-right">
                                — {section.title}
                              </p>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                ) : (
                  <Markdown>{blog.content}</Markdown>
                )}
              </div>

              {/* Tags & Action row */}
              <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-stone/60 text-text-secondary border border-border/20 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Share article actions */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary font-button">
                    Share Story:
                  </span>
                  
                  {/* Share Clipboard */}
                  <button
                    onClick={handleShareCopy}
                    className="p-2 bg-warm-cream hover:bg-stone/35 rounded-full border border-border/20 text-dark-forest hover:text-gold-accent transition-colors cursor-pointer relative"
                    title="Copy Link"
                  >
                    <IconWrapper name="menu" className="rotate-90" size={13} />
                    {copied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-forest text-warm-cream text-[9px] px-2 py-1 rounded shadow-sm animate-fadeIn whitespace-nowrap">
                        Copied Link!
                      </span>
                    )}
                  </button>

                  {/* Share Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this premium article: ${blog.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-warm-cream hover:bg-stone/35 rounded-full border border-border/20 text-dark-forest hover:text-gold-accent transition-colors flex items-center justify-center"
                    title="Share on Twitter"
                  >
                    <IconWrapper name="sparkles" size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Table of Contents & Side details */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              
              {/* Dynamic Table of Contents */}
              {toc.length > 0 && (
                <div className="bg-white border border-border/30 rounded-[24px] p-6 shadow-subtle space-y-4">
                  <h4 className="font-heading text-base font-medium text-dark-forest border-b border-border/10 pb-2">
                    Table of Contents
                  </h4>
                  <ul className="space-y-2.5">
                    {toc.map((heading, i) => (
                      <li key={i} className="flex items-start gap-2 group">
                        <span className="text-gold-accent text-xs font-semibold pt-0.5">•</span>
                        <span className="text-xs text-text-secondary group-hover:text-gold-accent font-light transition-colors leading-relaxed">
                          {heading}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Author & Editorial note card */}
              <div className="bg-dark-forest text-warm-cream border border-white/5 rounded-[24px] p-6 shadow-subtle space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-accent/15 border border-gold-accent/20 flex items-center justify-center font-heading font-medium text-lg text-gold-accent">
                    {blog.author[0]}
                  </div>
                  <div>
                    <h5 className="font-heading text-sm font-medium tracking-wide">
                      {blog.author}
                    </h5>
                    <p className="text-[10px] text-stone font-semibold uppercase tracking-widest">
                      Hospitality Coordinator
                    </p>
                  </div>
                </div>
                <p className="text-xs text-stone font-light leading-relaxed">
                  Dedicated to crafting authentic, serene residential sanctuaries. Evelyn writes guides on living well, biophilic design, and local Hyderabad gastronomy.
                </p>
                
                <Link to="/rooms" className="text-xs text-gold-accent font-semibold tracking-wide hover:underline flex items-center gap-1.5">
                  Browse Premium Suites
                  <IconWrapper name="sparkles" size={11} />
                </Link>
              </div>

              {/* Back CTA Button */}
              <Link to="/blog" className="block">
                <Button variant="outline" className="w-full text-xs uppercase tracking-widest py-3 font-semibold justify-center gap-1.5 text-text-primary border-border/40">
                  <IconWrapper name="arrowLeft" size={12} />
                  Back to Journal
                </Button>
              </Link>

            </div>

          </div>

          {/* Related Stories */}
          {relatedBlogs.length > 0 && (
            <div className="border-t border-border/30 pt-16 mt-16 space-y-8">
              <div className="max-w-2xl space-y-2">
                <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block">
                  Keep Reading
                </span>
                <Heading level={2} className="text-2xl md:text-3xl font-light text-dark-forest">
                  You Might Also Enjoy
                </Heading>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {relatedBlogs.map((item) => (
                  <div key={item.id} className="bg-white border border-border/30 rounded-[20px] overflow-hidden flex flex-col sm:flex-row h-full">
                    <div className="sm:w-2/5 relative h-40 sm:h-full min-h-[140px]">
                      <Image 
                        src={item.coverImage || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop'} 
                        alt={item.title} 
                        radius="none"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="p-5 sm:w-3/5 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-text-secondary font-button font-semibold">
                          {item.category}
                        </span>
                        <h4 className="font-heading text-base font-medium text-dark-forest line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <Link to={`/blog/${item.slug}`}>
                        <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-widest py-1 px-3.5">
                          Read Article
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </Container>
      </Section>
    </div>
  );
}
export default BlogDetailsPage;
