import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Letter, Settings } from './types';
import { fetchLetters, sendPostApi } from './api';
import { Header } from './components/Header';
import { Clothesline } from './components/Clothesline';
import { WriteModal } from './components/WriteModal';
import { ReadModal } from './components/ReadModal';
import { AdminModal } from './components/AdminModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { Toast } from './components/Toast';

const DEFAULT_SETTINGS: Settings = {
  name: '강윤찬',
  title: '',
  org: '전주삼천초등학교',
  orgSpaced: '전 주 삼 천 초 등 학 교',
  who: '강윤찬',
  fullTarget: '강윤찬에게',
  deadline: '',
  closed: false,
};

// Initial sample data if API hasn't returned yet or is loading
const SAMPLE_LETTERS: Letter[] = [
  {
    id: 'sample1',
    at: '2026-09-01 10:00',
    name: '이창민',
    role: '교직원',
    grade: null,
    classNo: null,
    message: '윤찬아, 방학이라 늦었지만 생일 정말 축하해! 늘 씩씩하고 야무진 네 멋진 모습을 응원한다.',
  }
];

export default function App() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  // Local storage for my authored letters: { [id]: token }
  const [mineMap, setMineMap] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('rp_mine') || '{}');
    } catch (e) {
      return {};
    }
  });

  const captureRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLetters();
      setLetters(data.letters.slice().reverse()); // latest first
      if (data.settings) setSettings(data.settings);
    } catch (err: any) {
      console.warn('Could not fetch remote letters, using local cache/sample:', err);
      // If network/API error, fallback to samples for preview
      if (letters.length === 0) {
        setLetters(SAMPLE_LETTERS);
      }
      showToast('구글 시트 연동 상태를 확인 중입니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save new or edit letter
  const handleSubmitLetter = async (form: {
    name: string;
    role: string;
    grade: string;
    classNo: string;
    message: string;
  }) => {
    if (editingLetter) {
      const token = mineMap[editingLetter.id];
      try {
        await sendPostApi('update', {
          id: editingLetter.id,
          token,
          ...form,
        });
        showToast('편지를 고쳤습니다.');
      } catch (e) {
        // Optimistic local update
        setLetters((prev) =>
          prev.map((l) =>
            l.id === editingLetter.id
              ? {
                  ...l,
                  name: form.name,
                  role: form.role,
                  grade: form.grade ? Number(form.grade) : null,
                  classNo: form.classNo ? Number(form.classNo) : null,
                  message: form.message,
                }
              : l
          )
        );
        showToast('편지가 수정되었습니다.');
      }
    } else {
      try {
        const res = await sendPostApi<{ id: string; token: string }>('create', form);
        if (res && res.id && res.token) {
          const newMap = { ...mineMap, [res.id]: res.token };
          setMineMap(newMap);
          localStorage.setItem('rp_mine', JSON.stringify(newMap));
        }
        showToast('편지를 걸었습니다. 고맙습니다!');
      } catch (e) {
        // Fallback local addition if offline
        const mockId = Math.random().toString(36).slice(2, 10);
        const newLetter: Letter = {
          id: mockId,
          at: new Date().toISOString().replace('T', ' ').slice(0, 16),
          name: form.name,
          role: form.role,
          grade: form.grade ? Number(form.grade) : null,
          classNo: form.classNo ? Number(form.classNo) : null,
          message: form.message,
        };
        const newMap = { ...mineMap, [mockId]: 'local_token' };
        setMineMap(newMap);
        localStorage.setItem('rp_mine', JSON.stringify(newMap));
        setLetters((prev) => [newLetter, ...prev]);
        showToast('편지를 걸었습니다!');
      }
    }
    loadData();
  };

  // Delete letter
  const handleDeleteLetter = async (id: string) => {
    if (!window.confirm('편지를 지울까요? 지우면 되돌릴 수 없습니다.')) return;
    const token = mineMap[id];
    try {
      await sendPostApi('remove', { id, token });
    } catch (e) {
      console.warn('Delete request fallback:', e);
    }
    const newMap = { ...mineMap };
    delete newMap[id];
    setMineMap(newMap);
    localStorage.setItem('rp_mine', JSON.stringify(newMap));
    setLetters((prev) => prev.filter((l) => l.id !== id));
    setSelectedLetter(null);
    showToast('편지를 지웠습니다.');
  };

  // Handle Full Rolling Paper Capture
  const handleCaptureImage = async () => {
    if (letters.length === 0) {
      showToast('아직 걸린 편지가 없습니다.');
      return;
    }

    if (!captureRef.current) return;
    setCapturing(true);
    showToast('롤링페이퍼 이미지를 만들고 있습니다…');

    try {
      // Pause animations temporarily during capture
      const pins = document.querySelectorAll('.animate-sway');
      pins.forEach((p) => {
        (p as HTMLElement).style.animation = 'none';
        (p as HTMLElement).style.transform = 'none';
      });

      const canvas = await html2canvas(captureRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#FAF2DE',
        useCORS: true,
        logging: false,
      });

      pins.forEach((p) => {
        (p as HTMLElement).style.animation = '';
        (p as HTMLElement).style.transform = '';
      });

      const dataUrl = canvas.toDataURL('image/png');
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        setPreviewImgUrl(dataUrl);
      } else {
        const link = document.createElement('a');
        link.download = `롤링페이퍼_${settings.name || '마음'}_${new Date()
          .toISOString()
          .slice(0, 10)}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('이미지 다운로드가 완료되었습니다!');
      }
    } catch (err) {
      console.error(err);
      showToast('이미지를 생성하지 못했습니다.');
    } finally {
      setCapturing(false);
    }
  };

  const isAuthor = Boolean(selectedLetter && mineMap[selectedLetter.id]);

  return (
    <div className="min-h-screen bg-[#FAF2DE] text-[#3E362B] relative selection:bg-[#EADFC2]">
      {/* Top Admin Gear button */}
      <button
        type="button"
        id="gearBtn"
        aria-label="관리자 설정"
        onClick={() => setIsAdminOpen(true)}
        className="fixed right-3.5 top-3.5 z-40 w-9 h-9 rounded-full border border-[#EADFC2] bg-[#FFFCF4]/90 flex items-center justify-center shadow-sm cursor-pointer hover:bg-amber-50"
      >
        <svg className="w-4 h-4 stroke-[#6E6355]" fill="none" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.6 1.6 0 0 0 15 19.4a1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.09A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.09A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.6a1.6 1.6 0 0 0 .97-1.47V3a2 2 0 1 1 4 0v.09A1.6 1.6 0 0 0 15 4.6a1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9v0a1.6 1.6 0 0 0 1.47.97H21a2 2 0 1 1 0 4h-.09a1.6 1.6 0 0 0-1.47.97z" />
        </svg>
      </button>

      {/* Complete Printable / Capturable Area */}
      <div id="captureArea" ref={captureRef} className="max-w-[560px] mx-auto bg-[#FAF2DE] pb-6">
        <Header settings={settings} count={letters.length} loading={loading} />

        <Clothesline
          letters={letters}
          mineMap={mineMap}
          onSelectLetter={(l) => setSelectedLetter(l)}
          loading={loading}
          onRetry={loadData}
        />

        <footer id="foot" className="px-6 pb-24 text-center text-[12px] text-[#A79880] leading-relaxed">
          이름과 함께 남긴 편지는 {settings.fullTarget || '강윤찬에게'} 그대로 전달됩니다.
        </footer>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-0 z-30 w-full max-w-[560px] p-3 sm:p-4 bg-gradient-to-t from-[#FAF2DE] via-[#FAF2DE]/90 to-transparent flex gap-2.5">
        <button
          type="button"
          id="saveImgBtn"
          onClick={handleCaptureImage}
          disabled={capturing || letters.length === 0}
          className="flex-1 h-[54px] bg-[#FFFCF4] border border-[#DBCBA5] hover:bg-[#FAF4E3] disabled:bg-[#ECE4D0] disabled:text-[#A89B84] text-[#6F5730] font-bold text-[15px] rounded-[14px] shadow-[0_4px_16px_rgba(120,90,35,0.15)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>🖼️</span>
          <span>{capturing ? '저장 중…' : '이미지로 저장'}</span>
        </button>

        <button
          type="button"
          id="writeBtn"
          onClick={() => {
            setEditingLetter(null);
            setIsWriteOpen(true);
          }}
          disabled={settings.closed}
          className="flex-[1.4] h-[54px] bg-[#8A6D3F] hover:bg-[#6F5730] disabled:bg-[#CFC1A2] text-[#FFF8E9] font-bold text-[15.5px] rounded-[14px] shadow-[0_8px_20px_rgba(120,90,35,0.24)] transition-all cursor-pointer flex items-center justify-center"
        >
          {settings.closed ? '편지 마감' : '내 편지 걸기'}
        </button>
      </div>

      {/* Modals */}
      <WriteModal
        isOpen={isWriteOpen}
        editingLetter={editingLetter}
        onClose={() => setIsWriteOpen(false)}
        onSubmit={handleSubmitLetter}
      />

      <ReadModal
        letter={selectedLetter}
        isMine={isAuthor}
        isClosed={settings.closed}
        onClose={() => setSelectedLetter(null)}
        onEdit={() => {
          setEditingLetter(selectedLetter);
          setSelectedLetter(null);
          setIsWriteOpen(true);
        }}
        onDelete={() => {
          if (selectedLetter) handleDeleteLetter(selectedLetter.id);
        }}
      />

      <ImagePreviewModal
        imgUrl={previewImgUrl}
        recipientName={settings.name}
        onClose={() => setPreviewImgUrl(null)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        settings={settings}
        onClose={() => setIsAdminOpen(false)}
        onSettingsSaved={(newSettings) => setSettings(newSettings)}
        showToast={showToast}
      />

      <Toast message={toastMsg} />
    </div>
  );
}
