import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import {
  PhUserCircle,
  PhLockKey,
  PhShieldCheck,
  PhCheckCircle,
  PhWarningCircle,
  PhX,
  PhArrowsClockwise,
} from '../icons/PhosphorIcons';
import { API_BASE } from '../../services/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    isAuthenticated,
    currentUser,
    apiStatus,
    apiLatency,
    loginWithCredentials,
    verifyMfaCode,
    changeStaffPassword,
    enrollStaffMfa,
    confirmStaffMfa,
    logoutUser,
    mfaChallenge,
    passwordChangeRequired,
    mfaEnrollmentRequired,
    mfaEnrollmentUri,
    apiErrors,
    refreshBackendData,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaQrImage, setMfaQrImage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'mfa' | 'password' | 'enroll' | 'status'>('login');

  useEffect(() => {
    let cancelled = false;
    if (!mfaEnrollmentUri) {
      setMfaQrImage(null);
      return;
    }
    QRCode.toDataURL(mfaEnrollmentUri, { errorCorrectionLevel: 'M', width: 240, margin: 2 })
      .then((image) => { if (!cancelled) setMfaQrImage(image); })
      .catch(() => { if (!cancelled) setMfaQrImage(null); });
    return () => { cancelled = true; };
  }, [mfaEnrollmentUri]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithCredentials(email, password);
      if (res.mfaRequired) {
        setActiveTab('mfa');
      } else if (res.passwordChangeRequired) {
        setActiveTab('password');
      } else if (res.mfaEnrollmentRequired || mfaEnrollmentRequired) {
        setActiveTab('enroll');
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      setError('Please enter a valid 6-digit TOTP code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const nextStep = await verifyMfaCode(mfaCode);
      if (nextStep === 'enroll') setActiveTab('enroll');
      else if (nextStep === 'password') setActiveTab('password');
      else onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid MFA code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await changeStaffPassword(password, newPassword);
      setPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      if (mfaEnrollmentRequired) setActiveTab('enroll');
      else onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password update failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!mfaEnrollmentUri) await enrollStaffMfa();
      else {
        if (!/^\d{6}$/.test(mfaCode)) throw new Error('Enter the 6-digit authenticator code.');
        await confirmStaffMfa(mfaCode);
        setMfaCode('');
        setActiveTab('login');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'MFA setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-panel bg-white p-6 shadow-float border border-ink/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ink/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-ctl bg-moss/10 text-moss">
              <PhShieldCheck size={22} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Healora Staff Authentication</h2>
              <p className="text-xs text-ink-light">Backend API & Role-Based Access Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-ctl p-1.5 text-ink-light hover:bg-ink/5 hover:text-ink transition-colors"
          >
            <PhX size={18} />
          </button>
        </div>

        {/* Status Pill & Tab Bar */}
        <div className="mt-4 flex items-center justify-between gap-2 rounded-ctl bg-bone p-1 text-xs font-medium text-ink-mid">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 rounded-sm py-1.5 transition-colors ${
              activeTab === 'login' ? 'bg-white font-bold text-ink shadow-sm' : 'hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 rounded-sm py-1.5 transition-colors ${
              activeTab === 'status' ? 'bg-white font-bold text-ink shadow-sm' : 'hover:text-ink'
            }`}
          >
            Live API Status
          </button>
          {passwordChangeRequired && (
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 rounded-sm py-1.5 text-terracotta transition-colors ${
                activeTab === 'password' ? 'bg-white font-bold text-terracotta shadow-sm' : ''
              }`}
            >
              Change Password
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-ctl bg-terracotta/10 p-3 text-xs text-terracotta">
            <PhWarningCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Login Form */}
        {activeTab === 'login' && (
          <div className="mt-4 space-y-4">
            {isAuthenticated ? (
              <div className="rounded-panel border border-moss/30 bg-moss/5 p-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss/20 text-moss">
                  <PhCheckCircle size={24} weight="bold" />
                </div>
                <h3 className="mt-2 text-sm font-bold text-ink">{currentUser?.name || 'Authenticated Staff'}</h3>
                <p className="text-xs text-ink-mid">{currentUser?.email}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => refreshBackendData()}
                    className="flex items-center gap-1.5 rounded-ctl bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-moss"
                  >
                    <PhArrowsClockwise size={14} />
                    <span>Sync Live Data</span>
                  </button>
                  <button
                    onClick={() => logoutUser()}
                    className="rounded-ctl border border-ink/20 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-terracotta/10 hover:text-terracotta"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-ink-mid mb-1">Staff Work Email</label>
                  <div className="relative">
                    <PhUserCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Work email address"
                      className="w-full rounded-ctl border border-ink/20 bg-bone/40 pl-9 pr-3 py-2 text-sm text-ink outline-none focus:border-moss"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-mid mb-1">Password</label>
                  <div className="relative">
                    <PhLockKey size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-ctl border border-ink/20 bg-bone/40 pl-9 pr-3 py-2 text-sm text-ink outline-none focus:border-moss"
                    />
                  </div>
                </div>

                <p className="text-xs text-ink-light">
                  Sign in with the staff account issued by your Healora administrator. Your assigned roles are loaded after authentication.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-ctl bg-moss py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-moss/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Hub Console'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: MFA Verification */}
        {activeTab === 'mfa' && (
          <form onSubmit={handleVerifyMfa} className="mt-4 space-y-4">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss/10 text-moss">
                <PhShieldCheck size={24} />
              </div>
              <h3 className="mt-2 text-sm font-bold text-ink">Two-Factor Authentication (TOTP)</h3>
              <p className="text-xs text-ink-mid mt-1">
                Enter a fresh 6-digit code from your authenticator app. Codes refresh every 30 seconds; a code already used for setup cannot be reused.
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                autoFocus
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono rounded-ctl border border-ink/20 py-2.5 outline-none focus:border-moss"
              />
              {mfaChallenge && (
                <p className="mt-1 text-center text-[11px] text-ink-light">
                  Challenge expires in {mfaChallenge.expiresIn}s
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="w-full rounded-ctl bg-moss py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Verifying Code...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        {/* Tab 3: Password Change */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3.5">
            <div className="text-center">
              <h3 className="text-sm font-bold text-ink">Password Change Required</h3>
              <p className="text-xs text-ink-mid mt-0.5">
                Admin issued a temporary password. Choose a strong permanent passphrase.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-mid mb-1">New Passphrase</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 12 characters with symbol & number"
                className="w-full rounded-ctl border border-ink/20 bg-bone/40 px-3 py-2 text-sm text-ink outline-none focus:border-moss"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-mid mb-1">Confirm New Passphrase</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new passphrase"
                className="w-full rounded-ctl border border-ink/20 bg-bone/40 px-3 py-2 text-sm text-ink outline-none focus:border-moss"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-ctl bg-moss py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save & Refresh Session'}
            </button>
          </form>
        )}

        {activeTab === 'enroll' && (
          <form onSubmit={handleMfaEnrollment} className="mt-4 space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-bold text-ink">Set up two-factor authentication</h3>
              <p className="mt-1 text-xs text-ink-mid">Add this account to an authenticator app, then enter its 6-digit code.</p>
            </div>
            {mfaEnrollmentUri && (
              <div className="rounded-ctl border border-ink/10 bg-bone/60 p-3">
                <p className="mb-2 text-center text-xs font-semibold text-ink-mid">Scan this QR code in your authenticator app</p>
                {mfaQrImage && <img src={mfaQrImage} alt="Authenticator setup QR code" className="mx-auto mb-3 size-48 rounded bg-white p-2" />}
                <p className="text-[11px] text-ink-light">If scanning is unavailable, enter this setup key manually:</p>
                <code className="mt-1 block break-all rounded bg-white p-2 text-center text-sm font-bold tracking-wider text-ink">
                  {new URL(mfaEnrollmentUri).searchParams.get('secret') || 'Setup key unavailable'}
                </code>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="mt-3 w-full rounded-ctl border border-ink/20 bg-white px-3 py-2 text-center font-mono tracking-[0.4em] outline-none focus:border-moss"
                />
                <p className="mt-2 text-center text-[11px] text-ink-light">Codes change every 30 seconds and can only be used once. After confirming setup, wait for a new code before signing in.</p>
              </div>
            )}
            <button type="submit" disabled={loading || (!!mfaEnrollmentUri && mfaCode.length !== 6)} className="w-full rounded-ctl bg-moss py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {loading ? 'Please wait…' : mfaEnrollmentUri ? 'Confirm MFA and sign in again' : 'Generate authenticator setup'}
            </button>
          </form>
        )}

        {/* Tab 4: Live Backend Status & Health */}
        {activeTab === 'status' && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-panel border border-ink/10 bg-bone/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-mid">API Endpoint:</span>
                <span className="font-mono text-[11px] text-ink">{API_BASE}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-mid">Connection Status:</span>
                <span className="flex items-center gap-1.5 font-bold text-moss">
                  <span className="h-2 w-2 rounded-full bg-moss animate-pulse" />
                  {apiStatus === 'connected' ? 'Connected (Render Cloud)' : apiStatus}
                </span>
              </div>
              {apiLatency && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink-mid">Roundtrip Latency:</span>
                  <span className="font-mono text-ink">{apiLatency} ms</span>
                </div>
              )}
            </div>

            {apiErrors.length > 0 && (
              <div className="rounded-ctl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
                <div className="mb-1 font-bold">Some API data could not be loaded</div>
                <ul className="list-disc space-y-1 pl-4">{apiErrors.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => refreshBackendData()}
              className="w-full flex items-center justify-center gap-2 rounded-ctl border border-moss bg-moss/5 py-2 font-semibold text-moss hover:bg-moss hover:text-white transition-colors"
            >
              <PhArrowsClockwise size={15} />
              <span>Force Re-fetch Live Data</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
