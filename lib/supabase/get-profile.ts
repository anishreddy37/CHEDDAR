import { createClient } from "./server"

export interface UserProfile {
  id: string
  country: string
  currency: string
  created_at: string
  updated_at: string
}

/**
 * Safely gets or creates a user profile.
 * Returns the profile with a default USD currency if no profile exists.
 */
export async function getOrCreateProfile(userId: string): Promise<UserProfile> {
  const supabase = await createClient()

  // Try to get existing profile (without .single() to avoid error on 0 rows)
  const { data: profiles } = await supabase.from("profiles").select("*").eq("id", userId).limit(1)

  // If profile exists, return it
  if (profiles && profiles.length > 0) {
    return profiles[0] as UserProfile
  }

  // If no profile exists, create one with defaults
  const defaultProfile = {
    id: userId,
    country: "US",
    currency: "USD",
  }

  const { data: newProfile, error } = await supabase.from("profiles").upsert(defaultProfile).select().single()

  if (error || !newProfile) {
    // Return default if creation fails (user can update in settings)
    return {
      ...defaultProfile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UserProfile
  }

  return newProfile as UserProfile
}

/**
 * Gets user currency, creating profile if needed.
 */
export async function getUserCurrency(userId: string): Promise<string> {
  const profile = await getOrCreateProfile(userId)
  return profile.currency || "USD"
}
