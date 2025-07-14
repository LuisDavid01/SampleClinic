import { createLazyFileRoute } from '@tanstack/react-router'
import {  SignUp} from '@clerk/clerk-react'
export const Route = createLazyFileRoute('/signup/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='mx-auto py-16 flex justify-center'>
    <SignUp></SignUp>
    </div>
  )
}
