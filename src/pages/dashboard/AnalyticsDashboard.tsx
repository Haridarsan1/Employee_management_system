import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { supabase } from '@/services/supabase'
import { Calendar, TrendingUp, Users, Clock, Download } from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceStats {
  date: string
  present: number
  absent: number
  late: number
  total: number
}

interface PerformanceStats {
  department: string
  avgHours: number
  attendance: number
  productivity: number
}

export default function AnalyticsDashboard() {
  const [attendanceData, setAttendanceData] = useState<AttendanceStats[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceStats[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('30') // days
  const [loading, setLoading] = useState(true)
  const [totalStats, setTotalStats] = useState({
    totalEmployees: 0,
    avgAttendance: 0,
    avgWorkHours: 0,
    totalPresent: 0
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [dateRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadAttendanceTrends(),
        loadPerformanceMetrics(),
        loadDepartmentStats(),
        loadOverallStats()
      ])
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const loadAttendanceTrends = async () => {
    const days = parseInt(dateRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    // Group by date and status
    const grouped = data?.reduce((acc: any, record: any) => {
      const date = record.date
      if (!acc[date]) {
        acc[date] = { date, present: 0, absent: 0, late: 0, total: 0 }
      }
      acc[date].total++
      if (record.status === 'present') acc[date].present++
      else if (record.status === 'absent') acc[date].absent++
      else if (record.status === 'late') acc[date].late++
      return acc
    }, {})

    const chartData = Object.values(grouped || {}).map((item: any) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))

    setAttendanceData(chartData as AttendanceStats[])
  }

  const loadPerformanceMetrics = async () => {
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        id,
        department,
        attendance (
          work_hours,
          status
        )
      `)

    if (error) throw error

    // Calculate metrics by department
    const deptMetrics = employees?.reduce((acc: any, emp: any) => {
      const dept = emp.department || 'Unassigned'
      if (!acc[dept]) {
        acc[dept] = { department: dept, totalHours: 0, presentDays: 0, totalDays: 0, employees: 0 }
      }
      
      acc[dept].employees++
      emp.attendance?.forEach((att: any) => {
        acc[dept].totalHours += att.work_hours || 0
        acc[dept].totalDays++
        if (att.status === 'present' || att.status === 'late') {
          acc[dept].presentDays++
        }
      })
      
      return acc
    }, {})

    const perfData = Object.values(deptMetrics || {}).map((dept: any) => ({
      department: dept.department,
      avgHours: dept.totalDays > 0 ? (dept.totalHours / dept.totalDays).toFixed(1) : 0,
      attendance: dept.totalDays > 0 ? Math.round((dept.presentDays / dept.totalDays) * 100) : 0,
      productivity: dept.totalDays > 0 ? Math.min(100, Math.round((dept.totalHours / (dept.totalDays * 8)) * 100)) : 0
    }))

    setPerformanceData(perfData as PerformanceStats[])
  }

  const loadDepartmentStats = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('department')

    if (error) throw error

    const deptCount = data?.reduce((acc: any, emp: any) => {
      const dept = emp.department || 'Unassigned'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {})

    const pieData = Object.entries(deptCount || {}).map(([name, value]) => ({
      name,
      value
    }))

    setDepartmentData(pieData)
  }

  const loadOverallStats = async () => {
    const days = parseInt(dateRange)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [empCount, attData] = await Promise.all([
      supabase.from('employees').select('id', { count: 'exact', head: true }),
      supabase
        .from('attendance')
        .select('work_hours, status')
        .gte('date', startDate.toISOString().split('T')[0])
    ])

    const totalEmp = empCount.count || 0
    const records = attData.data || []
    
    const totalHours = records.reduce((sum, r) => sum + (r.work_hours || 0), 0)
    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length
    
    setTotalStats({
      totalEmployees: totalEmp,
      avgAttendance: records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0,
      avgWorkHours: records.length > 0 ? parseFloat((totalHours / records.length).toFixed(1)) : 0,
      totalPresent: presentCount
    })
  }

  const exportData = () => {
    const csvData = attendanceData.map(row => 
      `${row.date},${row.present},${row.absent},${row.late},${row.total}`
    ).join('\n')
    
    const csv = `Date,Present,Absent,Late,Total\n${csvData}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Report exported successfully!')
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive insights and reports</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition hover-scale"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.totalEmployees}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Employees</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.avgAttendance}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Attendance</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.avgWorkHours}h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Work Hours</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.totalPresent}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Present Today</p>
          </div>
        </div>

        {/* Attendance Trends */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Attendance Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="present" stackId="1" stroke="#10b981" fill="#10b981" name="Present" />
              <Area type="monotone" dataKey="late" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Late" />
              <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="#ef4444" name="Absent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Department Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="department" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="attendance" fill="#3b82f6" name="Attendance %" />
                <Bar dataKey="productivity" fill="#8b5cf6" name="Productivity %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Department Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Detailed Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avg Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Productivity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {performanceData.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {dept.avgHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dept.attendance >= 90 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : dept.attendance >= 75
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {dept.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${dept.productivity}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
