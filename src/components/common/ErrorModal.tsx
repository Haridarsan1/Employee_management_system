"use client"

interface ErrorModalProps {
  title: string
  message: string
  details?: string
  onClose: () => void
}

export default function ErrorModal({ title, message, details, onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          </div>

          <p className="text-slate-600 dark:text-slate-400 mb-4">{message}</p>

          {details && (
            <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded text-sm text-slate-700 dark:text-slate-300">
              {details}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
