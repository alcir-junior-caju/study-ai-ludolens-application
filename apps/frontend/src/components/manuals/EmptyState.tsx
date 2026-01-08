import { BookOpen } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="text-center py-12 text-[#4C566A]">
      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40 text-[#88C0D0]" />
      <p className="font-medium">Nenhum manual cadastrado ainda.</p>
      <p className="text-sm mt-2">Use a API para fazer upload de manuais em PDF</p>
    </div>
  )
}
