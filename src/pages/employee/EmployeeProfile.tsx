import { useState, useEffect } from "react"
import { useAuthStore } from "@/services/auth"
import { supabase } from "@/services/supabase"
import { toast } from "sonner"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  FileText,
  Camera,
  Edit,
  Save,
  X,
  Download,
  Upload
} from "lucide-react"

interface EmployeeProfileData {
  id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  date_of_birth?: string
  date_of_joining: string
  position: string
  department: string
  salary?: number
  emergency_contact_name?: string
  emergency_contact_phone?: string
  blood_group?: string
  avatar_url?: string
  skills?: string[]
  certifications?: string[]
  education?: string
}

export default function EmployeeProfile() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<EmployeeProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editedProfile, setEditedProfile] = useState<Partial<EmployeeProfileData>>({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("email", user?.email)
        .single()

      if (error) throw error
      setProfile(data)
      setEditedProfile(data)
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('employee-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee-files')
        .getPublicUrl(filePath)

      // Update profile
      const { error: updateError } = await supabase
        .from('employees')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success("Avatar uploaded successfully!")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload avatar")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from("employees")
        .update(editedProfile)
        .eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, ...editedProfile })
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile || {})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">
              Profile Not Found
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              Your profile hasn't been created yet. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition hover-scale"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          
          {/* Avatar & Basic Info */}
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-gray-200 dark:bg-slate-700 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Name & Position */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{profile.position}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{profile.department}</p>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h3>
                
                <div className="space-y-3">
                  <InfoField
                    icon={<Mail className="w-4 h-4" />}
                    label="Email"
                    value={profile.email}
                    isEditing={false}
                  />
                  
                  <InfoField
                    icon={<Phone className="w-4 h-4" />}
                    label="Phone"
                    value={editedProfile.phone || "Not provided"}
                    isEditing={isEditing}
                    onChange={(value) => setEditedProfile({ ...editedProfile, phone: value })}
                  />
                  
                  <InfoField
                    icon={<MapPin className="w-4 h-4" />}
                    label="Address"
                    value={editedProfile.address || "Not provided"}
                    isEditing={isEditing}
                    onChange={(value) => setEditedProfile({ ...editedProfile, address: value })}
                  />
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Employment Details
                </h3>
                
                <div className="space-y-3">
                  <InfoField
                    icon={<Calendar className="w-4 h-4" />}
                    label="Date of Joining"
                    value={new Date(profile.date_of_joining).toLocaleDateString()}
                    isEditing={false}
                  />
                  
                  <InfoField
                    icon={<Briefcase className="w-4 h-4" />}
                    label="Employee ID"
                    value={profile.id.slice(0, 8).toUpperCase()}
                    isEditing={false}
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                
                <div className="space-y-3">
                  <InfoField
                    icon={<Calendar className="w-4 h-4" />}
                    label="Date of Birth"
                    value={editedProfile.date_of_birth ? new Date(editedProfile.date_of_birth).toLocaleDateString() : "Not provided"}
                    isEditing={isEditing}
                    type="date"
                    onChange={(value) => setEditedProfile({ ...editedProfile, date_of_birth: value })}
                  />
                  
                  <InfoField
                    icon={<FileText className="w-4 h-4" />}
                    label="Blood Group"
                    value={editedProfile.blood_group || "Not provided"}
                    isEditing={isEditing}
                    onChange={(value) => setEditedProfile({ ...editedProfile, blood_group: value })}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergency Contact
                </h3>
                
                <div className="space-y-3">
                  <InfoField
                    icon={<User className="w-4 h-4" />}
                    label="Contact Name"
                    value={editedProfile.emergency_contact_name || "Not provided"}
                    isEditing={isEditing}
                    onChange={(value) => setEditedProfile({ ...editedProfile, emergency_contact_name: value })}
                  />
                  
                  <InfoField
                    icon={<Phone className="w-4 h-4" />}
                    label="Contact Phone"
                    value={editedProfile.emergency_contact_phone || "Not provided"}
                    isEditing={isEditing}
                    onChange={(value) => setEditedProfile({ ...editedProfile, emergency_contact_phone: value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface InfoFieldProps {
  icon: React.ReactNode
  label: string
  value: string
  isEditing: boolean
  type?: string
  onChange?: (value: string) => void
}

function InfoField({ icon, label, value, isEditing, type = "text", onChange }: InfoFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {isEditing && onChange ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full px-3 py-1 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <p className="mt-1 text-gray-900 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  )
}
