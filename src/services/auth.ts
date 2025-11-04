import { create } from "zustand"
import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

interface AuthStore {
  user: User | null
  userRole: "admin" | "employee" | null
  isAuthenticated: boolean
  isLoading: boolean
  signup: (email: string, password: string, fullName: string, companyName: string, role: "admin" | "employee") => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  getUserRole: () => Promise<"admin" | "employee" | null>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userRole: null,
  isAuthenticated: false,
  isLoading: true,

  signup: async (email, password, fullName, companyName, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          company_name: companyName,
          role: role,
        },
      },
    })

    if (error) throw new Error(error.message)

    // Insert into users_metadata table
    if (data.user) {
      const { error: metadataError } = await supabase.from("users_metadata").insert({
        id: data.user.id,
        full_name: fullName,
        company_name: companyName,
        role: role,
      })

      if (metadataError) {
        console.error("Error creating user metadata:", metadataError)
        throw new Error("Failed to create user profile. Please contact support.")
      }
    }
  },

  getUserRole: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from("users_metadata")
        .select("role")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching user role:", error)
        // Default to admin if no metadata found (backwards compatibility)
        return "admin"
      }

      return data?.role || "admin"
    } catch (err) {
      console.error("Error in getUserRole:", err)
      return "admin"
    }
  },

  login: async (email, password) => {
    console.log("🔐 Login attempt for:", email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("❌ Login error:", error.message)
      throw new Error(error.message)
    }

    console.log("✅ Auth successful, user ID:", data.user?.id)

    // Fetch user role
    let role: "admin" | "employee" | null = null
    if (data.user) {
      try {
        console.log("🔍 Checking users_metadata for role...")
        const { data: metadata, error: roleError } = await supabase
          .from("users_metadata")
          .select("role")
          .eq("id", data.user.id)
          .single()
        
        if (roleError) {
          console.error("⚠️ Error fetching role from users_metadata:", roleError)
          // Fallback to user metadata
          const userMetaRole = data.user.user_metadata?.role
          console.log("📋 Fallback to user_metadata.role:", userMetaRole)
          if (userMetaRole === "admin" || userMetaRole === "employee") {
            role = userMetaRole
          } else {
            role = "employee"
          }
        } else {
          role = metadata?.role || "employee"
          console.log("✅ Role from users_metadata:", role)
        }
      } catch (err) {
        console.error("❌ Exception fetching role:", err)
        // Fallback to user metadata
        const userMetaRole = data.user.user_metadata?.role
        console.log("📋 Exception fallback to user_metadata.role:", userMetaRole)
        role = (userMetaRole === "admin" || userMetaRole === "employee") ? userMetaRole : "employee"
      }
    }

    console.log("🎯 Final role assigned:", role)

    set({
      user: data.user,
      userRole: role,
      isAuthenticated: true,
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({
      user: null,
      userRole: null,
      isAuthenticated: false,
    })
  },

  checkAuth: async () => {
    console.log("🔍 Starting checkAuth...")
    set({ isLoading: true })
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      console.log("📧 Session:", session ? "Found" : "Not found")

      if (session?.user) {
        // Fetch user role
        let role: "admin" | "employee" | null = null
        try {
          console.log("🔍 Fetching role from users_metadata...")
          const { data: metadata, error: roleError } = await supabase
            .from("users_metadata")
            .select("role")
            .eq("id", session.user.id)
            .single()

          if (roleError) {
            console.error("⚠️ Error fetching role on checkAuth:", roleError)
            // Check if role is in user metadata as fallback
            const userMetaRole = session.user.user_metadata?.role
            console.log("🔄 Falling back to user_metadata role:", userMetaRole)
            if (userMetaRole === "admin" || userMetaRole === "employee") {
              role = userMetaRole
            } else {
              // If no role found, default to employee (safer than admin)
              console.log("⚠️ No role found, defaulting to employee")
              role = "employee"
            }
          } else {
            role = metadata?.role || "employee"
            console.log("✅ Role from database:", role)
          }
        } catch (err) {
          console.error("❌ Exception in checkAuth:", err)
          // Check user metadata as fallback
          const userMetaRole = session.user.user_metadata?.role
          role = (userMetaRole === "admin" || userMetaRole === "employee") ? userMetaRole : "employee"
          console.log("🔄 Exception fallback role:", role)
        }

        console.log("✅ Setting auth state - Role:", role)
        set({
          user: session.user,
          userRole: role,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        console.log("❌ No session found, setting isLoading to false")
        set({ isLoading: false })
      }
    } catch (error) {
      console.error("❌ Fatal error in checkAuth:", error)
      set({ isLoading: false })
    }
  },
}))

// Listen for auth state changes (handles email confirmation redirects)
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("🔔 Auth event:", event)
  
  if (event === "SIGNED_IN" && session) {
    // User just signed in or confirmed email
    console.log("✅ User signed in, checking auth...")
    await useAuthStore.getState().checkAuth()
  } else if (event === "SIGNED_OUT") {
    console.log("👋 User signed out")
    useAuthStore.setState({
      user: null,
      userRole: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }
})

// Check auth on app load with timeout fallback
console.log("🚀 Initializing auth check on app load...")
useAuthStore.getState().checkAuth()

// Safety timeout - if auth check takes more than 5 seconds, force stop loading
setTimeout(() => {
  const state = useAuthStore.getState()
  if (state.isLoading) {
    console.error("⏱️ Auth check timeout! Forcing isLoading to false")
    useAuthStore.setState({ isLoading: false })
  }
}, 5000)
