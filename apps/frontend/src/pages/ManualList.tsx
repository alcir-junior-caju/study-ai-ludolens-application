import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Lightbulb } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { ManualCard } from '@/components/manuals/ManualCard'
import { EmptyState } from '@/components/manuals/EmptyState'
import { LoadingState } from '@/components/manuals/LoadingState'
import { ErrorState } from '@/components/manuals/ErrorState'

interface Manual {
  id: string
  gameName: string
  fileName: string
  uploadDate: string
  indexed: boolean
}

export default function ManualList() {
  const navigate = useNavigate()
  const { data: manuals, loading, error, execute } = useApi<Manual[]>()

  useEffect(() => {
    execute('/api/manuals')
  }, [])

  const handleSelectManual = (manualId: string) => {
    navigate(`/manuals/${manualId}/query`)
  }

  const handleRetry = () => {
    execute('/api/manuals')
  }

  return (
    <div className="min-h-screen bg-[#ECEFF4]">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-12 lg:mb-16 text-center space-y-3 sm:space-y-4 lg:space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#88C0D0]/20 mb-3 sm:mb-4 lg:mb-6 border border-[#88C0D0]/30">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-[#5E81AC]" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2E3440]">
              Ludolens
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[#4C566A] max-w-2xl mx-auto leading-relaxed px-4">
              Seu assistente inteligente para jogos de mesa. Tire dúvidas, consulte regras e jogue com confiança.
            </p>
          </div>

          <Card className="mb-6 sm:mb-8 border border-[#D8DEE9] shadow-sm bg-white/80 backdrop-blur-sm animate-slide-in">
            <CardHeader className="pb-4 sm:pb-6 border-b border-[#E5E9F0] px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl text-[#2E3440]">
                <div className="p-2 sm:p-2.5 bg-[#88C0D0]/10 border border-[#88C0D0]/20">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#5E81AC]" />
                </div>
                Manuais Disponíveis
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-[#4C566A] mt-2">
                Selecione um manual para começar a fazer perguntas sobre as regras do jogo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loading && <LoadingState />}
              {error && <ErrorState message={error} onRetry={handleRetry} />}
              {!loading && !error && (!manuals || manuals.length === 0) && <EmptyState />}
              {!loading && !error && manuals && manuals.length > 0 && (
                <div className="grid gap-3">
                  {manuals.map((manual, index) => (
                    <ManualCard
                      key={manual.id}
                      manual={manual}
                      index={index}
                      onSelect={handleSelectManual}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-[#D8DEE9] bg-[#88C0D0]/5">
            <CardContent className="py-4 sm:py-6 px-4 sm:px-6 text-center">
              <p className="text-xs sm:text-sm text-[#4C566A] flex flex-col sm:flex-row items-center justify-center gap-2">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[#EBCB8B] shrink-0" />
                  Para cadastrar novos manuais, use a API REST:
                </span>
                <code className="bg-[#2E3440] text-[#88C0D0] px-2 sm:px-3 py-1 sm:py-1.5 font-mono text-xs border border-[#3B4252]">POST /api/manuals</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
