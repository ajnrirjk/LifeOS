import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLifeOS } from '../../context/LifeOSContext';
import { Search, X, Plus, Trash2 } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export const LaunchpadModal: React.FC = () => {
  const { apps, launchApp, isLaunchpadOpen, setIsLaunchpadOpen, deleteApp } = useLifeOS();
  const [search, setSearch] = useState('');

  if (!isLaunchpadOpen) return null;

  const filteredApps = apps.filter(a => 
    !search.trim() || 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase()) || 
    a.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 bg-black/80 p-6 sm:p-12 flex flex-col items-center justify-between text-white select-none"
      >
        {/* Top search & close */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 350 }}
          className="w-full max-w-xl flex items-center justify-between gap-4"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search LifeOS apps..."
              autoFocus
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-sm font-semibold focus:outline-none focus:bg-white/20 transition-all placeholder:text-stone-400"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sounds.playTap();
              setIsLaunchpadOpen(false);
            }}
            className="p-2.5 rounded-full hover:bg-white/10 text-stone-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Grid of Apps */}
        <div className="my-auto w-full max-w-4xl py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.035
                }
              }
            }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 sm:gap-8 justify-items-center"
          >
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.7, y: 20 },
                  visible: { 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: { type: 'spring', stiffness: 380, damping: 22 }
                  }
                }}
                className="flex flex-col items-center gap-2 group relative"
              >
                <motion.button
                  whileHover={{ scale: 1.12, y: -4 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  onClick={() => {
                    launchApp(app.id);
                    setIsLaunchpadOpen(false);
                  }}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-3xl shadow-xl bg-gradient-to-tr ${app.color} ring-1 ring-white/20`}
                >
                  <span>{app.emoji}</span>
                </motion.button>

                <span className="text-xs sm:text-sm font-bold text-center text-stone-200 max-w-[90px] line-clamp-1 group-hover:text-white transition-colors">
                  {app.title}
                </span>

                {/* Delete button for custom user-created apps */}
                {!app.isSystem && (
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteApp(app.id);
                    }}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Delete custom app"
                  >
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-stone-400 font-semibold pb-4"
        >
          LifeOS v2.0 • Complete Spiritual Ecosystem & App Creator
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
