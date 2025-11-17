export interface Activity {
  id: number;
  timestamp: string;
  type: string;
  userName: string;
  userRole: string;
  userAvatarUrl?: string | null;
  metadata: { [key: string]: any };
}
