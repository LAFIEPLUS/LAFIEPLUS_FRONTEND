import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, User } from 'lucide-react';
import { libraryAPI } from '../../api/index.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import styles from './Library.module.css';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    libraryAPI.getArticle(id)
      .then(r => setArticle(r.data.data.article))
      .catch(err => setError(err.response?.data?.message || 'Article not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.loadGrid}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.empty}>
          <BookOpen size={40} />
          <p>{error}</p>
          <button onClick={() => navigate('/library')} className={styles.catBtn}>
            Back to Library
          </button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Back button */}
        <Link to="/library" className={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Library
        </Link>

        {/* Cover image */}
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className={styles.detailCover}
          />
        )}

        {/* Header */}
        <div className={styles.detailHeader}>
          <span className={[styles.catTag, styles[article.category]].join(' ')}>
            {article.category}
          </span>
          <h1 className={styles.detailTitle}>{article.title}</h1>
          {article.summary && (
            <p className={styles.detailSummary}>{article.summary}</p>
          )}
          <div className={styles.detailMeta}>
            <span className={styles.metaItem}>
              <User size={14} />
              {article.authorId?.name || 'Lafieplus Team'}
            </span>
            <span className={styles.metaItem}>
              <Calendar size={14} />
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>
          {article.tags?.length > 0 && (
            <div className={styles.tags}>
              {article.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Article body */}
        <div
          className={styles.detailBody}
          dangerouslySetInnerHTML={{ __html: formatBody(article.body) }}
        />

      </div>
    </DashboardLayout>
  );
}

// Convert markdown-style headings and line breaks to HTML
function formatBody(text) {
  if (!text) return '';
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')
    .replace(/<p><\/p>/g, '');
}