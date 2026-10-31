import { Link } from "react-router-dom";

export default function AuthLayout({ title, children }) {
  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <section className="col-12 col-md-8 col-lg-5" aria-labelledby="auth-title">
          <div className="card"><div className="card-body p-4">
            <Link className="d-inline-block mb-3" to="/">Anything but Fish</Link>
            <h1 id="auth-title" className="h3 mb-4">{title}</h1>
            {children}
          </div></div>
        </section>
      </div>
    </main>
  );
}
