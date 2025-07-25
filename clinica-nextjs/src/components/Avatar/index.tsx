
import { currentUser } from "@clerk/nextjs/server"
import Image from "next/image"
import { Suspense } from "react"


const Avatar = async () =>{
    const user = await currentUser()
    if (!user) {
        return null
    }
    return (
        <Suspense fallback={<div>cargando...</div>}>
             <div className="flex items-center">
            <Image
                src={user.imageUrl}
                alt='usuario'
                width={128}
                height={128}
                className="w-10 h-10 rounded-full"
            />
            <span className="ml-2 text-text-primary">{user.firstName}</span>
        </div>
        </Suspense>
       
    )
}

export default Avatar