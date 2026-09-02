import React from 'react';
import { Settings } from '../types';

interface HeaderProps {
  settings: Settings;
  count: number;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ settings, count, loading }) => {
  const orgSpaced = (settings.org || '전주삼천초등학교').split('').join(' ');
  const target = settings.fullTarget || (settings.name ? `${settings.name}에게` : '강윤찬에게');

  return (
    <header className="relative text-center pt-8 pb-3 px-5 max-w-[560px] mx-auto">
      {/* Decorative clothesline with 6 pastel hanging notes */}
      <div className="relative w-full max-w-[420px] h-[72px] mx-auto mb-2 flex justify-around items-start pt-3">
        {/* Rope line */}
        <div className="absolute left-0 right-0 top-[11px] h-[2.5px] bg-[#B99C6A] rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.12)]" />
        
        {/* Pastel mini notes */}
        {[
          { bg: '#FDF4D8', delay: '0s' },
          { bg: '#EEF5DA', delay: '-1.2s' },
          { bg: '#FDE8DB', delay: '-2.4s' },
          { bg: '#E7EDEF', delay: '-0.6s' },
          { bg: '#FEF0BE', delay: '-1.8s' },
          { bg: '#F6EBEF', delay: '-3.0s' }
        ].map((item, idx) => (
          <div
            key={idx}
            className="relative w-[44px] h-[54px] rounded-[2px] shadow-[0_2px_6px_rgba(100,75,30,0.12)] border border-[#EFE5CD] animate-sway"
            style={{ backgroundColor: item.bg, animationDelay: item.delay }}
          >
            {/* Wooden clip */}
            <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-[7px] h-[16px] bg-gradient-to-b from-[#EFD9AF] to-[#D5B079] rounded-[2px] shadow-[0_1px_2px_rgba(70,50,20,0.25)] z-10" />
          </div>
        ))}
      </div>

      {/* School / Org Name */}
      <div id="hOrg" className="text-[11.5px] tracking-[0.3em] text-[#A79880] uppercase font-medium">
        {orgSpaced}
      </div>

      {/* Main Title */}
      <h1 id="hTitle" className="font-gaegu text-[32px] sm:text-[36px] font-bold mt-2 text-[#4A3F2F] leading-[1.3]">
        {target}
        <br />
        보내는 마음
      </h1>

      {/* Meta count description */}
      <div id="meta" className="mt-2 text-[13px] text-[#9C8C6E]">
        {loading ? (
          '편지를 불러오는 중입니다…'
        ) : count > 0 ? (
          <>
            지금까지 <b className="text-[#8A6D3F] font-bold">{count}</b>장이 걸렸습니다
            {settings.closed && ' · 마감되었습니다'}
          </>
        ) : settings.closed ? (
          '편지 받는 기간이 끝났습니다'
        ) : (
          '아직 편지가 없습니다. 첫 마음을 전해보세요!'
        )}
      </div>
    </header>
  );
};
