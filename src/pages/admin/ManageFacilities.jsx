import { useState, useEffect } from 'react';
import { Plus, Pencil, X, MapPin, Phone, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { facilityAPI } from '../../api/index.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import styles from './ManageFacilities.module.css';

const EMPTY_FORM = { name: '', type: 'clinic', address: '', latitude: '', longitude: '', phone: '', email: '', website: '', services: '', operatingHours: '' };

const typeColors = { hospital: 'red', clinic: 'orange', pharmacy: 'green', lab: 'blue', chw: 'purple' };

export default function ManageFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | { type:'edit', facility }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      // Use getNearby with a broad search — since we don't have a list-all endpoint,
      // we use the admin's perspective: get facilities by type or name search
      // The backend facility routes only have nearby/suggest/id/create/update
      // So we fetch by getting the first 50 from suggest with a dummy location
      // Actually we just call getOne won't work for list — we build the list from
      // repeated calls. Instead we'll show an "add facilities" focused UI
      // and load them via the nearby endpoint with a central Ghana coordinate
      const res = await facilityAPI.getNearby({ lat: 7.9465, lng: -1.0232, radius: 500000 });
      setFacilities(res.data.data.facilities || []);
    } catch { toast.error('Failed to load facilities'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (f) => {
    setForm({
      name: f.name, type: f.type, address: f.address,
      latitude: f.location?.coordinates?.[1] || '',
      longitude: f.location?.coordinates?.[0] || '',
      phone: f.phone || '', email: f.email || '', website: f.website || '',
      services: (f.services || []).join(', '),
      operatingHours: typeof f.operatingHours === 'string' ? f.operatingHours : '',
    });
    setModal({ type: 'edit', id: f._id, isActive: f.isActive !== false });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const lat = Number.parseFloat(form.latitude);
    const lng = Number.parseFloat(form.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error('Enter valid latitude and longitude');
      return;
    }
    // Backend Joi + controller expect `coordinates: [longitude, latitude]` → stored as GeoJSON Point
    const payload = {
      name: form.name.trim(),
      type: form.type,
      address: form.address.trim(),
      coordinates: [lng, lat],
      services: form.services ? form.services.split(',').map(s => s.trim()).filter(Boolean) : [],
      operatingHours: form.operatingHours?.trim() || undefined,
    };
    if (form.phone?.trim()) payload.phone = form.phone.trim();
    if (form.email?.trim()) payload.email = form.email.trim();
    if (form.website?.trim()) payload.website = form.website.trim();

    setSaving(true);
    try {
      if (modal === 'create') {
        await facilityAPI.create(payload);
        toast.success('Facility created!');
      } else {
        await facilityAPI.update(modal.id, { ...payload, isActive: modal.isActive !== false });
        toast.success('Facility updated!');
      }
      setModal(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const filtered = facilities.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Facility Management</h1>
            <p className={styles.subtitle}>{facilities.length} facilities registered on the platform.</p>
          </div>
          <Button onClick={openCreate}><Plus size={15} /> Add Facility</Button>
        </div>

        <div className={styles.toolbar}>
          <input className={styles.searchInput} placeholder="Search by name or address..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className={styles.loadGrid}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
        ) : filtered.length === 0 ? (
          <Card className={styles.empty}>
            <Building2 size={40} />
            <h3>No facilities found</h3>
            <p>Add a facility using the button above.</p>
          </Card>
        ) : (
          <div className={styles.grid}>
            {filtered.map(f => (
              <Card key={f._id} className={styles.facilityCard}>
                <div className={styles.facilityTop}>
                  <span className={[styles.typeTag, styles[typeColors[f.type] || 'orange']].join(' ')}>{f.type}</span>
                  <button className={styles.editBtn} onClick={() => openEdit(f)} title="Edit">
                    <Pencil size={14} />
                  </button>
                </div>
                <h3 className={styles.facilityName}>{f.name}</h3>
                <div className={styles.facilityInfo}>
                  {f.address && <span><MapPin size={12} />{f.address}</span>}
                  {f.phone && <span><Phone size={12} />{f.phone}</span>}
                  {f.operatingHours && <span className={styles.hours}>{typeof f.operatingHours === 'string' ? f.operatingHours : 'See details'}</span>}
                </div>
                {f.services?.length > 0 && (
                  <div className={styles.services}>
                    {f.services.slice(0, 3).map(s => <span key={s} className={styles.service}>{s}</span>)}
                    {f.services.length > 3 && <span className={styles.service}>+{f.services.length - 3}</span>}
                  </div>
                )}
                <div className={[styles.activeTag, f.isActive ? styles.active : styles.inactive].join(' ')}>
                  {f.isActive ? 'Active' : 'Inactive'}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>{modal === 'create' ? 'Add Facility' : 'Edit Facility'}</h2>
              <button onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Facility Name *</label>
                <input required value={form.name} onChange={set('name')} placeholder="e.g. Korle Bu Teaching Hospital" />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Type *</label>
                  <select value={form.type} onChange={set('type')}>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="lab">Lab</option>
                    <option value="chw">CHW</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Phone</label>
                  <input value={form.phone} onChange={set('phone')} placeholder="+233 XX XXX XXXX" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Address *</label>
                <input required value={form.address} onChange={set('address')} placeholder="Full address" />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Latitude *</label>
                  <input required type="number" step="any" value={form.latitude} onChange={set('latitude')} placeholder="e.g. 5.5600" />
                </div>
                <div className={styles.field}>
                  <label>Longitude *</label>
                  <input required type="number" step="any" value={form.longitude} onChange={set('longitude')} placeholder="e.g. -0.2050" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Services <span className={styles.hint}>(comma-separated)</span></label>
                <input value={form.services} onChange={set('services')} placeholder="Emergency, Maternity, Surgery" />
              </div>
              <div className={styles.field}>
                <label>Operating Hours</label>
                <input value={form.operatingHours} onChange={set('operatingHours')} placeholder="e.g. 24 hours / Mon-Fri 8am-5pm" />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="facility@email.com" />
                </div>
                <div className={styles.field}>
                  <label>Website</label>
                  <input value={form.website} onChange={set('website')} placeholder="https://..." />
                </div>
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
                <Button type="submit" loading={saving}>
                  {modal === 'create' ? <><Plus size={14} /> Add Facility</> : <><Pencil size={14} /> Save Changes</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}