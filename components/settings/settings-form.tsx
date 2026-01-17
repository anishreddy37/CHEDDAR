"use client"

import type React from "react"
import type { User } from "@supabase/supabase-js"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries, getCountryByCode } from "@/lib/countries"
import { Loader2, CheckCircle2 } from "lucide-react"

interface Profile {
  id: string
  country: string
  currency: string
}

interface SettingsFormProps {
  user: User
  profile: Profile | null
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
  const [country, setCountry] = useState(profile?.country || "US")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const selectedCountry = getCountryByCode(country)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        country,
        currency: selectedCountry?.currency || "USD",
      })

      if (error) throw error

      setSuccess(true)
      router.refresh()

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Settings update error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <p className="text-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country & Currency</Label>
              <Select value={country} onValueChange={setCountry} disabled={loading}>
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.currencySymbol} {c.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCountry && (
                <p className="text-sm text-muted-foreground">
                  Your currency: {selectedCountry.currencySymbol} ({selectedCountry.currency})
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              {success && (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Settings saved!
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
