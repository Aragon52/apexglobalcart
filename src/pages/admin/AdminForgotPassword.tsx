import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";
import { adminPath } from "@/lib/subdomain";

export default function AdminForgotPassword() {
  return (
    <ForgotPasswordForm
      portalName="admin portal"
      resetPath={adminPath("/admin/auth/reset-password")}
      backPath={adminPath("/admin/auth/sign-in")}
    />
  );
}
