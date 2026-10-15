import { fitWithin, validateImageFile } from './image'

describe('fitWithin', () => {
  it('memperkecil sisi terpanjang ke batas dan menjaga rasio', () => {
    expect(fitWithin(4000, 2000, 1280)).toEqual({ width: 1280, height: 640 })
    expect(fitWithin(1000, 3000, 256)).toEqual({ width: 85, height: 256 })
  })
  it('tidak memperbesar gambar kecil', () => {
    expect(fitWithin(300, 200, 1280)).toEqual({ width: 300, height: 200 })
  })
})

describe('validateImageFile', () => {
  it('menerima JPG/PNG/WebP/GIF sampai 5 MB', () => {
    expect(validateImageFile({ type: 'image/gif', size: 5 * 1024 * 1024 }).ok).toBe(true)
  })
  it('menolak format lain dan ukuran berlebih', () => {
    expect(validateImageFile({ type: 'application/pdf', size: 10 }).ok).toBe(false)
    expect(validateImageFile({ type: 'image/png', size: 5 * 1024 * 1024 + 1 }).ok).toBe(false)
  })
  it('avatar tidak menerima GIF', () => {
    expect(validateImageFile({ type: 'image/gif', size: 10 }, ['image/jpeg', 'image/png', 'image/webp']).ok).toBe(false)
  })
})
