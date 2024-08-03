'use client'
import { useState } from 'react';
import { auth } from '../../firebase/config';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth'; 
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    try {
      const res = await signInWithEmailAndPassword(email, password);
        console.log({ res });
        sessionStorage.setItem('user', true);
        setEmail('');
        setPassword('');
        router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account' // Forces account selection every time
    });
    try {
      await signInWithPopup(auth, provider);
      // Handle successful Google sign-in.
      sessionStorage.setItem('user', true);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

    const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1B1212',
    },
    form: {
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '300px',
    },
    input: {
      padding: '10px',
      border: '2px solid #ccc',
      borderRadius: '4px',
      fontSize: '16px',
    },
    button: {
      backgroundColor: '#5c67f2',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    buttonHover: {
      backgroundColor: '#4a54e1',
    },
    googleButton: {
      backgroundColor: '#333',
      color: '#fff',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
      <h1>Sign In</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button} onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}>
          Sign In with Email
              </button>
        <button type="button" onClick={handleGoogleSignIn} style={styles.googleButton}>
            <div className="gsi-material-button-icon">
              <svg viewBox="0 0 48 48" style={{ display: 'block', width: '50%', height: '50%' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
                  </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingRight: '30px' }}>
            Continue with Google
          </div>
        </button>
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Don&apos;t have an account? <a href="/sign-up" style={{ color: '#5c67f2', textDecoration: 'none' }}>Sign Up</a>
        </p>
      </form>
    </div>
  );
}

export default SignIn;