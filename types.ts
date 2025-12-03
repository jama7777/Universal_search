import React from 'react';

export type SearchCategory = 'General' | 'Health' | 'Emotion' | 'Business' | 'Education' | 'Creative';

export interface SearchSource {
  title?: string;
  uri: string;
}

export interface SearchResult {
  markdownText: string;
  sources: SearchSource[];
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: SearchSource[];
  timestamp: number;
}

// Replaced enum with const object + type for better runtime safety
export const SearchStatus = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

export type SearchStatus = typeof SearchStatus[keyof typeof SearchStatus];

export interface NavItem {
  id: SearchCategory;
  label: string;
  icon: React.ReactNode;
}

export interface SearchSession {
  id: string;
  title: string;
  category: SearchCategory;
  messages: ChatMessage[];
  status: SearchStatus;
  error: string | null;
  lastUpdated: number;
}