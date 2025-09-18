export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">The Guild Genesis</h1>
        <a
          href="https://discord.gg/pg4UgaTr"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Join our Discord
        </a>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">What is The Guild?</h2>
        <p className="text-muted-foreground">
          The Guild is a peer‑run organization for software developers. We learn
          together, certify each other’s skills, and create opportunities
          through collaboration, attestations, and on‑chain credentials.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Why it matters</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            Community‑verified skills: members issue attestations that build
            portable, credible profiles.
          </li>
          <li>
            Learning by doing: contribute, earn badges, and grow through real
            projects.
          </li>
          <li>
            Open and merit‑based: progress is transparent and anchored on public
            infrastructure.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li>Connect your wallet and create your developer profile.</li>
          <li>
            Contribute to initiatives and receive attestations from peers.
          </li>
          <li>Earn badges that reflect concrete skills and achievements.</li>
          <li>
            Use your on‑chain reputation across The Guild apps and beyond.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Get involved</h2>
        <p className="text-muted-foreground">
          New here? Start by joining the Discord, introducing yourself, and
          picking a project that matches your interests. Your first contribution
          can earn your first attestation.
        </p>
      </section>
    </div>
  );
}
