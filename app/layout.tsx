import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/layout/Header';
import FooterWrapper from '@/components/layout/FooterWrapper';
import MainWrapper from '@/components/layout/MainWrapper';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Vitalia | Tu Web de Bienestar',
  description: 'Tu espacio de bienestar físico y mental con recomendaciones personalizadas. Te ayudamos a transformar tu calidad de vida de forma efectiva y adaptada a ti.',
  keywords: 'Bienestar, Salud mental, Blog, Meditación, Fitness, Nutrición',
  openGraph: {
    title: 'Vitalia | Tu Web de Bienestar',
    description: 'Tu espacio de bienestar físico y mental con recomendaciones personalizadas. Te ayudamos a transformar tu calidad de vida de forma efectiva y adaptada a ti.',
    url: 'https://vitalia-selfcare.vercel.app/',
    type: 'website',
    images: [
      {
        url: 'https://vitalia-selfcare.vercel.app/assets/images/ui/og-vitalia.jpg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitalia | Tu Web de Bienestar',
    description: 'Tu espacio de bienestar físico y mental con recomendaciones personalizadas. Te ayudamos a transformar tu calidad de vida de forma efectiva y adaptada a ti.',
    images: ['https://vitalia-selfcare.vercel.app/assets/images/ui/og-vitalia.jpg'],
  },
  icons: {
    icon: [
      { url: '/assets/favicons/vitalia-favicon.svg', type: 'image/svg+xml' },
      { url: '/assets/favicons/vitalia-favicon.png', type: 'image/png' },
    ],
    apple: '/assets/favicons/vitalia-favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta name="theme-color" content="#B571DE" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <MainWrapper>
            {children}
          </MainWrapper>
          <FooterWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
