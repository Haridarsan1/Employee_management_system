import { supabase } from "./supabase"

/**
 * Generate a random temporary password
 */
function generateTemporaryPassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*"
  const allChars = uppercase + lowercase + numbers + symbols

  let password = ""
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

/**
 * Invite a new employee by creating their account with temporary password
 */
export async function inviteEmployee(
  email: string,
  fullName: string,
  position: string,
  department: string,
  salary?: number
) {
  try {
    // Generate temporary password
    const tempPassword = generateTemporaryPassword()

    // Create auth user with temporary password
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          full_name: fullName,
          role: "employee",
        },
        emailRedirectTo: `${window.location.origin}/employee`,
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Failed to create user")

    // Create employee record
    const { error: employeeError } = await supabase.from("employees").insert({
      email,
      name: fullName,
      position,
      department,
      salary,
      status: "active",
      hire_date: new Date().toISOString().split("T")[0],
      must_change_password: true,
      is_invited: true,
      invited_at: new Date().toISOString(),
    })

    if (employeeError) {
      // Rollback: delete auth user if employee creation fails
      console.error("Failed to create employee record:", employeeError)
      throw new Error("Failed to create employee record")
    }

    // Create user metadata
    const { error: metadataError } = await supabase.from("users_metadata").insert({
      id: authData.user.id,
      role: "employee",
      full_name: fullName,
    })

    if (metadataError) {
      console.error("Failed to create user metadata:", metadataError)
    }

    // In a real app, you would send the temp password via email
    // For now, return it to display to admin
    return {
      success: true,
      email,
      temporaryPassword: tempPassword,
      message: "Employee invited successfully",
    }
  } catch (error: any) {
    console.error("Error inviting employee:", error)
    throw new Error(error.message || "Failed to invite employee")
  }
}

/**
 * Check if employee needs to change password
 */
export async function checkMustChangePassword(employeeEmail: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("employees")
    .select("must_change_password")
    .eq("email", employeeEmail)
    .single()

  if (error) {
    console.error("Error checking password change requirement:", error)
    return false
  }

  return data?.must_change_password || false
}

/**
 * Change employee password
 */
export async function changeEmployeePassword(
  newPassword: string,
  employeeEmail: string
) {
  try {
    // Update password in auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (authError) throw authError

    // Update employee record to mark password as changed
    const { error: employeeError } = await supabase
      .from("employees")
      .update({
        must_change_password: false,
        last_password_change: new Date().toISOString(),
      })
      .eq("email", employeeEmail)

    if (employeeError) throw employeeError

    return { success: true, message: "Password changed successfully" }
  } catch (error: any) {
    console.error("Error changing password:", error)
    throw new Error(error.message || "Failed to change password")
  }
}

/**
 * Get employee theme preference
 */
export async function getEmployeeTheme(employeeEmail: string): Promise<string> {
  const { data, error } = await supabase
    .from("employees")
    .select("theme_preference")
    .eq("email", employeeEmail)
    .single()

  if (error) {
    console.error("Error getting theme:", error)
    return "light"
  }

  return data?.theme_preference || "light"
}

/**
 * Update employee theme preference
 */
export async function updateEmployeeTheme(employeeEmail: string, theme: string) {
  const { error } = await supabase
    .from("employees")
    .update({ theme_preference: theme })
    .eq("email", employeeEmail)

  if (error) {
    console.error("Error updating theme:", error)
    throw new Error("Failed to update theme")
  }

  return { success: true }
}
