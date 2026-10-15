import { ImagePlus, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AVATAR_TYPES, resizeImageFile, validateImageFile } from '@/lib/image'
import { LIMITS } from '@/types'
import { UserAvatar } from './UserAvatar'

interface Props {
  name: string
  seed?: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
  square?: boolean
}

export function AvatarPicker({ name, seed, value, onChange, square }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    const check = validateImageFile(file, AVATAR_TYPES)
    if (!check.ok) {
      toast.error(check.error)
      return
    }
    try {
      onChange(await resizeImageFile(file, LIMITS.avatarMaxSide))
    } catch {
      toast.error('Gambar tidak dapat diproses')
    }
  }

  return (
    <div className="flex items-center gap-4">
      <UserAvatar name={name || '?'} seed={seed} src={value} size="xl" square={square} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          <ImagePlus /> {value ? 'Ganti foto' : 'Pilih foto'}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            <Trash2 /> Hapus
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_TYPES.join(',')}
          className="hidden"
          aria-label="Pilih foto profil"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
