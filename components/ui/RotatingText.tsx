'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const words = [
  { text: 'buscas' },
  { text: 'necesitas' },
  { text: 'mereces' },
];

export default function RotatingText() {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState<number | 'auto'>('auto');
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth);
    }
  }, [index]);

  useEffect(() => {
    const handleResize = () => {
      if (measureRef.current) {
        setWidth(measureRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span 
      className="words-wrapper"
      animate={{ width }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'middle',
        overflow: 'hidden',
        padding: '0 10px',
        boxSizing: 'content-box',
        height: '1.2em',
      }}
    >
      <span 
        ref={measureRef}
        className="rotating-word"
        aria-hidden="true"
        style={{
          visibility: 'hidden',
          position: 'absolute',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-secondary)',
          fontWeight: 600,
          fontStyle: 'italic',
          lineHeight: 1,
        }}
      >
        {words[index].text}
      </span>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ y: '100%', x: '-50%', opacity: 0 }}
          animate={{ y: '0%', x: '-50%', opacity: 1 }}
          exit={{ y: '-100%', x: '-50%', opacity: 0 }}
          transition={{ 
            y: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
            opacity: { duration: 0.25, delay: 0.25, ease: 'linear' }
          }}
          style={{
            display: 'inline-block',
            position: 'absolute',
            left: '50%',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-secondary)',
            fontWeight: 600,
            fontStyle: 'italic',
            lineHeight: 1,
            marginTop: '-6px',
          }}
          className="rotating-word"
        >
          {words[index].text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

