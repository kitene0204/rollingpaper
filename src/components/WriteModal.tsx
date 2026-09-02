import React, { useState, useEffect } from 'react';
import { Letter } from '../types';

interface WriteModalProps {
  isOpen: boolean;
  editingLetter: Letter | null;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    role: string;
    grade: string;
    classNo: string;
    message: string;
  }) => Promise<void>;
}

export const WriteModal: React.FC<WriteModalProps> = ({
  isOpen,
  editingLetter,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('학생');
  const [grade, setGrade] = useState('');
  const [classNo, setClassNo] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingLetter) {
      setName(editingLetter.name || '');
      setRole(editingLetter.role || '학생');
      setGrade(editingLetter.grade ? String(editingLetter.grade) : '');
      setClassNo(editingLetter.classNo ? String(editingLetter.classNo) : '');
      setMessage(editingLetter.message || '');
    } else {
      // Load saved preferences if available
      try {
        setName(localStorage.getItem('rp_saved_name') || '');
        setRole(localStorage.getItem('rp_saved_role') || '학생');
        setGrade(localStorage.getItem('rp_saved_grade') || '');
        setClassNo(localStorage.getItem('rp_saved_class') || '');
      } catch (e) {}
      setMessage('');
    }
    setError('');
  }, [editingLetter, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('이름을 적어 주세요.');
      return;
    }
    if (!role) {
      setError('구분(학생·교직원·학부모)을 골라 주세요.');
      return;
    }
    if (role === '학생' && (!grade.trim() || !classNo.trim())) {
      setError('학년과 반을 숫자로 적어 주세요.');
      return;
    }
    if (!message.trim()) {
      setError('편지 내용을 적어 주세요.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      // Save local preferences
      try {
        localStorage.setItem('rp_saved_name', name.trim());
        localStorage.setItem('rp_saved_role', role);
        if (role === '학생') {
          localStorage.setItem('rp_saved_grade', grade.trim());
          localStorage.setItem('rp_saved_class', classNo.trim());
        }
      } catch (e) {}

      await onSubmit({
        name: name.trim(),
        role,
        grade: grade.trim(),
        classNo: classNo.trim(),
        message: message.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || '편지를 보내지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(40,30,15,0.45)] flex items-end sm:items-center justify-center p-0 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[92dvh] overflow-y-auto bg-[#FAF2DE] border border-[#EFE3C6] rounded-t-[20px] sm:rounded-[18px] p-5 sm:p-6 shadow-[0_18px_52px_rgba(70,50,15,0.32)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-gaegu text-[26px] font-bold text-[#4A3F2F]">
            {editingLetter ? '편지 고치기' : '편지 쓰기'}
          </h2>
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

        {/* Sender Name */}
        <label className="block text-[12.5px] font-semibold text-[#8A7A5C] mt-3 mb-1.5">
          이름
        </label>
        <input
          type="text"
          maxLength={12}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 적어 주세요"
          className="w-full h-[48px] px-3.5 bg-[#FFFCF4] border border-[#EADFC2] rounded-[12px] font-gaegu text-[20px] text-[#3E362B] focus:outline-none focus:border-[#CBAE79] focus:ring-2 focus:ring-[#CBAE79]/20"
        />

        {/* Role Chips */}
        <label className="block text-[12.5px] font-semibold text-[#8A7A5C] mt-4 mb-1.5">
          누구신가요
        </label>
        <div className="flex gap-2">
          {['학생', '교직원', '학부모'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 h-[46px] rounded-[12px] border text-[14.5px] font-medium cursor-pointer transition-colors ${
                role === r
                  ? 'bg-[#8A6D3F] border-[#8A6D3F] text-[#FFF8E9] font-bold shadow-sm'
                  : 'bg-[#FFFCF4] border-[#EADFC2] text-[#7C6E56] hover:bg-[#FAF4E3]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Grade / Class (Only for students) */}
        {role === '학생' && (
          <div className="mt-3.5">
            <label className="block text-[12.5px] font-semibold text-[#8A7A5C] mb-1.5">
              학년 · 반
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={grade}
                onChange={(e) => setGrade(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="학년"
                className="flex-1 h-[48px] px-3.5 bg-[#FFFCF4] border border-[#EADFC2] rounded-[12px] font-gaegu text-[20px] text-[#3E362B] text-center focus:outline-none focus:border-[#CBAE79]"
              />
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={classNo}
                onChange={(e) => setClassNo(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="반"
                className="flex-1 h-[48px] px-3.5 bg-[#FFFCF4] border border-[#EADFC2] rounded-[12px] font-gaegu text-[20px] text-[#3E362B] text-center focus:outline-none focus:border-[#CBAE79]"
              />
            </div>
          </div>
        )}

        {/* Message Input */}
        <label className="block text-[12.5px] font-semibold text-[#8A7A5C] mt-4 mb-1.5">
          편지
        </label>
        <textarea
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="여기에 마음을 적어 주세요"
          rows={5}
          className="w-full min-h-[160px] p-3.5 lined-paper border border-[#EADFC2] rounded-[12px] font-gaegu text-[19px] leading-[34px] text-[#41392D] resize-none focus:outline-none focus:border-[#CBAE79] focus:ring-2 focus:ring-[#CBAE79]/20"
        />
        <div className="text-right text-[12px] text-[#9C8C6E] mt-1">
          {message.length} / 500
        </div>

        {error && (
          <div className="mt-2.5 text-[13px] text-[#B3452F] bg-rose-50/80 p-2.5 rounded-[10px] border border-rose-200">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-[52px] mt-4 bg-[#8A6D3F] hover:bg-[#6F5730] disabled:bg-[#CFC1A2] text-[#FFF8E9] text-[16px] font-bold rounded-[14px] shadow-[0_4px_14px_rgba(120,90,35,0.25)] transition-all cursor-pointer"
        >
          {submitting
            ? '보내는 중…'
            : editingLetter
            ? '고친 내용 저장'
            : '마음 보내기'}
        </button>
      </div>
    </div>
  );
};
