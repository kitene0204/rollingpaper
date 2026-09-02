import React from 'react';

interface ImagePreviewModalProps {
  imgUrl: string | null;
  recipientName: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imgUrl,
  recipientName,
  onClose,
}) => {
  if (!imgUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.download = `롤링페이퍼_${recipientName || '마음'}_${new Date()
      .toISOString()
      .slice(0, 10)}.png`;
    a.href = imgUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(40,30,15,0.55)] flex items-center justify-center p-4 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] max-h-[90dvh] overflow-y-auto bg-[#FAF2DE] border border-[#EFE3C6] rounded-[18px] p-5 text-center shadow-[0_18px_52px_rgba(70,50,15,0.32)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-gaegu text-[24px] font-bold text-[#4A3F2F]">이미지 저장</h2>
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

        <div className="my-2 max-h-[55dvh] overflow-y-auto rounded-[8px] border border-[#EADFC2] shadow-inner bg-stone-100">
          <img src={imgUrl} alt="롤링페이퍼 전체 이미지" className="w-full h-auto block" />
        </div>

        <div className="text-[13px] text-[#8A6D3F] font-medium my-2.5">
          💡 모바일에서는 이미지를 <b>길게 꾹 눌러서</b> [사진에 저장] 하실 수도 있습니다.
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full h-[48px] mt-2 bg-[#8A6D3F] hover:bg-[#6F5730] text-[#FFF8E9] text-[15px] font-bold rounded-[12px] shadow-sm cursor-pointer"
        >
          사진 파일로 다운로드
        </button>
      </div>
    </div>
  );
};
