'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { getBrandName, getHeaderNavItems } from '@/app/lib/siteContent';
import { cn, getImageSrc } from '@/app/lib/utils';

function toTitleCase(label: string): string {
  return label
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function BrandMark({ name, className }: { name: string; className?: string }) {
  const text = (name || 'Brand').toUpperCase();
  const oIndex = text.indexOf('O');

  if (oIndex === -1) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {text.slice(0, oIndex)}
      <span className="relative inline-block">
        O
        <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-[2px] w-[85%] bg-current" aria-hidden />
      </span>
      {text.slice(oIndex + 1)}
    </span>
  );
}

function useIsActivePath() {
  const pathname = usePathname();

  return (href: string) => {
    if (!href || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return false;
    }
    const path = href.split(/[?#]/)[0] || '/';
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };
}

function HeaderNavLink({
  href,
  children,
  isActive,
  fonts,
  activeColor,
  textColor,
  onClick,
  className,
}: {
  href: string;
  children: ReactNode;
  isActive: boolean;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
  activeColor: string;
  textColor: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn('text-[15px] font-normal leading-none transition-colors duration-300', className)}
      style={{
        fontFamily: fonts.heading,
        color: isActive ? activeColor : textColor,
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { site, pages, loading } = useWebBuilder();
  const { colors, fonts } = useSectionTheme();
  const isActivePath = useIsActivePath();

  const [isOpen, setIsOpen] = useState(false);

  const businessName = useMemo(() => getBrandName(site), [site]);
  const phoneNumber = site?.business?.phone?.trim() || site?.business?.emergencyPhone?.trim() || '';

  const logoSrc = useMemo(() => {
    const url = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return url ? getImageSrc(url) : '';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const logoAlt = site?.footer?.logo?.altText?.trim() || businessName || 'Logo';

  const navEntries = useMemo(() => getHeaderNavItems(pages), [pages]);

  const activeColor = colors.primaryButton;
  const textColor = colors.mainText;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  if (loading) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] border-b bg-white" style={{ borderColor: `color-mix(in srgb, ${textColor} 8%, transparent)` }}>
        <div className="container mx-auto flex h-16 items-center justify-between px-8 lg:h-[4.5rem] lg:px-12">
          <Link
            href="/"
            className="shrink-0 no-underline"
            style={{ color: textColor, fontFamily: fonts.heading }}
          >
            {logoSrc ? (
              <div className="relative h-9 w-32 sm:h-10 sm:w-36">
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  fill
                  priority
                  className="object-contain object-left"
                  sizes="144px"
                />
              </div>
            ) : (
              <BrandMark
                name={businessName}
                className="text-[1.05rem] font-normal tracking-[0.12em] sm:text-[1.15rem]"
              />
            )}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navEntries.map((entry) => (
              <HeaderNavLink
                key={entry.id}
                href={entry.href}
                isActive={isActivePath(entry.href)}
                fonts={fonts}
                activeColor={activeColor}
                textColor={textColor}
              >
                {toTitleCase(entry.name)}
              </HeaderNavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="relative z-[110] p-2 lg:hidden"
            style={{ color: textColor }}
          >
            <div className="flex w-6 flex-col items-end gap-1.5">
              <span className={cn('block h-px w-6 bg-current transition-all duration-300', isOpen && 'translate-y-[5px] rotate-45')} />
              <span className={cn('block h-px bg-current transition-all duration-300', isOpen ? 'w-0 opacity-0' : 'w-4')} />
              <span className={cn('block h-px bg-current transition-all duration-300', isOpen ? 'w-6 -translate-y-[5px] -rotate-45' : 'w-2.5')} />
            </div>
          </button>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-[105] bg-white transition-all duration-300 lg:hidden',
          isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
      >
        <div className="flex h-full flex-col px-8 pb-10 pt-20">
          <nav className="flex flex-1 flex-col gap-5">
            {navEntries.map((entry) => (
              <HeaderNavLink
                key={entry.id}
                href={entry.href}
                isActive={isActivePath(entry.href)}
                fonts={fonts}
                activeColor={activeColor}
                textColor={textColor}
                onClick={closeMenu}
                className="text-2xl"
              >
                {toTitleCase(entry.name)}
              </HeaderNavLink>
            ))}
          </nav>

          {phoneNumber && (
            <div className="border-t pt-6" style={{ borderColor: `color-mix(in srgb, ${textColor} 12%, transparent)` }}>
              <a
                href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                className="text-lg"
                style={{ fontFamily: fonts.heading, color: textColor }}
              >
                {phoneNumber}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
