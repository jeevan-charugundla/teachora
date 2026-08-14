import { useState } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlashcardsPreviewProps {
  data: any;
}

export function FlashcardsPreview({ data }: FlashcardsPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!data || !data.cards || data.cards.length === 0) return null;

  const cards = data.cards;
  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center pb-2">
        <span className="bg-lime-50 text-lime-800 border border-lime-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
          {data.subject} • {data.grade} • {cards.length} Cards
        </span>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1.5">{data.title}</h2>
      </div>

      {/* Main Flashcard Interactive Canvas */}
      <div className="relative perspective-1000 min-h-[300px] flex items-center justify-center">
        <motion.div
          key={currentCard.id + (isFlipped ? '-back' : '-front')}
          initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full min-h-[280px] p-8 rounded-3xl border text-center flex flex-col justify-between cursor-pointer transition-all shadow-md select-none ${
            isFlipped
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950 ring-2 ring-emerald-300'
              : 'bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)]'
          }`}
        >
          {/* Card Category / Tag */}
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            <span>{currentCard.category || 'Vocabulary'}</span>
            <span className="text-[10px] bg-[var(--color-surface-elevated)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
              {isFlipped ? 'Answer / Definition' : 'Click to Flip'}
            </span>
          </div>

          {/* Card Body */}
          <div className="py-6 my-auto">
            {isFlipped ? (
              <div className="space-y-3">
                <p className="text-base sm:text-lg font-semibold leading-relaxed">
                  {currentCard.back}
                </p>
                {currentCard.mnemonic && (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-900 text-xs px-3 py-1 rounded-full font-medium mt-2">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Memory Tip: {currentCard.mnemonic}</span>
                  </div>
                )}
              </div>
            ) : (
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                {currentCard.front}
              </h3>
            )}
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)] font-semibold border-t border-[var(--color-border)] pt-3">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span className="inline-flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Flip Card
            </span>
          </div>
        </motion.div>
      </div>

      {/* Navigation Toolbar */}
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          onClick={handlePrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        <div className="flex items-center gap-2">
          {cards.map((_: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? 'w-6 bg-[var(--color-primary-600)]' : 'w-2 bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
