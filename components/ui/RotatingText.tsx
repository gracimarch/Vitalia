'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const words = [
  { text: 'buscas' },
  { text: 'necesitas' },
  { text: 'mereces' },
];

export default function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span 
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        verticalAlign: 'bottom',
        overflow: 'hidden',
        padding: '0.1em 0',
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-secondary)',
            fontWeight: 600,
            fontStyle: 'italic',
            lineHeight: 1,
            paddingBottom: '0.1em',
          }}
        >
          {words[index].text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
