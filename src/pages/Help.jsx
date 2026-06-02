import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    id: 'method',
    title: '核心方法论：梳理—合并—突破',
    content: `这套方法适合脑子里长期并行很多线索的人（CEO、创业者、主理人）。

第一步：梳理（清空脑子）
把脑子里所有未闭环的事情倒出来。不分类、不判断，先倒干净。可以是任务、焦虑、灵感、待办、想法、人名，任何东西。

第二步：合并（翻译成行动）
把散乱的想法翻译成可处理的对象。每个想法到底是一个情绪、一个判断、一个项目、还是一个任务？5 个碎片问题可能本质是同一个杠杆点。

第三步：突破（打穿主战役）
每周只定 1-2 个主战役，48 小时内必须推进。一天结束时，看的是「这个问题有没有被打穿一层」，不是「做了多少事」。`,
  },
  {
    id: 'install',
    title: '怎么安装到手机',
    content: `1. iPhone Safari 打开雷达地址
2. 点底部「分享」按钮（方框+箭头图标）
3. 往下滑找到「添加到主屏幕」
4. 确认添加 → 桌面出现「雷达」图标
5. 以后从桌面图标打开，全屏运行

离线也能用：加载过一次后，没网也能正常使用。`,
  },
  {
    id: 'capture',
    title: '倾倒：把想法倒出来',
    content: `倾倒页面是核心入口。脑子里有什么想法、焦虑、待办，直接写下来。

原则：不分类、不判断、不排序。有多少倒多少，倒干净为止。

也可以点右下角紫色 + 号按钮，在任何页面快速倾倒。

语音输入：点麦克风按钮可以语音输入（需要网络）。从主屏幕打开时语音可能不可用，建议用 Safari。`,
  },
  {
    id: 'inbox',
    title: '待处理池：翻译成任务',
    content: `倾倒的内容自动进入待处理池。你需要逐条处理：

变成任务 → 选优先级（主战役/重要/普通）和类别（突破/清债/关系）
不需要 → 标记为已处理，不创建任务
删除 → 彻底移除

关键动作：把脑内语言变成执行语言。`,
  },
  {
    id: 'tasks',
    title: '任务池：管理执行',
    content: `五个状态：
○ 未开始 → ◉ 进行中 → ● 已完成 → ⏸ 暂停
点左侧图标循环切换状态。

展开任务卡片可以：
- 记录推进进展
- 分配到周一~周日
- 删除任务

右上角「不做」入口：战略性放弃的事放这里。`,
  },
  {
    id: 'week',
    title: '本周：主战役 + 节奏',
    content: `主战役区域：点 + 号设定本周要打穿什么 + 48 小时推进计划。

七天节奏表：
周一 梳理日 — 清空脑子，确定主线
周二 突破日 — 打穿最重要事项
周三 关系日 — 处理人和协作
周四 突破日 — 第二次深度推进
周五 清债日 — 清理悬挂、回复
周六日 休息 — 家庭 / 恢复`,
  },
  {
    id: 'stats',
    title: '数据：看趋势',
    content: `本周概览：完成数、任务总数、完成率。

时间分配饼图：看突破/清债/关系三类占比。如果清债占比太高，说明你一直在处理琐事。

周趋势柱状图：过去 8 周对比。看趋势比看单周更重要。

主战役历史：回顾每周在打穿什么。`,
  },
  {
    id: 'rhythm',
    title: '推荐工作节奏',
    content: `周一：梳理日 — 倒想法 → 翻译 → 定主战役 → 分配到天
周二/周四：突破日 — 集中推进主战役，记录进展
周三：关系日 — 团队沟通、合作伙伴
周五：清债日 — 清理积压 + 下午收口复盘
每天：随时倾倒 — 有想法就点 + 号，周一再统一处理

硬约束：每次梳理结束，必须选出一个 48 小时内要推进的突破点。否则梳理会变成高级内耗。`,
  },
  {
    id: 'data',
    title: '数据安全',
    content: `数据存在你手机浏览器的 localStorage 里，不上传任何服务器。

风险：清除浏览器缓存会丢失数据。

建议：每周在「设置 → 导出数据」备份 JSON 文件。换设备时用「导入数据」恢复。`,
  },
]

function AccordionItem({ section, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-light)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'none',
          textAlign: 'left',
        }}
      >
        <div style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{section.title}</span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: '0 0 14px 26px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
          }}
        >
          {section.content}
        </div>
      )}
    </div>
  )
}

export default function Help() {
  const navigate = useNavigate()
  const [openId, setOpenId] = useState(null)

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>使用手册</div>
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>基于「梳理—合并—突破」方法论</div>
        </div>
      </div>

      <div className="card" style={{ padding: '4px 16px' }}>
        {SECTIONS.map((section) => (
          <AccordionItem
            key={section.id}
            section={section}
            isOpen={openId === section.id}
            onToggle={() => setOpenId(openId === section.id ? null : section.id)}
          />
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          你不是每天平均产出型
          <br />
          而是周期性清空、合并、突破型
        </div>
      </div>
    </div>
  )
}
