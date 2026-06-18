import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 text-center">
      <div className="aurora" aria-hidden />
      <div>
        <p className="font-mono text-sm tracking-widest text-accent-2">ERROR 404</p>
        <h1 className="mt-4 font-display text-6xl font-semibold tracking-tight sm:text-8xl">
          <span className="text-gradient">Lost in space.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          The page you're looking for drifted off the grid. Let's get you back to the catalog.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] px-8 text-sm font-medium text-white shadow-[0_10px_40px_-10px_var(--color-accent)] transition-transform hover:-translate-y-0.5"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
