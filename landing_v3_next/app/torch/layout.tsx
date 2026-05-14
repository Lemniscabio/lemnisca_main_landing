import { Newsreader, JetBrains_Mono } from 'next/font/google';
import './torch.css';

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

export default function TorchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`torch-page ${newsreader.variable} ${jetbrains.variable}`}>
      {children}
    </div>
  );
}
