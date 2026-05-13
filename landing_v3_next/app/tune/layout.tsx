import { Newsreader, JetBrains_Mono } from 'next/font/google';
import './tune.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'optional',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains',
  display: 'optional',
});

export default function TuneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`tune-page ${newsreader.variable} ${jetbrains.variable}`}>
      {children}
    </div>
  );
}
