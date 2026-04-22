import { useState, useEffect } from 'react';
import { Search, Trash2, Mail, ToggleLeft, ToggleRight, Shield, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import styles from './ManageUsers.module.css';

export default function ManageUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modals
  const [notifyModal, setNotifyModal] = useState(null); // user object
  const [notifyForm, setNotifyForm] = useState({ subject: '', message: '' });
  const [notifying, setNotifying] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await userAPI.getAllUsers(params);
      setUsers(res.data.data.users || []);
      setTotal(res.data.data.total || 0);
      setPages(res.data.data.pages || 1);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchUsers(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleRoleChange = async (userId, role) => {
    try {
      await userAPI.updateUserRole(userId, role);
      setUsers(p => p.map(u => u._id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleStatusToggle = async (userId, current) => {
    try {
      await userAPI.updateUserStatus(userId, !current);
      setUsers(p => p.map(u => u._id === userId ? { ...u, isActive: !current } : u));
      toast.success(!current ? 'User activated' : 'User deactivated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleNotify = async (e) => {
    e.preventDefault();
    setNotifying(true);
    try {
      await userAPI.notifyUser(notifyModal._id, notifyForm);
      toast.success(`Email sent to ${notifyModal.name}`);
      setNotifyModal(null);
      setNotifyForm({ subject: '', message: '' });
    } catch { toast.error('Failed to send email'); }
    finally { setNotifying(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userAPI.deleteUser(deleteModal._id);
      setUsers(p => p.filter(u => u._id !== deleteModal._id));
      toast.success('User deleted');
      setDeleteModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(false); }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>User Management</h1>
            <p className={styles.subtitle}>{total} total users registered on the platform.</p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={15} />
            <input placeholder="Search by name or email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className={styles.filters}>
            {['', 'user', 'partner', 'admin'].map(r => (
              <button key={r || 'all'}
                className={[styles.filterBtn, roleFilter === r ? styles.active : ''].join(' ')}
                onClick={() => { setRoleFilter(r); setPage(1); }}>
                {r || 'All Roles'}
              </button>
            ))}
          </div>
        </div>

        <Card className={styles.tableCard}>
          {loading ? (
            <div className={styles.loadBox}><div className={styles.spinner} /></div>
          ) : users.length === 0 ? (
            <div className={styles.empty}><p>No users found</p></div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className={!u.isActive ? styles.inactiveRow : ''}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>{u.name[0]}</div>
                          <span className={styles.userName}>{u.name}</span>
                        </div>
                      </td>
                      <td className={styles.contactCell}>
                        <span>{u.email || '—'}</span>
                        {u.phone && <span className={styles.phone}>{u.phone}</span>}
                      </td>
                      <td>
                        {u._id === me?._id || u._id === me?.id ? (
                          <span className={styles.roleTag}>{u.role}</span>
                        ) : (
                          <div className={styles.roleSelect}>
                            <select value={u.role}
                              onChange={e => handleRoleChange(u._id, e.target.value)}>
                              <option value="user">user</option>
                              <option value="partner">partner</option>
                              <option value="admin">admin</option>
                            </select>
                            <ChevronDown size={12} />
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={[styles.statusDot, u.isActive ? styles.active : styles.inactive].join(' ')}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {/* Toggle active */}
                          {u._id !== me?._id && u._id !== me?.id && (
                            <button className={styles.actionBtn}
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                              onClick={() => handleStatusToggle(u._id, u.isActive)}>
                              {u.isActive
                                ? <ToggleRight size={16} style={{ color: 'var(--green)' }} />
                                : <ToggleLeft size={16} style={{ color: 'var(--muted)' }} />}
                            </button>
                          )}
                          {/* Notify */}
                          {u.email && (
                            <button className={styles.actionBtn} title="Send email"
                              onClick={() => setNotifyModal(u)}>
                              <Mail size={15} style={{ color: 'var(--orange)' }} />
                            </button>
                          )}
                          {/* Delete */}
                          {u._id !== me?._id && u._id !== me?.id && (
                            <button className={styles.actionBtn} title="Delete user"
                              onClick={() => setDeleteModal(u)}>
                              <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>&larr; Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next &rarr;</button>
            </div>
          )}
        </Card>
      </div>

      {/* NOTIFY MODAL */}
      {notifyModal && (
        <div className={styles.overlay} onClick={() => setNotifyModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Email {notifyModal.name}</h2>
              <button onClick={() => setNotifyModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleNotify} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Subject</label>
                <input required value={notifyForm.subject}
                  onChange={e => setNotifyForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Email subject..." />
              </div>
              <div className={styles.field}>
                <label>Message</label>
                <textarea required rows={5} value={notifyForm.message}
                  onChange={e => setNotifyForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Write your message..." />
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setNotifyModal(null)}>Cancel</Button>
                <Button type="submit" loading={notifying}><Mail size={14} /> Send Email</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteModal && (
        <div className={styles.overlay} onClick={() => setDeleteModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Delete User</h2>
              <button onClick={() => setDeleteModal(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalForm}>
              <p className={styles.deleteMsg}>
                Are you sure you want to permanently delete <strong>{deleteModal.name}</strong>?
                This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
                <Button variant="danger" loading={deleting} onClick={handleDelete}>
                  <Trash2 size={14} /> Delete User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}