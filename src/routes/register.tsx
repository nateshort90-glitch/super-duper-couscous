import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { registerUser, getCategories } from '../lib/auth-actions'
import { CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/register')({
  component: RegisterComponent,
  loader: async () => {
    return await getCategories()
  }
})

function RegisterComponent() {
  const categories = Route.useLoaderData()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'client' | 'expert'>('client')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await registerUser({
        data: {
          email,
          password,
          name,
          role,
          categoryIds: role === 'expert' ? selectedCategories : []
        }
      })

      if (res.success) {
        // Set token in localStorage for client-side use if needed, 
        // though cookie is better for SSR.
        localStorage.setItem('bf_token', res.token)
        navigate({ to: role === 'expert' ? '/expert/dashboard' : '/dashboard' })
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the BountyFix community today
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">I am joining as a:</label>
            <div className="mt-2 flex gap-4">
              <button
                type="button"
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
                  role === 'client' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setRole('client')}
              >
                Client
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
                  role === 'expert' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setRole('expert')}
              >
                Expert
              </button>
            </div>
          </div>

          {role === 'expert' && (
            <div className="space-y-4">
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-semibold text-gray-900">Expertise & Specialization</label>
                <p className="text-xs text-gray-500 mb-4">Select all categories you are licensed or certified to provide diagnosis for.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {categories.map((cat: any) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle2 className={`h-5 w-5 ${isSelected ? 'block' : 'hidden'}`} />
                        {!isSelected && <div className="h-2 w-2 rounded-full bg-gray-300" />}
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-[10px] text-orange-600 font-medium italic">Please select at least one category to continue.</p>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <a href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Already have an account? Log in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
