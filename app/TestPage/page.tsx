'use client';

import React from 'react';
import AIOverlayWrapper from '@/components/AIOverlay';
import AudioCapture from '@/components/audioRecordLogic';

export default function Home() {
  return (
    <main>
      <AIOverlayWrapper />
      <AudioCapture />
      <h1>Your page content</h1>
    </main>
  );
}
