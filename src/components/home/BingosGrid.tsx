import React from 'react';
import { HomeView } from './HomeView';
import { AvailableBingoItem } from '../../data/featuredBingos';

interface BingosGridProps {
  onSelectBingo: (bingo: AvailableBingoItem) => void;
  onOpenSupport?: () => void;
}

export const BingosGrid: React.FC<BingosGridProps> = ({ onSelectBingo, onOpenSupport }) => {
  return <HomeView onSelectBingo={onSelectBingo} onOpenSupport={onOpenSupport} />;
};

export default BingosGrid;
