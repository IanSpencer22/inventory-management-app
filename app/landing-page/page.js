'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';
import { Analytics } from "@vercel/analytics/react"

function LandingPage() {
  const router = useRouter();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1B1212',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    button: {
      padding: '10px 20px',
      margin: '10px',
      backgroundColor: '#5c67f2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    iconsContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
    },
    icon: {
      fontSize: '30px',
      color: 'white',
      margin: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Analytics />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ padding: '20px', color: 'white' }}>Welcome to the Inventory Management App</h1>
          <p style={{ padding: '20px', color: 'white' }}>Manage your inventory or pantry efficiently and effortlessly with our easy-to-use interface.</p>
          <p style={{ padding: '20px', color: 'white' }}>Try it out now for free!</p>
        </div>
        <button style={styles.button} onClick={() => router.push('/sign-up')}>
          Sign Up
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '10px', width: '100%' }}>
        <a href="https://ian-spencer.com/" target="_blank" rel="noopener noreferrer">
          <FaGlobe style={styles.icon} />
        </a>
        <a href="https://www.linkedin.com/in/ianspencer22/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin style={styles.icon} />
        </a>
        <a href="https://github.com/IanSpencer22" target="_blank" rel="noopener noreferrer">
          <FaGithub style={styles.icon} />
        </a>
      </div>
    </div>
  );
}

export default LandingPage;