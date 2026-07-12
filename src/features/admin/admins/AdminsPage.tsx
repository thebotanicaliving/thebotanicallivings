import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/shared';
import { useToast } from '@/providers/ToastProvider';
import { Shield, Plus, Edit2, Trash2, X, AlertTriangle, Check, UserPlus } from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AdminCredential {
  uid: string;
  email: string;
  name: string;
  role: 'Administrator';
  createdAt: string;
}

export function AdminsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [admins, setAdmins] = useState<AdminCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminCredential | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // New Admin form state
  const [newAdmin, setNewAdmin] = useState({
    uid: '',
    email: '',
    name: ''
  });

  // Fetch Admins real-time
  useEffect(() => {
    if (!db) {
      setError("Firestore database is not initialized.");
      setLoading(false);
      return;
    }

    const path = 'admins';
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: AdminCredential[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            uid: doc.id,
            email: data.email || '',
            name: data.name || '',
            role: 'Administrator', // Enforce single flat role
            createdAt: data.createdAt || ''
          } as AdminCredential);
        });
        setAdmins(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (parsedError: any) {
          setError(parsedError.message);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    // Form validation
    const uidTrimmed = newAdmin.uid.trim();
    const emailTrimmed = newAdmin.email.trim();
    const nameTrimmed = newAdmin.name.trim();

    if (!uidTrimmed || !emailTrimmed || !nameTrimmed) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (!/^[a-zA-Z0-9_\-]+$/.test(uidTrimmed)) {
      showToast('UID contains invalid characters. Use alphanumeric characters, dashes, and underscores only.', 'error');
      return;
    }

    setIsSaving(true);
    const path = `admins/${uidTrimmed}`;
    try {
      await setDoc(doc(db, 'admins', uidTrimmed), {
        email: emailTrimmed,
        name: nameTrimmed,
        role: 'Administrator', // All admins are Administrators
        createdAt: new Date().toISOString()
      });
      
      showToast('Administrator authorized successfully', 'success');
      setNewAdmin({ uid: '', email: '', name: '' });
      setShowAddModal(false);
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch (parsedError: any) {
        showToast('Failed to add admin: ' + err.message, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedAdmin) return;

    const emailTrimmed = selectedAdmin.email.trim();
    const nameTrimmed = selectedAdmin.name.trim();

    if (!emailTrimmed || !nameTrimmed) {
      showToast('Please fill in Name and Email fields', 'error');
      return;
    }

    setIsSaving(true);
    const path = `admins/${selectedAdmin.uid}`;
    try {
      await setDoc(doc(db, 'admins', selectedAdmin.uid), {
        email: emailTrimmed,
        name: nameTrimmed,
        role: 'Administrator', // Maintain Administrator role
        createdAt: selectedAdmin.createdAt || new Date().toISOString()
      }, { merge: true });

      showToast('Administrator updated successfully', 'success');
      setShowEditModal(false);
      setSelectedAdmin(null);
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch (parsedError: any) {
        showToast('Failed to update admin: ' + err.message, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!db) return;
    
    // Safety check: Prevent self deletion
    if (adminId === user?.uid) {
      showToast('Security Alert: You cannot delete your own Administrator credential while logged in.', 'error');
      return;
    }

    if (!window.confirm('Are you absolutely sure you want to revoke admin credentials for this user? They will immediately lose access to the CMS.')) {
      return;
    }

    const path = `admins/${adminId}`;
    try {
      await deleteDoc(doc(db, 'admins', adminId));
      showToast('Admin credentials revoked successfully', 'success');
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch (parsedError: any) {
        showToast('Failed to revoke admin: ' + err.message, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary font-sans tracking-wide">Retrieving authorized credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1300px] mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-light tracking-wide text-dark-forest flex items-center gap-3">
            <Shield className="text-gold-accent w-6 h-6 sm:w-7 sm:h-7 shrink-0" /> Admin Credentials
          </h1>
          <p className="text-xs tracking-wider uppercase text-text-secondary/60 font-mono mt-1">
            Manage and Whitelist CMS Authorized Administrators
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="sm:self-start bg-dark-forest text-white hover:bg-forest">
          <UserPlus size={16} className="mr-2" /> Add Administrator
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-card mb-8 text-sm">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">Access Audit Failure</p>
              <p className="mt-1 font-mono text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Notice card */}
      <div className="bg-warm-cream border border-stone/15 rounded-card p-5 mb-8 text-sm flex gap-4 items-start">
        <Shield className="text-gold-accent w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-heading text-dark-forest font-semibold tracking-wide">Zero-Trust Authorized Admins Only</h4>
          <p className="text-text-secondary mt-1 leading-relaxed">
            By registering a user's Firebase Authentication UID, the corresponding account is immediately whitelisted in Firestore security rules. There are no hierarchies or access tiers—all registered admins hold full administrative credentials.
          </p>
        </div>
      </div>

      {/* Admins Table/List */}
      <div className="bg-white border border-stone/10 rounded-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone/10 text-xs font-sans tracking-wider uppercase text-text-secondary">
                <th className="py-4 px-6 font-semibold">User Details</th>
                <th className="py-4 px-6 font-semibold">Firebase UID</th>
                <th className="py-4 px-6 font-semibold">Role</th>
                <th className="py-4 px-6 font-semibold">Authorized Date</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10 text-sm">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-secondary">
                    No administrator credentials found. Use the "Add Administrator" button to register one.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.uid} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-dark-forest">{admin.name}</div>
                      <div className="text-xs text-text-secondary">{admin.email}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-text-secondary select-all">
                      {admin.uid}
                      {admin.uid === user?.uid && (
                        <span className="ml-2 bg-forest/10 text-forest text-[10px] px-2 py-0.5 rounded font-sans font-medium shrink-0">
                          Active Session
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-accent/10 text-gold-accent">
                        <Shield size={12} />
                        Administrator
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-text-secondary">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 hover:bg-stone-100 rounded text-text-secondary hover:text-dark-forest transition-colors"
                          title="Edit admin details"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.uid)}
                          disabled={admin.uid === user?.uid}
                          className={`p-1.5 hover:bg-red-50 rounded transition-colors ${
                            admin.uid === user?.uid ? 'opacity-30 cursor-not-allowed text-stone' : 'text-red-500 hover:text-red-700'
                          }`}
                          title={admin.uid === user?.uid ? "You cannot delete your own credentials" : "Revoke CMS access"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-xl max-w-md w-full border border-stone/10 overflow-hidden animate-slideUp">
            <div className="bg-dark-forest text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-heading font-light text-lg tracking-wide">New Administrator</h3>
                <p className="text-[10px] tracking-wider uppercase text-white/60 font-mono mt-0.5">Whitelist auth credentials</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-1">
                  Firebase UID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAdmin.uid}
                  onChange={(e) => setNewAdmin({ ...newAdmin, uid: e.target.value })}
                  placeholder="Enter user's exact Firebase UID"
                  className="w-full p-2.5 border border-stone/20 rounded focus:ring-1 focus:ring-gold-accent outline-none text-sm font-mono"
                />
                <p className="text-[10px] text-text-secondary/75 mt-1 leading-relaxed">
                  Required: Copy this directly from Firebase Authentication or user profile.
                </p>
              </div>

              <div>
                <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="e.g. Robert Smith"
                  className="w-full p-2.5 border border-stone/20 rounded focus:ring-1 focus:ring-gold-accent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="e.g. rsmith@botanicalliving.in"
                  className="w-full p-2.5 border border-stone/20 rounded focus:ring-1 focus:ring-gold-accent outline-none text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone/10">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-dark-forest text-white">
                  {isSaving ? 'Authorizing...' : 'Authorize User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-xl max-w-md w-full border border-stone/10 overflow-hidden animate-slideUp">
            <div className="bg-dark-forest text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-heading font-light text-lg tracking-wide">Edit Administrator</h3>
                <p className="text-[10px] tracking-wider uppercase text-white/60 font-mono mt-0.5">Update credentials</p>
              </div>
              <button onClick={() => { setShowEditModal(false); setSelectedAdmin(null); }} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-1">
                  Firebase UID (Immutable)
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedAdmin.uid}
                  className="w-full p-2.5 border border-stone/20 rounded bg-stone-100 text-text-secondary text-sm font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={selectedAdmin.name}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })}
                  className="w-full p-2.5 border border-stone/20 rounded focus:ring-1 focus:ring-gold-accent outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-sans tracking-widest uppercase text-text-secondary mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={selectedAdmin.email}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, email: e.target.value })}
                  className="w-full p-2.5 border border-stone/20 rounded focus:ring-1 focus:ring-gold-accent outline-none text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone/10">
                <Button type="button" variant="ghost" onClick={() => { setShowEditModal(false); setSelectedAdmin(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-dark-forest text-white">
                  {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminsPage;
