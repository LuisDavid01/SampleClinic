import { SignIn } from '@clerk/nextjs'

export default function Page() {
   return (
    <div className='mx-auto py-16 flex justify-center'>
    <SignIn></SignIn>
    </div>
  )
}