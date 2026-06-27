// Text strings — every visible label lives here. Editable from admin panel.
export type LangMode = "id" | "zh" | "id_zh" | "zh_id";

export const TEXT_KEYS = [
  "appTitle", "appSubtitle", "companyName", "eventName",
  "stats_total", "stats_remaining", "stats_winners", "stats_round",
  "btn_spin", "btn_reset_round", "btn_reset_all", "btn_next_round",
  "btn_admin", "btn_login", "btn_logout", "btn_close", "btn_confirm", "btn_cancel",
  "winners_title", "winner_label", "select_winners_count", "winners_per_round",
  "no_participants", "loading", "spinning", "congrats",
  "admin_title", "admin_general", "admin_participants", "admin_theme",
  "admin_text", "admin_sound", "admin_history", "admin_decorations",
  "presentation_mode", "exit_fullscreen",
] as const;
export type TextKey = (typeof TEXT_KEYS)[number];

type Dict = Record<TextKey, string>;

const id: Dict = {
  appTitle: "BULAN KESELAMATAN PRODUKSI 2026",
  appSubtitle: "SAFETY LUCKY DRAW",
  companyName: "Nama Perusahaan",
  eventName: "Undian Keberuntungan K3",
  stats_total: "Total Peserta",
  stats_remaining: "Sisa Peserta",
  stats_winners: "Total Pemenang",
  stats_round: "Putaran",
  btn_spin: "PUTAR RODA",
  btn_reset_round: "Reset Putaran",
  btn_reset_all: "Reset Semua Pemenang",
  btn_next_round: "Putaran Berikutnya",
  btn_admin: "Panel Admin",
  btn_login: "Masuk",
  btn_logout: "Keluar",
  btn_close: "Tutup",
  btn_confirm: "Konfirmasi",
  btn_cancel: "Batal",
  winners_title: "PEMENANG",
  winner_label: "Pemenang",
  select_winners_count: "Jumlah Pemenang",
  winners_per_round: "Pemenang per Putaran",
  no_participants: "Belum ada peserta. Tambahkan dari Panel Admin.",
  loading: "Memuat…",
  spinning: "Sedang berputar…",
  congrats: "Selamat!",
  admin_title: "Panel Administrator",
  admin_general: "Umum",
  admin_participants: "Peserta",
  admin_theme: "Tema",
  admin_text: "Teks",
  admin_sound: "Suara",
  admin_history: "Riwayat",
  admin_decorations: "Dekorasi",
  presentation_mode: "Mode Presentasi",
  exit_fullscreen: "Keluar Layar Penuh",
};

const zh: Dict = {
  appTitle: "2026 年生产安全月",
  appSubtitle: "安全幸运抽奖",
  companyName: "公司名称",
  eventName: "职业健康与安全抽奖",
  stats_total: "参与人数",
  stats_remaining: "剩余人数",
  stats_winners: "中奖人数",
  stats_round: "轮次",
  btn_spin: "开始抽奖",
  btn_reset_round: "重置本轮",
  btn_reset_all: "重置全部中奖者",
  btn_next_round: "下一轮",
  btn_admin: "管理面板",
  btn_login: "登录",
  btn_logout: "退出",
  btn_close: "关闭",
  btn_confirm: "确认",
  btn_cancel: "取消",
  winners_title: "中奖者",
  winner_label: "中奖者",
  select_winners_count: "中奖人数",
  winners_per_round: "每轮中奖人数",
  no_participants: "暂无参与者，请在管理面板添加。",
  loading: "加载中…",
  spinning: "抽奖中…",
  congrats: "恭喜！",
  admin_title: "管理员面板",
  admin_general: "通用",
  admin_participants: "参与者",
  admin_theme: "主题",
  admin_text: "文本",
  admin_sound: "音效",
  admin_history: "记录",
  admin_decorations: "装饰",
  presentation_mode: "演示模式",
  exit_fullscreen: "退出全屏",
};

// For combined modes we join Indo and Mandarin with a newline so the UI
// renders Indonesian on top and Mandarin below (CSS: whitespace-pre-line).
export const DEFAULT_TEXTS: Record<LangMode, Dict> = {
  id,
  zh,
  id_zh: Object.fromEntries(
    (Object.keys(id) as TextKey[]).map((k) => [k, `${id[k]}\n${zh[k]}`])
  ) as Dict,
  zh_id: Object.fromEntries(
    (Object.keys(id) as TextKey[]).map((k) => [k, `${id[k]}\n${zh[k]}`])
  ) as Dict,
};
