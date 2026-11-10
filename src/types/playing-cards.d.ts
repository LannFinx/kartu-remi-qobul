declare module '@letele/playing-cards' {
  import type { ComponentType, SVGProps } from 'react';

  type CardSvg = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

  const deck: Record<string, CardSvg>;
  export = deck;
}

