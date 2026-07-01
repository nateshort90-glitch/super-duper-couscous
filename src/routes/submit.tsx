import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/submit')({
  component: SubmitComponent,
})

function SubmitComponent() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold">Submit your problem</h1>
      <p className="mt-4 text-gray-600">Problem submission form placeholder</p>
    </div>
  )
}
