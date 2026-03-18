import { LoginForm } from './LoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">BAY Admin</h1>
          <p className="text-sm text-zinc-500">Blockchain Academy Yonsei</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
