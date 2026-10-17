import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section not-found">
      <p className="micro">Error 404</p>
      <h1>Page not found</h1>
      <p className="lead">The page you were looking for has moved or no longer exists.</p>
      <p>
        <Link href="/" className="bracket bracket-accent">
          <span>Back to home</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </p>
    </section>
  );
}
