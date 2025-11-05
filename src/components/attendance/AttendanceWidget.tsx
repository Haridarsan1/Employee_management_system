import { useState, useEffect } from 'react'
import { Clock, MapPin, Calendar, TrendingUp, Check, X } from 'lucide-react'
import { clockIn, clockOut, getTodayAttendance, getAttendanceStats, AttendanceRecord } from '@/services/attendance'
import { useAuthStore } from '@/services/auth'
import { supabase } from '@/services/supabase'

export default function AttendanceWidget() {
  const { user } = useAuthStore()
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update clock every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (user) {
      loadEmployeeData()
    }
  }, [user])

  const loadEmployeeData = async () => {
    try {
      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('email', user?.email)
        .single()

      if (employee) {
        setEmployeeId(employee.id)
        await loadAttendanceData(employee.id)
      }
    } catch (error) {
      console.error('Error loading employee data:', error)
    }
  }

  const loadAttendanceData = async (empId: string) => {
    try {
      const [attendance, statistics] = await Promise.all([
        getTodayAttendance(empId),
        getAttendanceStats(empId)
      ])
      
      setTodayAttendance(attendance)
      setStats(statistics)
    } catch (error) {
      console.error('Error loading attendance:', error)
    }
  }

  const handleClockIn = async () => {
    if (!employeeId) return
    
    setLoading(true)
    try {
      await clockIn(employeeId, false) // Set to true to allow remote clock-in
      await loadAttendanceData(employeeId)
    } catch (error) {
      // Error handled in service
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!employeeId) return
    
    setLoading(true)
    try {
      await clockOut(employeeId, false) // Set to true to allow remote clock-out
      await loadAttendanceData(employeeId)
    } catch (error) {
      // Error handled in service
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present': return 'bg-green-500'
      case 'late': return 'bg-yellow-500'
      case 'absent': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'present': return 'On Time'
      case 'late': return 'Late'
      case 'absent': return 'Absent'
      default: return 'Not Clocked In'
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-6 fade-in">
      {/* Header with Current Time */}
      <div className="text-center space-y-2">
        <div className="text-4xl font-bold text-gray-900 dark:text-white font-mono">
          {formatTime(currentTime)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(currentTime)}
        </div>
      </div>

      {/* Status Badge */}
      {todayAttendance && (
        <div className="flex justify-center">
          <div className={`px-4 py-2 rounded-full text-white text-sm font-medium ${getStatusColor(todayAttendance.status)}`}>
            {getStatusText(todayAttendance.status)}
          </div>
        </div>
      )}

      {/* Clock In/Out Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Clock className="w-4 h-4" />
            Clock In
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {todayAttendance?.clock_in_time 
              ? new Date(todayAttendance.clock_in_time).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              : '--:--'
            }
          </div>
          {todayAttendance?.clock_in_location && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin className="w-3 h-3" />
              <span>Location verified</span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Clock className="w-4 h-4" />
            Clock Out
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {todayAttendance?.clock_out_time 
              ? new Date(todayAttendance.clock_out_time).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })
              : '--:--'
            }
          </div>
          {todayAttendance?.work_hours && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>{todayAttendance.work_hours.toFixed(2)}h worked</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!todayAttendance?.clock_in_time ? (
          <button
            onClick={handleClockIn}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover-scale"
          >
            <Check className="w-5 h-5" />
            {loading ? 'Clocking In...' : 'Clock In'}
          </button>
        ) : !todayAttendance?.clock_out_time ? (
          <button
            onClick={handleClockOut}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover-scale"
          >
            <X className="w-5 h-5" />
            {loading ? 'Clocking Out...' : 'Clock Out'}
          </button>
        ) : (
          <div className="flex-1 py-3 bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium text-center">
            Attendance Completed
          </div>
        )}
      </div>

      {/* Monthly Stats */}
      {stats && (
        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Month</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Late</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {stats.averageWorkHours.toFixed(1)}h
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Avg Hours</div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">GPS Verification Enabled</p>
            <p className="mt-1">Your location is verified when clocking in/out to ensure workplace compliance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
