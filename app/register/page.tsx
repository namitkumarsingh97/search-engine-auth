import AuthForm from "@/components/AuthForm";
import Masthead from "@/components/Masthead";

export default function RegisterPage() {
  return (
    <main>
      <Masthead />
      <AuthForm mode="register" />
    </main>
  );
}
