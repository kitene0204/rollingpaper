import React, { useState } from 'react';
import { Settings } from '../types';
import { getApiUrl, setApiUrl, sendPostApi } from '../api';

interface AdminModalProps {
  isOpen: boolean;
  settings: Settings;
  onClose: () => void;
  onSettingsSaved: (newSettings: Settings) => void;
  showToast: (msg: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSettingsSaved,
  showToast,
}) => {
  const [pin, setPin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Settings fields
  const [name, setName] = useState(settings.name || '');
  const [title, setTitle] = useState(settings.title || '');
  const [org, setOrg] = useState(settings.org || '');
  const [deadline, setDeadline] = useState(settings.deadline || '');
  const [newPin, setNewPin] = useState('');
  const [customApi, setCustomApi] = useState(getApiUrl());

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!pin) {
      setError('비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await sendPostApi<Settings>('adminLogin', { pin });
      setIsLoggedIn(true);
      setAdminPin(pin);
      setName(data.name || '');
      setTitle(data.title || '');
      setOrg(data.org || '');
      setDeadline(data.deadline || '');
    } catch (err: any) {
      setError(err.message || '비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');

    try {
      const updated = await sendPostApi<Settings>('saveSettings', {
        pin: adminPin,
        name: name.trim(),
        title: title.trim(),
        org: org.trim(),
        deadline: deadline.trim(),
      });
      onSettingsSaved(updated);
      showToast('설정이 성공적으로 저장되었습니다.');
      onClose();
    } catch (err: any) {
      setError(err.message || '저장하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiUrl = () => {
    setApiUrl(customApi);
    showToast('구글 스프레드시트 API 주소가 변경되었습니다.');
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(40,30,15,0.45)] flex items-center justify-center p-4 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] max-h-[90dvh] overflow-y-auto bg-[#FAF2DE] border border-[#EFE3C6] rounded-[18px] p-5 sm:p-6 shadow-[0_18px_52px_rgba(70,50,15,0.32)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-gaegu text-[24px] font-bold text-[#4A3F2F]">관리자 설정</h2>
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

        {!isLoggedIn ? (
          <div>
            <label className="block text-[12.5px] font-semibold text-[#8A7A5C] mb-1.5">
              관리자 비밀번호
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="비밀번호 (초기값: 1234)"
              className="w-full h-[48px] px-3.5 bg-[#FFFCF4] border border-[#EADFC2] rounded-[12px] text-[#3E362B] focus:outline-none focus:border-[#CBAE79]"
            />
            {error && <div className="mt-2 text-[13px] text-[#B3452F]">{error}</div>}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-[48px] mt-4 bg-[#8A6D3F] hover:bg-[#6F5730] text-[#FFF8E9] font-bold rounded-[12px] cursor-pointer"
            >
              {loading ? '확인 중…' : '들어가기'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-gaegu text-[20px] font-bold text-[#6E6355] mb-2">화면 설정</h3>
              <label className="block text-[12px] font-semibold text-[#8A7A5C] mb-1">
                받는 분 이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 강윤찬"
                className="w-full h-[44px] px-3 bg-[#FFFCF4] border border-[#EADFC2] rounded-[10px] text-[#3E362B] mb-2.5"
              />

              <label className="block text-[12px] font-semibold text-[#8A7A5C] mb-1">
                호칭
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 선생님, 원장님 (비우면 ~에게)"
                className="w-full h-[44px] px-3 bg-[#FFFCF4] border border-[#EADFC2] rounded-[10px] text-[#3E362B] mb-2.5"
              />

              <label className="block text-[12px] font-semibold text-[#8A7A5C] mb-1">
                학교(기관) 이름
              </label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="예: 전주삼천초등학교"
                className="w-full h-[44px] px-3 bg-[#FFFCF4] border border-[#EADFC2] rounded-[10px] text-[#3E362B] mb-2.5"
              />

              <label className="block text-[12px] font-semibold text-[#8A7A5C] mb-1">
                받는 기간 마감
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="예: 2026-09-30 23:59 (비우면 상시)"
                className="w-full h-[44px] px-3 bg-[#FFFCF4] border border-[#EADFC2] rounded-[10px] text-[#3E362B]"
              />

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full h-[46px] mt-3 bg-[#8A6D3F] hover:bg-[#6F5730] text-[#FFF8E9] font-bold rounded-[10px] cursor-pointer"
              >
                {loading ? '저장 중…' : '설정 저장'}
              </button>
            </div>

            <div className="pt-3 border-t border-dashed border-[#DBCBA5]">
              <h3 className="font-gaegu text-[18px] font-bold text-[#6E6355] mb-2">연동 API 주소</h3>
              <input
                type="text"
                value={customApi}
                onChange={(e) => setCustomApi(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full h-[40px] px-2.5 bg-[#FFFCF4] border border-[#EADFC2] rounded-[8px] text-[12px] text-[#3E362B] font-mono mb-2"
              />
              <button
                type="button"
                onClick={handleSaveApiUrl}
                className="w-full h-[40px] border border-[#8A6D3F] text-[#8A6D3F] hover:bg-[#FAF4E3] text-[13px] font-bold rounded-[8px] cursor-pointer"
              >
                API 주소 변경 적용
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
