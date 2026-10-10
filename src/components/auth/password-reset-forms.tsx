import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/lib/router-compat";
import { KeyRound, MailCheck } from "lucide-react";
import { requestPasswordReset, setNewPassword, waitForRecoverySession } from "@/services/password-reset-service";

interface ForgotProps {
  portalName: string;
  resetPath: string;
  backPath: string;
  initialEmail?: string;
}

export function ForgotPasswordForm({ portalName, resetPath, backPath, initialEmail = "" }: ForgotProps) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter the email address you signed up with.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestPasswordReset(email, resetPath);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We couldn't send the email. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {sent ? <MailCheck className="h-6 w-6 text-primary" /> : <KeyRound className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle className="text-2xl">{sent ? "Check your email" : "Reset your password"}</CardTitle>
          <CardDescription>
            {sent
              ? `If ${email.trim()} has a ${portalName} account, we've sent a link to set a new password. It may take a minute — please check spam too.`
              : `Enter the email for your ${portalName} account and we'll send you a reset link.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent && (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input id="reset-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}
          <Link to={backPath} className="mt-4 block text-center text-sm text-muted-foreground hover:text-primary">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

interface ResetProps {
  forgotPath: string;
  donePath: string;
}

export function ResetPasswordForm({ forgotPath, donePath }: ResetProps) {
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    void waitForRecoverySession().then(setReady);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("Please use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    setError("");
    try {
      await setNewPassword(password);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We couldn't update your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{done ? "Password updated" : "Choose a new password"}</CardTitle>
          <CardDescription>
            {done
              ? "Your new password is saved. You're signed in and can continue."
              : ready === false
                ? "This reset link has expired or was already used. Please request a new one."
                : "Enter your new password below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <Button asChild className="w-full"><Link to={donePath}>Continue</Link></Button>
          ) : ready === false ? (
            <Button asChild className="w-full"><Link to={forgotPath}>Request a new link</Link></Button>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy || ready === null}>
                {ready === null ? "Checking your link…" : busy ? "Saving…" : "Save new password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
