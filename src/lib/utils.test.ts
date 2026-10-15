import { cn } from './utils'

describe('cn', () => {
  it('menggabungkan kelas dan menyelesaikan konflik tailwind', () => {
    expect(cn('p-2', 'p-4', undefined)).toBe('p-4')
  })
})
