export interface UserRetentionData {
  date: string;
  newUsers: number;
  returningUsers: number;
  totalSessions: number;
}

export interface EntityExtractionResult {
  entities: {
    id: string;
    label: string;
    type: string;
    confidence: number;
    abstract: string;
  }[];
  relationships: {
    source: string;
    target: string;
    type: string;
    strength: number;
  }[];
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
  }[];
}

export interface AdminStats {
  totalUsers: number;
  activeFaculty: number;
  pendingApprovals: number;
  totalStudents: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}
