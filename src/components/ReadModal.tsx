import React from 'react';
import { Letter } from '../types';
import { getToneClass } from './LetterCard';

interface ReadModalProps {
  letter: Letter | null;
  isMine: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isClosed: boolean;
}

export const ReadModal: React.FC<ReadModalProps> = ({
  letter,
  isMine,
  onClose,
  onEdit,
  onDelete,
  isClosed,
}) => {
  if (!letter) return null;

  const roleText =
    letter.role === '학생' && letter.grade && letter.classNo
      ? `${letter.grade}학년 ${letter.classNo}반`
      : letter.role;

  const dateText = letter.at
    ? `${letter.at.slice(5, 7)}월 ${letter.at.slice(8, 10)}일`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(40,30,15,0.45)] flex items-center justify-center p-4 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] max-h-[88dvh] overflow-y-auto bg-[#FAF2DE] border border-[#EFE3C6] rounded-[16px] p-5 sm:p-6 shadow-[0_18px_52px_rgba(70,50,15,0.32)] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-gaegu text-[24px] font-bold text-[#4A3F2F]">편지</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 rounded-full border border-[#EADFC2] bg-[#FFFCF4] flex items-center justify-center cursor-pointer hover:bg-amber-50"
          >
            <svg
              className="w-4 h-4 stroke-[#6E6355]"
              fill="none"
              strokeWidth="2.2"
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Paper Note with Pastel Gradient */}
        <div
          className={`paper p-5 sm:p-6 rounded-[4px] border border-[#F0E6CE] shadow-[0_4px_14px_rgba(120,95,50,0.12)] ${getToneClass(
            letter.id
          )}`}
        >
          {/* Sender metadata header */}
          <div className="flex items-baseline gap-2 pb-3 mb-3 border-b border-dashed border-[#DBCBA5] flex-wrap">
            <b className="font-gaegu text-[22px] text-[#4A3F2F] break-words">{letter.name}</b>
            <span className="text-[12.5px] text-[#9C8C6E]">{roleText}</span>
            {dateText && (
              <i className="ml-auto not-italic text-[11.5px] text-[#B3A78D]">{dateText}</i>
            )}
          </div>

          {/* Letter Body Text */}
          <div className="font-gaegu text-[20px] sm:text-[21px] leading-[1.75] text-[#413A2F] whitespace-pre-wrap break-words">
            {letter.message}
          </div>
        </div>

        {/* Action buttons for letter author */}
        {isMine && (
          <div className="mt-4 flex gap-2.5">
            {!isClosed && (
              <button
                type="button"
                onClick={onEdit}
                className="flex-1 h-[46px] rounded-[12px] border border-[#EADFC2] bg-[#FFFCF4] font-medium text-[14.5px] text-[#3E362B] hover:bg-[#FAF4E3] cursor-pointer"
              >
                고치기
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 h-[46px] rounded-[12px] border border-[#EADFC2] bg-[#FFFCF4] font-medium text-[14.5px] text-[#B3452F] hover:bg-rose-50 cursor-pointer"
            >
              지우기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
