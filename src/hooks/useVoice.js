import { useState, useRef, useCallback } from 'react'

export default function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const isStandalone = typeof window !== 'undefined' && window.navigator.standalone === true
  const hasAPI = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  // iOS PWA standalone mode may have the API but it often fails
  const isSupported = hasAPI && !isStandalone

  const startListening = useCallback(() => {
    if (!hasAPI) return
    setError(null)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript
      }
      setTranscript(finalTranscript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('麦克风权限被拒绝，请在设置中允许')
      } else if (event.error === 'network') {
        setError('语音识别需要网络连接')
      } else {
        setError('语音识别不可用，请手动输入')
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
      setTranscript('')
    } catch (e) {
      setError('语音识别启动失败，请手动输入')
      setIsListening(false)
    }
  }, [hasAPI])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return { isListening, transcript, error, startListening, stopListening, resetTranscript, isSupported, isStandalone }
}
