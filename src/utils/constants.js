export const THEMES = ['light', 'dark', 'warm']

export const THEME_LABELS = {
  light: '浅色',
  dark: '深色',
  warm: '暖光',
}

export const STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  PAUSED: 'paused',
  NOT_DOING: 'not-doing',
}

export const STATUS_LABELS = {
  'not-started': '未开始',
  'in-progress': '进行中',
  done: '已完成',
  paused: '暂停',
  'not-doing': '不做',
}

export const STATUS_ICONS = {
  'not-started': '○',
  'in-progress': '◐',
  done: '●',
  paused: '⏸',
  'not-doing': '✕',
}

export const PRIORITY = {
  CAMPAIGN: 'campaign',
  IMPORTANT: 'important',
  NORMAL: 'normal',
}

export const PRIORITY_LABELS = {
  campaign: '主战役',
  important: '重要',
  normal: '普通',
}

export const CATEGORY = {
  BREAKTHROUGH: 'breakthrough',
  DEBT: 'debt',
  RELATION: 'relation',
}

export const CATEGORY_LABELS = {
  breakthrough: '突破',
  debt: '清债',
  relation: '关系',
}

export const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export const DAY_ROLES = [
  { name: '梳理日', desc: '清空脑子，确定本周主线', type: 'review' },
  { name: '突破日', desc: '打穿本周最重要事项', type: 'breakthrough' },
  { name: '关系日', desc: '处理人和协作', type: 'relation' },
  { name: '突破日', desc: '第二次深度推进', type: 'breakthrough' },
  { name: '清债日', desc: '清理悬挂、回复、补资料', type: 'debt' },
  { name: '休息日', desc: '家庭 / 恢复', type: 'rest' },
  { name: '休息日', desc: '家庭 / 恢复', type: 'rest' },
]
