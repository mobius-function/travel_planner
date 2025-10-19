export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Itinerary {
  origin?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  days: DayPlan[];
}

export interface DayPlan {
  day: number;
  date?: string;
  title: string;
  activities: string[];
  transportation?: string;
  accommodation?: string;
}
