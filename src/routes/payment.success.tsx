import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/payment/success')({
  component: PaymentSuccessComponent,
})

function PaymentSuccessComponent() {
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-8">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
        Payment Successful!
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 max-w-md mx-auto">
        Your problem has been submitted and is now live. Our experts have been notified and you'll receive a response shortly.
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          View in Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/"
          className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
