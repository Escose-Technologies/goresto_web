import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { theme } from '../styles/theme';
import { Logo } from '../components/Logo';
import './LandingPage.css';

// Custom hook for scroll animations
const useScrollAnimation = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Scroll-triggered animated section
const AnimatedSection = ({ children, className = '', animation = 'fade-up', delay = 0, style = {} }) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`scroll-animate ${animation} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ '--animation-delay': `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
};

// Parallax component
const ParallaxLayer = ({ children, speed = 0.5, className = '' }) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        setOffset(scrolled * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={`parallax-layer ${className}`}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
};

// Floating food icons component
const FloatingIcons = () => {
  const icons = ['🍕', '🍔', '🍜', '🍣', '🥗', '🍰', '☕', '🍷'];

  return (
    <div className="floating-icons">
      {icons.map((icon, index) => (
        <span
          key={index}
          className="floating-icon"
          style={{
            '--delay': `${index * 0.5}s`,
            '--x-start': `${Math.random() * 100}%`,
            '--duration': `${15 + Math.random() * 10}s`,
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  );
};

export const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '📱',
      title: 'QR Code Menus',
      description: 'Generate unique QR codes for each table. Customers scan and browse your digital menu instantly.',
      color: '#7C3AED',
    },
    {
      icon: '🍽️',
      title: 'Menu Management',
      description: 'Easily add, edit, and organize menu items with images, dietary labels, and pricing.',
      color: '#EC4899',
    },
    {
      icon: '📋',
      title: 'Order Tracking',
      description: 'Real-time order management from placement to serving. Never miss an order again.',
      color: '#F59E0B',
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track sales, popular items, and revenue with intuitive analytics and reports.',
      color: '#10B981',
    },
    {
      icon: '👥',
      title: 'Staff Management',
      description: 'Onboard and manage your team with roles, schedules, and contact information.',
      color: '#3B82F6',
    },
    {
      icon: '⭐',
      title: 'Reviews & Ratings',
      description: 'Collect customer feedback and ratings to improve your service quality.',
      color: '#EF4444',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Sign Up',
      description: 'Create your restaurant account in minutes',
      icon: '✨',
    },
    {
      step: '2',
      title: 'Set Up Menu',
      description: 'Add your menu items, categories, and pricing',
      icon: '📝',
    },
    {
      step: '3',
      title: 'Generate QR Codes',
      description: 'Create QR codes for each table in your restaurant',
      icon: '📲',
    },
    {
      step: '4',
      title: 'Start Receiving Orders',
      description: 'Customers scan, order, and you manage everything digitally',
      icon: '🚀',
    },
  ];

  return (
    <div className="landing-page">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Floating Food Icons Background */}
      <FloatingIcons />

      {/* Navigation */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <Logo size="small" />
          </Link>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link to="/login" className="nav-btn-login">Login</Link>
            <Link to="/login" className="nav-btn-cta" style={{ background: theme.colors.background.gradient }}>
              Get Started
            </Link>
          </div>
          <Link to="/login" className="mobile-cta" style={{ background: theme.colors.background.gradient }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-pattern"></div>
        <ParallaxLayer speed={-0.1} className="hero-parallax-bg">
          <div className="hero-floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </ParallaxLayer>
        <AnimatedSection animation="fade-up" className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            #1 Restaurant Management Platform
          </div>
          <h1 className="hero-title">
            Smart Restaurant Management,
            <span className="hero-highlight"> Simplified</span>
          </h1>
          <p className="hero-subtitle">
            Transform your restaurant operations with digital menus, QR code ordering,
            real-time order tracking, and powerful analytics — all in one platform.
          </p>
          <div className="hero-cta">
            <Link
              to="/login"
              className="btn-primary-large pulse-animation"
              style={{ background: theme.colors.background.gradient }}
            >
              <span>Explore the App</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10H15M15 10L10 5M15 10L10 15" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#features" className="btn-secondary-large">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10" cy="10" r="8"/>
                <polygon points="8,6 14,10 8,14" fill="currentColor" stroke="none"/>
              </svg>
              <span>Watch Demo</span>
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-left" delay={200} className="hero-visual">
          <div className="hero-phone-mockup">
            <div className="phone-notch"></div>
            <div className="phone-screen">
              <div className="mockup-restaurant-header">
                <div className="mockup-avatar"></div>
                <div className="mockup-restaurant-info">
                  <div className="mockup-name"></div>
                  <div className="mockup-rating">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <div className="mockup-menu-items">
                <div className="mockup-menu-item">
                  <div className="mockup-item-img">🍕</div>
                  <div className="mockup-item-info">
                    <div className="mockup-item-name"></div>
                    <div className="mockup-item-price"></div>
                  </div>
                </div>
                <div className="mockup-menu-item">
                  <div className="mockup-item-img">🍔</div>
                  <div className="mockup-item-info">
                    <div className="mockup-item-name"></div>
                    <div className="mockup-item-price"></div>
                  </div>
                </div>
                <div className="mockup-menu-item">
                  <div className="mockup-item-img">🍜</div>
                  <div className="mockup-item-info">
                    <div className="mockup-item-name"></div>
                    <div className="mockup-item-price"></div>
                  </div>
                </div>
              </div>
              <div className="mockup-cart-btn">View Cart - $24.99</div>
            </div>
          </div>

          {/* Floating notification cards */}
          <div className="floating-card card-order animate-float">
            <span className="card-icon">🛒</span>
            <div className="card-content">
              <span className="card-title">New Order!</span>
              <span className="card-subtitle">Table 5 - $45.00</span>
            </div>
          </div>

          <div className="floating-card card-review animate-float-delayed">
            <span className="card-icon">⭐</span>
            <div className="card-content">
              <span className="card-title">5-Star Review</span>
              <span className="card-subtitle">"Amazing food!"</span>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <AnimatedSection animation="scale-up" className="stats-container">
          <div className="stat-item">
            <span className="stat-number">
              <AnimatedCounter end={500} suffix="+" />
            </span>
            <span className="stat-label">Restaurants</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">
              <AnimatedCounter end={50} suffix="K+" />
            </span>
            <span className="stat-label">Orders Processed</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">
              <AnimatedCounter end={99} suffix="%" />
            </span>
            <span className="stat-label">Satisfaction</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">4.9</span>
            <span className="stat-label">Rating</span>
          </div>
        </AnimatedSection>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <AnimatedSection animation="fade-up" className="section-header">
            <span className="section-badge">Features</span>
            <h2 className="section-title">Everything You Need to Run Your Restaurant</h2>
            <p className="section-subtitle">
              Powerful tools designed specifically for modern restaurant management
            </p>
          </AnimatedSection>
          <div className="features-grid">
            {features.map((feature, index) => (
              <AnimatedSection
                key={index}
                animation="fade-up"
                delay={index * 100}
                className="feature-card"
                style={{ '--accent-color': feature.color }}
              >
                <div className="feature-icon-wrapper" style={{ background: `${feature.color}15` }}>
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-link" style={{ color: feature.color }}>
                  Learn more
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 8H12M12 8L8 4M12 8L8 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <AnimatedSection animation="fade-up" className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">Get Started in 4 Simple Steps</h2>
            <p className="section-subtitle">
              Setting up your digital restaurant has never been easier
            </p>
          </AnimatedSection>
          <div className="steps-container">
            {howItWorks.map((item, index) => (
              <AnimatedSection
                key={index}
                animation="fade-up"
                delay={index * 150}
                className="step-card"
              >
                <div className="step-icon-wrapper">
                  <span className="step-emoji">{item.icon}</span>
                </div>
                <div className="step-number" style={{ background: theme.colors.background.gradient }}>
                  {item.step}
                </div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-description">{item.description}</p>
                {index < howItWorks.length - 1 && <div className="step-connector"></div>}
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="section-container">
          <AnimatedSection animation="scale-up" className="testimonial-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">
              GoResto transformed how we manage our restaurant. Orders are faster,
              customers love the QR menus, and our revenue increased by 30%!
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍🍳</div>
              <div className="author-info">
                <span className="author-name">Chef Marco</span>
                <span className="author-role">Owner, Bella Italia</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <AnimatedSection animation="blur-in" className="cta-container" style={{ background: theme.colors.background.gradient }}>
          <div className="cta-pattern"></div>
          <h2 className="cta-title">Ready to Transform Your Restaurant?</h2>
          <p className="cta-subtitle">
            Join hundreds of restaurants already using GoResto to streamline their operations
          </p>
          <Link to="/login" className="btn-cta-white">
            Get Started Free
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10H15M15 10L10 5M15 10L10 15" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p className="cta-note">No credit card required • Free 14-day trial</p>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <AnimatedSection animation="fade-up" className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <Logo size="large" variant="light" />
            </div>
            <p className="footer-tagline">Smart Restaurant Management, Simplified</p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
              <a href="#careers">Careers</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </AnimatedSection>
        <div className="footer-big-name">GoResto</div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GoResto. All rights reserved. Made with ❤️ for restaurants.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
