import { useState } from 'react'
import { Zap, ArrowRight, Target, BarChart3, CheckCircle2 } from 'lucide-react'
import useStore from '../stores/useStore'

const STEPS = [
  {
    icon: '👋',
    title: '欢迎使用雷达',
    desc: '基于「梳理—合并—突破」方法论的个人工作台。帮你把脑子里的想法理清楚、排出来、打穿它。',
  },
  {
    icon: '🧠',
    title: '第一步：倾倒',
    desc: '脑子里有什么想法、焦虑、待办？先全部倒出来。不分类、不判断，倒干净就行。',
    action: '试试倒一条',
    placeholder: '比如：最近团队执行力不行...',
  },
  {
    icon: '🔄',
    title: '第二步：翻译',
    desc: '倾倒的内容进入「待处理池」。你把它翻译成任务：选优先级、选类别（突破/清债/关系）。',
  },
  {
    icon: '🎯',
    title: '第三步：主战役',
    desc: '每周定 1-2 个「主战役」— 本周最重要的事。48 小时内必须推进。其他任务围绕主战役展开。',
  },
  {
    icon: '📊',
    title: '第四步：看数据',
    desc: '仪表盘看全局，数据页看趋势。定期回顾：完成率怎么样？时间花在突破还是清债上？',
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [firstCapture, setFirstCapture] = useState('')
  const addCapture = useStore((s) => s.addCapture)
  const current = STEPS[step]

  const handleNext = () => {
    if (step === 1 && firstCapture.trim()) {
      addCapture(firstCapture.trim())
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Icon */}
      <div style={{ fontSize: '56px', marginBottom: '20px' }}>{current.icon}</div>

      {/* Title */}
      <div
        style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          textAlign: 'center',
        }}
      >
        {current.title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          textAlign: 'center',
          maxWidth: '320px',
          marginBottom: '24px',
        }}
      >
        {current.desc}
      </div>

      {/* Step 2: try capture */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: '320px', marginBottom: '16px' }}>
          <textarea
            value={firstCapture}
            onChange={(e) => setFirstCapture(e.target.value)}
            placeholder={current.placeholder}
            rows={3}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px',
              fontSize: '16px',
              color: 'var(--text-primary)',
              resize: 'none',
            }}
          />
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleNext}
        style={{
          padding: '14px 32px',
          borderRadius: '14px',
          background: 'var(--accent)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
        }}
      >
        {step === STEPS.length - 1 ? '开始使用' : step === 1 ? (firstCapture.trim() ? '存入并继续' : '跳过') : '继续'}
        <ArrowRight size={18} />
      </button>

      {/* Skip */}
      {step < STEPS.length - 1 && (
        <button
          onClick={onComplete}
          style={{
            marginTop: '16px',
            background: 'none',
            color: 'var(--text-tertiary)',
            fontSize: '13px',
            padding: '8px',
          }}
        >
          跳过引导
        </button>
      )}
    </div>
  )
}
