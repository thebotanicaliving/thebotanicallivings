import { useDashboard } from '@/hooks/useDashboard';
import { useNavigate } from 'react-router-dom';
import { BedDouble, MessageSquare, BookOpen, CalendarDays, Key, Image as ImageIcon, Plus, Home, Settings, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/shared';
import { OccupancyCalendar } from '@/components/admin/OccupancyCalendar';

export function Dashboard() {
  const { stats, recent, loading, error } = useDashboard();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-forest border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-xs tracking-widest font-mono uppercase">Syncing Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    const isPermissionError = error.message.includes('Missing or insufficient permissions');
    return (
      <div className="p-8 max-w-4xl mx-auto animate-fadeIn">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-card shadow-sm">
          <h2 className="text-xl font-heading font-medium text-red-800 mb-2">Access Synchronization Error</h2>
          <p className="text-sm leading-relaxed mb-6">{error.message}</p>
          
          {isPermissionError && (
            <div className="space-y-4 text-sm mt-4">
              <p className="font-semibold">It looks like your Firebase account lacks Administrator permissions.</p>
              <p className="text-xs text-red-600/80 leading-relaxed">
                Because you are using a custom Firebase project (botanical-site), the security rules require you to explicitly whitelist your UID in Firestore. To fix this, you must complete one of the following steps:
              </p>
              
              <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                <p className="font-bold mb-2 text-dark-forest">Option 1: Add your UID to the admins collection (Recommended)</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-text-secondary">
                  <li>Go to Firebase Console &gt; Authentication. Copy your User UID.</li>
                  <li>Go to Firestore Database.</li>
                  <li>Find the <code>admins</code> collection (create it if it doesn't exist).</li>
                  <li>Add a new document where the <strong>Document ID is your UID</strong>. Include fields <code>name</code>, <code>email</code>, and <code>role</code> (Administrator).</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                <p className="font-bold mb-2 text-dark-forest">Option 2: Update your Firestore Rules</p>
                <ol className="list-decimal pl-5 space-y-1 text-xs text-text-secondary">
                  <li>Go to Firebase Console &gt; Firestore Database &gt; Rules.</li>
                  <li>Update the <code>isAdmin()</code> function to include your email:</li>
                </ol>
                <pre className="bg-stone-50 p-3 mt-2 rounded overflow-x-auto text-xs text-stone-800 border">
{`function isAdmin() {
  return isSignedIn() && (
    request.auth.token.email == 'instinstsincbusiness@gmail.com' ||
    exists(/databases/$(database)/documents/admins/$(request.auth.uid))
  );
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-10 animate-fadeIn">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone/10 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-light tracking-wide text-dark-forest">
            Welcome to Botanical CMS
          </h1>
          <p className="text-xs tracking-wider uppercase text-text-secondary/60 font-mono mt-1">
            Real-time control desk & 5-star operations overview
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => navigate('/admin/rooms/new')} className="text-xs hover:border-gold-accent hover:text-gold-accent">
            <Plus size={14} className="mr-1.5" /> Suite
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/blogs/new')} className="text-xs hover:border-gold-accent hover:text-gold-accent">
            <Plus size={14} className="mr-1.5" /> Blog
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/homepage')} className="text-xs hover:border-gold-accent hover:text-gold-accent">
            <Home size={14} className="mr-1.5" /> Homepage
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/settings')} className="text-xs hover:border-gold-accent hover:text-gold-accent">
            <Settings size={14} className="mr-1.5" /> Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Total Rooms */}
        <div 
          onClick={() => navigate('/admin/rooms')}
          className="group p-5 bg-[#FCFDFD] border border-[#E8EFF1] rounded-card cursor-pointer hover:border-[#BFDFD6] hover:shadow-sm transition-all duration-300 flex flex-col justify-between h-32"
        >
          <div className="flex items-center justify-between text-[#37646E]">
            <span className="text-[10px] font-sans tracking-widest uppercase font-bold text-text-secondary/80">Total Suites</span>
            <Key size={18} className="text-gold-accent" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-semibold text-dark-forest">{stats?.totalRooms || 0}</span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-text-secondary/60 transition-opacity" />
          </div>
        </div>

        {/* Available Rooms */}
        <div 
          onClick={() => navigate('/admin/availability')}
          className="group p-5 bg-[#FCFDFD] border border-[#E8EFF1] rounded-card cursor-pointer hover:border-[#BFDFD6] hover:shadow-sm transition-all duration-300 flex flex-col justify-between h-32"
        >
          <div className="flex items-center justify-between text-[#37646E]">
            <span className="text-[10px] font-sans tracking-widest uppercase font-bold text-text-secondary/80">Available</span>
            <CalendarDays size={18} className="text-forest" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-semibold text-dark-forest">{stats?.availableRooms || 0}</span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-text-secondary/60 transition-opacity" />
          </div>
        </div>

        {/* Pending Bookings */}
        <div 
          onClick={() => navigate('/admin/bookings')}
          className="group p-5 bg-[#FCFDFD] border border-[#E8EFF1] rounded-card cursor-pointer hover:border-[#BFDFD6] hover:shadow-sm transition-all duration-300 flex flex-col justify-between h-32"
        >
          <div className="flex items-center justify-between text-[#37646E]">
            <span className="text-[10px] font-sans tracking-widest uppercase font-bold text-text-secondary/80">Pending Bookings</span>
            <BedDouble size={18} className="text-amber-600" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-semibold text-dark-forest">{stats?.pendingBookings || 0}</span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-text-secondary/60 transition-opacity" />
          </div>
        </div>

        {/* Unread Messages */}
        <div 
          onClick={() => navigate('/admin/messages')}
          className="group p-5 bg-[#FCFDFD] border border-[#E8EFF1] rounded-card cursor-pointer hover:border-[#BFDFD6] hover:shadow-sm transition-all duration-300 flex flex-col justify-between h-32"
        >
          <div className="flex items-center justify-between text-[#37646E]">
            <span className="text-[10px] font-sans tracking-widest uppercase font-bold text-text-secondary/80">Unread</span>
            <MessageSquare size={18} className="text-blue-500" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-semibold text-dark-forest">{stats?.unreadMessages || 0}</span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-text-secondary/60 transition-opacity" />
          </div>
        </div>

        {/* Published Blogs */}
        <div 
          onClick={() => navigate('/admin/blogs')}
          className="group p-5 bg-[#FCFDFD] border border-[#E8EFF1] rounded-card cursor-pointer hover:border-[#BFDFD6] hover:shadow-sm transition-all duration-300 flex flex-col justify-between h-32"
        >
          <div className="flex items-center justify-between text-[#37646E]">
            <span className="text-[10px] font-sans tracking-widest uppercase font-bold text-text-secondary/80">Blogs</span>
            <BookOpen size={18} className="text-purple-500" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-semibold text-dark-forest">{stats?.publishedBlogs || 0}</span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-text-secondary/60 transition-opacity" />
          </div>
        </div>

        {/* Gallery Items */}
        <div 
          onClick={() => navigate('/admin/gallery')}
          className="group p-5 bg-[#FCFDFD] border border-[#E8EFF1] rounded-card cursor-pointer hover:border-[#BFDFD6] hover:shadow-sm transition-all duration-300 flex flex-col justify-between h-32"
        >
          <div className="flex items-center justify-between text-[#37646E]">
            <span className="text-[10px] font-sans tracking-widest uppercase font-bold text-text-secondary/80">Media Gallery</span>
            <ImageIcon size={18} className="text-pink-500" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-semibold text-dark-forest">{stats?.galleryImages || 0}</span>
            <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-text-secondary/60 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Embedded Live Occupancy Timeline Block */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-stone/10 pb-2">
          <h3 className="font-heading font-light text-xl text-dark-forest">Occupancy Matrix</h3>
          <button 
            onClick={() => navigate('/admin/availability')}
            className="text-xs text-gold-accent hover:text-dark-forest font-semibold transition-colors flex items-center gap-1"
          >
            Manage Availability <ArrowUpRight size={14} />
          </button>
        </div>
        <OccupancyCalendar />
      </div>

      {/* Recent Items split lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings Card */}
        <div className="bg-white border border-stone/10 p-6 rounded-card shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-stone/10 pb-3">
            <h2 className="font-heading font-light text-xl text-dark-forest flex items-center gap-2">
              <BedDouble className="text-gold-accent" size={18} /> Recent Enquiries
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/bookings')} className="text-xs text-gold-accent font-semibold hover:text-dark-forest">
              View All
            </Button>
          </div>
          <div className="divide-y divide-stone/10">
            {recent?.recentBookings.length === 0 ? (
              <p className="text-text-secondary/70 text-sm py-6 text-center">No recent guest bookings found.</p>
            ) : recent?.recentBookings.map((b: any) => (
              <div key={b.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 hover:bg-stone-50/20 transition-colors">
                <div>
                  <p className="font-medium text-dark-forest">{b.name || `${b.firstName} ${b.lastName}`}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{b.roomName || b.roomType || 'Standard Inquiry'} • <span className="font-mono text-[11px]">{new Date(b.createdAt).toLocaleDateString()}</span></p>
                </div>
                <span className={`text-[10px] font-sans font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                  b.status === 'pending' ? 'bg-[#FAF4F2] text-[#8F4A3F] border border-[#EFE1DD]' : 'bg-[#EAF5F2] text-[#2C544B] border border-[#BFDFD6]'
                }`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages Card */}
        <div className="bg-white border border-stone/10 p-6 rounded-card shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-stone/10 pb-3">
            <h2 className="font-heading font-light text-xl text-dark-forest flex items-center gap-2">
              <MessageSquare className="text-gold-accent" size={18} /> Concierge Queries
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/messages')} className="text-xs text-gold-accent font-semibold hover:text-dark-forest">
              View All
            </Button>
          </div>
          <div className="divide-y divide-stone/10">
            {recent?.recentMessages.length === 0 ? (
              <p className="text-text-secondary/70 text-sm py-6 text-center">No recent messages found.</p>
            ) : recent?.recentMessages.map((m: any) => (
              <div key={m.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 hover:bg-stone-50/20 transition-colors">
                <div className="min-w-0 pr-4">
                  <p className="font-medium text-dark-forest truncate max-w-[280px]">{m.subject}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{m.name} • <span className="font-mono text-[11px]">{new Date(m.createdAt).toLocaleDateString()}</span></p>
                </div>
                <span className={`text-[10px] font-sans font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                  m.status === 'pending' ? 'bg-[#FAF4F2] text-[#8F4A3F] border border-[#EFE1DD]' : 'bg-stone-100 text-text-secondary border'
                }`}>{m.status === 'pending' ? 'Unread' : 'Read'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
