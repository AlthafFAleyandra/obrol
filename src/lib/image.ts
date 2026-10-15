import { LIMITS } from '@/types'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export interface FileCheck {
  ok: boolean
  error?: string
}

export function validateImageFile(
  file: { type: string; size: number },
  allowed: readonly string[] = IMAGE_TYPES,
  maxBytes: number = LIMITS.imageMaxBytes,
): FileCheck {
  if (!allowed.includes(file.type)) {
    const names = allowed.map((t) => t.replace('image/', '').toUpperCase().replace('JPEG', 'JPG'))
    return { ok: false, error: `Format tidak didukung. Gunakan ${names.join(', ')}.` }
  }
  if (file.size > maxBytes) {
    return { ok: false, error: `Ukuran gambar maksimal ${Math.round(maxBytes / 1024 / 1024)} MB.` }
  }
  return { ok: true }
}

/** Hitung ukuran baru dengan sisi terpanjang <= maxSide, tanpa memperbesar. */
export function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= maxSide) return { width, height }
  const scale = maxSide / longest
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gambar tidak dapat dibuka'))
    img.src = src
  })
}

/** Perkecil gambar lewat canvas dan kembalikan data URL. GIF kecil dipertahankan agar tetap beranimasi. */
export async function resizeImageFile(file: File, maxSide: number): Promise<string> {
  const original = await readAsDataUrl(file)
  const img = await loadImage(original)
  const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, maxSide)
  const unchanged = width === img.naturalWidth && height === img.naturalHeight
  if (file.type === 'image/gif' && unchanged) return original

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return original
  ctx.drawImage(img, 0, 0, width, height)
  const outType = file.type === 'image/jpeg' || file.type === 'image/webp' ? file.type : 'image/png'
  return canvas.toDataURL(outType, 0.85)
}
