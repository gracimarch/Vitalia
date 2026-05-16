'use client';

import dynamic from 'next/dynamic';

const LiquidBackground = dynamic(() => import('./LiquidBackground'), { ssr: false });

export default function LiquidBackgroundWrapper() {
  return <LiquidBackground />;
}
