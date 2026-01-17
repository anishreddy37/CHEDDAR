import { createClient } from "@/lib/supabase/server"
import { getOrCreateProfile } from "@/lib/supabase/get-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SettingsForm } from "@/components/settings/settings-form"

async function getUserProfile(userId: string) {
  return getOrCreateProfile(userId)
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const profile = await getUserProfile(user.id)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <SettingsForm user={user} profile={profile} />
      </div>
    </DashboardShell>
  )
}
