import React from 'react';

export type SearchCategory = 'General' | 'Health' | 'Emotion' | 'Business' | 'Education' | 'Creative';

export interface SearchSource {
  title?: string;
  uri: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface SearchResult {
  markdownText: string;
  sources: SearchSource[];
}

export enum SearchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface NavItem {
  id: SearchCategory;
  label: string;
  icon: React.ReactNode;
}