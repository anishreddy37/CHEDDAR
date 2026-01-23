import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary glow-primary mb-4">
            <span className="text-3xl font-bold text-primary-foreground">₿</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Finzy</h1>
          <p className="text-muted-foreground mt-2">Pay & Track - Create your account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
