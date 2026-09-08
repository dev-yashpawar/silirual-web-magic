export type Role = "member" | "guardian" | "professional";

export type LangCode = "en" | "hi" | "as" | "bn" | "mni" | "ne" | "brx" | "kha" | "lus" | "kok";

export type TextSize = "normal" | "large" | "xlarge";

export type GuardianPermission =
  | "view_activity"
  | "view_progress"
  | "manage_reminders"
  | "upload_memories"
  | "view_memories"
  | "receive_alerts"
  | "manage_settings";

export type ProfessionalPermission =
  | "view_history"
  | "view_trends"
  | "view_adherence"
  | "view_alerts"
  | "add_observations"
  | "view_reports";

export interface Settings {
  language: LangCode;
  textSize: TextSize;
  voice: boolean;
  voiceSpeed: "slow" | "normal";
  haptics: boolean;
  reducedMotion: boolean;
  comfortableSpeed: boolean;
}

export interface Member {
  id: string;
  name: string;
  age: number;
  region: string;
  language: LangCode;
  connectionCode: string;
  status: "active" | "attention";
  interests: string[];
  hometown: string;
  occupation: string;
}

export interface Guardian {
  id: string;
  name: string;
  relation: string;
  memberIds: string[];
  language: LangCode;
  permissions: GuardianPermission[];
}

export interface CareProfessional {
  id: string;
  name: string;
  kind: "ASHA Worker" | "Doctor" | "Nurse" | "Specialist" | "Counsellor" | "Other Healthcare Professional";
  memberIds: string[];
  permissions: ProfessionalPermission[];
}

export interface Connection {
  id: string;
  memberId: string;
  personName: string;
  personRole: Role;
  relation: string;
  status: "connected" | "pending" | "expired";
  permissions: string[];
  durationDays?: number;
}

export interface FamilyMember {
  id: string;
  memberId: string;
  name: string;
  relation: string;
  emoji: string;
}

export interface Memory {
  id: string;
  memberId: string;
  albumId?: string;
  title: string;
  people: string;
  place: string;
  year: number;
  occasion: string;
  story: string;
  theme: "family" | "home" | "festival" | "nature" | "music" | "people";
  emoji: string;
  imageUrl?: string;
  offline: boolean;
}

export interface MemoryAlbum {
  id: string;
  memberId: string;
  title: string;
  count: number;
  offline: boolean;
  emoji: string;
}

export type GameId = "pattern" | "find" | "match" | "signals";

export interface GameSession {
  id: string;
  memberId: string;
  gameId: GameId;
  level: number;
  accuracy: number;
  responseMs: number;
  attempts: number;
  completed: boolean;
  date: string;
}

export type ReminderKind =
  | "medicine"
  | "hydration"
  | "exercise"
  | "meal"
  | "activity"
  | "appointment"
  | "routine";

export interface Reminder {
  id: string;
  memberId: string;
  kind: ReminderKind;
  time: string;
  labelKey: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  emoji: string;
}

export interface Alert {
  id: string;
  memberId: string;
  emoji: string;
  titleKey: string;
  detail: string;
  when: string;
  tone: "info" | "attention";
}

export interface ProfessionalNote {
  id: string;
  memberId: string;
  author: string;
  date: string;
  activity: string;
  note: string;
  followUp: string;
}

export interface ProgressPoint {
  day: string;
  games: number;
  memories: number;
  adherence: number;
  hydration: number;
}

export interface NostalgiaPreference {
  memberId: string;
  preferredThemes: string[];
  engagementScore: number;
  lastEngaged: string;
}

export interface DailyActivity {
  id: string;
  memberId: string;
  date: string;
  gamesPlayed: number;
  memoriesViewed: number;
  remindersCompleted: number;
  remindersTotal: number;
  hydrationGlasses: number;
  hydrationGoal: number;
}

export interface RootsCard {
  key: string;
  emoji: string;
  titleKey: string;
  detailKey: string;
}
