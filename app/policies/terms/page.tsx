export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-6 text-gray-800">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Terms of Service
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Sporty Gotchi</h1>
        <p className="text-sm text-gray-500">Draft – finalize with counsel before launch.</p>
      </header>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">1. Acceptance</h2>
        <p>By connecting Strava you agree to these terms.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">2. Service description</h2>
        <p>
          We provide a virtual avatar + readiness dashboard based on your Strava data. Sporty Gotchi
          is not a medical device. Consult a coach/doctor before making training decisions.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">3. Accounts</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>You must own the Strava account you connect and be 16+ years old.</li>
          <li>You are responsible for any content you upload to Strava.</li>
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">4. Subscription</h2>
        <p>MVP is free. Future paid tiers will include a separate agreement.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">5. Prohibited use</h2>
        <p>No reverse engineering, API abuse, or sharing other people’s data.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">6. Termination</h2>
        <p>You can disconnect any time. We may suspend access for abuse or API violations.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">7. Limitation of liability</h2>
        <p>Sporty Gotchi is provided “as is.” We are not liable for indirect or consequential damages.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">8. Changes</h2>
        <p>We may update these terms; continued use equals acceptance. Material changes will be posted.</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">9. Contact</h2>
        <p>legal@sportygotchi.app</p>
      </section>
    </main>
  );
}

