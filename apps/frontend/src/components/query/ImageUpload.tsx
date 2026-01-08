import { useRef } from 'react'
import { Camera, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  image: File | null
  imagePreview: string | null
  onImageSelect: (file: File) => void
  onImageRemove: () => void
}

export function ImageUpload({
  image,
  imagePreview,
  onImageSelect,
  onImageRemove,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold flex items-center gap-2 text-[#2E3440]">
        <Camera className="h-4 w-4 text-[#88C0D0]" />
        Foto da mesa <span className="text-[#4C566A] font-normal">(opcional)</span>
      </label>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:flex-1 h-12 sm:h-11 border border-[#D8DEE9] hover:border-[#88C0D0] hover:bg-[#88C0D0]/10 transition-colors text-[#2E3440] text-sm sm:text-base"
        >
          {image ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Trocar foto
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Adicionar foto
            </>
          )}
        </Button>
        {image && (
          <Button
            type="button"
            variant="ghost"
            onClick={onImageRemove}
            className="w-full sm:w-auto h-12 sm:h-auto hover:bg-[#BF616A]/10 hover:text-[#BF616A] transition-colors text-sm sm:text-base"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Remover
          </Button>
        )}
      </div>
      {imagePreview && (
        <div className="mt-3 overflow-hidden border border-[#D8DEE9] shadow-sm animate-fade-in">
          <img src={imagePreview} alt="Preview" className="w-full h-64 sm:h-80 object-cover" />
        </div>
      )}
    </div>
  )
}
