import { Bot } from 'lucide-react'
import Markdown from 'react-markdown'

interface AnswerDisplayProps {
  answer: string
}

export function AnswerDisplay({ answer }: AnswerDisplayProps) {
  return (
    <div className="p-4 sm:p-6 border border-[#88C0D0]/30 bg-[#88C0D0]/5 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-[#88C0D0]/20">
        <Bot className="h-5 w-5 text-[#5E81AC] shrink-0" />
        <h3 className="font-bold text-base sm:text-lg text-[#2E3440]">Resposta do Assistente</h3>
      </div>
      <div className="prose prose-sm sm:prose-base prose-slate max-w-none">
        <Markdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl sm:text-2xl font-bold text-[#2E3440] mt-4 mb-2">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg sm:text-xl font-bold text-[#2E3440] mt-3 mb-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base sm:text-lg font-semibold text-[#2E3440] mt-3 mb-1.5">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-sm sm:text-base text-[#2E3440] mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-sm sm:text-base text-[#2E3440] mb-3 space-y-1.5 ml-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-sm sm:text-base text-[#2E3440] mb-3 space-y-1.5 ml-2">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-sm sm:text-base text-[#2E3440]">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-[#5E81AC]">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-[#4C566A]">{children}</em>
            ),
            code: ({ children }) => (
              <code className="bg-[#2E3440] text-[#88C0D0] px-1.5 py-0.5 text-xs sm:text-sm font-mono border border-[#3B4252]">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-[#2E3440] text-[#88C0D0] p-3 sm:p-4 overflow-x-auto my-3 border border-[#3B4252]">{children}</pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#88C0D0] pl-4 py-2 my-3 text-sm sm:text-base text-[#4C566A] italic bg-[#ECEFF4]">{children}</blockquote>
            ),
            a: ({ children, href }) => (
              <a href={href} className="text-[#5E81AC] hover:text-[#88C0D0] underline" target="_blank" rel="noopener noreferrer">{children}</a>
            ),
          }}
        >
          {answer}
        </Markdown>
      </div>
    </div>
  )
}
