import { BookOpen, Search, CheckCircle, Clock, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Manual {
  id: string
  gameName: string
  fileName: string
  uploadDate: string
  indexed: boolean
}

interface ManualCardProps {
  manual: Manual
  index: number
  onSelect: (id: string) => void
}

export function ManualCard({ manual, index, onSelect }: ManualCardProps) {
  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border border-[#D8DEE9] hover:border-[#88C0D0] bg-white hover:translate-x-1 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onSelect(manual.id)}
    >
      <CardContent className="flex items-center justify-between p-3 sm:p-4 lg:p-5">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="p-2 sm:p-3 bg-[#88C0D0]/10 border border-[#88C0D0]/20 group-hover:bg-[#88C0D0]/20 transition-colors shrink-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#5E81AC]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-1 text-[#2E3440] group-hover:text-[#5E81AC] transition-colors truncate">
              {manual.gameName}
            </h3>
            <p className="text-xs sm:text-sm text-[#4C566A] mb-2 truncate">{manual.fileName}</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2">
              <p className="text-xs text-[#4C566A] flex items-center gap-1.5 shrink-0">
                <Calendar className="h-3 w-3 text-[#88C0D0]" />
                {new Date(manual.uploadDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <span className="flex items-center gap-1.5 text-xs">
                {manual.indexed ? (
                  <span className="flex items-center gap-1.5 bg-[#A3BE8C]/10 text-[#A3BE8C] px-2.5 py-1 border border-[#A3BE8C]/20 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Pronto
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-[#EBCB8B]/10 text-[#EBCB8B] px-2.5 py-1 border border-[#EBCB8B]/20 font-medium animate-pulse-soft">
                    <Clock className="h-3.5 w-3.5" />
                    Processando
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="group-hover:bg-[#88C0D0]/10 transition-colors shrink-0 h-8 w-8 sm:h-9 sm:w-9"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[#4C566A] group-hover:text-[#5E81AC] transition-colors" />
        </Button>
      </CardContent>
    </Card>
  )
}
