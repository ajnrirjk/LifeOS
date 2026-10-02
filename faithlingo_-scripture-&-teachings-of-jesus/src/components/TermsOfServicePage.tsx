import React from 'react';
import { FileText, ArrowLeft, Shield, Mail } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-start p-4 sm:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Return Navigation */}
      <div className="w-full max-w-3xl mb-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg bg-stone-900/80 border border-stone-800 hover:border-emerald-500/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Life OS</span>
        </a>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-3xl bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8">
        {/* Header */}
        <header className="border-b border-stone-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Terms of Service for Life OS
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                Last Updated: October 2, 2026
              </p>
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <div className="space-y-6 text-stone-300 leading-relaxed text-sm sm:text-base">
          <section className="bg-stone-950/50 p-5 rounded-xl border border-stone-800/80">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-stone-300 pl-8 text-sm">
              By accessing or using Life OS (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="bg-stone-950/50 p-5 rounded-xl border border-stone-800/80">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
              Description of Service
            </h2>
            <p className="text-stone-300 pl-8 text-sm">
              Life OS provides personal organization and management tools. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
          </section>

          <section className="bg-stone-950/50 p-5 rounded-xl border border-stone-800/80">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">3</span>
              Account Registration and Google OAuth
            </h2>
            <p className="text-stone-300 pl-8 text-sm">
              To access certain features of Life OS, you must authenticate using your Google account. You agree to provide accurate information and are responsible for maintaining the security of your account. Life OS&apos;s use of your Google data is strictly governed by our Privacy Policy.
            </p>
          </section>

          <section className="bg-stone-950/50 p-5 rounded-xl border border-stone-800/80">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">4</span>
              User Conduct
            </h2>
            <p className="text-stone-300 pl-8 text-sm">
              You agree not to use Life OS for any unlawful purposes, to violate any local or international laws, or to conduct any activity that would damage, disable, or impair the Service&apos;s servers or networks.
            </p>
          </section>

          <section className="bg-stone-950/50 p-5 rounded-xl border border-stone-800/80">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">5</span>
              Termination
            </h2>
            <p className="text-stone-300 pl-8 text-sm">
              We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice or liability, for any reason, including a breach of these Terms.
            </p>
          </section>

          <section className="bg-stone-950/50 p-5 rounded-xl border border-stone-800/80">
            <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">6</span>
              Contact Us
            </h2>
            <p className="text-stone-300 pl-8 text-sm">
              If you have any questions about these Terms, please contact us at: <a href="mailto:aw03102008@gmail.com" className="text-emerald-400 underline font-semibold hover:text-emerald-300">aw03102008@gmail.com</a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <span>Life OS &bull; Personal Organization Platform</span>
          <div className="flex items-center gap-4">
            <a href="/privacy.html" className="text-stone-400 hover:text-white transition-colors underline">
              Privacy Policy
            </a>
            <a href="/" className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
              Open App &rarr;
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};
