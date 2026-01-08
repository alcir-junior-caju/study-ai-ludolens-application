import { FileText } from 'lucide-react'

interface QuestionInputProps {
  value: string
  onChange: (value: string) => void
}

export function QuestionInput({ value, onChange }: QuestionInputProps) {
  return (
    <div className="space-y-3">
      <label htmlFor="question" className="text-sm font-semibold flex items-center gap-2 text-[#2E3440]">
        <FileText className="h-4 w-4 text-[#88C0D0]" />
        Sua pergunta
      </label>
      <textarea
        id="question"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Como funciona a troca de recursos?"
        rows={3}
        className="w-full p-3 sm:p-4 text-sm sm:text-base border border-[#D8DEE9] bg-white text-[#2E3440] placeholder:text-[#4C566A]/50 resize-none focus:outline-none focus:border-[#88C0D0] focus:ring-1 focus:ring-[#88C0D0] transition-all"
      />
    </div>
  )
}
