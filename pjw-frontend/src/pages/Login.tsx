import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, signUp } from "@/api/publicApi";

type AuthMode = "signin" | "signup";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminPermissionCode, setAdminPermissionCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetStatus = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const resetSignUpOnlyFields = () => {
    setConfirmPassword("");
    setShowAdminCode(false);
    setAdminPermissionCode("");
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetStatus();
    if (nextMode === "signin") {
      resetSignUpOnlyFields();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();

    if (!email.trim() || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "signin") {
        const response = await signIn({
          email: email.trim(),
          password,
        });

        window.localStorage.setItem("pjw_auth_token", response.token);
        window.localStorage.setItem(
          "pjw_auth_user",
          JSON.stringify({
            id: response.user.id,
            email: response.user.email,
            role: response.role,
          })
        );

        setSuccessMessage("Login successful. Redirecting...");
        window.setTimeout(() => {
          navigate("/home");
        }, 350);
        return;
      }

      await signUp({
        email: email.trim(),
        password,
        adminPermissionCode:
          showAdminCode && adminPermissionCode.trim()
            ? adminPermissionCode.trim()
            : undefined,
      });

      setSuccessMessage("Account created. You can now sign in.");
      setMode("signin");
      setPassword("");
      resetSignUpOnlyFields();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication request failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="bg-[#22C55E] py-20 neo-brutal-border border-b-4">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-black neo-brutal-border mx-auto mb-6 flex items-center justify-center">
            {mode === "signin" ? (
              <LogIn className="w-10 h-10 text-[#22C55E]" />
            ) : (
              <UserPlus className="w-10 h-10 text-[#22C55E]" />
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-white">
            {mode === "signin" ? "LOGIN" : "CREATE ACCOUNT"}
          </h1>
          <p className="text-xl font-bold text-black max-w-2xl mx-auto">
            {mode === "signin"
              ? "Sign in to access member and admin features."
              : "Sign up for a new account. Admin code is optional."}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="neo-brutal-border neo-brutal-shadow">
          <CardHeader className="bg-black text-white">
            <CardTitle className="font-black text-2xl">
              {mode === "signin" ? "SIGN IN" : "SIGN UP"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                onClick={() => handleModeChange("signin")}
                className={`neo-button font-black ${
                  mode === "signin" ? "bg-black! text-white" : "bg-white text-black"
                }`}
              >
                Sign In
              </Button>
              <Button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={`neo-button font-black ${
                  mode === "signup" ? "bg-black! text-white" : "bg-white text-black"
                }`}
              >
                Sign Up
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              {mode === "signup" && (
                <>
                  <div>
                    <label className="block font-black mb-2">CONFIRM PASSWORD</label>
                    <Input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="neo-brutal-border-thin font-bold"
                      placeholder="Re-enter password"
                    />
                  </div>

                  <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAdminCode}
                      onChange={(event) => setShowAdminCode(event.target.checked)}
                    />
                    I have an admin permission code
                  </label>

                  {showAdminCode && (
                    <div>
                      <label className="block font-black mb-2">ADMIN PERMISSION CODE</label>
                      <Input
                        type="text"
                        value={adminPermissionCode}
                        onChange={(event) => setAdminPermissionCode(event.target.value)}
                        className="neo-brutal-border-thin font-bold"
                        placeholder="Optional admin code"
                      />
                    </div>
                  )}
                </>
              )}

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

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="neo-button bg-[#22C55E]! text-white font-black px-8"
                >
                  {submitting
                    ? "PLEASE WAIT..."
                    : mode === "signin"
                      ? "LOGIN"
                      : "CREATE ACCOUNT"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="neo-button bg-white text-black font-black"
                >
                  BACK HOME
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
