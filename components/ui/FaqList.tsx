'use client';

import React, { useState } from 'react';
import { ParticleCard } from './MagicBento';

const faqData = [
  {
    question: "¿Cómo funciona el proceso de personalización en Vitalia?",
    answer: "Al registrarte en Vitalia, completarás un formulario que nos permitirá conocer tus objetivos, hábitos y preferencias. Con esta información, crearemos un plan de bienestar único, que incluirá recomendaciones de alimentación, rutinas de ejercicio y meditaciones, ajustadas a tu estilo de vida y necesidades. A medida que avanzas, el plan se ajustará para seguir siendo relevante y efectivo."
  },
  {
    question: "¿Vitalia está diseñada para cualquier persona?",
    answer: "Sí, Vitalia está diseñada para todos. Sin importar tu estilo de vida o tus necesidades específicas, nuestros planes se ajustan a tus preferencias y objetivos. Ya sea que tengas una vida activa, restricciones alimenticias o de movilidad, o busques mejorar tu salud mental, te ofrecemos una orientación personalizada que responde a cada uno de estos aspectos."
  },
  {
    question: "¿Existen opciones gratuitas o solo puedo acceder mediante suscripción?",
    answer: "Ofrecemos tanto planes gratuitos como premium. El plan gratuito incluye acceso básico a nuestra plataforma, con rutinas de ejercicio, meditación, planes de nutrición y artículos educativos. Los planes premium te ofrecen acceso a una experiencia personalizada más avanzada, con contenido exclusivo, asesoría con profesionales y seguimiento continuo."
  },
  {
    question: "¿Es Vitalia accesible desde cualquier dispositivo?",
    answer: "¡Sí! Vitalia está diseñada para ser accesible desde cualquier dispositivo, ya sea desde tu computadora, teléfono móvil o tablet. Todo lo que necesitas es acceso a internet para que puedas disfrutar de tus planes de bienestar en cualquier lugar y en cualquier momento."
  }
];

const FAQItem = ({ item, isOpen, onClick }: { item: any, isOpen: boolean, onClick: () => void }) => {
  const colors = ['128, 202, 205', '157, 96, 207', '225, 148, 127'];
  const glowColor = colors[Math.abs(item.question.length) % 3];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    target.style.setProperty('--glow-x', `${x}%`);
    target.style.setProperty('--glow-y', `${y}%`);
    target.style.setProperty('--glow-intensity', '1');
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--glow-intensity', '0');
  };

  return (
    <div style={{ marginBottom: '15px' }}>
      <ParticleCard
        enableStars={true}
        enableSpotlight={false}
        enableBorderGlow={true}
        particleCount={8}
        glowColor={glowColor}
        clickEffect={true}
        className="magic-bento-card magic-bento-card--border-glow"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        tiltMaxAngle={3}
        tiltDuration={0.4}
        style={{
          aspectRatio: 'unset',
          minHeight: 'unset',
          height: 'auto',
          backgroundColor: '#FFFFFF',
          color: '#333',
          overflow: 'hidden',
          padding: 0,
          border: '1px solid rgba(0,0,0,0.08)',
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': '0',
          '--glow-radius': '300px'
        }}
      >
        <button
          className={`question ${isOpen ? 'active' : ''}`}
          onClick={onClick}
          style={{
            margin: 0,
            backgroundColor: 'transparent',
            border: 'none',
            zIndex: 2,
            position: 'relative',
            color: '#000',
            fontWeight: 600,
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer'
          }}
          aria-expanded={isOpen}
        >
          {item.question}
        </button>

        <div
          className="answercont"
          style={{
            maxHeight: isOpen ? '500px' : '0',
            opacity: isOpen ? 1 : 0,
            transition: 'all 0.3s ease',
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden'
          }}
          aria-hidden={!isOpen}
        >
          <div className="answer" style={{ color: '#000', padding: '0 2.5rem 1.25rem 1.25rem', lineHeight: '1.6', fontSize: '1.05rem', fontFamily: 'var(--font-secondary)' }}>
            {item.answer}
          </div>
        </div>
      </ParticleCard>
    </div>
  );
};

export default function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-list">
      {faqData.map((item, index) => (
        <FAQItem
          key={index}
          item={item}
          isOpen={openIndex === index}
          onClick={() => toggleFAQ(index)}
        />
      ))}
    </div>
  );
}
