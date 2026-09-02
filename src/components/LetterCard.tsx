import React from 'react';
import { Letter } from '../types';

interface LetterCardProps {
  letter: Letter;
  isMine: boolean;
  onClick: () => void;
}

export function getToneClass(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return `tone-${n % 6}`;
}

export const LetterCard: React.FC<LetterCardProps> = ({ letter, isMine, onClick }) => {
  const roleText =
    letter.role === '학생' && letter.grade && letter.classNo
      ? `${letter.grade}학년 ${letter.classNo}반`
      : letter.role;

  return (
    <button
      type="button"
      id={`pin-${letter.id}`}
      onClick={onClick}
      className={`pin relative pt-3 bg-transparent border-0 cursor-pointer text-left animate-sway focus:outline-none transition-transform active:scale-95 ${
        isMine ? 'mine' : ''
      }`}
    >
      {/* Wooden Clothespin */}
      <div className="absolute -top-[14px] left-1/2 -ml-[5px] w-[10px] h-[26px] bg-gradient-to-b from-[#F0D8AE] to-[#D9B37F] rounded-[3px] z-20 shadow-[0_1px_3px_rgba(70,50,20,0.26)]" />

      {/* Card Body */}
      <div
        className={`card bg-[#FFFCF1] p-2 sm:p-2.5 pb-2.5 rounded-[2px] shadow-[0_3px_10px_rgba(120,95,50,0.14)] border border-[#F0E6CE] relative ${
          isMine ? 'ring-2 ring-[#8A6D3F]' : ''
        }`}
      >
        {isMine && (
          <span className="absolute right-1.5 top-1.5 z-10 bg-[#8A6D3F] text-[#FFF8E9] text-[9px] px-1.5 py-0.5 rounded-full font-sans tracking-tight">
            내 편지
          </span>
        )}

        {/* Message preview note */}
        <div
          className={`ph h-[92px] sm:h-[104px] rounded-[1px] flex items-end p-2 overflow-hidden font-gaegu text-[14px] sm:text-[15px] leading-[1.42] text-[#42392C] ${getToneClass(
            letter.id
          )}`}
        >
          <span className="line-clamp-4 break-words overflow-hidden w-full">
            {letter.message}
          </span>
        </div>

        {/* Sender Name & Role */}
        <div className="nm font-gaegu text-[15px] sm:text-[16.5px] font-bold mt-1.5 text-[#4A3F2F] flex flex-col gap-[1px] overflow-hidden">
          <span className="truncate">{letter.name}</span>
          <em className="font-sans text-[9.5px] sm:text-[10.5px] font-normal not-italic text-[#9C8C6E] truncate">
            {roleText}
          </em>
        </div>
      </div>
    </button>
  );
};
