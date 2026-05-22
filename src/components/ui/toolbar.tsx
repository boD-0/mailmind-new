'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Bold, Italic, Link, Heading, Quote, Highlighter,
  AlignLeft, AlignCenter, AlignRight, Palette,
  Underline, Strikethrough,
} from 'lucide-react'
import { useState } from 'react'

interface ToolbarButtonProps {
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
  onClick: () => void
  tooltip: string | null
  showTooltip: (label: string) => void
  hideTooltip: () => void
}

function ToolbarButton({
  label,
  icon: Icon,
  isActive,
  onClick,
  tooltip,
  showTooltip,
  hideTooltip,
}: ToolbarButtonProps) {
  return (
    <div
      className="relative"
      onMouseEnter={() => showTooltip(label)}
      onMouseLeave={hideTooltip}
    >
      <button
        className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors duration-200 ${
          isActive ? 'bg-[#ff5f5f]/15 text-[#ff5f5f]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
        } focus:outline-none`}
        aria-label={label}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" />
      </button>
      {tooltip === label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="text-nowrap font-medium absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-md px-2 py-1 shadow-lg z-50"
        >
          {label}
        </motion.div>
      )}
    </div>
  )
}

export interface ToolbarProps {
  onAction?: (action: string) => void
  className?: string
}

export function Toolbar({ onAction, className = '' }: ToolbarProps) {
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left')
  const [activeButtons, setActiveButtons] = useState<string[]>([])
  const [tooltip, setTooltip] = useState<string | null>(null)

  const toggleActiveButton = (button: string) => {
    setActiveButtons((prev) =>
      prev.includes(button)
        ? prev.filter((b) => b !== button)
        : [...prev, button]
    )
    onAction?.(button)
  }

  const showTooltip = (label: string) => setTooltip(label)
  const hideTooltip = () => setTooltip(null)

  const handleAlign = (align: 'left' | 'center' | 'right') => {
    setTextAlign(align)
    onAction?.(`align-${align}`)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`${className} flex items-center gap-1 p-1 bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg shadow-black/5 flex-wrap`}
      >
        {/* Text Formatting */}
        <ToolbarButton label="Bold" icon={Bold} isActive={activeButtons.includes('bold')} onClick={() => toggleActiveButton('bold')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
        <ToolbarButton label="Italic" icon={Italic} isActive={activeButtons.includes('italic')} onClick={() => toggleActiveButton('italic')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
        <ToolbarButton label="Underline" icon={Underline} isActive={activeButtons.includes('underline')} onClick={() => toggleActiveButton('underline')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
        <ToolbarButton label="Strikethrough" icon={Strikethrough} isActive={activeButtons.includes('strikethrough')} onClick={() => toggleActiveButton('strikethrough')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />

        <div className="w-px h-6 bg-gray-200 mx-0.5" />

        <ToolbarButton label="Link" icon={Link} isActive={activeButtons.includes('link')} onClick={() => toggleActiveButton('link')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
        <ToolbarButton label="Heading" icon={Heading} isActive={activeButtons.includes('heading')} onClick={() => toggleActiveButton('heading')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
        <ToolbarButton label="Quote" icon={Quote} isActive={activeButtons.includes('quote')} onClick={() => toggleActiveButton('quote')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />

        <div className="w-px h-6 bg-gray-200 mx-0.5" />

        <ToolbarButton label="Highlight" icon={Highlighter} isActive={activeButtons.includes('highlight')} onClick={() => toggleActiveButton('highlight')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
        <ToolbarButton label="Change Color" icon={Palette} isActive={activeButtons.includes('color')} onClick={() => toggleActiveButton('color')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />

        <div className="w-px h-6 bg-gray-200 mx-0.5" />

        <ToolbarButton label="Align Left" icon={AlignLeft} isActive={textAlign === 'left'} onClick={() => handleAlign('left')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
        <ToolbarButton label="Align Center" icon={AlignCenter} isActive={textAlign === 'center'} onClick={() => handleAlign('center')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
        <ToolbarButton label="Align Right" icon={AlignRight} isActive={textAlign === 'right'} onClick={() => handleAlign('right')} tooltip={tooltip} showTooltip={showTooltip} hideTooltip={hideTooltip} />
      </motion.div>
    </AnimatePresence>
  )
}
