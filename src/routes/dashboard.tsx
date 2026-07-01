import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/auth-actions'
import { getUserConsultations } from '../lib/consultation-actions'
import { Plus, Clock, CheckCircle, AlertCircle, Video, Play, MessageSquare, X } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
  loader: async () => {
    const user = await getCurrentUser()
    const consultations = user ? await getUserConsultations() : []
    return { user, consultations }
  }
})

function DashboardComponent() {
  const { user, consultations } = Route.useLoaderData()
  const navigate = useNavigate()
  const [selectedResponse, setSelectedResponse] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login', search: { redirect: '/dashboard' } })
    }
  }, [user, navigate])

  if (!user) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50 ring-blue-500/10'
      case 'claimed': return 'text-indigo-600 bg-indigo-50 ring-indigo-500/10'
      case 'completed': return 'text-green-600 bg-green-50 ring-green-500/10'
      default: return 'text-gray-600 bg-gray-50 ring-gray-500/10'
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Consultations</h1>
            <p className="mt-1 text-sm text-gray-500">Track your open problems and expert responses.</p>
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            New Problem
          </Link>
        </div>

        {/* List */}
        {consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <div className="rounded-full bg-gray-50 p-4">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No consultations yet</h3>
            <p className="mt-1 text-sm text-gray-500">Submit your first problem to get expert help.</p>
            <div className="mt-6">
              <Link
                to="/submit"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Submit Problem
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <ul className="divide-y divide-gray-200">
              {consultations.map((c: any) => (
                <li key={c.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-gray-900">{c.title}</h3>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(c.status)}`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                        {c.is_express === 1 && (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">
                            Express
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="font-medium text-gray-700">{c.category_name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        <span>${(c.bounty_amount / 100).toFixed(2)} bounty</span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2 max-w-2xl">{c.description}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-4">
                      {c.status === 'completed' ? (
                        <button 
                          onClick={() => setSelectedResponse(c)}
                          className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          <Play className="h-3 w-3" />
                          View Response
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Expires in</span>
                          <span className="text-xs font-medium text-gray-700">
                            {Math.max(0, Math.floor((new Date(c.expires_at).getTime() - Date.now()) / (60 * 1000)))} mins
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal for response */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Expert Diagnosis: {selectedResponse.title}</h3>
              <button onClick={() => setSelectedResponse(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <video src={selectedResponse.response_video_url} controls autoPlay className="w-full h-full" />
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 flex gap-3">
                <MessageSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">Expert Notes</h4>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    {selectedResponse.response_notes || "No additional notes provided."}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedResponse(null)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
