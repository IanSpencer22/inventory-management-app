'use client'
import { useState } from 'react';
import { auth } from '../../firebase/config';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      console.log({ res });
      sessionStorage.setItem('user', true);
      setEmail('');
      setPassword('');
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
      backgroundColor: '#f4f4f4',
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
    buttonHover: { // Note: Hover effects with inline styles in React need to be handled with JavaScript or CSS.
      backgroundColor: '#4a54e1',
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
      <h1>Sign Up</h1>
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
          Sign Up
        </button>
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Have an account? <a href="/sign-in" style={{ color: '#5c67f2', textDecoration: 'none' }}>Sign In</a>
        </p>
      </form>
    </div>
  );
}

export default SignUp;