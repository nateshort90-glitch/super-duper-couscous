import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/auth-actions'
import { getUserConsultations, submitRating } from '../lib/consultation-actions'
import { Plus, Clock, CheckCircle, AlertCircle, Video, Play, MessageSquare, X, Star, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
  loader: async () => {
    const user = await getCurrentUser()
    const consultations = user ? await getUserConsultations() : []
    return { user, consultations }
  }
})

function DashboardComponent() {
  const { user, consultations: initialConsultations } = Route.useLoaderData()
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState(initialConsultations)
  const [selectedResponse, setSelectedResponse] = useState<any>(null)
  
  // Rating state
  const [ratingScore, setRatingScore] = useState(0)
  const [ratingFeedback, setRatingFeedback] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login', search: { redirect: '/dashboard' } })
    }
  }, [user, navigate])

  if (!user) return null

  const handleRefresh = async () => {
    const res = await getUserConsultations()
    setConsultations(res)
  }

  const handleSubmitRating = async () => {
    if (ratingScore === 0) return
    setSubmittingRating(true)
    setRatingError(null)
    try {
      await submitRating({
        data: {
          consultationId: selectedResponse.id,
          score: ratingScore,
          feedback: ratingFeedback
        }
      })
      // Update local state
      setConsultations(prev => prev.map(c => 
        c.id === selectedResponse.id 
          ? { ...c, rating_score: ratingScore, rating_feedback: ratingFeedback } 
          : c
      ))
      setSelectedResponse(prev => ({ ...prev, rating_score: ratingScore, rating_feedback: ratingFeedback }))
    } catch (err: any) {
      setRatingError(err.message)
    } finally {
      setSubmittingRating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50 ring-blue-500/10'
      case 'claimed': return 'text-indigo-600 bg-indigo-50 ring-indigo-500/10'
      case 'completed': return 'text-green-600 bg-green-50 ring-green-500/10'
      case 'pending_payment': return 'text-amber-600 bg-amber-50 ring-amber-500/10'
      default: return 'text-gray-600 bg-gray-50 ring-gray-500/10'
    }
  }

  const formatStatus = (status: string) => {
    if (status === 'pending_payment') return 'Pending Payment'
    return status.charAt(0).toUpperCase() + status.slice(1)
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
                          {formatStatus(c.status)}
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
                        <div className="flex flex-col items-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedResponse(c)
                              setRatingScore(c.rating_score || 0)
                              setRatingFeedback(c.rating_feedback || '')
                            }}
                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <Play className="h-3 w-3" />
                            View Response
                          </button>
                          {c.rating_score > 0 && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < c.rating_score ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : c.status === 'pending_payment' ? (
                        <a 
                          href={c.payment_url}
                          className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500"
                        >
                          Pay Now
                        </a>
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
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
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

              {/* Rating Section */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Rate this Diagnosis</h4>
                
                {selectedResponse.rating_score > 0 ? (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < selectedResponse.rating_score ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-green-700">Thank you for your feedback!</span>
                    </div>
                    {selectedResponse.rating_feedback && (
                      <p className="text-sm text-green-800 italic">"{selectedResponse.rating_feedback}"</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => setRatingScore(score)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star className={`h-8 w-8 ${score <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Optional feedback for the expert..."
                      rows={2}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={ratingFeedback}
                      onChange={e => setRatingFeedback(e.target.value)}
                    />
                    {ratingError && (
                      <div className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {ratingError}
                      </div>
                    )}
                    <button
                      onClick={handleSubmitRating}
                      disabled={ratingScore === 0 || submittingRating}
                      className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {submittingRating && <Loader2 className="h-4 w-4 animate-spin" />}
                      Submit Rating
                    </button>
                  </div>
                )}
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

