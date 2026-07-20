import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { roomService } from '@/services/room.service';
import { blogService } from '@/services/blog.service';
import { bookingService } from '@/services/booking.service';
import { contactService } from '@/services/contact.service';

interface SearchResult {
  id: string;
  type: 'room' | 'blog' | 'booking' | 'message';
  title: string;
  subtitle: string;
  url: string;
}

export function AdminGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const q = query.toLowerCase();
        const searchResults: SearchResult[] = [];
        
        // Rooms
        const rooms = await roomService.getRooms();
        rooms.filter(r => r.title.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q))
             .forEach(r => searchResults.push({ id: r.id!, type: 'room', title: r.title, subtitle: `Room • ${r.slug}`, url: `/admin/rooms/${r.id}/edit` }));
        
        // Blogs
        const blogs = await blogService.getBlogs(true);
        blogs.filter(b => b.title.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q))
             .forEach(b => searchResults.push({ id: b.id!, type: 'blog', title: b.title, subtitle: `Blog • ${b.author}`, url: `/admin/blogs/${b.id}/edit` }));
        
        // Bookings
        const bookings = await bookingService.getBookingRequests();
        bookings.filter(b => b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.roomId.toLowerCase().includes(q))
                .forEach(b => searchResults.push({ id: b.id!, type: 'booking', title: b.name, subtitle: `Booking • ${b.email}`, url: `/admin/bookings/${b.id}` }));

        // Messages
        const messages = await contactService.getContactRequests();
        messages.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q))
                .forEach(m => searchResults.push({ id: m.id!, type: 'message', title: m.subject, subtitle: `Message from ${m.name}`, url: `/admin/messages/${m.id}` }));

        setResults(searchResults);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-full transition-colors w-64 justify-between"
      >
        <div className="flex items-center">
          <Search size={18} className="mr-2" />
          <span>Search...</span>
        </div>
        <span className="text-xs bg-stone-200 px-2 py-1 rounded font-mono">⌘K</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-stone-900/50 backdrop-blur-sm p-4">
          <div ref={searchRef} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex items-center p-4 border-b relative">
              <Search className="text-stone-400 absolute left-6" size={24} />
              <input 
                autoFocus
                type="text"
                className="w-full pl-12 pr-10 py-3 text-lg outline-none"
                placeholder="Search rooms, blogs, bookings, messages..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="absolute right-6 text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching && <div className="p-8 text-center text-stone-500">Searching...</div>}
              {!isSearching && query.length >= 2 && results.length === 0 && (
                <div className="p-8 text-center text-stone-500">No results found for "{query}"</div>
              )}
              {!isSearching && results.length > 0 && (
                <ul className="py-2">
                  {results.map(result => (
                    <li key={`${result.type}-${result.id}`}>
                      <button 
                        onClick={() => handleSelect(result.url)}
                        className="w-full text-left px-6 py-3 hover:bg-stone-50 flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-stone-900 group-hover:text-forest transition-colors">{result.title}</div>
                          <div className="text-sm text-stone-500">{result.subtitle}</div>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-stone-100 rounded-full text-stone-500 capitalize">{result.type}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!query && (
                <div className="p-8 text-center text-stone-400 text-sm">
                  Type at least 2 characters to search across the entire CMS.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
