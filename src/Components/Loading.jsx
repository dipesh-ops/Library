import React from 'react';

const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm'>
      <div className='w-12 h-12 border-3 border-b border-[#32735a] rounded-full animate-spin'></div>
      {text && <p className='mt-4 font-medium text-brand'>{text}</p>}
    </div>
  );
};

export default Loading;