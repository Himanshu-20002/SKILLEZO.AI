export interface NormalizedLocation {
  raw: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface NormalizedSalary {
  raw: string;
}

export interface NormalizedExternalJob {
  externalId: string;
  sourceType: "external";
  sourceProvider: string;
  title: string;
  companyName: string;
  description: string;
  location: NormalizedLocation;
  employmentType?: string;
  salary?: NormalizedSalary;
  sourceUrl: string;
  sourceName: string;
  sourceUpdatedAt?: Date;
}
