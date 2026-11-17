import AuthForm from "@/components/AuthForm";
import Masthead from "@/components/Masthead";

export default function LoginPage() {
  return (
    <main>
      <Masthead />
      <AuthForm mode="login" />
    </main>
  );
}
