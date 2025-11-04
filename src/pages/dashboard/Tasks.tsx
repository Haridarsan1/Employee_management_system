"use client"

import { useState, useEffect } from "react"
import { getTasks, addTaskUpdate } from "@/services/employee-portal"
import { supabase } from "@/services/supabase"
import type { ProjectTask, Employee, Project } from "@/types/employee-portal"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import { toast } from "sonner"
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Filter,
  Calendar,
  User,
  TrendingUp
} from "lucide-react"

export default function TasksPage() {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [updateText, setUpdateText] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [formData, setFormData] = useState({
    project_id: "",
    assigned_to: "",
    title: "",
    description: "",
    status: "todo" as "todo" | "in-progress" | "review" | "completed" | "blocked",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    due_date: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [tasksData, employeesData, projectsData] = await Promise.all([
        getTasks(),
        supabase.from("employees").select("*").eq("company_id", user.id).order("name"),
        supabase.from("projects").select("*").eq("created_by", user.id).order("name"),
      ])

      setTasks(tasksData)
      setEmployees(employeesData.data || [])
      setProjects(projectsData.data || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load tasks")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from("project_tasks").insert([formData])
      if (error) throw error

      toast.success("Task created successfully")
      setShowCreateModal(false)
      setFormData({
        project_id: "",
        assigned_to: "",
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: "",
      })
      await loadData()
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task")
    }
  }

  const handleAddUpdate = async () => {
    if (!selectedTask || !updateText.trim()) return
    try {
      await addTaskUpdate(selectedTask.id, selectedTask.assigned_to, updateText)
      toast.success("Update added successfully")
      setUpdateText("")
      setSelectedTask(null)
      await loadData()
    } catch (error) {
      console.error("Error adding update:", error)
      toast.error("Failed to add update")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "review":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
      case "blocked":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "todo":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
      case "medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "low":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false
    if (filterPriority !== "all" && task.priority !== filterPriority) return false
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    )
  }

  const todoTasks = filteredTasks.filter((t) => t.status === "todo")
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in-progress")
  const completedTasks = filteredTasks.filter((t) => t.status === "completed")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage all your tasks</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active workflow</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">To Do</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todoTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Pending tasks</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Currently working</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Successfully done</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          <div className="flex-1 flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Old Stats - Remove these */}
      <div className="hidden flex-wrap gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{filteredTasks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">Todo</p>
          <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{todoTasks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">In Progress</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{inProgressTasks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{completedTasks.length}</p>
        </div>

        <div className="ml-auto flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No tasks yet. Create your first task!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Todo Column */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Todo ({todoTasks.length})</h3>
            <div className="space-y-2">
              {todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onViewDetails={setSelectedTask}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              In Progress ({inProgressTasks.length})
            </h3>
            <div className="space-y-2">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onViewDetails={setSelectedTask}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onViewDetails={setSelectedTask}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Task</h2>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Project *</label>
                <select
                  required
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To *</label>
                <select
                  required
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTask.title}</h2>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedTask.description}</p>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assigned to: <span className="font-medium text-slate-900 dark:text-white">{selectedTask.employee?.name}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Project: <span className="font-medium text-slate-900 dark:text-white">{selectedTask.project?.name}</span>
                </p>
                {selectedTask.due_date && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Due: <span className="font-medium text-slate-900 dark:text-white">{new Date(selectedTask.due_date).toLocaleDateString()}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Add Update</label>
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  rows={3}
                  placeholder="Add a progress update..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleAddUpdate}
                  disabled={!updateText.trim()}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Add Update
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedTask(null)}
                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({
  task,
  onViewDetails,
  getPriorityColor,
}: {
  task: ProjectTask
  onViewDetails: (task: ProjectTask) => void
  getPriorityColor: (priority: string) => string
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{task.title}</h4>
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">{task.employee?.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(task)
          }}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View
        </button>
      </div>

      {task.due_date && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Due: {new Date(task.due_date).toLocaleDateString()}</p>
      )}
    </div>
  )
}
