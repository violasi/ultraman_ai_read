import { useState } from 'react'
import type { UltramanCharacter } from '../../data/ultramanCharacters'

interface UltramanAvatarProps {
  character: UltramanCharacter
  size?: 'xs' | 'sm' | 'md' | 'lg'
  dimmed?: boolean
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-10 h-10 text-lg',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-24 h-24 text-4xl',
}

export default function UltramanAvatar({ character, size = 'md', dimmed = false }: UltramanAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const sizeClass = sizeMap[size]

  if (imgError) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center text-white font-black shadow-md ${dimmed ? 'opacity-40 grayscale' : ''}`}
        style={{ backgroundColor: character.fallbackColor }}
      >
        {character.fallbackChar}
      </div>
    )
  }

  return (
    <img
      src={character.imageUrl}
      alt={character.name}
      className={`${sizeClass} rounded-full object-cover shadow-md ${dimmed ? 'opacity-40 grayscale' : ''}`}
      onError={() => setImgError(true)}
    />
  )
}
