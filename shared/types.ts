// Shared TypeScript types between frontend and backend

export type PoliticalBias = 'left' | 'center' | 'right';

export type UserRole = 'admin' | 'editor';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  editor_content: string | null;
  cover_image: string | null;
  location: string | null;
  author_id: number;
  author?: User;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  status: 'draft' | 'published';
  classification?: ArticleClassification;
  coverages?: ArticleCoverage[];
  tags?: Tag[];
}

export interface MediaSource {
  id: number;
  name: string;
  url: string;
  bias_rating: PoliticalBias;
  logo_url: string | null;
  created_at: string;
}

export interface ArticleCoverage {
  id: number;
  article_id: number;
  media_source_id: number;
  media_source?: MediaSource;
  coverage_url: string;
  coverage_title: string;
  snippet: string | null;
  created_at: string;
  media_name?: string;
  media_url?: string;
  media_bias?: string;
  media_logo?: string | null;
}

export interface ArticleClassification {
  id: number;
  article_id: number;
  political_bias: PoliticalBias;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  editor_content?: string;
  cover_image?: string;
  location?: string;
  status?: 'draft' | 'published';
  political_bias?: PoliticalBias;
  tag_ids?: number[];
}

export interface CreateCoverageDto {
  media_source_id: number;
  coverage_url: string;
  coverage_title: string;
  snippet?: string;
}

export interface CreateMediaSourceDto {
  name: string;
  url: string;
  bias_rating: PoliticalBias;
  logo_url?: string;
}
