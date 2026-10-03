import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WidgetId, ALL_DESKTOP_WIDGETS } from '../../types/widgets';
import { Plus, Check, Trash2, X, Sparkles, RefreshCw } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWidgets: WidgetId[];
  onAddWidget: (id: WidgetId) => void;
  onRemoveWidget: (id: WidgetId) => void;
  onResetDefaults: () => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  activeWidgets,
  onAddWidget,
  onRemoveWidget,
  onResetDefaults
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="w-full max-w-2xl bg-stone-900/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight">LifeOS Desktop Widgets</h2>
                <p className="text-xs text-stone-400">Add or remove widgets to customize your spiritual desktop</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Widgets List */}
          <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ALL_DESKTOP_WIDGETS.map((widget) => {
              const isAdded = activeWidgets.includes(widget.id);

              return (
                <motion.div
                  key={widget.id}
                  whileHover={{ y: -2 }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isAdded
                      ? 'bg-white/10 border-white/20 shadow-md'
                      : 'bg-black/30 border-white/10 opacity-75 hover:opacity-100 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{widget.emoji}</span>
                      <div>
                        <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          {widget.title}
                          {isAdded && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-stone-300 mt-0.5">{widget.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      {widget.category}
                    </span>

                    {isAdded ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          sounds.playTap();
                          onRemoveWidget(widget.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          sounds.playTap();
                          onAddWidget(widget.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Widget</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sounds.playTap();
                onResetDefaults();
              }}
              className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition-colors font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Default Layout</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all"
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
