import { cn } from '@/lib/utils';

interface BrandMonogramProps {
  storeName: string;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_STYLES = {
  sm: {
    shell: 'h-10 w-10',
    initials: 'text-base tracking-[0.24em] pl-[0.24em]',
  },
  md: {
    shell: 'h-12 w-12',
    initials: 'text-lg tracking-[0.26em] pl-[0.26em]',
  },
  lg: {
    shell: 'h-16 w-16',
    initials: 'text-2xl tracking-[0.28em] pl-[0.28em]',
  },
} as const;

export function getStoreWordmark(storeName: string) {
  const words = storeName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return { primary: 'Aurelia', secondary: 'Jewels' };
  }

  return {
    primary: words[0],
    secondary: words.slice(1).join(' '),
  };
}

function getStoreInitials(storeName: string) {
  const words = storeName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return 'AJ';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

export function BrandMonogram({
  storeName,
  theme = 'light',
  size = 'md',
  className,
}: BrandMonogramProps) {
  const initials = getStoreInitials(storeName);
  const sizeStyles = SIZE_STYLES[size];
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full border',
        'shadow-[0_12px_32px_rgba(26,21,16,0.12)]',
        sizeStyles.shell,
        isDark
          ? 'border-gold-200/35 bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-900'
          : 'border-gold-300/70 bg-gradient-to-br from-white via-cream-50 to-gold-100',
        className
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          'absolute inset-[4px] rounded-full border',
          isDark ? 'border-gold-200/20' : 'border-gold-300/35'
        )}
      />
      <span
        className={cn(
          'relative z-10 font-serif uppercase leading-none',
          sizeStyles.initials,
          isDark ? 'text-gold-100' : 'text-charcoal-900'
        )}
      >
        {initials}
      </span>
    </div>
  );
}
