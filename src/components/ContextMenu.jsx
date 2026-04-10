import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContextMenu = ({ x, y, options, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if menu goes off screen
  const menuWidth = 220;
  const menuHeight = options.length * 40 + 20;
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-[999] glass py-2 rounded-xl border border-white/10 shadow-2xl min-w-[220px]"
        style={{ left: adjustedX, top: adjustedY }}
      >
        {options.map((option, index) => (
          <React.Fragment key={index}>
            {option.separator ? (
              <div className="my-1 border-t border-white/5" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  option.onClick();
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-all hover:bg-white/5 ${
                  option.danger ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'
                }`}
              >
                {option.icon && <option.icon size={16} />}
                <span>{option.label}</span>
              </button>
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextMenu;
