import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "BountyFix";
  } catch {
    return "BountyFix";
  }
});

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

function Home() {
  const businessName = Route.useLoaderData();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-gray-900">
                Get expert eyes on your <br className="hidden md:inline" />
                <span className="text-indigo-600">problem in minutes.</span>
              </h1>
              <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl lg:text-2xl font-light">
                No scheduling, no house-calls. Just record a short video of your issue 
                and get a personalized video diagnosis from a verified pro.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/submit"
                className="inline-flex h-14 items-center justify-center rounded-full bg-indigo-600 px-10 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                I Need Help
              </Link>
              <Link
                to="/expert/dashboard"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-indigo-200 bg-white px-10 py-4 text-lg font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:border-indigo-600 hover:scale-105"
              >
                I'm an Expert
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="w-full py-20 bg-white border-y border-gray-100">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">How it Works</h2>
            <p className="mt-4 text-gray-500 text-lg">Visual diagnostics in three simple steps.</p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="relative flex flex-col items-center text-center group">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition-transform group-hover:rotate-6">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1. Record your problem</h3>
              <p className="text-gray-600">Point your phone at the issue, explain what's happening, and hit send.</p>
              <div className="hidden md:block absolute top-10 -right-6 text-indigo-200">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
            <div className="relative flex flex-col items-center text-center group">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition-transform group-hover:rotate-6">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">2. Experts bid & claim</h3>
              <p className="text-gray-600">Verified specialists review your case and the best match claims it instantly.</p>
              <div className="hidden md:block absolute top-10 -right-6 text-indigo-200">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-white transition-transform group-hover:rotate-6">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">3. Get video diagnosis</h3>
              <p className="text-gray-600">Watch your custom solution video. Follow the steps and fix it yourself.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Verified Expertise</h2>
            <p className="mt-4 text-gray-500 text-lg">Top professionals across all major trades.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <CategoryCard 
              title="Auto Mechanics" 
              desc="Engine noises, dashboard lights, or pre-purchase advice."
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <CategoryCard 
              title="Home Repair" 
              desc="Drywall, flooring, carpentry, and general DIY guidance."
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
            />
            <CategoryCard 
              title="Plumbing" 
              desc="Leaky faucets, water pressure issues, or pipe routing."
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.34a2 2 0 01-1.736 0l-.69-.34a6 6 0 00-3.861-.517l-2.387.477a2 2 0 00-1.022.547l-1.022 1.022A2 2 0 004.5 18h15a2 2 0 001.447-.553l-1.519-2.019zM12 2v4M12 12V8" /></svg>}
            />
            <CategoryCard 
              title="Electrical" 
              desc="Flickering lights, outlet issues, and smart home wiring."
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <CategoryCard 
              title="Legal & Contracts" 
              desc="Quick review of terms or help understanding a clause."
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
            <CategoryCard 
              title="Tech Support" 
              desc="Software bugs, hardware setup, or networking help."
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            />
            <CategoryCard 
              title="Creative/Design" 
              desc="Feedback on logos, UX flows, or video editing tips."
              icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <div className="flex flex-col justify-center items-center p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 text-gray-400">
               <span className="text-sm font-medium">More coming soon...</span>
            </div>
          </div>
        </div>
      </section>

      {/* For Clients / For Experts */}
      <section className="w-full py-20 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                For Clients
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">Stop guessing. Start fixing.</h2>
              <p className="text-lg text-gray-600">
                Why wait for a scheduled call or pay for a $150 house call just for a diagnosis? 
                BountyFix gives you direct access to the same expertise for a fraction of the cost.
              </p>
              <ul className="grid gap-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Affordable:</span>
                    <p className="text-gray-500 text-sm">Save up to 70% compared to traditional on-site visits.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Fast:</span>
                    <p className="text-gray-500 text-sm">Most consultations are completed in under 30 minutes.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Verified:</span>
                    <p className="text-gray-500 text-sm">Every expert is vetted for licenses and certifications.</p>
                  </div>
                </li>
              </ul>
              <Link to="/submit" className="inline-flex h-12 items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700">
                Get a Diagnosis Now
              </Link>
            </div>
            <div className="space-y-6">
              <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                For Experts
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">Earn from your expertise.</h2>
              <p className="text-lg text-gray-600">
                Turn your professional knowledge into a side stream of income. 
                Answer diagnostic questions on your own schedule, from anywhere.
              </p>
              <ul className="grid gap-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Flexible:</span>
                    <p className="text-gray-500 text-sm">Work when you want, for as long as you want.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Low Effort:</span>
                    <p className="text-gray-500 text-sm">No travel, no heavy tools. Just your eyes and a camera.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Weekly Payouts:</span>
                    <p className="text-gray-500 text-sm">Get paid directly to your bank account every Friday.</p>
                  </div>
                </li>
              </ul>
              <Link to="/register" className="inline-flex h-12 items-center justify-center rounded-md border border-indigo-600 px-6 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50">
                Apply to be an Expert
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-indigo-600">
        <div className="container px-4 md:px-6 mx-auto text-center text-white">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-6">Ready to fix it?</h2>
          <p className="mx-auto max-w-[600px] text-indigo-100 text-xl mb-10">
            Join thousands of users who have saved time and money with BountyFix.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/submit" className="rounded-full bg-white px-10 py-4 text-lg font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50">
              Get Started
            </Link>
            <Link to="/login" className="rounded-full border-2 border-white px-10 py-4 text-lg font-bold text-white transition hover:bg-white/10">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-2xl font-bold text-white">BountyFix</span>
            <p className="text-sm max-w-xs text-center md:text-left">
              The world's fastest asynchronous video consultation marketplace.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-white uppercase text-xs tracking-widest">Platform</span>
              <Link to="/submit" className="text-sm hover:text-white">Get Help</Link>
              <Link to="/expert/dashboard" className="text-sm hover:text-white">Become Expert</Link>
              <Link to="/login" className="text-sm hover:text-white">Log In</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-bold text-white uppercase text-xs tracking-widest">Legal</span>
              <Link to="#" className="text-sm hover:text-white">Privacy</Link>
              <Link to="#" className="text-sm hover:text-white">Terms</Link>
              <Link to="#" className="text-sm hover:text-white">Trust</Link>
            </div>
          </div>
        </div>
        <div className="container px-4 md:px-6 mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs">
          © 2026 {businessName} Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function CategoryCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
