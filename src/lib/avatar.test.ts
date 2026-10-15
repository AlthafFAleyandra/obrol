import { colorFor, initials } from './avatar'

describe('avatar', () => {
  it('inisial dari nama', () => {
    expect(initials('Rina Maharani')).toBe('RM')
    expect(initials('Budi')).toBe('BU')
    expect(initials('  ')).toBe('?')
  })
  it('warna stabil untuk kunci yang sama', () => {
    expect(colorFor('u_rina')).toBe(colorFor('u_rina'))
    expect(colorFor('u_rina')).toMatch(/^bg-avatar-[1-8]$/)
  })
})
