import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getCurrentUser } from '../lib/auth-actions'
import { getPendingPayouts, markAsPaid } from '../lib/consultation-actions'
import { CheckCircle2, Loader2, AlertCircle, ExternalLink, Mail, User } from 'lucide-react'

export const Route = createFileRoute('/admin/payouts')({
  loader: async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return { user: null, pendingPayouts: [] }
    }
    const pendingPayouts = await getPendingPayouts()
    return { user, pendingPayouts }
  },
  component: AdminPayoutsComponent,
})

function AdminPayoutsComponent() {
  const { user, pendingPayouts: initialPayouts } = Route.useLoaderData()
  const navigate = useNavigate()
  
  const [pendingPayouts, setPendingPayouts] = useState(initialPayouts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate({ to: '/login', search: { redirect: '/admin/payouts' } })
    }
  }, [user, navigate])

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm('Are you sure you have manually sent this payout?')) return
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await markAsPaid({ data: id })
      setPendingPayouts(prev => prev.filter((p: any) => p.id !== id))
      setSuccess('Payout marked as paid successfully.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-extrabold text-gray-900">Pending Expert Payouts</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all completed consultations waiting for manual payout processing.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Expert
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Consultation
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Payout Amount
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Completed At
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pendingPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500 italic">
                        No pending payouts found.
                      </td>
                    </tr>
                  ) : (
                    pendingPayouts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                <User className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{p.expert_name}</div>
                              <div className="flex items-center text-gray-500">
                                <Mail className="mr-1 h-3 w-3" />
                                {p.expert_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="text-gray-900 font-medium">{p.consultation_title}</div>
                          <div className="text-[10px] text-gray-400">ID: {p.consultation_id}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <div className="font-bold text-gray-900">${(p.net_amount_cents / 100).toFixed(2)}</div>
                          <div className="text-[10px] text-gray-400">Gross: ${(p.gross_amount_cents / 100).toFixed(2)}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleMarkAsPaid(p.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Mark as Paid
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-xl bg-amber-50 p-6 border border-amber-200">
        <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-2">Payout Process Instructions</h3>
        <ul className="text-sm text-amber-700 space-y-2 list-disc pl-5">
          <li>Log into the <a href="https://dashboard.stripe.com" target="_blank" className="font-bold underline flex inline-items items-center gap-1">Stripe Dashboard <ExternalLink className="h-3 w-3" /></a></li>
          <li>Find the payment associated with the consultation.</li>
          <li>Initiate a manual transfer to the expert's bank account or PayPal.</li>
          <li>Once the money is sent, click <strong>"Mark as Paid"</strong> here to update the internal records.</li>
        </ul>
      </div>
    </div>
  )
}
