import { colorFor, initials } from '@/lib/avatar'
import { cn } from '@/lib/utils'

const SIZES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-20 text-2xl',
} as const

const DOTS = {
  xs: 'size-2',
  sm: 'size-2.5',
  md: 'size-3.5',
  lg: 'size-4',
  xl: 'size-5',
} as const

interface UserAvatarProps {
  name: string
  seed?: string
  src?: string
  size?: keyof typeof SIZES
  /** undefined = tanpa titik status */
  online?: boolean
  /** warna latar titik status agar menyatu dengan permukaan di bawahnya */
  ringClass?: string
  className?: string
  square?: boolean
}

export function UserAvatar({
  name,
  seed,
  src,
  size = 'md',
  online,
  ringClass = 'ring-sidebar',
  className,
  square,
}: UserAvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt=""
          className={cn('object-cover', SIZES[size], square ? 'rounded-2xl' : 'rounded-full')}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex items-center justify-center font-semibold text-white select-none',
            SIZES[size],
            colorFor(seed ?? name),
            square ? 'rounded-2xl' : 'rounded-full',
          )}
        >
          {initials(name)}
        </span>
      )}
      {online !== undefined && (
        <span
          role="img"
          aria-label={online ? 'Online' : 'Offline'}
          className={cn(
            'absolute -right-0.5 -bottom-0.5 rounded-full ring-2',
            DOTS[size],
            ringClass,
            online ? 'bg-online' : 'bg-muted-foreground',
          )}
        />
      )}
    </span>
  )
}
