/** Pembungkus setTimeout yang melacak semua timer aktif agar bisa dibersihkan sekaligus. */
export class Scheduler {
  private timers = new Set<ReturnType<typeof setTimeout>>()

  after(ms: number, fn: () => void): () => void {
    const id = setTimeout(() => {
      this.timers.delete(id)
      fn()
    }, ms)
    this.timers.add(id)
    return () => {
      clearTimeout(id)
      this.timers.delete(id)
    }
  }

  clear(): void {
    for (const id of this.timers) clearTimeout(id)
    this.timers.clear()
  }

  get pending(): number {
    return this.timers.size
  }
}
