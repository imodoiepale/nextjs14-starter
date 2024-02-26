import AnimationTest from "@/components/AnimationTest"
import { serverClient } from "./_trpc/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"


export default async function Home() {
  const getTodos = await serverClient.getTodos()

  console.log('server', getTodos)
  return (
    <main className="flex min-w-screen flex-col items-center justify-between">
      <div className='flex flex-col items-center mt-[4rem] p-3 '>
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl text-center">
          Nill Tech Solutions <span>ID-Generator</span>
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-3">
          Generate your Id by clicking the Button Below
        </p>
        {/* <AnimationTest /> */}
      </div>
      <div className='flex flex-col items-center mt-[4rem] p-3 '>
        <Button >
          <Link href="/generator">
          Generate ID
          </Link>
        </Button>
      </div>
    </main>
  )
}