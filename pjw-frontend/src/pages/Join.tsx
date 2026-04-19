import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signUp, validateInvite } from '@/api/publicApi';

export default function Join() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const inviteToken = useMemo(() => (token ?? '').trim(), [token]);

  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadInvite = async () => {
      if (!inviteToken) {
        setInviteValid(false);
        setLoadingInvite(false);
        return;
      }

      setLoadingInvite(true);
      setErrorMessage(null);

      try {
        const response = await validateInvite(inviteToken);
        if (!mounted) return;

        if (!response.valid) {
          setInviteValid(false);
          setErrorMessage('This invite link is invalid or has expired. Contact your admin.');
          return;
        }

        setInviteValid(true);
      } catch {
        if (mounted) {
          setInviteValid(false);
          setErrorMessage('This invite link is invalid or has expired. Contact your admin.');
        }
      } finally {
        if (mounted) {
          setLoadingInvite(false);
        }
      }
    };

    loadInvite();

    return () => {
      mounted = false;
    };
  }, [inviteToken]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!inviteValid) {
      setErrorMessage('This invite link is invalid or has expired. Contact your admin.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email is required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        invite_token: inviteToken,
      });

      setSuccessMessage('Account created successfully. Redirecting to login...');
      window.setTimeout(() => {
        navigate('/login');
      }, 600);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            <UserPlus className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-white">JOIN PROJECT WAMPUS</h1>
          <p className="text-xl font-bold text-black max-w-2xl mx-auto">
            Complete your invite-based registration to access member tools.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="neo-brutal-border neo-brutal-shadow">
          <CardHeader className="bg-black text-white">
            <CardTitle className="font-black text-2xl">CREATE YOUR ACCOUNT</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loadingInvite ? (
              <div className="bg-white neo-brutal-border-thin p-4">
                <p className="font-bold">Validating invite link...</p>
              </div>
            ) : !inviteValid ? (
              <div className="bg-red-100 neo-brutal-border-thin p-4">
                <p className="font-bold text-red-700">
                  {errorMessage ?? 'This invite link is invalid or has expired. Contact your admin.'}
                </p>
                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="neo-button bg-white text-black font-black mt-4"
                >
                  GO TO LOGIN
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-black mb-2">EMAIL</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="Create password"
                  />
                </div>

                <div>
                  <label className="block font-black mb-2">CONFIRM PASSWORD</label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="neo-brutal-border-thin font-bold"
                    placeholder="Re-enter password"
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-100 neo-brutal-border-thin p-3">
                    <p className="font-bold text-red-700">{errorMessage}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-[#DCFCE7] neo-brutal-border-thin p-3">
                    <p className="font-bold text-[#166534]">{successMessage}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="neo-button bg-[#22C55E]! text-white font-black px-8"
                  >
                    {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="neo-button bg-white text-black font-black"
                  >
                    BACK TO LOGIN
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
