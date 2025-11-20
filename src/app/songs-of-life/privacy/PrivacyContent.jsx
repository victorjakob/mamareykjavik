"use client";

const LAST_UPDATED = "November 2025";

export default function PrivacyContent() {
  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" />
      <article className="space-y-12 rounded-3xl border border-emerald-100/70 bg-white/90 p-8 shadow-xl shadow-emerald-100/40 backdrop-blur">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
            Songs of Life
          </p>
          <h1 className="font-serif text-4xl font-semibold text-emerald-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-emerald-900/70">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <section className="space-y-10 text-base leading-relaxed text-emerald-900/80">
          <div className="space-y-3">
            <p>
              Welcome to Songs of Life.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, and protect your personal information when you use the Songs of Life mobile application ("App").
            </p>
            <p>
              By using the App, you agree to the practices described in this Policy.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              1. Information We Collect
            </h2>
            <p>
              We collect the minimum information necessary for the App to function smoothly and to support your learning journey.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100/70 bg-emerald-50/50 p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-emerald-900 mb-2">
                A. Personal Information
              </h3>
              <p className="mb-2">
                When you create an account or sign in, we may collect:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Email address</li>
                <li>Name (if provided)</li>
                <li>Authentication data</li>
                <li>Apple Sign-In information (if used)</li>
              </ul>
              <p className="mt-2">
                We do not store your password — Supabase handles authentication securely.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-emerald-900 mb-2">
                B. Usage Information
              </h3>
              <p className="mb-2">
                We may collect:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>App interactions</li>
                <li>Lessons or audio content you access</li>
                <li>Time spent on features</li>
                <li>Device type and operating system</li>
                <li>Crash data and diagnostic logs</li>
              </ul>
              <p className="mt-2">
                This helps us understand what content resonates and improve your experience.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-emerald-900 mb-2">
                C. Optional Information
              </h3>
              <p>
                If you choose to share preferences, bookmarks, notes, or practice logs inside the App, this information is stored securely with your account.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              2. How We Use Your Information
            </h2>
            <p className="mb-2">
              We use your data to:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Provide access to Songs of Life content</li>
              <li>Maintain and improve app functionality</li>
              <li>Personalize your learning experience</li>
              <li>Authenticate your account</li>
              <li>Deliver optional notifications</li>
              <li>Ensure platform safety and performance</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-2">
              We never sell your data or use it for advertising.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              3. How Your Data Is Stored
            </h2>
            <p>
              Songs of Life uses Supabase as its secure backend.
            </p>
            <p>
              Your data is stored using:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>encrypted connections (TLS)</li>
              <li>managed databases</li>
              <li>role-based access control (RLS)</li>
              <li>secure authentication flows</li>
            </ul>
            <p>
              We take reasonable precautions to protect your information from unauthorized access or disclosure.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              4. Third-Party Services
            </h2>
            <p className="mb-2">
              We may use trusted third-party providers to support:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Account authentication (Apple Sign-In)</li>
              <li>Database storage (Supabase)</li>
              <li>Analytics (Expo, app store platforms)</li>
              <li>Crash reporting (optional Expo services)</li>
            </ul>
            <p className="mt-2">
              These providers only receive the minimum information needed to perform their tasks.
            </p>
            <p>
              We do not sell or share your information for marketing purposes.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              5. Your Rights
            </h2>
            <p className="mb-2">
              Depending on your local laws (GDPR, etc.), you have the right to:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Access the information we store about you</li>
              <li>Update or correct your information</li>
              <li>Request deletion of your account</li>
              <li>Export your data</li>
              <li>Withdraw consent (where applicable)</li>
            </ul>
            <p className="mt-2">
              To request any of these, email us at{" "}
              <a
                href="mailto:victor@mama.is"
                className="text-emerald-700 hover:text-emerald-800 underline"
              >
                victor@mama.is
              </a>
              .
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              6. Account Deletion
            </h2>
            <p className="mb-2">
              You may request full account deletion at any time. This includes:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Your profile</li>
              <li>Lessons progress</li>
              <li>Notes or logs</li>
              <li>Any stored preferences</li>
            </ul>
            <p className="mt-2">
              Once deleted, this data cannot be recovered.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              7. Children's Privacy
            </h2>
            <p>
              Songs of Life is not intended for children under 16. We do not knowingly collect personal data from children without parental consent.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              8. Data Retention
            </h2>
            <p className="mb-2">
              We retain personal data only as long as:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>your account is active</li>
              <li>required by law</li>
              <li>needed to provide core functionality</li>
            </ul>
            <p className="mt-2">
              Inactive accounts may be removed after a period of time.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              9. Security
            </h2>
            <p className="mb-2">
              We implement reasonable and industry-standard security measures, but no method of electronic storage is 100% secure.
            </p>
            <p className="mb-2">
              You are responsible for:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Keeping your device secure</li>
              <li>Ensuring your Apple ID or email login remains private</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If changes are significant, we will notify you within the App or through an update.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-emerald-800">
              11. Contact Us
            </h2>
            <p className="mb-2">
              If you have any questions, concerns, or data requests:
            </p>
            <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/70 p-5">
              <p className="space-y-1">
                <span className="block">
                  <strong>Songs of Life</strong>
                </span>
                <span className="block">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:victor@mama.is"
                    className="text-emerald-700 hover:text-emerald-800 underline"
                  >
                    victor@mama.is
                  </a>
                </span>
              </p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}

