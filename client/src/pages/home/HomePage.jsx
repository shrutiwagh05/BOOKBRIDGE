
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePages.css';

const HomePage = () => {
  const features = [
    {
      icon: '📚',
      title: 'Buy & Sell Books',
      description:
        'Discover affordable textbooks and give your used books a new home.',
    },
    {
      icon: '🤝',
      title: 'Borrow & Lend',
      description:
        'Borrow books for your semester and share resources with other students.',
    },
    {
      icon: '🔄',
      title: 'Exchange Books',
      description:
        'Exchange books with fellow students and make learning more affordable.',
    },
  ];

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#faf7f2',
      color: '#292522',
      fontFamily: 'Arial, sans-serif',
      padding: '40px 7%',
      boxSizing: 'border-box',
    },
    hero: {
      background: 'linear-gradient(135deg, #f4e5d5, #fffaf4)',
      borderRadius: '24px',
      padding: '65px 30px',
      textAlign: 'center',
      marginBottom: '45px',
    },
    badge: {
      display: 'inline-block',
      background: '#ead2bd',
      color: '#70452f',
      borderRadius: '30px',
      padding: '9px 18px',
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    heading: {
      fontSize: 'clamp(34px, 5vw, 58px)',
      lineHeight: 1.15,
      margin: '0 auto 20px',
      maxWidth: '800px',
      color: '#30231e',
    },
    highlight: {
      color: '#a65335',
    },
    paragraph: {
      fontSize: '17px',
      lineHeight: 1.8,
      color: '#6d625b',
      maxWidth: '700px',
      margin: '0 auto 28px',
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '14px',
    },
    primaryButton: {
      display: 'inline-block',
      background: '#a65335',
      color: '#ffffff',
      textDecoration: 'none',
      padding: '14px 24px',
      borderRadius: '9px',
      fontWeight: 'bold',
    },
    secondaryButton: {
      display: 'inline-block',
      background: '#ffffff',
      color: '#8d462f',
      border: '1px solid #cda58d',
      textDecoration: 'none',
      padding: '14px 24px',
      borderRadius: '9px',
      fontWeight: 'bold',
    },
    sectionTitle: {
      fontSize: '30px',
      marginBottom: '10px',
      color: '#30231e',
    },
    sectionText: {
      color: '#756961',
      lineHeight: 1.7,
      marginBottom: '25px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '22px',
    },
    card: {
      background: '#ffffff',
      border: '1px solid #eee3d8',
      borderRadius: '16px',
      padding: '27px',
      boxShadow: '0 5px 18px rgba(65, 43, 30, 0.05)',
    },
    icon: {
      fontSize: '36px',
      marginBottom: '15px',
    },
    cardTitle: {
      fontSize: '21px',
      marginBottom: '10px',
      color: '#402c22',
    },
    cardText: {
      color: '#756961',
      lineHeight: 1.7,
      margin: 0,
    },
    bottom: {
      background: '#efe0d2',
      borderRadius: '18px',
      padding: '35px 20px',
      textAlign: 'center',
      marginTop: '45px',
    },
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.badge}>YOUR CAMPUS BOOK COMMUNITY</div>

        <h1 style={styles.heading}>
          Every Book Deserves
          <br />
          <span style={styles.highlight}>Another Chapter</span>
        </h1>

        <p style={styles.paragraph}>
          Buy, sell, borrow, lend, and exchange college books in one place.
          Discover your next textbook and connect with your campus community.
        </p>

        <div style={styles.buttonRow}>
          <Link to="/books" style={styles.primaryButton}>
            Explore Books →
          </Link>

          <Link to="/books/add" style={styles.secondaryButton}>
            + List Your Book
          </Link>
        </div>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>
          Everything Books, All in One Place
        </h2>

        <p style={styles.sectionText}>
          A simpler, affordable way to access learning resources on campus.
        </p>

        <div style={styles.grid}>
          {features.map((feature) => (
            <article key={feature.title} style={styles.card}>
              <div style={styles.icon} aria-hidden="true">
                {feature.icon}
              </div>

              <h3 style={styles.cardTitle}>{feature.title}</h3>

              <p style={styles.cardText}>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={styles.bottom}>
        <h2 style={styles.sectionTitle}>
          Have a book someone else needs?
        </h2>

        <p style={styles.sectionText}>
          Share your books with fellow students and help make learning more accessible.
        </p>

        <Link to="/books/add" style={styles.primaryButton}>
          Create a Listing
        </Link>
      </section>
    </main>
  );
};

export default HomePage;
