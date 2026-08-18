export interface RawJoobleJob {
  title: string;
  location?: string | null;
  snippet?: string | null;
  salary?: string | number | null;
  source?: string | null;
  type?: string | null;
  link?: string | null;
  company?: string | null;
  updated?: string | null;
  id: string | number;
}

export interface RawJoobleResponse {
  totalCount: number;
  jobs?: RawJoobleJob[] | null;
}
