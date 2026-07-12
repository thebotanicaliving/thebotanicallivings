import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogs } from '@/hooks/useBlogs';
import { Section } from '@/components/shared/Section';
import { Container } from '@/components/shared/Container';
import { Heading, Paragraph } from '@/components/shared/Typography';
import { Card } from '@/components/shared/Card';
import { Image } from '@/components/shared/Image';
import { Button } from '@/components/shared/Button';
import { IconWrapper } from '@/components/shared/IconWrapper';

export function BlogPage() {
  const { blogs, featuredBlog, loading, error, refresh } = useBlogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Derive all categories
  const categories = ['All', ...Array.from(new Set(blogs.map((b) => b.category)))];

  // Filter logic
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-warm-cream pb-16">
      {/* Search & Banner Section */}
      <Section variant="cream" className="!py-10 md:!py-16">
        <Container className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-button text-[10px] font-semibold uppercase tracking-widest text-gold-accent block animate-fadeIn">
              Our Journal
            </span>
            <Heading level={1} className="text-3xl md:text-5xl font-light text-dark-forest tracking-tight animate-fadeIn">
              The Botanical Journal
            </Heading>
            <Paragraph size="md" className="text-text-secondary max-w-lg mx-auto font-light leading-relaxed animate-fadeIn">
              Insights on organic living, remote work productivity, eco-luxury design trends, and guides to navigating Hyderabad\'s premium tech corridors.
            </Paragraph>
          </div>

          {/* Search bar & Category filters row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto border-y border-border/20 py-6">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border cursor-pointer transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-dark-forest border-dark-forest text-warm-cream shadow-sm'
                      : 'bg-white border-border/30 text-text-secondary hover:border-dark-forest/50 hover:text-dark-forest'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search articles or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-border/40 focus:border-gold-accent focus:outline-none rounded-full pl-10 pr-4 py-2 text-xs transition-all text-text-primary placeholder-text-secondary/50 font-light"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50">
                <IconWrapper name="menu" className="rotate-90" size={14} />
              </span>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-24 text-center space-y-4 animate-pulse">
              <div className="w-10 h-10 border-4 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-text-secondary">Loading editorial articles...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-[24px] border border-border/30">
              <p className="text-sm text-text-primary font-medium">Failed to retrieve journal entries</p>
              <p className="text-xs text-text-secondary">{error.message}</p>
              <button
                onClick={refresh}
                className="bg-dark-forest text-warm-cream px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-primary-forest transition-colors cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredBlogs.length === 0 && (
            <div className="py-16 text-center max-w-md mx-auto bg-white/50 border border-border/20 rounded-[24px] p-8">
              <p className="text-sm text-text-secondary font-light">No articles match your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-gold-accent font-semibold underline mt-2 block mx-auto hover:text-dark-forest transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Featured Article Banner - Spotlight */}
          {!loading && !error && featuredBlog && selectedCategory === 'All' && searchQuery === '' && (
            <div className="max-w-5xl mx-auto animate-fadeIn">
              <Card className="p-0 border-border/20 overflow-hidden bg-white hover:shadow-subtle rounded-[24px]">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 h-64 sm:h-80 md:h-[400px] overflow-hidden relative">
                    <Image
                      src={featuredBlog.coverImage || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop'}
                      alt={featuredBlog.title}
                      radius="none"
                      className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-gold-accent text-dark-forest text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-sm">
                      Featured Spotlight
                    </div>
                  </div>
                  
                  <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-text-secondary text-xs font-semibold uppercase tracking-wider">
                        <span>{featuredBlog.category}</span>
                        <span>•</span>
                        <span>{featuredBlog.readingTime}</span>
                      </div>
                      
                      <Heading level={2} className="text-xl md:text-3xl font-light text-dark-forest leading-tight">
                        <Link to={`/blog/${featuredBlog.slug}`} className="hover:text-gold-accent transition-colors">
                          {featuredBlog.title}
                        </Link>
                      </Heading>

                      <Paragraph size="sm" className="text-text-secondary font-light leading-relaxed">
                        {featuredBlog.excerpt}
                      </Paragraph>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/20 pt-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone flex items-center justify-center font-heading font-medium text-xs text-dark-forest">
                          {featuredBlog.author[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-dark-forest">{featuredBlog.author}</span>
                          <span className="text-[10px] text-text-secondary font-light">
                            {new Date(featuredBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <Link to={`/blog/${featuredBlog.slug}`}>
                        <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-widest px-4 py-2 font-bold">
                          Read Story
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Blogs Grid */}
          {!loading && !error && filteredBlogs.length > 0 && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Grid Header */}
              {selectedCategory !== 'All' || searchQuery !== '' ? (
                <p className="text-xs text-text-secondary font-medium tracking-wide">
                  Showing {filteredBlogs.length} results
                </p>
              ) : (
                <Heading level={3} className="text-xl font-light text-dark-forest border-b border-border/10 pb-2">
                  All Journal Stories
                </Heading>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredBlogs
                  // Exclude featured blog from listing grid only if in default list view to avoid redundancy
                  .filter((b) => selectedCategory !== 'All' || searchQuery !== '' || b.id !== featuredBlog?.id)
                  .map((blog) => (
                    <Card
                      key={blog.id}
                      hover={true}
                      border={true}
                      className="p-0 border-border/30 overflow-hidden bg-white flex flex-col h-full rounded-card"
                    >
                      {/* Image cover */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Link to={`/blog/${blog.slug}`}>
                          <Image
                            src={blog.coverImage || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop'}
                            alt={blog.title}
                            radius="none"
                            className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                          />
                        </Link>
                        <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-border/20 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-semibold text-dark-forest">
                          {blog.category}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="p-5 flex flex-col justify-between flex-grow space-y-5">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-[10px] text-text-secondary font-medium uppercase tracking-wider">
                            <span>{blog.readingTime}</span>
                            <span>•</span>
                            <span>
                              {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <Heading level={3} className="text-base sm:text-lg font-light text-dark-forest leading-snug line-clamp-2">
                            <Link to={`/blog/${blog.slug}`} className="hover:text-gold-accent transition-colors">
                              {blog.title}
                            </Link>
                          </Heading>

                          <Paragraph size="sm" className="text-text-secondary font-light leading-relaxed line-clamp-3">
                            {blog.excerpt}
                          </Paragraph>
                        </div>

                        {/* Card footer */}
                        <div className="border-t border-border/15 pt-3 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-dark-forest">
                            By {blog.author}
                          </span>

                          <Link to={`/blog/${blog.slug}`} className="text-[10px] font-semibold tracking-widest uppercase text-gold-accent hover:text-dark-forest transition-colors flex items-center gap-1">
                            Read More
                            <IconWrapper name="sparkles" size={8} />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
export default BlogPage;
