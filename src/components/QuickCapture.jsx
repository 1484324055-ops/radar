import { useState, useEffect, useRef } from 'react'
import { X, Mic, MicOff, Send } from 'lucide-react'
import useStore from '../stores/useStore'
import useVoice from '../hooks/useVoice'

export default function QuickCapture() {
  const [text, setText] = useState('')
  const showQuickCapture = useStore((s) => s.showQuickCapture)
  const closeQuickCapture = useStore((s) => s.closeQuickCapture)
  const addCapture = useStore((s) => s.addCapture)
  const inputRef = useRef(null)
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useVoice()
  const prevTranscriptRef = useRef('')

  useEffect(() => {
    if (showQuickCapture && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showQuickCapture])

  useEffect(() => {
    if (transcript && transcript !== prevTranscriptRef.current) {
      setText((prev) => {
        const newPart = transcript.slice(prevTranscriptRef.current.length)
        return prev + newPart
      })
      prevTranscriptRef.current = transcript
    }
  }, [transcript])

  const handleSubmit = () => {
    const content = text.trim()
    if (!content) return
    addCapture(content)
    setText('')
    resetTranscript()
    closeQuickCapture()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!showQuickCapture) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeQuickCapture}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          background: 'var(--bg-secondary)',
          borderRadius: '20px 20px 0 0',
          padding: '20px',
          paddingBottom: 'calc(20px + var(--sab))',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>倾倒想法</span>
          <button onClick={closeQuickCapture} style={{ background: 'none', color: 'var(--text-tertiary)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="脑子里在想什么？直接倒出来..."
          rows={4}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '16px',
            color: 'var(--text-primary)',
            resize: 'none',
            width: '100%',
            outline: 'none',
            marginBottom: '12px',
          }}
        />

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isListening ? 'var(--danger-bg)' : 'var(--accent-bg)',
                color: isListening ? 'var(--danger)' : 'var(--accent)',
                transition: 'all 0.2s',
              }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: text.trim() ? 'var(--accent)' : 'var(--bg-input)',
              color: text.trim() ? '#fff' : 'var(--text-tertiary)',
              fontWeight: 600,
              fontSize: '15px',
              transition: 'all 0.2s',
            }}
          >
            <Send size={16} />
            存入
          </button>
        </div>

        {isListening && (
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--danger)', textAlign: 'center' }}>
            正在录音...
          </div>
        )}
      </div>
    </div>
  )
}
