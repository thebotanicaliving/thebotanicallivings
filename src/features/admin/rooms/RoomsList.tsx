import { useState } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { Button } from '@/components/shared';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { roomService } from '@/services/room.service';
import { useToast } from '@/providers/ToastProvider';
import { ConfirmDialog } from '@/components/admin/dialogs/ConfirmDialog';

export function RoomsList() {
  const { rooms, loading, error, refresh } = useRooms();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await roomService.deleteRoom(deleteId);
      showToast('Room deleted', 'success');
      if (refresh) refresh();
    } catch (err) {
      showToast('Failed to delete room', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Button onClick={() => navigate('/admin/rooms/new')}>
          <Plus size={20} className="mr-2" /> New Room
        </Button>
      </div>
      <div className="bg-white rounded-card shadow overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-stone-50">
            <tr>
              <th className="p-4 text-left font-semibold text-stone-600">Room Name</th>
              <th className="p-4 text-left font-semibold text-stone-600">Price</th>
              <th className="p-4 text-left font-semibold text-stone-600">Status</th>
              <th className="p-4 text-right font-semibold text-stone-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-stone-500">No rooms found.</td></tr>
            ) : rooms.map((room) => (
              <tr key={room.id} className="border-b hover:bg-stone-50/50">
                <td className="p-4">
                  <div className="font-medium">{room.title}</div>
                  <div className="text-sm text-stone-500">{room.slug}</div>
                </td>
                <td className="p-4">{room.price}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${room.published ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-800'}`}>
                    {room.published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/rooms/${room.id}/edit`)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteId(room.id!)}>
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
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDestructive={true}
      />
    </div>
  );
}
