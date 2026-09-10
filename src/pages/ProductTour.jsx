import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { theme } from '../styles/theme';
import { Logo } from '../components/Logo';
import './ProductTour.css';

const useScrollAnimation = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

const AnimatedSection = ({ children, className = '', delay = 0, style = {} }) => {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`tour-animate ${isVisible ? 'visible' : ''} ${className}`}
      style={{ '--animation-delay': `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
};

const Shot = ({ src, alt, phone = false }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`tour-shot-placeholder ${phone ? 'is-phone' : ''}`}>
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`tour-shot ${phone ? 'is-phone' : ''}`}
      onError={() => setFailed(true)}
    />
  );
};

const chapters = [
  {
    id: 'customer',
    eyebrow: 'Chapter 1 — Your Customer',
    title: 'They scan. That is the whole setup.',
    lede:
      'No app store, no download, no sign-up. The QR on the table opens your menu in the phone browser they already have.',
    accent: '#7830E4',
    steps: [
      {
        title: 'Scan the table QR',
        body:
          'Every table gets its own QR code, printed from your dashboard. The scan opens your live menu instantly — and because the table is encoded in the code, you always know where the order came from.',
        shot: '/tour/public-menu.jpg',
        alt: 'Public menu on a phone',
        phone: true,
      },
      {
        title: 'Browse a menu that sells',
        body:
          'Photos, veg and non-veg marks, spice levels and dietary badges. Prices update the moment you change them — no reprinting, no stale cards, no "sorry, that is unavailable".',
        shot: '/tour/public-menu-items.jpg',
        alt: 'Menu items with dietary badges',
        phone: true,
      },
      {
        title: 'Order and call a waiter',
        body:
          'Items go into a cart and straight to your kitchen. Need service? One tap raises a waiter call that shows up in your dashboard until somebody clears it.',
        shot: '/tour/public-menu-cart.jpg',
        alt: 'Cart and waiter call',
        phone: true,
      },
    ],
  },
  {
    id: 'kitchen',
    eyebrow: 'Chapter 2 — Your Kitchen',
    title: 'Orders land on the screen, not on paper.',
    lede:
      'The kitchen display updates in real time over WebSocket. No runner, no shouting across the pass, no lost slips.',
    accent: '#F59E0B',
    steps: [
      {
        title: 'Live kitchen display',
        body:
          'Open the kitchen screen on any tablet or old laptop. New orders appear the second they are placed, grouped by table, with a running clock so nothing sits forgotten.',
        shot: '/tour/kitchen-display.png',
        alt: 'Kitchen display system',
      },
      {
        title: 'Status your staff can trust',
        body:
          'Mark items preparing or ready and the change reflects everywhere at once — the floor staff and the owner dashboard see the same truth without asking anyone.',
        shot: '/tour/orders.png',
        alt: 'Order status management',
      },
    ],
  },
  {
    id: 'owner',
    eyebrow: 'Chapter 3 — You',
    title: 'Bill it, close the day, see the numbers.',
    lede:
      'GST-compliant billing built for how Indian restaurants actually settle a table — at the counter, in cash, card, UPI, or a split of all three.',
    accent: '#10B981',
    steps: [
      {
        title: 'Generate the bill',
        body:
          'Pull an open order into a bill in one click. Apply a discount preset or a manual one, split the payment across modes, and print to a thermal roll or a full A4 GST invoice.',
        shot: '/tour/billing.png',
        alt: 'Billing screen',
      },
      {
        title: 'GST that adds up',
        body:
          'CGST, SGST and IGST calculated automatically, with round-off and amount in words. Bill numbers run in a clean sequence your accountant will not complain about.',
        shot: '/tour/invoice.png',
        alt: 'GST invoice',
      },
      {
        title: 'Know your day before you lock up',
        body:
          'Daily summary of sales, payment modes and discounts given. Analytics show what is selling, what is not, and how today compares to yesterday.',
        shot: '/tour/reports.png',
        alt: 'Reports and analytics',
      },
    ],
  },
  {
    id: 'setup',
    eyebrow: 'Chapter 4 — Getting Set Up',
    title: 'You can be live tonight.',
    lede:
      'Four steps, and none of them need a technician.',
    accent: '#EC4899',
    steps: [
      {
        title: 'Menu, tables, done',
        body:
          'Add your categories and items with photos, create your tables, print the QR codes and stick them down. Staff get their own logins and a kitchen PIN.',
        shot: '/tour/menu-management.jpg',
        alt: 'Menu management dashboard',
      },
    ],
  },
];

export const ProductTour = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="product-tour bare-controls">
      <nav className={`tour-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="tour-nav-container">
          <Link to="/" className="tour-nav-logo">
            <Logo size="small" />
          </Link>
          <div className="tour-nav-links">
            <Link to="/" className="tour-nav-back">Back to Home</Link>
            <Link
              to="/register"
              className="tour-nav-cta"
              style={{ background: theme.colors.background.gradient }}
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <header className="tour-hero">
        <AnimatedSection>
          <span className="tour-badge">Product Tour</span>
          <h1 className="tour-hero-title">
            See exactly how an order
            <span className="tour-hero-highlight"> moves through GoResto</span>
          </h1>
          <p className="tour-hero-subtitle">
            From the customer scanning a QR code at the table, to the kitchen screen,
            to the printed GST bill and your end-of-day numbers. Here is the whole flow.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <div className="tour-chapter-nav">
            {chapters.map((c) => (
              <a key={c.id} href={`#${c.id}`} style={{ '--accent': c.accent }}>
                {c.eyebrow.split('—')[1].trim()}
              </a>
            ))}
          </div>
        </AnimatedSection>
      </header>

      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="tour-chapter">
          <div className="tour-container">
            <AnimatedSection className="tour-chapter-header">
              <span className="tour-eyebrow" style={{ color: chapter.accent }}>
                {chapter.eyebrow}
              </span>
              <h2 className="tour-chapter-title">{chapter.title}</h2>
              <p className="tour-chapter-lede">{chapter.lede}</p>
            </AnimatedSection>

            <div className="tour-steps">
              {chapter.steps.map((step, i) => (
                <AnimatedSection
                  key={step.title}
                  className={`tour-step ${i % 2 === 1 ? 'reversed' : ''}`}
                  delay={i * 80}
                >
                  <div className="tour-step-copy">
                    <span className="tour-step-index" style={{ background: chapter.accent }}>
                      {i + 1}
                    </span>
                    <h3 className="tour-step-title">{step.title}</h3>
                    <p className="tour-step-body">{step.body}</p>
                  </div>
                  <div className="tour-step-visual">
                    <Shot src={step.shot} alt={step.alt} phone={step.phone} />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="tour-cta-section">
        <AnimatedSection
          className="tour-cta-container"
          style={{ background: theme.colors.background.gradient }}
        >
          <h2 className="tour-cta-title">That is the whole system.</h2>
          <p className="tour-cta-subtitle">
            Free for a full year for the first 250 restaurants. No credit card, no setup fee.
          </p>
          <Link to="/register" className="tour-cta-button">
            Start Free for 1 Year
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10H15M15 10L10 5M15 10L10 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="tour-cta-note">
            Already with us? <Link to="/srm-app">Restaurant login</Link>
          </p>
        </AnimatedSection>
      </section>

      <footer className="tour-footer">
        <p>&copy; {new Date().getFullYear()} GoResto by Escose. All rights reserved.</p>
        <p>
          <a href="mailto:info@escose.com">info@escose.com</a>
        </p>
      </footer>
    </div>
  );
};

export default ProductTour;
