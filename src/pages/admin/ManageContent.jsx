import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { libraryAPI } from '../../api/index.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import styles from './ManageContent.module.css';

const EMPTY_FORM = { title: '', summary: '', body: '', category: 'general', locale: 'en', status: 'draft', tags: '' };

export default function ManageContent() {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await libraryAPI.getArticles(params);
      setArticles(res.data.data.articles || []);
      setTotal(res.data.data.total || 0);
      setPages(res.data.data.pages || 1);
    } catch { toast.error('Failed to load articles'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); }, [page, statusFilter, categoryFilter]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (a) => {
    setForm({ title: a.title, summary: a.summary || '', body: a.body, category: a.category, locale: a.locale, status: a.status, tags: (a.tags || []).join(', ') });
    setModal({ type: 'edit', id: a._id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (modal === 'create') {
        await libraryAPI.createArticle(payload);
        toast.success('Article created!');
      } else {
        await libraryAPI.updateArticle(modal.id, payload);
        toast.success('Article updated!');
      }
      setModal(null);
      fetchArticles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await libraryAPI.deleteArticle(deleteId);
      toast.success('Article deleted');
      setDeleteId(null);
      fetchArticles();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const toggleStatus = async (article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      await libraryAPI.updateArticle(article._id, { status: newStatus });
      setArticles(p => p.map(a => a._id === article._id ? { ...a, status: newStatus } : a));
      toast.success(`Article ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Content Management</h1>
            <p className={styles.subtitle}>{total} articles in the health library.</p>
          </div>
          <Button onClick={openCreate}><Plus size={15} /> New Article</Button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.filters}>
            {['', 'published', 'draft', 'archived'].map(s => (
              <button key={s || 'all'}
                className={[styles.filterBtn, statusFilter === s ? styles.active : ''].join(' ')}
                onClick={() => { setStatusFilter(s); setPage(1); }}>
                {s || 'All Status'}
              </button>
            ))}
          </div>
          <div className={styles.filters}>
            {['', 'maternal', 'adolescent', 'preventive', 'general'].map(c => (
              <button key={c || 'all'}
                className={[styles.filterBtn, categoryFilter === c ? styles.activeGreen : ''].join(' ')}
                onClick={() => { setCategoryFilter(c); setPage(1); }}>
                {c || 'All Categories'}
              </button>
            ))}
          </div>
        </div>

        <Card className={styles.tableCard}>
          {loading ? <div className={styles.loadBox}><div className={styles.spinner} /></div> :
           articles.length === 0 ? <div className={styles.empty}><p>No articles found</p></div> : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(a => (
                    <tr key={a._id}>
                      <td>
                        <div className={styles.articleTitle}>{a.title}</div>
                        {a.summary && <div className={styles.articleSummary}>{a.summary.substring(0, 60)}...</div>}
                      </td>
                      <td><span className={[styles.catTag, styles[a.category]].join(' ')}>{a.category}</span></td>
                      <td><span className={[styles.statusTag, styles[a.status]].join(' ')}>{a.status}</span></td>
                      <td className={styles.viewCount}>{a.viewCount || 0}</td>
                      <td className={styles.dateCell}>{new Date(a.publishedAt || a.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} title={a.status === 'published' ? 'Unpublish' : 'Publish'}
                            onClick={() => toggleStatus(a)}>
                            {a.status === 'published'
                              ? <EyeOff size={15} style={{ color: 'var(--warning)' }} />
                              : <Eye size={15} style={{ color: 'var(--green)' }} />}
                          </button>
                          <button className={styles.actionBtn} title="Edit" onClick={() => openEdit(a)}>
                            <Pencil size={14} style={{ color: 'var(--orange)' }} />
                          </button>
                          <button className={styles.actionBtn} title="Delete" onClick={() => setDeleteId(a._id)}>
                            <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>&larr; Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next &rarr;</button>
            </div>
          )}
        </Card>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>{modal === 'create' ? 'New Article' : 'Edit Article'}</h2>
              <button onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Title *</label>
                <input required value={form.title} onChange={set('title')} placeholder="Article title..." />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Category *</label>
                  <select value={form.category} onChange={set('category')}>
                    <option value="general">General</option>
                    <option value="maternal">Maternal</option>
                    <option value="adolescent">Adolescent</option>
                    <option value="preventive">Preventive</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Status</label>
                  <select value={form.status} onChange={set('status')}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Locale</label>
                  <select value={form.locale} onChange={set('locale')}>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="tw">Twi</option>
                    <option value="ha">Hausa</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label>Summary</label>
                <input value={form.summary} onChange={set('summary')} placeholder="Brief summary (max 300 chars)..." maxLength={300} />
              </div>
              <div className={styles.field}>
                <label>Tags <span className={styles.hint}>(comma-separated)</span></label>
                <input value={form.tags} onChange={set('tags')} placeholder="malaria, prevention, mosquito" />
              </div>
              <div className={styles.field}>
                <label>Body *</label>
                <textarea required rows={10} value={form.body} onChange={set('body')} placeholder="Write the full article content here..." />
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
                <Button type="submit" loading={saving}>
                  {modal === 'create' ? <><Plus size={14} /> Create Article</> : <><Pencil size={14} /> Save Changes</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <h2>Delete Article?</h2>
            <p>This will archive the article and remove it from the public library. This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" loading={deleting} onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}