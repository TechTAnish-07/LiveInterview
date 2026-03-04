import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { body } from 'framer-motion/client';


const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isHR } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: '🎥',
      title: 'Live Video Interviews',
      description: 'Crystal-clear HD video calls with real-time collaboration',
    },
    {
      icon: '💻',
      title: 'Integrated Code Editor',
      description: 'Built-in compiler supporting multiple programming languages',
    },
    {
      icon: '🔒',
      title: 'Security Monitoring',
      description: 'Advanced proctoring with tab switching and copy-paste detection',
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track performance, engagement, and security metrics instantly',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Interviews Conducted' },
    { value: '99.9%', label: 'Uptime Reliability' },
    { value: '500+', label: 'Companies Trust Us' },
    { value: '4.9/5', label: 'Average Rating' },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(isHR ? '/dashboard/hr' : '/dashboard/candidate');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={{
        ...styles.hero,
        transform: `translateY(${scrollY * 0.5}px)`,
      }}>
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <div style={styles.badge}>
              <span style={styles.badgeDot}>●</span>
              <span style={styles.badgeText}>Live Interview Platform</span>
            </div>

            <h1 style={styles.heroTitle}>
              Conduct Technical
              <span style={styles.heroTitleAccent}> Interviews</span>
              <br />
              That Actually Work
            </h1>

            <p style={styles.heroDescription}>
              The only platform that combines video calling, code compilation,
              and advanced security monitoring in one seamless experience.
              Stop juggling multiple tools and start hiring better talent.
            </p>

            <div style={styles.heroButtons}>
              <button
                onClick={handleGetStarted}
                style={styles.primaryButton}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Get Started Free
                <span style={styles.buttonArrow}>→</span>
              </button>

              <button
                onClick={() => navigate('/demoVideo')}
                style={styles.secondaryButton}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                Watch Demo
                <span style={styles.playIcon}>▶</span>
              </button>
            </div>

            <div style={styles.socialProof}>
              <div style={styles.avatarGroup}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    ...styles.avatar,
                    marginLeft: i > 1 ? '-12px' : '0',
                    zIndex: 5 - i,
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, 
                        hsl(${i * 60}, 70%, 60%), 
                        hsl(${i * 60 + 30}, 70%, 50%))`,
                    }} />
                  </div>
                ))}
              </div>
              <p style={styles.socialProofText}>
                <strong>2,847</strong> interviews conducted this week
              </p>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={{
              ...styles.floatingCard,
              animation: 'float 6s ease-in-out infinite',
            }}>
              <div style={styles.mockInterview}>
                <div style={styles.mockHeader}>
                  <div style={styles.mockDots}>
                    <span style={{ ...styles.dot, background: '#ff5f56' }} />
                    <span style={{ ...styles.dot, background: '#ffbd2e' }} />
                    <span style={{ ...styles.dot, background: '#27c93f' }} />
                  </div>
                  <span style={styles.mockTitle}>Live Interview</span>
                  <div style={styles.recordingBadge}>
                    <span style={styles.recordingDot} />
                    REC
                  </div>
                </div>

                <div style={styles.mockVideo}>
                  <div style={styles.videoPlaceholder}>
                    <div style={styles.videoIcon}>👨‍💼</div>
                    <p style={styles.videoLabel}>Interviewer</p>
                  </div>
                  <div style={{ ...styles.videoPlaceholder, gridColumn: '2' }}>
                    <div style={styles.videoIcon}>👨‍💻</div>
                    <p style={styles.videoLabel}>Candidate</p>
                  </div>
                </div>

                <div style={styles.mockCode}>
                  <div style={styles.codeLine}>
                    <span style={{ color: '#ff79c6' }}>function</span>{' '}
                    <span style={{ color: '#50fa7b' }}>createInterview</span>
                    <span style={{ color: '#f8f8f2' }}>(candidateEmail, interviewTime) {'{'}</span>
                  </div>

                  <div style={{ ...styles.codeLine, paddingLeft: '20px' }}>
                    <span style={{ color: '#ff79c6' }}>const</span>{' '}
                    <span style={{ color: '#8be9fd' }}>interview</span>{' '}
                    <span style={{ color: '#f8f8f2' }}>= {'{'}</span>
                  </div>

                  <div style={{ ...styles.codeLine, paddingLeft: '40px' }}>
                    <span style={{ color: '#f8f8f2' }}>email: candidateEmail,</span>
                  </div>

                  <div style={{ ...styles.codeLine, paddingLeft: '40px' }}>
                    <span style={{ color: '#f8f8f2' }}>time: interviewTime</span>
                  </div>

                  <div style={{ ...styles.codeLine, paddingLeft: '20px' }}>
                    <span style={{ color: '#f8f8f2' }}>{'}'};</span>
                  </div>

                  <div style={{ ...styles.codeLine, paddingLeft: '20px' }}>
                    <span style={{ color: '#ff79c6' }}>return</span>{' '}
                    <span style={{ color: '#f1fa8c' }}>'created'</span>;
                  </div>

                  <div style={styles.codeLine}>
                    <span style={{ color: '#f8f8f2' }}>{'}'}</span>
                  </div>

                  <div style={styles.securityIndicator}>
                    <span style={styles.securityIcon}>🔒</span>
                    <span style={styles.securityText}>Secure Session Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div style={{ ...styles.floatingOrb, top: '10%', left: '5%', animation: 'orbit 20s linear infinite' }} />
        <div style={{ ...styles.floatingOrb, top: '70%', right: '10%', animation: 'orbit 15s linear infinite reverse' }} />
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                ...styles.statCard,
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>FEATURES</span>
          <h2 style={styles.sectionTitle}>
            Everything You Need to
            <br />
            <span style={styles.sectionTitleAccent}>Run Perfect Interviews</span>
          </h2>
        </div>

        <div style={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                ...styles.featureCard,
                background: activeFeature === idx
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                  : 'rgba(255, 255, 255, 0.03)',
                borderColor: activeFeature === idx ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                transform: activeFeature === idx ? 'translateY(-8px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setActiveFeature(idx)}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorksSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>HOW IT WORKS</span>
          <h2 style={styles.sectionTitle}>
            From Setup to Hire
            <br />
            <span style={styles.sectionTitleAccent}>In Three Simple Steps</span>
          </h2>
        </div>

        <div style={styles.stepsContainer}>
          {[
            {
              step: '01',
              title: 'Schedule Interview',
              description: 'Create your interview room and send the link to your candidate',
              color: '#3b82f6',
            },
            {
              step: '02',
              title: 'Conduct Interview',
              description: 'Use video, code editor, and real-time collaboration tools',
              color: '#8b5cf6',
            },
            {
              step: '03',
              title: 'Review & Decide',
              description: 'Access recordings, code submissions, and security reports',
              color: '#06b6d4',
            },
          ].map((item, idx) => (
            <div key={idx} style={styles.stepCard}>
              <div style={{ ...styles.stepNumber, background: item.color }}>
                {item.step}
              </div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>{item.title}</h3>
                <p style={styles.stepDescription}>{item.description}</p>
              </div>
              {idx < 2 && <div style={styles.stepConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>
            Ready to Transform Your
            <br />
            Hiring Process?
          </h2>
          <p style={styles.ctaDescription}>
            Join hundreds of companies conducting better technical interviews
          </p>
          <button
            onClick={handleGetStarted}
            style={styles.ctaButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 10px 40px rgba(59, 130, 246, 0.3)';
            }}
          >
            Start Your Free Trial
            <span style={styles.ctaButtonArrow}>→</span>
          </button>
          <p style={styles.ctaNote}>No credit card required • 14-day free trial</p>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Bricolage+Grotesque:wght@600;700;800&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        * {
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>
    </div>
  );
};

const styles = {

  container: {
    background: 'linear-gradient(180deg,rgb(96, 106, 142) 0%, #1a1f35 100%)',
    minHeight: '100vh',
    color: '#fff',
    overflow: 'hidden',
    width: '100%',
  },

  hero: {
    padding: '120px 60px',
    position: 'relative',
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
  },

  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    alignItems: 'center',
    zIndex: 2,
    position: 'relative',
  },

  heroLeft: {
    animation: 'slideUp 0.8s ease-out',
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'hsla(13, 84.30%, 52.50%, 0.10)',
    border: '1px solid rgba(0, 0, 0, 0.3)',
    padding: '8px 16px',
    borderRadius: '100px',
    marginBottom: '24px',
  },

  badgeDot: {
    color: 'red',
    fontSize: '13px',
    animation: 'pulse 2s ease-in-out infinite',
  },

  badgeText: {
    fontSize: '18px',
    fontWeight: '800',
    color: 'red',
    letterSpacing: '0.5px',
  },

  heroTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '72px',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '24px',
    letterSpacing: '-0.02em',
  },

  heroTitleAccent: {
    background: 'linear-gradient(135deg,rgb(6, 71, 176),rgb(187, 178, 206))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  heroDescription: {
    fontSize: '20px',
    lineHeight: '1.6',
    color: '#94a3b8',
    marginBottom: '40px',
    maxWidth: '540px',
  },

  heroButtons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '48px',
  },

  primaryButton: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    border: 'none',
    padding: '18px 36px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
  },

  buttonArrow: {
    transition: 'transform 0.3s ease',
  },

  secondaryButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '18px 36px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },

  playIcon: {
    fontSize: '12px',
  },

  socialProof: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  avatarGroup: {
    display: 'flex',
    alignItems: 'center',
  },

  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '3px solid #0a0e1a',
    overflow: 'hidden',
  },

  socialProofText: {
    fontSize: '15px',
    color: '#94a3b8',
  },

  heroRight: {
    position: 'relative',
    animation: 'slideUp 0.8s ease-out 0.2s backwards',
  },

  floatingCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
  },

  mockInterview: {
    padding: '0',
  },

  mockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },

  mockDots: {
    display: 'flex',
    gap: '8px',
  },

  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },

  mockTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#94a3b8',
  },

  recordingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#ef4444',
  },

  recordingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#ef4444',
    animation: 'pulse 2s ease-in-out infinite',
  },

  mockVideo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '24px',
    background: 'rgba(0, 0, 0, 0.2)',
  },

  videoPlaceholder: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
    borderRadius: '12px',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  videoIcon: {
    fontSize: '48px',
  },

  videoLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500',
  },

  mockCode: {
    background: '#1e1e2e',
    padding: '24px',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.8',
    position: 'relative',
  },

  codeLine: {
    marginBottom: '4px',
  },

  securityIndicator: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    borderRadius: '8px',
  },

  securityIcon: {
    fontSize: '16px',
  },

  securityText: {
    fontSize: '12px',
    color: '#22c55e',
    fontWeight: '600',
  },

  floatingOrb: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },

  statsSection: {
    padding: '80px 60px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },

  statsGrid: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '40px',
  },

  statCard: {
    textAlign: 'center',
    animation: 'slideUp 0.6s ease-out',
  },

  statValue: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '56px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #fff, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
  },

  statLabel: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '500',
  },

  featuresSection: {
    padding: '120px 60px',
    position: 'relative',
  },

  sectionHeader: {
    textAlign: 'center',
    marginBottom: '80px',
  },

  sectionBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '2px',
    color: '#3b82f6',
    marginBottom: '16px',
  },

  sectionTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '56px',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },

  sectionTitleAccent: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  featuresGrid: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },

  featureCard: {
    padding: '40px 32px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
  },

  featureIcon: {
    fontSize: '48px',
    marginBottom: '24px',
  },

  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#fff',
  },

  featureDescription: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#94a3b8',
  },

  howItWorksSection: {
    padding: '120px 60px',
    background: 'rgba(255, 255, 255, 0.02)',
  },

  stepsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },

  stepCard: {
    flex: 1,
    position: 'relative',
  },

  stepNumber: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '24px',
    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
  },

  stepContent: {
    paddingRight: '40px',
  },

  stepTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#fff',
  },

  stepDescription: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#94a3b8',
  },

  stepConnector: {
    position: 'absolute',
    top: '40px',
    right: '-20px',
    width: '40px',
    height: '2px',
    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent)',
  },

  ctaSection: {
    padding: '120px 60px',
    position: 'relative',
    overflow: 'hidden',
  },

  ctaContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },

  ctaTitle: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '64px',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '24px',
    letterSpacing: '-0.02em',
  },

  ctaDescription: {
    fontSize: '20px',
    color: '#94a3b8',
    marginBottom: '48px',
  },

  ctaButton: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    border: 'none',
    padding: '24px 48px',
    borderRadius: '16px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.4s ease',
    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
  },

  ctaButtonArrow: {
    fontSize: '20px',
    transition: 'transform 0.3s ease',
  },

  ctaNote: {
    marginTop: '24px',
    fontSize: '14px',
    color: '#64748b',
  },
};

export default Home;