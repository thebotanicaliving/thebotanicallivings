import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/shared';
import { Eye, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contactService } from '@/services/contact.service';
import { useToast } from '@/providers/ToastProvider';
import { ConfirmDialog } from '@/components/admin/dialogs/ConfirmDialog';

export function MessagesList() {
  const { messages, loading } = useMessages();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = messages.filter((m) => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (id: string, status: 'pending' | 'reviewed' | 'archived') => {
    try {
      await contactService.updateContactStatus(id, status);
      showToast('Status updated', 'success');
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await contactService.deleteContact(deleteId);
      showToast('Message deleted', 'success');
    } catch (error) {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className="p-8">Loading messages...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="mb-6 bg-white p-4 rounded-card shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Search messages by name, email, or subject..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-card shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-stone-600">Sender</th>
              <th className="p-4 font-semibold text-stone-600">Subject</th>
              <th className="p-4 font-semibold text-stone-600">Status</th>
              <th className="p-4 font-semibold text-stone-600">Date</th>
              <th className="p-4 font-semibold text-stone-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-stone-500">No messages found.</td></tr>
            ) : filtered.map((msg) => (
              <tr key={msg.id} className={`border-b hover:bg-stone-50/50 ${msg.status === 'pending' ? 'bg-forest/5' : ''}`}>
                <td className="p-4">
                  <div className="font-medium">{msg.name}</div>
                  <div className="text-sm text-stone-500">{msg.email}</div>
                </td>
                <td className="p-4 text-sm truncate max-w-xs">{msg.subject}</td>
                <td className="p-4">
                  <select 
                    value={msg.status}
                    onChange={(e) => handleStatusChange(msg.id!, e.target.value as any)}
                    className="text-sm py-1 px-2 rounded-full border bg-white"
                  >
                    <option value="pending">Unread</option>
                    <option value="reviewed">Read</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="p-4 text-sm">{new Date(msg.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/messages/${msg.id}`)}>
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteId(msg.id!)}>
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDestructive={true}
      />
    </div>
  );
}
