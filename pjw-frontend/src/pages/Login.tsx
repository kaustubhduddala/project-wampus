import { useEffect, useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { setStoredAuthSession, signIn, signUp } from '@/api/publicApi';
import { supabase } from '@/lib/supabaseClient';

type AuthMode = 'signin' | 'reset';

const GENERIC_FORGOT_PASSWORD_MESSAGE = 'If that email is registered, a reset link has been sent.';

export default function Login() {
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [submittingForgotPassword, setSubmittingForgotPassword] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [submittingResetPassword, setSubmittingResetPassword] = useState(false);

  const [showAdminBootstrap, setShowAdminBootstrap] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminPermissionCode, setAdminPermissionCode] = useState('');
  const [submittingAdminSignup, setSubmittingAdminSignup] = useState(false);
  const [adminSignupError, setAdminSignupError] = useState<string | null>(null);
  const [adminSignupSuccess, setAdminSignupSuccess] = useState<string | null>(null);

  useEffect(() => {
    const syncRecoveryMode = () => {
      const hash = window.location.hash;
      if (hash.includes('type=recovery')) {
        setAuthMode('reset');
        setShowForgotPassword(false);
        setForgotPasswordError(null);
        setForgotPasswordMessage(null);
        setLoginError(null);
      }
    };

    syncRecoveryMode();
    window.addEventListener('hashchange', syncRecoveryMode);

    return () => {
      window.removeEventListener('hashchange', syncRecoveryMode);
    };
  }, []);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!email.trim() || !password) {
      setLoginError('Email and password are required.');
      return;
    }

    setSubmittingLogin(true);
    try {
      const response = await signIn({
        email: email.trim(),
        password,
      });

      setStoredAuthSession(response.token, {
        id: response.user.id,
        email: response.user.email,
        role: response.role,
      });

      setLoginSuccess('Login successful. Redirecting...');
      window.setTimeout(() => {
        navigate('/home');
      }, 350);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleForgotPasswordRequest = async () => {
    setForgotPasswordError(null);
    setForgotPasswordMessage(null);

    const normalizedEmail = forgotEmail.trim();
    if (!normalizedEmail) {
      setForgotPasswordError('Email is required.');
      return;
    }

    setSubmittingForgotPassword(true);
    try {
      await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
    } catch {
      // Intentionally ignored so the response remains generic.
    } finally {
      setSubmittingForgotPassword(false);
      setForgotPasswordMessage(GENERIC_FORGOT_PASSWORD_MESSAGE);
    }
  };

  const handleResetPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!newPassword) {
      setLoginError('Password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setLoginError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setLoginError('Passwords do not match.');
      return;
    }

    setSubmittingResetPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setLoginError('Reset link is invalid or expired.');
        return;
      }

      setAuthMode('signin');
      setNewPassword('');
      setConfirmNewPassword('');
      setLoginSuccess('Password reset successful. Please sign in.');
      window.history.replaceState({}, document.title, '/login');
    } catch {
      setLoginError('Reset link is invalid or expired.');
    } finally {
      setSubmittingResetPassword(false);
    }
  };

  const handleCancelResetMode = () => {
    setAuthMode('signin');
    setNewPassword('');
    setConfirmNewPassword('');
    setLoginError(null);
    window.history.replaceState({}, document.title, '/login');
  };

  const handleAdminSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminSignupError(null);
    setAdminSignupSuccess(null);

    if (!adminEmail.trim() || !adminPassword || !adminPermissionCode.trim()) {
      setAdminSignupError('Admin email, password, and admin permission code are required.');
      return;
    }

    if (adminPassword !== adminConfirmPassword) {
      setAdminSignupError('Admin passwords do not match.');
      return;
    }

    setSubmittingAdminSignup(true);
    try {
      await signUp({
        email: adminEmail.trim(),
        password: adminPassword,
        adminPermissionCode: adminPermissionCode.trim(),
      });

      setAdminSignupSuccess('Admin account created. You can now log in above.');
      setAdminPassword('');
      setAdminConfirmPassword('');
      setAdminPermissionCode('');
    } catch (error) {
      setAdminSignupError(error instanceof Error ? error.message : 'Admin signup failed');
    } finally {
      setSubmittingAdminSignup(false);
    }
  };

  return (
    <div>
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            <LogIn className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-white">LOGIN</h1>
          <p className="text-xl font-bold text-black max-w-3xl mx-auto">
            Members sign in here. New member registration is invite-only through a secure `/join/:token` link.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-2xl space-y-8">
        <Card className="neo-brutal-border neo-brutal-shadow">
          <CardHeader className="bg-black text-white">
            <CardTitle className="font-black text-2xl">
              {authMode === 'reset' ? 'RESET PASSWORD' : 'SIGN IN'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {authMode === 'reset' ? (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                <div>
                  <label className="block font-black mb-2">NEW PASSWORD</label>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label className="block font-black mb-2">CONFIRM NEW PASSWORD</label>
                  <Input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(event) => setConfirmNewPassword(event.target.value)}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="Re-enter new password"
                  />
                </div>

                {loginError && (
                  <div className="bg-red-100 neo-brutal-border-thin p-3">
                    <p className="font-bold text-red-700">{loginError}</p>
                  </div>
                )}

                {loginSuccess && (
                  <div className="bg-[#DCFCE7] neo-brutal-border-thin p-3">
                    <p className="font-bold text-[#166534]">{loginSuccess}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={submittingResetPassword}
                    className="neo-button bg-[#22C55E]! text-white font-black px-8"
                  >
                    {submittingResetPassword ? 'UPDATING...' : 'SET NEW PASSWORD'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelResetMode}
                    className="neo-button bg-white text-black font-black"
                  >
                    BACK TO LOGIN
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block font-black mb-2">EMAIL</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block font-black mb-2">PASSWORD</label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    className="font-black text-sm underline underline-offset-2"
                    onClick={() => {
                      setShowForgotPassword((current) => {
                        const next = !current;
                        if (next) {
                          setForgotEmail((existing) => (existing.trim() ? existing : email.trim()));
                        }
                        return next;
                      });
                      setForgotPasswordError(null);
                      setForgotPasswordMessage(null);
                    }}
                  >
                    FORGOT PASSWORD?
                  </button>
                </div>

                {showForgotPassword && (
                  <div className="bg-[#F5F5F5] neo-brutal-border-thin p-4 space-y-3">
                    <label className="block font-black mb-1">ACCOUNT EMAIL</label>
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(event) => setForgotEmail(event.target.value)}
                      className="neo-brutal-border-thin font-bold bg-white"
                      placeholder="you@example.com"
                    />

                    {forgotPasswordError && (
                      <div className="bg-red-100 neo-brutal-border-thin p-3">
                        <p className="font-bold text-red-700">{forgotPasswordError}</p>
                      </div>
                    )}

                    {forgotPasswordMessage && (
                      <div className="bg-[#DCFCE7] neo-brutal-border-thin p-3">
                        <p className="font-bold text-[#166534]">{forgotPasswordMessage}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={handleForgotPasswordRequest}
                        disabled={submittingForgotPassword}
                        className="neo-button bg-black! text-white font-black"
                      >
                        {submittingForgotPassword ? 'SENDING...' : 'SEND RESET LINK'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordError(null);
                          setForgotPasswordMessage(null);
                        }}
                        className="neo-button bg-white text-black font-black"
                      >
                        CLOSE
                      </Button>
                    </div>
                  </div>
                )}

                {loginError && (
                  <div className="bg-red-100 neo-brutal-border-thin p-3">
                    <p className="font-bold text-red-700">{loginError}</p>
                  </div>
                )}

                {loginSuccess && (
                  <div className="bg-[#DCFCE7] neo-brutal-border-thin p-3">
                    <p className="font-bold text-[#166534]">{loginSuccess}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={submittingLogin}
                    className="neo-button bg-[#22C55E]! text-white font-black px-8"
                  >
                    {submittingLogin ? 'PLEASE WAIT...' : 'LOGIN'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="neo-button bg-white text-black font-black"
                  >
                    BACK HOME
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="neo-brutal-border neo-brutal-shadow">
          <CardHeader className="bg-black text-white">
            <CardTitle className="font-black text-2xl flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" />
              ADMIN BOOTSTRAP (SECRET CODE)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-bold text-gray-700">
              Use this only for bootstrap admin account creation using the protected admin permission code.
            </p>

            {!showAdminBootstrap ? (
              <Button
                type="button"
                onClick={() => setShowAdminBootstrap(true)}
                className="neo-button bg-black! text-white font-black"
              >
                OPEN ADMIN SIGNUP
              </Button>
            ) : (
              <form onSubmit={handleAdminSignupSubmit} className="space-y-4">
                <div>
                  <label className="block font-black mb-2">ADMIN EMAIL</label>
                  <Input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="block font-black mb-2">ADMIN PASSWORD</label>
                  <Input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    className="neo-brutal-border-thin font-bold"
                  />
                </div>

                <div>
                  <label className="block font-black mb-2">CONFIRM ADMIN PASSWORD</label>
                  <Input
                    type="password"
                    required
                    value={adminConfirmPassword}
                    onChange={(event) => setAdminConfirmPassword(event.target.value)}
                    className="neo-brutal-border-thin font-bold"
                  />
                </div>

                <div>
                  <label className="block font-black mb-2">ADMIN PERMISSION CODE</label>
                  <Input
                    type="text"
                    required
                    value={adminPermissionCode}
                    onChange={(event) => setAdminPermissionCode(event.target.value)}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="Secret admin code"
                  />
                </div>

                {adminSignupError && (
                  <div className="bg-red-100 neo-brutal-border-thin p-3">
                    <p className="font-bold text-red-700">{adminSignupError}</p>
                  </div>
                )}

                {adminSignupSuccess && (
                  <div className="bg-[#DCFCE7] neo-brutal-border-thin p-3">
                    <p className="font-bold text-[#166534]">{adminSignupSuccess}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={submittingAdminSignup}
                    className="neo-button bg-[#22C55E]! text-white font-black"
                  >
                    {submittingAdminSignup ? 'CREATING...' : 'CREATE ADMIN ACCOUNT'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAdminBootstrap(false);
                      setAdminSignupError(null);
                      setAdminSignupSuccess(null);
                    }}
                    className="neo-button bg-white text-black font-black"
                  >
                    CLOSE
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
