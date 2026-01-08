import { AlertTriangle } from 'lucide-react'

interface ErrorDisplayProps {
  message: string
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="p-4 bg-[#BF616A]/10 border border-[#BF616A]/30 text-[#BF616A] flex items-start gap-3 animate-fade-in">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1">{message}</p>
    </div>
  )
}
