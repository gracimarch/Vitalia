import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import RotatingText from '@/components/ui/RotatingText';
import MagicBento from '@/components/ui/MagicBento';
import FaqList from '@/components/ui/FaqList';
import PricingList from '@/components/ui/PricingList';
import './landing.css';

import LiquidBackground from '@/components/ui/LiquidBackgroundWrapper';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://vitalia-selfcare.vercel.app/',
  },
};

export default function Home() {
  return (
    <div className="page-landing">
      {/* Background Decorations */}
      <div className="decoration-container"></div>

      {/* Hero section */}
      <div className="container-fluid p-0">
        <div className="text-center bg-image welcome hero-composition">
          {/* Hero Composition Elements */}
          <Image src="/assets/images/hero/fondo.webp" className="hero-bg" alt="" aria-hidden="true" width={1920} height={1080} priority />
          <Image src="/assets/images/hero/flor.webp" className="hero-flower flower-left" alt="" aria-hidden="true" width={500} height={800} priority />
          <Image src="/assets/images/hero/flores.webp" className="hero-flower flower-right" alt="" aria-hidden="true" width={500} height={800} priority />

          <LiquidBackground />

          <div className="hero-content d-flex justify-content-center align-items-center h-100">
            <div className="text-white text-main px-3">
              <h1 className="mb-3">
                Vitalia, el cambio que <br /> <RotatingText /> en tu vida
              </h1>
              <h4 className="mb-3">Planes de bienestar personalizados para cuidar tu salud</h4>
              <Link href="/crear-cuenta" className="btn-hero">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z" />
                </svg>
                Crear mi plan gratis
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Magic Bento Section */}
      <div id="magic-bento-root" className="mb-3">
        <div className="container py-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="reading-section text-center p-0 mb-5" style={{ textAlign: 'center' }}>
            <p className="reading-subtext">¿Qué ofrece Vitalia?</p>
            <div>
              <h2 className="reading-heading wobble gradient-txt-vitalia">Nuestras funcionalidades</h2>
            </div>
          </div>
          <MagicBento />
        </div>
      </div>

      {/* FAQs */}
      <section id="preguntas-frecuentes" className="reading">
        <div className="container pt-3 pb-4">
          <div className="row">
            {/* Left Column: Title & Subtitle */}
            <div className="col-lg-5 col-md-5 mb-4 mb-md-0">
              <div className="reading-section faq-header" style={{ textAlign: 'left', padding: 0 }}>
                <p className="reading-subtext">Preguntas frecuentes</p>
                <div>
                  <h2 className="reading-heading wobble gradient-txt-vitalia">¿Tienes alguna duda? Nosotros te respondemos</h2>
                </div>
              </div>
            </div>

            {/* Right Column: Questions */}
            <div className="col-lg-7 col-md-7">
              <FaqList />
            </div>
          </div>
        </div>
      </section>

      {/* Premium */}
      <section className="reading" id="premium">
        <div className="container pt-4 pb-5">
          <div className="reading-section" style={{ textAlign: 'center', margin: '0 auto' }}>
            <p className="reading-subtext">Planes de suscripción</p>
            <div>
              <h2 className="reading-heading wobble gradient-txt-vitalia">Lleva tu experiencia al siguiente nivel</h2>
            </div>
          </div>
        </div>
      </section>
      
      <section>
        <PricingList />
      </section>
    </div>
  );
}
