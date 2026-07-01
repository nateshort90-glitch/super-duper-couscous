import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { getCurrentUser } from '../lib/auth-actions'
import { getAvailableBounties, claimBounty, getClaimedConsultation, submitResponse } from '../lib/consultation-actions'
import { Video, Clock, DollarSign, AlertCircle, CheckCircle2, Loader2, PlayCircle, ClipboardList, Send } from 'lucide-react'

export const Route = createFileRoute('/expert/dashboard')({
  loader: async () => {
    const user = await getCurrentUser()
    if (!user || user.role !== 'expert') {
      return { user: null, availableBounties: [] }
    }
    const availableBounties = await getAvailableBounties()
    return { user, availableBounties }
  },
  component: ExpertDashboardComponent,
})

function ExpertDashboardComponent() {
  const { user, availableBounties: initialBounties } = Route.useLoaderData()
  const navigate = useNavigate()
  
  const [availableBounties, setAvailableBounties] = useState(initialBounties)
  const [claimedBounty, setClaimedBounty] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [videoData, setVideoData] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login', search: { redirect: '/expert/dashboard' } })
    }
  }, [user, navigate])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const res = await getAvailableBounties()
      setAvailableBounties(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await claimBounty({ data: id })
      const details = await getClaimedConsultation({ data: id })
      setClaimedBounty(details)
      // Remove from available list
      setAvailableBounties(prev => prev.filter((b: any) => b.id !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          setVideoData(reader.result as string)
        }
        reader.readAsDataURL(blob)
        
        stream.getTracks().forEach(track => track.stop())
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
      
      chunksRef.current = []
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch (err) {
      console.error("Camera error:", err)
      setError("Could not access camera/microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSubmitResponse = async () => {
    if (!videoData) return
    setSubmittingResponse(true)
    setError(null)
    try {
      await submitResponse({
        data: {
          consultationId: claimedBounty.id,
          videoData,
          notes
        }
      })
      setClaimedBounty(null)
      setVideoData(null)
      setNotes('')
      handleRefresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmittingResponse(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:truncate">Expert Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {user.name}. Browse and solve problems.</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh Feed
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {claimedBounty ? (
        <div className="space-y-8">
          <div className="overflow-hidden rounded-2xl bg-indigo-600 shadow-xl">
            <div className="px-6 py-8 sm:p-10">
              <div className="flex items-center gap-4 text-white mb-6">
                <div className="rounded-full bg-indigo-500 p-3">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Solving: {claimedBounty.title}</h2>
                  <p className="text-indigo-100 text-sm">Client: {claimedBounty.client_name} • Bounty: ${claimedBounty.bounty_amount / 100}</p>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-xl bg-white/10 p-4 text-white">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-200 mb-2">Problem Description</h3>
                    <p className="text-sm leading-relaxed">{claimedBounty.description}</p>
                  </div>
                  <div className="rounded-xl bg-black overflow-hidden aspect-video relative">
                    <video 
                      src={claimedBounty.video_url} 
                      controls 
                      className="h-full w-full"
                    />
                    <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-1 text-[10px] font-bold text-white uppercase">Client's Video</div>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl bg-white p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900">Your Diagnosis</h3>
                  
                  {videoData ? (
                    <div className="space-y-4">
                      <video src={videoData} controls className="aspect-video w-full rounded-lg bg-black" />
                      <button
                        onClick={() => setVideoData(null)}
                        className="text-xs font-medium text-red-600 hover:text-red-500"
                      >
                        Delete and re-record
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
                      {isRecording ? (
                        <div className="text-center space-y-4 w-full">
                          <video ref={videoRef} autoPlay muted className="aspect-video w-full rounded-lg bg-black mx-auto" />
                          <button
                            onClick={stopRecording}
                            className="inline-flex items-center rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                          >
                            Stop Recording
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <Video className="h-6 w-6" />
                          </div>
                          <p className="text-sm text-gray-600">Record a 1-2 minute diagnostic video.</p>
                          <button
                            onClick={startRecording}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                          >
                            Start Recording
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Response Notes (Optional)</label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Summary of your advice..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleSubmitResponse}
                    disabled={!videoData || submittingResponse}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {submittingResponse ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit Diagnosis & Get Paid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Available Bounties</h2>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              {availableBounties.length} found
            </span>
          </div>

          {availableBounties.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No bounties available</h3>
              <p className="mt-1 text-sm text-gray-500">Check back soon for new problems in your categories.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {availableBounties.map((bounty: any) => {
                const timeRemaining = Math.max(0, Math.round((new Date(bounty.expires_at).getTime() - Date.now()) / (60 * 1000)))
                
                return (
                  <div key={bounty.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-md">
                    {bounty.is_express === 1 && (
                      <div className="absolute top-0 right-0 bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white uppercase rounded-bl-lg z-10">
                        Priority
                      </div>
                    )}
                    <div className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {bounty.category_name}
                        </span>
                        <div className="flex items-center text-xs font-bold text-gray-900">
                          <DollarSign className="h-3 w-3" />
                          {bounty.bounty_amount / 100}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{bounty.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-3 mb-6 h-15">{bounty.description}</p>
                      
                      <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          {timeRemaining}m left
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <PlayCircle className="mr-1 h-3 w-3" />
                          View Sample
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClaim(bounty.id)}
                      disabled={loading}
                      className="mt-auto block w-full bg-indigo-50 py-3 text-center text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
                    >
                      Claim Bounty
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
