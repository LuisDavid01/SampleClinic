import { SignIn } from '@clerk/tanstack-react-start'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='mx-auto py-16 flex justify-center'>
    <SignIn></SignIn>
    </div>
  )
}
