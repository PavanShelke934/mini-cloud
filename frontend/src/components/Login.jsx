import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Lock, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const response = await api.post(endpoint, { email, password });
      
      // Save token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(isLogin ? 'Logged in successfully!' : 'Registered successfully!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-box" style={{ background: 'var(--surface-container-low)', padding: '3rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Cloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h1 className="title-lg">Aura Cloud</h1>
          <p className="subtitle">{isLogin ? 'Welcome back' : 'Create an account'}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
            <Mail size={20} color="var(--on-surface-variant)" style={{ marginRight: '0.75rem' }} />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--on-surface)', width: '100%' }}
            />
          </div>
          
          <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
            <Lock size={20} color="var(--on-surface-variant)" style={{ marginRight: '0.75rem' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--on-surface)', width: '100%' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--on-surface-variant)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
