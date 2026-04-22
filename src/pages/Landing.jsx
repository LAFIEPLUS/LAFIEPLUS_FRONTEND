import { Link } from 'react-router-dom';
import { Activity, BookOpen, Building2, MessageSquare, Shield, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';
import styles from './Landing.module.css';

const features = [
  { icon: Activity, title: 'AI Symptom Checker', desc: 'Get intelligent risk assessments and personalised next steps in seconds.', color: 'orange' },
  { icon: BookOpen, title: 'Health Library', desc: 'Trusted, localised health content on maternal health, adolescent care and prevention.', color: 'green' },
  { icon: Building2, title: 'Facility Locator', desc: 'Find clinics, hospitals and pharmacies near you, filtered by your needs.', color: 'orange' },
  { icon: MessageSquare, title: 'Partner Consultations', desc: 'Connect with verified health professionals for real-time guidance.', color: 'green' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your health data is encrypted and protected to the highest standards.', color: 'orange' },
  { icon: Smartphone, title: 'Multi-Channel Access', desc: 'Access via web, SMS or USSD — works even on basic phones.', color: 'green' },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '200+', label: 'Health Partners' },
  { value: '1,200+', label: 'Facilities Listed' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.logoIcon}>+</div>
          <span><span className={styles.orange}>Lafie</span><span className={styles.green}>plus</span></span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login" className={styles.loginLink}>Sign In</Link>
          <Link to="/register" className={styles.ctaBtn}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            Trusted Health Platform for Africa
          </div>
          <h1 className={styles.heroTitle}>
            Connecting Health,<br />
            <span className={styles.gradientText}>Creating Futures.</span>
          </h1>
          <p className={styles.heroDesc}>
            Lafieplus delivers AI-assisted health guidance, expert consultations,
            and trusted health information — making quality healthcare accessible to everyone.
          </p>
          <div className={styles.heroCta}>
            <Link to="/register" className={styles.primaryBtn}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className={styles.secondaryBtn}>
              Sign In
            </Link>
          </div>
          <div className={styles.heroChecks}>
            {['Free to use', 'No appointment needed', 'Available 24/7'].map(t => (
              <span key={t} className={styles.heroCheck}><CheckCircle size={14} />{t}</span>
            ))}
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <Activity size={20} />
              <span>Symptom Check</span>
              <span className={styles.heroCardBadge}>AI Powered</span>
            </div>
            <div className={styles.heroCardSymptoms}>
              {['Headache', 'Fever', 'Fatigue'].map(s => (
                <span key={s} className={styles.symptomTag}>{s}</span>
              ))}
            </div>
            <div className={styles.heroCardResult}>
              <div className={styles.riskBar}><div className={styles.riskFill} /></div>
              <div className={styles.riskInfo}>
                <span className={styles.riskLabel}>Moderate Risk</span>
                <span className={styles.riskSub}>Seek care within 48h</span>
              </div>
            </div>
          </div>
          <div className={styles.floatCard1}>
            <Building2 size={16} />
            <div><p>Korle Bu Hospital</p><p>0.8 km away</p></div>
          </div>
          <div className={styles.floatCard2}>
            <CheckCircle size={16} />
            <div><p>Partner Connected</p><p>Dr. Amara Osei</p></div>
          </div>
          <div className={styles.heroBg} />
        </div>
      </section>

      {/* STATS */}
      <section className={styles.stats}>
        {stats.map(({ value, label }) => (
          <div key={label} className={styles.statItem}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionTag}>Everything you need</p>
          <h2 className={styles.sectionTitle}>Your complete health companion</h2>
          <p className={styles.sectionDesc}>From symptom checks to specialist consultations — all in one platform.</p>
        </div>
        <div className={styles.featureGrid}>
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={styles.featureCard}>
              <div className={[styles.featureIcon, styles[color]].join(' ')}>
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2>Start your health journey today</h2>
          <p>Join thousands of users accessing quality health guidance across Africa.</p>
          <Link to="/register" className={styles.ctaMainBtn}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <span><span className={styles.orange}>Lafie</span><span className={styles.green}>plus</span></span>
          <p>Connecting Health, Creating Futures.</p>
        </div>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} Lafieplus. All rights reserved.</p>
      </footer>
    </div>
  );
}
