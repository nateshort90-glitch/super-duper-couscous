import { createFileRoute, Link } from '@tanstack/react-router'
import { getCategories } from '../lib/auth-actions'
import { CheckCircle2, Clock, MapPin, DollarSign, ArrowRight, PlayCircle, ClipboardCheck, Video } from 'lucide-react'

export const Route = createFileRoute('/experts')({
  loader: async () => {
    const categories = await getCategories()
    return { categories }
  },
  component: ExpertsComponent
})

function ExpertsComponent() {
  const { categories } = Route.useLoaderData()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Meta tags for social sharing */}
      <head>
        <title>Become an Expert on BountyFix | Earn from Your Expertise</title>
        <meta name="description" content="Turn your professional knowledge into extra income. Answer diagnostic questions on your own schedule, from anywhere with BountyFix." />
        <meta property="og:title" content="Join BountyFix as an Expert" />
        <meta property="og:description" content="Earn $50-100/day from your couch helping others solve practical problems." />
        <meta property="og:image" content="/og-expert.png" />
      </head>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-indigo-900 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.500),theme(colors.indigo.900))] opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Turn your expertise into <span className="text-indigo-400">extra income</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Earn $50–$100/day sharing your knowledge from your couch. 
              No house calls, no schedules, just your phone and your brain.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-full bg-indigo-500 px-8 py-4 text-lg font-bold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Join as an Expert
              </Link>
              <a href="#how-it-works" className="text-sm font-semibold leading-6 text-white hover:text-indigo-200">
                Learn how it works <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">The Workflow</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How it works for experts
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <Step
              icon={<PlayCircle className="h-8 w-8" />}
              title="Browse Bounties"
              desc="See open problems in your trade that need answers."
            />
            <Step
              icon={<Video className="h-8 w-8" />}
              title="Watch Videos"
              desc="View the client's video evidence to diagnose the issue."
            />
            <Step
              icon={<ClipboardCheck className="h-8 w-8" />}
              title="Record Response"
              desc="Record a short video explaining the fix or next steps."
            />
            <Step
              icon={<DollarSign className="h-8 w-8" />}
              title="Get Paid"
              desc="Earn your bounty instantly once the diagnosis is delivered."
            />
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="bg-indigo-50 py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Built for the modern pro
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Stop trading hours for dollars. BountyFix lets you monetize your knowledge 
                whenever you have a few spare minutes.
              </p>
              <dl className="mt-10 space-y-8">
                <Benefit
                  icon={<Clock className="text-indigo-600" />}
                  title="Set your own schedule"
                  desc="No minimum hours or commitments. Pick up a bounty when you're waiting for parts or relaxing at home."
                />
                <Benefit
                  icon={<DollarSign className="text-indigo-600" />}
                  title="Get paid per consultation"
                  desc="No hourly rates or complex bidding. Every consultation has a fixed bounty you see upfront."
                />
                <Benefit
                  icon={<MapPin className="text-indigo-600" />}
                  title="Work from anywhere"
                  desc="As long as you have your phone and an internet connection, you're open for business."
                />
                <Benefit
                  icon={<CheckCircle2 className="text-indigo-600" />}
                  title="Build your reputation"
                  desc="Earn ratings and reviews to become a top-tier expert and unlock higher-paying priority bounties."
                />
              </dl>
            </div>
            <div className="relative rounded-2xl bg-indigo-600 p-8 shadow-2xl lg:p-12">
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-indigo-400 opacity-20" />
              <div className="space-y-6 text-white">
                <h3 className="text-2xl font-bold">Top Expert Monthly Earnings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500 pb-2">
                    <span>HVAC Specialist</span>
                    <span className="font-bold">$2,450</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-indigo-500 pb-2">
                    <span>Master Electrician</span>
                    <span className="font-bold">$1,820</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-indigo-500 pb-2">
                    <span>Tech Consultant</span>
                    <span className="font-bold">$1,200</span>
                  </div>
                </div>
                <p className="text-sm text-indigo-100">
                  *Results based on average completions for experts spending 10 hours/week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Preview */}
      <section className="py-24 bg-white sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">
            What's your specialty?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat: any) => (
              <div
                key={cat.id}
                className="rounded-full bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
              >
                {cat.name}
              </div>
            ))}
            <div className="rounded-full bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-500 italic">
              And more trades coming...
            </div>
          </div>
        </div>
      </section>

      {/* Strong CTA */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-indigo-600 px-6 pt-16 shadow-2xl rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to earn?
                <br />
                Start your expert application today.
              </h2>
              <p className="mt-6 text-lg leading-8 text-indigo-100">
                Verified experts typically get approved within 24 hours. Join the fastest growing diagnostic network.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <Link
                  to="/register"
                  className="rounded-full bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-sm hover:bg-indigo-50"
                >
                  Join as an Expert
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-white">
                  Existing expert? Log in <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Condensed) */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            © 2026 BountyFix Inc. Questions? <a href="mailto:experts@bountyfix.app" className="text-indigo-600 hover:underline">experts@bountyfix.app</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function Step({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  )
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="relative pl-12 text-left">
      <dt className="inline font-bold text-gray-900">
        <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center">
          {icon}
        </div>
        {title}
      </dt>
      <dd className="mt-1 text-gray-600">{desc}</dd>
    </div>
  )
}
