import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Send, Camera, MessageCircle, RefreshCw, Brain } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { ImageUpload } from '@/components/query/ImageUpload'
import { QuestionInput } from '@/components/query/QuestionInput'
import { AnswerDisplay } from '@/components/query/AnswerDisplay'
import { ErrorDisplay } from '@/components/query/ErrorDisplay'

export default function ManualQuery() {
  const { id: manualId } = useParams()
  const navigate = useNavigate()
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [question, setQuestion] = useState('')

  const { data: answer, loading, error, execute, reset, setError } = useApi<{ answer: string }>()

  const handleImageSelect = (file: File) => {
    setImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim() && !image) {
      setError('Por favor, adicione uma pergunta ou uma imagem')
      return
    }

    if (!manualId) {
      setError('Por favor, selecione um manual')
      return
    }

    try {
      if (image) {
        // Com imagem: usar /api/query e multipart/form-data
        const formData = new FormData()
        formData.append('manualId', manualId)
        formData.append('image', image)

        if (question.trim()) {
          formData.append('question', question.trim())
        }

        await execute('/api/query', {
          method: 'POST',
          body: formData,
        })
      } else {
        // Sem imagem: usar /api/query/text e JSON
        await execute('/api/query/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: question.trim(),
            manualId,
          }),
        })
      }
    } catch (err) {
      // Erro já tratado pelo hook
    }
  }

  const handleReset = () => {
    setImage(null)
    setImagePreview(null)
    setQuestion('')
    reset()
  }

  return (
    <div className="min-h-screen bg-[#ECEFF4]">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/manuals')}
            className="mb-4 sm:mb-6 lg:mb-8 hover:bg-[#88C0D0]/10 text-[#4C566A] hover:text-[#5E81AC] transition-colors -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="border border-[#D8DEE9] shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 border-b border-[#E5E9F0] px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl text-[#2E3440]">
                <div className="p-2 sm:p-2.5 bg-[#88C0D0]/10 border border-[#88C0D0]/20 shrink-0">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-[#5E81AC]" />
                </div>
                Consultar Regras
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-[#4C566A] flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                <span className="flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  Envie uma foto
                </span>
                <span className="hidden sm:inline">ou</span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  faça uma pergunta
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <ImageUpload
                  image={image}
                  imagePreview={imagePreview}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                />

                <QuestionInput value={question} onChange={setQuestion} />

                {error && <ErrorDisplay message={error} />}

                {answer && <AnswerDisplay answer={answer.answer} />}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading || (!question.trim() && !image)}
                    className="w-full sm:flex-1 h-12 sm:h-12 text-sm sm:text-base font-semibold bg-[#5E81AC] hover:bg-[#5E81AC]/90 text-white border-0 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent animate-spin"></span>
                        Processando...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Enviar Consulta
                      </>
                    )}
                  </Button>
                  {(answer || error) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="w-full sm:w-auto h-12 px-6 border border-[#D8DEE9] hover:bg-[#88C0D0]/10 hover:border-[#88C0D0] transition-colors text-[#2E3440]"
                      size="lg"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Nova consulta
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6 sm:mt-8 border-2 border-dashed border-[#D8DEE9] bg-[#88C0D0]/5">
            <CardContent className="py-4 sm:py-6 px-4 sm:px-6 text-center">
              <p className="text-xs sm:text-sm text-[#4C566A] flex flex-col sm:flex-row items-center justify-center gap-2">
                <Brain className="h-4 w-4 text-[#88C0D0] shrink-0" />
                <span>
                  O assistente analisa o contexto da foto e/ou sua pergunta para
                  fornecer respostas precisas baseadas no manual do jogo.
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
