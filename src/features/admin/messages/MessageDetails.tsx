import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { contactService } from '@/services/contact.service';
import { Button } from '@/components/shared';
import { ArrowLeft, Trash2, Mail } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';

export function MessageDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages, loading } = useMessages();
  const { showToast } = useToast();

  const msg = messages.find(m => m.id === id);

  useEffect(() => {
    if (msg && msg.status === 'pending') {
      contactService.updateContactStatus(id!, 'reviewed');
    }
  }, [msg, id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!msg) return <div className="p-8 text-center">Message not found</div>;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await contactService.deleteContact(id!);
        showToast('Message deleted', 'success');
        navigate('/admin/messages');
      } catch (error) {
        showToast('Failed to delete', 'error');
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/admin/messages')} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2" size={20} /> Back to Messages
      </Button>
      
      <div className="bg-white p-8 rounded-card shadow-lg relative">
        <div className="absolute top-8 right-8 flex space-x-2">
          <Button variant="outline" onClick={() => window.location.href = `mailto:${msg.email}`}>
            <Mail size={16} className="mr-2" /> Reply
          </Button>
          <Button variant="outline" className="text-red-500 border-red-200" onClick={handleDelete}>
            <Trash2 size={16} />
          </Button>
        </div>

        <div className="mb-8 border-b pb-6 pr-40">
          <h1 className="text-2xl font-bold mb-4">{msg.subject}</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-stone-500">From:</span> <span className="font-medium">{msg.name}</span></div>
            <div><span className="text-stone-500">Email:</span> <a href={`mailto:${msg.email}`} className="text-forest hover:underline">{msg.email}</a></div>
            <div><span className="text-stone-500">Phone:</span> {msg.phone}</div>
            <div><span className="text-stone-500">Date:</span> {new Date(msg.createdAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="prose max-w-none text-stone-800 whitespace-pre-wrap">
          {msg.message}
        </div>
      </div>
    </div>
  );
}
