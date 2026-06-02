import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'
import useStore from '../stores/useStore'
import useVoice from '../hooks/useVoice'

export default function Capture() {
  const [text, setText] = useState('')
  const addCapture = useStore((s) => s.addCapture)
  const captures = useStore((s) => s.captures)
  const inputRef = useRef(null)
  const { isListening, transcript, error: voiceError, startListening, stopListening, resetTranscript, isSupported, isStandalone } = useVoice()

  useEffect(() => {
    if (transcript) setText(transcript)
  }, [transcript])

  const handleSubmit = () => {
    const content = text.trim()
    if (!content) return
    addCapture(content)
    setText('')
    resetTranscript()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const recentCaptures = captures.filter((c) => !c.processed).slice(0, 5)

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>倾倒</div>
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>脑子里在想什么？直接倒出来，不分类、不判断</div>
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="写下来..."
          rows={6}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '16px',
            color: 'var(--text-primary)',
            resize: 'none',
            flex: 1,
            minHeight: '150px',
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isListening ? 'var(--danger)' : 'var(--accent-bg)',
                color: isListening ? '#fff' : 'var(--accent)',
                transition: 'all 0.2s',
                boxShadow: isListening ? 'var(--shadow-md)' : 'none',
              }}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: text.trim() ? 'var(--accent)' : 'var(--bg-input)',
              color: text.trim() ? '#fff' : 'var(--text-tertiary)',
              fontWeight: 600,
              fontSize: '16px',
              transition: 'all 0.2s',
            }}
          >
            <Send size={18} />
            存入待处理
          </button>
        </div>

        {isListening && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            正在录音，说完点击停止...
          </div>
        )}

        {voiceError && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'var(--warning-bg)',
              color: 'var(--warning)',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            {voiceError}
          </div>
        )}

        {isStandalone && !voiceError && (
          <div
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-tertiary)',
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            从主屏幕打开时语音可能不可用，建议用 Safari 打开使用语音功能
          </div>
        )}
      </div>

      {/* Recent */}
      {recentCaptures.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>最近倾倒</div>
          {recentCaptures.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '10px',
                marginBottom: '6px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
              }}
            >
              {c.content.length > 80 ? c.content.slice(0, 80) + '…' : c.content}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
