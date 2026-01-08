import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-[#BF616A] mb-4 font-medium">{message}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-[#D8DEE9] hover:bg-[#88C0D0]/10 hover:border-[#88C0D0] transition-colors"
      >
        Tentar novamente
      </Button>
    </div>
  )
}
