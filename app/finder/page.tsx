import type { Metadata } from 'next';
import { NailFinderTool } from '@/components/surfaces/NailFinderTool';

export const metadata: Metadata = {
  title: 'Nail Shape & Undertone Finder | Finglora',
  description:
    'Find the most flattering nail shape and polish undertones for your hands in 15 seconds, then preview matched manicures directly on your own hand.',
};

export default function NailFinderPage() {
  return <NailFinderTool />;
}
