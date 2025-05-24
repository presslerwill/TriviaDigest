'use client';

import { useState } from 'react';
import Link from 'next/link';
import Modal from './Modal';
import LeaderboardModal from './LeaderboardModal';
import AboutModal from './AboutModal';

export default function Header() {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="w-full border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Daily Trivia
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="hover:text-[var(--accent)]">
              Home
            </Link>
            <button 
              onClick={() => setIsLeaderboardOpen(true)}
              className="hover:text-[var(--accent)]"
            >
              Leaderboard
            </button>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[var(--accent)]"
            >
              About
            </button>
          </nav>
        </div>
      </header>

      <Modal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        title="Today's Leaderboard"
      >
        <LeaderboardModal />
      </Modal>

      <Modal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="About & How to Play"
      >
        <AboutModal />
      </Modal>
    </>
  );
} 