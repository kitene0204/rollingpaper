import React from 'react';
import { Letter } from '../types';
import { LetterCard } from './LetterCard';

interface ClotheslineProps {
  letters: Letter[];
  mineMap: Record<string, string>;
  onSelectLetter: (letter: Letter) => void;
  loading: boolean;
  onRetry: () => void;
}

export const Clothesline: React.FC<ClotheslineProps> = ({
  letters,
  mineMap,
  onSelectLetter,
  loading,
  onRetry,
}) => {
  if (loading) {
    return (
      <main className="py-14 text-center text-[#9C8C6E] text-[13.5px]">
        <div className="w-[28px] h-[28px] mx-auto mb-3.5 border-[2.5px] border-[#EADFC2] border-t-[#8A6D3F] rounded-full animate-spin" />
        편지를 불러오고 있습니다…
      </main>
    );
  }

  if (letters.length === 0) {
    return (
      <main className="py-16 text-center text-[#9C8C6E] text-[14px]">
        <div className="font-gaegu text-[22px] text-[#6E6355] mb-2">아직 걸린 편지가 없습니다</div>
        하단의 [내 편지 걸기] 버튼을 눌러 첫 번째 축하 편지를 걸어보세요!
      </main>
    );
  }

  // Split into rows of 3 letters each
  const rows: Letter[][] = [];
  for (let i = 0; i < letters.length; i += 3) {
    rows.push(letters.slice(i, i + 3));
  }

  return (
    <main className="py-4 pb-28 min-h-[40vh] max-w-[560px] mx-auto">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="line relative pt-8 pb-2 mb-2">
          {/* Wooden Clothesline Rope across the row */}
          <div className="absolute left-0 right-0 top-[16px] h-[2px] bg-[#C3A87C] rounded-full shadow-[0_1px_0_rgba(255,255,255,0.7)]" />

          {/* 3 Columns Grid */}
          <div className="row grid grid-cols-3 gap-2.5 sm:gap-3 px-3.5 sm:px-4 pb-2.5">
            {row.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                isMine={Boolean(mineMap[letter.id])}
                onClick={() => onSelectLetter(letter)}
              />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
};
