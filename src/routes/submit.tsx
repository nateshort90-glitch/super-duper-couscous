import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { getCategories, getCurrentUser } from '../lib/auth-actions'
import { submitConsultation } from '../lib/consultation-actions'
import { Video, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/submit')({
  component: SubmitComponent,
  loader: async () => {
    const user = await getCurrentUser()
    const categories = await getCategories()
    return { user, categories }
  }
})

function SubmitComponent() {
  const { user, categories } = Route.useLoaderData()
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isExpress, setIsExpress] = useState(false)
  const [videoData, setVideoData] = useState<string | null>(null)
  const [isRecording, setIsExpressRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!user) {
      navigate({ to: '/login', search: { redirect: '/submit' } })
    }
  }, [user, navigate])

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
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
      
      chunksRef.current = []
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsExpressRecording(true)
      setError(null)
    } catch (err) {
      console.error("Camera error:", err)
      setError("Could not access camera/microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsExpressRecording(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError("File too large. Max 50MB.")
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoData(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoData) {
      setError("Please record or upload a video")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await submitConsultation({
        data: {
          title,
          description,
          categoryId,
          videoData,
          isExpress
        }
      })
      
      if (res.success) {
        navigate({ to: '/dashboard' })
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit problem")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Submit a consultation</h1>
          <p className="mt-2 text-sm text-gray-600">
            Explain your problem and get an expert video diagnosis within minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-left">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Dishwasher leaking from bottom"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-left">Category</label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-left">Description</label>
              <textarea
                required
                rows={4}
                placeholder="Describe what's happening, what you've tried, etc."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-left mb-2">Video Evidence</label>
              <div className="mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6">
                {videoData ? (
                  <div className="relative w-full">
                    <video 
                      src={videoData} 
                      controls 
                      className="mx-auto max-h-64 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setVideoData(null)}
                      className="mt-4 text-xs font-medium text-red-600 hover:text-red-500"
                    >
                      Remove and re-record
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    {isRecording ? (
                      <div className="space-y-4">
                        <video ref={videoRef} autoPlay muted className="mx-auto max-h-64 rounded-lg bg-black" />
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="inline-flex items-center rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                          Stop Recording
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={startRecording}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                          >
                            <Video className="h-4 w-4" />
                            Record Video
                          </button>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                            <Upload className="h-4 w-4" />
                            Upload File
                            <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">Max duration 2 minutes. Max size 50MB.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700 text-left block mb-4">Choose your speed</label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setIsExpress(false)}
                  className={`relative flex flex-col rounded-xl border p-4 text-left focus:outline-none ${
                    !isExpress ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <span className="text-sm font-bold text-gray-900">Standard</span>
                  <span className="mt-1 text-xs text-gray-500">Response within 24 hours</span>
                  <span className="mt-4 text-lg font-bold text-gray-900">$10</span>
                  {!isExpress && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-indigo-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpress(true)}
                  className={`relative flex flex-col rounded-xl border p-4 text-left focus:outline-none ${
                    isExpress ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">Express Lane</span>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600 uppercase">Priority</span>
                  </div>
                  <span className="mt-1 text-xs text-gray-500">Response within 60 mins</span>
                  <span className="mt-4 text-lg font-bold text-gray-900">$25</span>
                  {isExpress && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-indigo-600" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Pay & Submit — $${isExpress ? '25' : '10'}`
              )}
            </button>
            <p className="mt-4 text-center text-xs text-gray-500">
              Secure payment processed by Stripe. Refunded if no expert claims within 45 mins.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
