import { SignupForm } from "@/components/auth/signup-form"
import { Coins } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Cheddar
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">Create your account to start stacking</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
