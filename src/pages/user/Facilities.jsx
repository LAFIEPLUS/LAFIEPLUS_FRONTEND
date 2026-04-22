import { useState } from 'react';
import { Building2, MapPin, Phone, Navigation, Search } from 'lucide-react';
import { facilityAPI } from '../../api/index.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import styles from './Facilities.module.css';

const typeColors = { hospital: 'red', clinic: 'orange', pharmacy: 'green', lab: 'blue', chw: 'purple' };

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [located, setLocated] = useState(false);
  const [filter, setFilter] = useState('');
  const [radius, setRadius] = useState(10000);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');

  const locate = () => {
    setError('');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        setLocated(true);
        try {
          const params = { lat, lng, radius };
          if (filter) params.type = filter;
          const res = await facilityAPI.getNearby(params);
          setFacilities(res.data.data.facilities || []);
        } catch { setError('Failed to load facilities.'); }
        finally { setLoading(false); }
      },
      () => { setError('Location access denied. Please enable location.'); setLoading(false); }
    );
  };

  const refilter = async (type) => {
    setFilter(type);
    if (!coords) return;
    setLoading(true);
    try {
      const params = { lat: coords.lat, lng: coords.lng, radius };
      if (type) params.type = type;
      const res = await facilityAPI.getNearby(params);
      setFacilities(res.data.data.facilities || []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerIcon}><Building2 size={22} /></div>
          <div>
            <h1 className={styles.title}>Find Facilities</h1>
            <p className={styles.subtitle}>Locate hospitals, clinics, pharmacies and health workers near you.</p>
          </div>
        </div>

        {!located ? (
          <Card className={styles.locateCard}>
            <div className={styles.locateContent}>
              <div className={styles.locateIcon}><Navigation size={32} /></div>
              <h2>Find facilities near you</h2>
              <p>Allow location access to discover nearby health facilities sorted by distance.</p>
              <div className={styles.radiusRow}>
                <label>Search radius:</label>
                <select value={radius} onChange={e => setRadius(Number(e.target.value))}>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                  <option value={20000}>20 km</option>
                  <option value={50000}>50 km</option>
                </select>
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
              <Button onClick={locate} loading={loading} size="lg" variant="green">
                <Navigation size={16} /> Use My Location
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className={styles.toolbar}>
              <div className={styles.filters}>
                {['', 'hospital', 'clinic', 'pharmacy', 'lab', 'chw'].map(t => (
                  <button key={t || 'all'}
                    className={[styles.filterBtn, filter === t ? styles.active : ''].join(' ')}
                    onClick={() => refilter(t)}>
                    {t || 'All'}
                  </button>
                ))}
              </div>
              <span className={styles.count}>{facilities.length} found</span>
            </div>

            {loading ? (
              <div className={styles.loadGrid}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
            ) : facilities.length === 0 ? (
              <div className={styles.empty}><Building2 size={40} /><p>No facilities found in this area</p></div>
            ) : (
              <div className={styles.grid}>
                {facilities.map(f => (
                  <Card key={f._id} hover className={styles.facilityCard}>
                    <div className={styles.facilityTop}>
                      <div className={[styles.typeTag, styles[typeColors[f.type] || 'orange']].join(' ')}>{f.type}</div>
                    </div>
                    <h3 className={styles.facilityName}>{f.name}</h3>
                    <div className={styles.facilityInfo}>
                      <span><MapPin size={13} />{f.address}</span>
                      {f.phone && <span><Phone size={13} />{f.phone}</span>}
                      {f.operatingHours && (
                        <span className={styles.hours}>
                          {typeof f.operatingHours === 'string' ? f.operatingHours : 'See details'}
                        </span>
                      )}
                    </div>
                    {f.services?.length > 0 && (
                      <div className={styles.services}>
                        {f.services.slice(0, 3).map(s => <span key={s} className={styles.service}>{s}</span>)}
                        {f.services.length > 3 && <span className={styles.service}>+{f.services.length - 3}</span>}
                      </div>
                    )}
                    {f.phone && (
                      <a href={`tel:${f.phone}`} className={styles.callBtn}>
                        <Phone size={14} /> Call Now
                      </a>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
