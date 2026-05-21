import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function MobileFilterDropdown({
  label,
  options,
  value,
  onChange,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || label;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop / tablet (>=640px): pill row */}
      <div className="hidden sm:block glass rounded-xl p-2 sm:p-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                value === option.value
                  ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan neon-text-cyan'
                  : 'glass text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile (<640px): dropdown */}
      <div className="sm:hidden relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl glass text-left transition-all ${className} ${
            isOpen ? 'ring-2 ring-neon-cyan/50' : 'hover:bg-white/10'
          }`}
        >
          <span className="text-sm">{displayLabel}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 glass rounded-xl overflow-hidden max-h-72 overflow-y-auto"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-all ${
                    value === option.value
                      ? 'bg-neon-cyan/20 text-neon-cyan'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
