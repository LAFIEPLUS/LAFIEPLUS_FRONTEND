import { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { libraryAPI } from '../../api/index.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import styles from './Library.module.css';

const categories = ['all', 'maternal', 'adolescent', 'preventive', 'general'];

export default function Library() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'all') params.category = category;
    if (search) params.q = search;
    libraryAPI.getArticles(params)
      .then(r => setArticles(r.data.data.articles || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, [category, search]);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerIcon}><BookOpen size={22} /></div>
          <div>
            <h1 className={styles.title}>Health Library</h1>
            <p className={styles.subtitle}>Trusted health information for you and your family.</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input placeholder="Search articles..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.cats}>
            {categories.map(c => (
              <button key={c} className={[styles.catBtn, category === c ? styles.active : ''].join(' ')}
                onClick={() => setCategory(c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className={styles.loadGrid}>{[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div> :
         articles.length === 0 ? (
          <div className={styles.empty}><BookOpen size={40} /><p>No articles found</p></div>
        ) : (
          <div className={styles.grid}>
            {articles.map(a => (
              <Link key={a._id} to={`/library/${a._id}`} className={styles.articleCard}>
                {a.coverImage && <img src={a.coverImage} alt={a.title} className={styles.cover} />}
                <div className={styles.articleBody}>
                  <span className={[styles.catTag, styles[a.category]].join(' ')}>{a.category}</span>
                  <h3 className={styles.articleTitle}>{a.title}</h3>
                  <p className={styles.articleSummary}>{a.summary}</p>
                  <div className={styles.articleMeta}>
                    <span>{a.authorId?.name}</span>
                    <span>{new Date(a.publishedAt || a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
