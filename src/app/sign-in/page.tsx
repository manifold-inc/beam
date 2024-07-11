import { Footer } from '@/components/footer'
import { Logo } from '@/components/icons'
import Link from 'next/link'

const SignIn = () => {
  return (
    <>
      <div className='h-screen'>
        <main className="relative flex items-center justify-center h-full bg-center bg-circle-grid dark:bg-circle-grid-dark">
          <div className="relative bottom-16">
            <Logo className="w-[326px] text-red-light h-[94px] mb-8 bg-primary" />
            <div className="w-full space-y-4 text-center bg-primary">
              <Link href="/sign-in/github" className="h-12 px-5 text-lg">
                Sign in with Github
              </Link>
            </div>
            <div className="-mt-4 md:mt-0 w-screen left-1/2 transform -translate-x-1/2 absolute sm:w-[434px] lg:w-[646px] xl:w-[862px] auth-footer">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default SignIn
