"use client"

import { useState, useEffect } from "react"
import { getLeaveRequests, getWFHRequests, updateLeaveRequest, updateWFHRequest, createNotification } from "@/services/employee-portal"
import type { LeaveRequest, WFHRequest } from "@/types/employee-portal"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import { toast } from "sonner"

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"leave" | "wfh">("leave")
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [wfhRequests, setWFHRequests] = useState<WFHRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      const [leave, wfh] = await Promise.all([
        getLeaveRequests(),
        getWFHRequests(),
      ])
      setLeaveRequests(leave)
      setWFHRequests(wfh)
    } catch (error) {
      console.error("Error loading requests:", error)
      toast.error("Failed to load requests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveAction = async (requestId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      setProcessingId(requestId)
      await updateLeaveRequest(requestId, action, notes)
      
      // Send notification to employee
      const request = leaveRequests.find(r => r.id === requestId)
      if (request) {
        await createNotification(
          request.employee_id,
          `leave_${action}`,
          `Leave Request ${action === 'approved' ? 'Approved' : 'Rejected'}`,
          `Your leave request from ${request.start_date} to ${request.end_date} has been ${action}.`,
          '/employee/leave'
        )
      }
      
      toast.success(`Leave request ${action}`)
      await loadRequests()
    } catch (error) {
      console.error("Error processing leave:", error)
      toast.error("Failed to process request")
    } finally {
      setProcessingId(null)
    }
  }

  const handleWFHAction = async (requestId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      setProcessingId(requestId)
      await updateWFHRequest(requestId, action, notes)
      
      // Send notification to employee
      const request = wfhRequests.find(r => r.id === requestId)
      if (request) {
        await createNotification(
          request.employee_id,
          `wfh_${action}`,
          `WFH Request ${action === 'approved' ? 'Approved' : 'Rejected'}`,
          `Your work from home request for ${request.wfh_date} has been ${action}.`,
          '/employee/wfh'
        )
      }
      
      toast.success(`WFH request ${action}`)
      await loadRequests()
    } catch (error) {
      console.error("Error processing WFH:", error)
      toast.error("Failed to process request")
    } finally {
      setProcessingId(null)
    }
  }

  const pendingLeave = leaveRequests.filter(r => r.status === 'pending')
  const pendingWFH = wfhRequests.filter(r => r.status === 'pending')
  const recentlyReviewed = [...leaveRequests, ...wfhRequests]
    .filter(r => r.status !== 'pending')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading requests..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Approvals</h1>
        <p className="text-slate-600 dark:text-slate-400">Review and approve employee requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow">
          <h3 className="text-orange-100 text-sm font-medium">Pending Leave</h3>
          <p className="text-4xl font-bold mt-2">{pendingLeave.length}</p>
          <p className="text-orange-100 text-xs mt-1">Awaiting approval</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow">
          <h3 className="text-purple-100 text-sm font-medium">Pending WFH</h3>
          <p className="text-4xl font-bold mt-2">{pendingWFH.length}</p>
          <p className="text-purple-100 text-xs mt-1">Awaiting approval</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow">
          <h3 className="text-green-100 text-sm font-medium">Approved Today</h3>
          <p className="text-4xl font-bold mt-2">
            {recentlyReviewed.filter(r => 
              r.status === 'approved' && 
              new Date(r.updated_at).toDateString() === new Date().toDateString()
            ).length}
          </p>
          <p className="text-green-100 text-xs mt-1">Last 24 hours</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 shadow">
          <h3 className="text-red-100 text-sm font-medium">Rejected Today</h3>
          <p className="text-4xl font-bold mt-2">
            {recentlyReviewed.filter(r => 
              r.status === 'rejected' && 
              new Date(r.updated_at).toDateString() === new Date().toDateString()
            ).length}
          </p>
          <p className="text-red-100 text-xs mt-1">Last 24 hours</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("leave")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "leave"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Leave Requests
          {pendingLeave.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingLeave.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("wfh")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "wfh"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          WFH Requests
          {pendingWFH.length > 0 && (
            <span className="ml-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingWFH.length}
            </span>
          )}
        </button>
      </div>

      {/* Leave Requests Tab */}
      {activeTab === "leave" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Pending Leave Requests</h2>
          
          {pendingLeave.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">No pending leave requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeave.map((request) => (
                <div key={request.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {request.employee?.name || 'Unknown Employee'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.leave_type === 'sick' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          request.leave_type === 'casual' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          request.leave_type === 'vacation' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {request.leave_type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {request.employee?.role} • {request.employee?.email}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(request.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">End Date</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {request.total_days} {request.total_days === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Leave Balance</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {(request.employee?.total_leave_days || 0) - (request.employee?.used_leave_days || 0)} days remaining
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reason</p>
                        <p className="text-sm text-slate-900 dark:text-white">{request.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleLeaveAction(request.id, 'approved')}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(request.id, 'rejected', 'Not approved at this time')}
                        disabled={processingId === request.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WFH Requests Tab */}
      {activeTab === "wfh" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Pending WFH Requests</h2>
          
          {pendingWFH.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">No pending work from home requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingWFH.map((request) => (
                <div key={request.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {request.employee?.name || 'Unknown Employee'}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          WFH REQUEST
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {request.employee?.role} • {request.employee?.email}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">WFH Date</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(request.wfh_date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Requested On</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reason</p>
                        <p className="text-sm text-slate-900 dark:text-white">{request.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleWFHAction(request.id, 'approved')}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleWFHAction(request.id, 'rejected', 'Not approved at this time')}
                        disabled={processingId === request.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recently Reviewed */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recently Reviewed</h2>
        {recentlyReviewed.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">No recent reviews</p>
        ) : (
          <div className="space-y-3">
            {recentlyReviewed.map((request) => {
              const isLeave = 'leave_type' in request
              return (
                <div key={request.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {request.employee?.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {isLeave ? `Leave: ${(request as LeaveRequest).leave_type}` : 'Work From Home'}
                      {' • '}
                      {new Date(request.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'approved' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
