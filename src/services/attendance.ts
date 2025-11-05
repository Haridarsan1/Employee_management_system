import { supabase } from './supabase'
import { toast } from 'sonner'

export interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  clock_in_time: string
  clock_out_time?: string
  clock_in_location?: string
  clock_out_location?: string
  work_hours?: number
  status: 'present' | 'absent' | 'late' | 'half-day'
  notes?: string
}

export interface GeofenceConfig {
  latitude: number
  longitude: number
  radius: number // in meters
}

// Default office location (you can make this configurable per company)
const DEFAULT_OFFICE_LOCATION: GeofenceConfig = {
  latitude: 0, // Set your office latitude
  longitude: 0, // Set your office longitude
  radius: 500 // 500 meters radius
}

/**
 * Get current GPS location
 */
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Check if current location is within geofence
 */
export const isWithinGeofence = async (
  geofence: GeofenceConfig = DEFAULT_OFFICE_LOCATION
): Promise<{ withinFence: boolean; distance: number; location: { latitude: number; longitude: number } }> => {
  try {
    const location = await getCurrentLocation()
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      geofence.latitude,
      geofence.longitude
    )

    return {
      withinFence: distance <= geofence.radius,
      distance,
      location,
    }
  } catch (error) {
    console.error('Error checking geofence:', error)
    throw error
  }
}

/**
 * Clock in with GPS verification
 */
export const clockIn = async (employeeId: string, allowRemote: boolean = false): Promise<AttendanceRecord> => {
  try {
    let location: { latitude: number; longitude: number } | null = null
    let locationString = ''

    // Get GPS location
    try {
      location = await getCurrentLocation()
      locationString = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`

      // Check geofence (only if remote work is not allowed)
      if (!allowRemote) {
        const { withinFence, distance } = await isWithinGeofence()
        if (!withinFence) {
          throw new Error(
            `You are ${Math.round(distance)}m away from the office. Please be within ${DEFAULT_OFFICE_LOCATION.radius}m to clock in.`
          )
        }
      }
    } catch (error: any) {
      if (!allowRemote) {
        throw error
      }
      // If remote work is allowed, continue without location
      console.warn('GPS not available, clocking in without location')
    }

    const today = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toISOString()

    // Check if already clocked in today
    const { data: existing, error: checkError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing && existing.clock_in_time) {
      throw new Error('You have already clocked in today')
    }

    // Determine if late (after 9:00 AM)
    const clockInHour = new Date().getHours()
    const status = clockInHour >= 9 ? 'late' : 'present'

    // Create attendance record
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        employee_id: employeeId,
        date: today,
        clock_in_time: currentTime,
        clock_in_location: locationString,
        status,
      })
      .select()
      .single()

    if (error) throw error

    toast.success(`Clocked in successfully at ${new Date(currentTime).toLocaleTimeString()}`)
    return data
  } catch (error: any) {
    console.error('Clock in error:', error)
    toast.error(error.message || 'Failed to clock in')
    throw error
  }
}

/**
 * Clock out with GPS verification
 */
export const clockOut = async (employeeId: string, allowRemote: boolean = false): Promise<AttendanceRecord> => {
  try {
    let location: { latitude: number; longitude: number } | null = null
    let locationString = ''

    // Get GPS location
    try {
      location = await getCurrentLocation()
      locationString = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`

      // Check geofence (only if remote work is not allowed)
      if (!allowRemote) {
        const { withinFence, distance } = await isWithinGeofence()
        if (!withinFence) {
          throw new Error(
            `You are ${Math.round(distance)}m away from the office. Please be within ${DEFAULT_OFFICE_LOCATION.radius}m to clock out.`
          )
        }
      }
    } catch (error: any) {
      if (!allowRemote) {
        throw error
      }
      console.warn('GPS not available, clocking out without location')
    }

    const today = new Date().toISOString().split('T')[0]
    const currentTime = new Date().toISOString()

    // Get today's attendance record
    const { data: existing, error: checkError } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single()

    if (checkError || !existing) {
      throw new Error('No clock-in record found for today. Please clock in first.')
    }

    if (existing.clock_out_time) {
      throw new Error('You have already clocked out today')
    }

    // Calculate work hours
    const clockInTime = new Date(existing.clock_in_time)
    const clockOutTime = new Date(currentTime)
    const workHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)

    // Update attendance record
    const { data, error } = await supabase
      .from('attendance')
      .update({
        clock_out_time: currentTime,
        clock_out_location: locationString,
        work_hours: workHours,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error

    toast.success(
      `Clocked out successfully at ${clockOutTime.toLocaleTimeString()}. Work hours: ${workHours.toFixed(2)}h`
    )
    return data
  } catch (error: any) {
    console.error('Clock out error:', error)
    toast.error(error.message || 'Failed to clock out')
    throw error
  }
}

/**
 * Get today's attendance status
 */
export const getTodayAttendance = async (employeeId: string): Promise<AttendanceRecord | null> => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  } catch (error) {
    console.error('Error getting today attendance:', error)
    return null
  }
}

/**
 * Get attendance history
 */
export const getAttendanceHistory = async (
  employeeId: string,
  startDate?: string,
  endDate?: string
): Promise<AttendanceRecord[]> => {
  try {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting attendance history:', error)
    throw error
  }
}

/**
 * Get attendance statistics
 */
export const getAttendanceStats = async (employeeId: string, month?: string) => {
  try {
    const startDate = month ? `${month}-01` : new Date(new Date().setDate(1)).toISOString().split('T')[0]
    const endDate = month
      ? new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    const records = await getAttendanceHistory(employeeId, startDate, endDate)

    const stats = {
      totalDays: records.length,
      presentDays: records.filter((r) => r.status === 'present' || r.status === 'late').length,
      absentDays: records.filter((r) => r.status === 'absent').length,
      lateDays: records.filter((r) => r.status === 'late').length,
      totalWorkHours: records.reduce((sum, r) => sum + (r.work_hours || 0), 0),
      averageWorkHours: records.length > 0
        ? records.reduce((sum, r) => sum + (r.work_hours || 0), 0) / records.length
        : 0,
    }

    return stats
  } catch (error) {
    console.error('Error getting attendance stats:', error)
    throw error
  }
}
