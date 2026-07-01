import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
})

function DashboardComponent() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold">User Dashboard</h1>
      <p className="mt-4 text-gray-600">Your consultations placeholder</p>
    </div>
  )
}
