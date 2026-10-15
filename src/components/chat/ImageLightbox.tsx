import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

export function ImageLightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  return (
    <Dialog open={!!src} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[min(95vw,1280px)] items-center border-0 bg-transparent p-0 shadow-none" showClose={false}>
        <DialogTitle className="sr-only">Pratinjau gambar</DialogTitle>
        <DialogDescription className="sr-only">Gambar ukuran penuh. Tekan Escape untuk menutup.</DialogDescription>
        {src && <img src={src} alt="Pratinjau gambar" className="max-h-[85dvh] max-w-full rounded-lg object-contain" />}
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-sidebar px-4 py-2 text-sm font-medium text-foreground hover:bg-elevated"
        >
          Tutup
        </button>
      </DialogContent>
    </Dialog>
  )
}
