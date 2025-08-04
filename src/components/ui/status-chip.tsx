// StatusChip Component
import React from 'react';

interface StatusChipProps {
  status: 'invited' | 'verified';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
  const statusClasses =
    status === 'invited' ? 'bg-[#E7E4DD] text-[#525044]' : 'bg-[#007EA7] text-[#FFFFFF]';

  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
