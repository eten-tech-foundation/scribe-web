import React from 'react';

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onClick }) => {
  return (
    <button
      className='hover:border-[#B4B1A3]] m-auto my-1 flex h-[40px] w-8/9 cursor-pointer items-center px-4 py-3 text-gray-700 transition-colors duration-150 hover:rounded-md hover:border hover:border-[#B4B1A3] hover:bg-gray-50'
      onClick={onClick}
    >
      <span className='mr-3 text-gray-500'>{icon}</span>
      <span className='text-sm font-medium'>{text}</span>
    </button>
  );
};

export default MenuItem;
