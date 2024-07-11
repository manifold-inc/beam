'use client'
import { buttonClasses } from '@/components/button'
import Link, { LinkProps } from 'next/link'
import { PropsWithChildren } from 'react';

export const ButtonLink = (
  props: { variant?: 'secondary' | 'primary'; className?: string } & LinkProps & PropsWithChildren
) => {
  return (
    <Link
      {...props}
      className={buttonClasses({
        className: props.className,
        variant: props.variant,
      })}
    />
  )
}
