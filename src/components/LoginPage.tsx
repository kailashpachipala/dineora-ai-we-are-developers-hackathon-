import React, { useState } from 'react';
import { ArrowRight, Chrome, Facebook, LockKeyhole, Mail, Phone, ShieldCheck, Sparkles, Utensils, UserRound, Zap } from 'lucide-react';

interface LoginPageProps {
  onAuthenticated: (name: string) => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState('');
  const passwordScore = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const passwordLabel = passwordScore < 2 ? 'Weak' : passwordScore < 4 ? 'Good' : 'Strong';

  const signInWithGoogle = () => {
    if (!GOOGLE_CLIENT_ID) {
      setNotice('Demo Google sign-in enabled for local development.');
      window.setTimeout(() => onAuthenticated('Google guest'), 450);
      return;
    }

    const query = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'id_token',
      scope: 'openid email profile',
      prompt: 'select_account',
      nonce: crypto.randomUUID(),
    });
    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`);
  };

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    if (isCreatingAccount) {
      if (!fullName.trim() || password !== confirmPassword || !acceptedTerms) {
        setNotice(password !== confirmPassword ? 'Passwords do not match.' : 'Complete your details and accept the terms to continue.');
        return;
      }
      onAuthenticated(fullName.trim());
      return;
    }
    if (!email.trim()) return;
    onAuthenticated(email.split('@')[0] || 'Dineora guest');
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Dineora introduction">
        <div className="login-brand"><span>✦</span><div><strong>Dineora</strong><small>AI-powered dining, made personal</small></div></div>
        <div className="login-visual-copy">
          <span className="login-eyebrow">Good food · great company</span>
          <h1>Better tables.<br /><em>Happier moments.</em></h1>
          <p>AI finds the perfect restaurants, matches your vibe, and books your table — instantly.</p>
          <div className="login-features"><span><i><Sparkles size={17} /></i>Smart<br />recommendations</span><span><i><Zap size={17} /></i>Real-time<br />availability</span><span><i><ShieldCheck size={17} /></i>Secure<br />booking</span><span><i><Utensils size={17} /></i>Restaurant<br />insights</span></div>
        </div>
        <div className="login-quote">“The best stories begin around a table.”</div>
      </section>

      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="login-welcome">Welcome back!</div>
          <span className="login-eyebrow">Your next great meal is just a login away.</span>
          <h2>Sign in to your<br /><strong>Dineora</strong></h2>
          <div className="login-card">
          {isCreatingAccount ? <>
            <div className="login-signup-heading"><strong>Create your Dineora account</strong><span>Save favourites, manage bookings, and get personalised dining ideas.</span></div>
            <form onSubmit={submitEmail} className="login-form">
              <label htmlFor="signup-name">Full name</label><div className="login-input-wrap"><UserRound size={17} /><input id="signup-name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" required /></div>
              <label htmlFor="signup-email">Email address</label><div className="login-input-wrap"><Mail size={17} /><input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
              <label htmlFor="signup-phone">Phone number</label><div className="login-input-wrap"><Phone size={17} /><input id="signup-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" required /></div>
              <label htmlFor="signup-password">Create password</label><div className="login-input-wrap"><LockKeyhole size={17} /><input id="signup-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required /></div>
              <label htmlFor="signup-confirm">Confirm password</label><div className="login-input-wrap"><LockKeyhole size={17} /><input id="signup-confirm" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" required /></div>
              <label className="login-terms"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /> I agree to Dineora's terms and privacy policy</label>
              <button className="login-submit" type="submit">Create account <ArrowRight size={16} /></button>
            </form>
            <p className="login-privacy">Already have an account? <button type="button" onClick={() => { setIsCreatingAccount(false); setNotice(''); }}>Sign in</button></p>
          </> : <>
          <div className="login-tabs"><button className={mode === 'email' ? 'active' : ''} onClick={() => setMode('email')}>Email</button><button className={mode === 'phone' ? 'active' : ''} onClick={() => setMode('phone')}>Phone</button></div>
          <form onSubmit={submitEmail} className="login-form">
            <label htmlFor="login-email">{mode === 'email' ? 'Email address' : 'Phone number'}</label>
            <div className="login-input-wrap"><Mail size={17} /><input id="login-email" type={mode === 'email' ? 'email' : 'tel'} value={email} onChange={(event) => setEmail(event.target.value)} placeholder={mode === 'email' ? 'you@example.com' : '+91 98765 43210'} required /></div>
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrap"><LockKeyhole size={17} /><input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></div>
            <div className="password-strength" aria-live="polite" aria-atomic="true"><div className="password-strength-bars">{[1, 2, 3, 4].map((bar) => <span key={bar} className={bar <= passwordScore ? `is-${passwordLabel.toLowerCase()}` : ''} />)}</div><small>Password strength: {password ? passwordLabel : 'Not set'}</small></div>
            <div className="login-options"><label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label><button type="button">Forgot password?</button></div>
            <button className="login-submit" type="submit">Sign in <ArrowRight size={16} /></button>
          </form>
          <div className="login-divider"><span>or continue with</span></div>
          <div className="login-socials"><button onClick={signInWithGoogle}><Chrome size={17} /> Google</button><button type="button"> Apple</button><button type="button"><Facebook size={17} /> Facebook</button></div>
          <p className="login-privacy">Don't have an account? <button type="button" onClick={() => { setIsCreatingAccount(true); setNotice(''); }}>Create one</button></p>
          </>}
          </div>
          <p className="login-notice" role="status" aria-live="polite" aria-atomic="true">{notice}</p>
        </div>
      </section>
    </main>
  );
}
