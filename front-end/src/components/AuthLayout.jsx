import { Link } from "react-router-dom";

export default function AuthLayout({ title, children }) {
  return (
    <main>
      <Link to="/">Anything but Fish</Link>
      <section aria-labelledby="auth-title">
        <h1 id="auth-title">{title}</h1>
        {children}
      </section>
    </main>
  );
}
