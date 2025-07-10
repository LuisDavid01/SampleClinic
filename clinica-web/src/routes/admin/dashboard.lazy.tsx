import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/dashboard"!</div>
}
