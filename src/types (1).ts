export interface CuratedItem {
  id: string;
  status: 'showroom' | 'archive';
  title: {
    tr: string;
    en: string;
  };
  dataAnalysis: {
    tr: string;
    en: string;
  };
  globalContext: {
    tr: string;
    en: string;
  };
  curatorInsight?: {
    tr: string;
    en: string;
  };
  deepDive?: {
    tr: string;
    en: string;
  };
  beyondPerspective?: {
    tr: string;
    en: string;
  };
  curatorSignature?: {
    tr: string;
    en: string;
  };
  glossary?: {
    term: string;
    definition: {
      tr: string;
      en: string;
    };
  }[];
  technicalSpecs?: {
    label: string;
    value: string;
  }[];
  imageUrl: string;
  visualPrompt: string;
  category: 'Space' | 'Engineering' | 'Physics' | 'Biology' | 'AI';
  author: string;
  publishDate: string;
  cycleEndDate: string;
  expiryDate: string; // For Deep Space Deletion (30 days)
  archiveCardSummary?: {
    tr: string;
    en: string;
  };
  rawData?: {
    label: string;
    value: string;
    unit?: string;
  }[];
}

export interface CycleInfo {
  currentCycle: number;
  daysRemaining: number;
  totalDays: number;
}
