import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { designTokens } from '@garazo/design-tokens';

export const metadata: Metadata = {
  title: 'Garazo admin shell',
  description: 'Garazo admin application scaffold',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: designTokens.space['0'],
          background: designTokens.color.background,
          color: designTokens.color.text,
          fontFamily: designTokens.font.family.base,
        }}
      >
        {children}
      </body>
    </html>
  );
}
