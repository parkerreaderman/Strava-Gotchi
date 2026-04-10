export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6 text-gray-800">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Privacy Policy
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Sporty Gotchi</h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toISOString().split('T')[0]}
        </p>
      </header>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">1. Data we collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Strava profile basics (name, photo) for personalization.</li>
          <li>Activity summaries for the past 90 days (distance, duration, heart rate, power).</li>
          <li>No location streams, private notes, or friend data.</li>
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">2. How we use it</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Calculate CTL/ATL/TSB to drive the avatar.</li>
          <li>Cache recent activities so dashboards load quickly.</li>
          <li>Never sell data or share with third parties.</li>
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">3. Storage &amp; retention</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Tokens + activity caches live in our database (SQLite/Postgres).</li>
          <li>
            Delete all user data within 30 days of disconnecting Strava (email privacy@sportygotchi.app).
          </li>
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">4. Security</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Secrets managed via Vercel environment variables.</li>
          <li>TLS enforced end-to-end via Vercel.</li>
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">5. Your choices</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Disconnect via Settings → “Disconnect Strava”.</li>
          <li>Request deletion by emailing privacy@sportygotchi.app.</li>
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">6. Contact</h2>
        <p>privacy@sportygotchi.app</p>
      </section>
    </main>
  );
}

