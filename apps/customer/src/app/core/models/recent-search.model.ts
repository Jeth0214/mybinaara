export interface RecentSearchProduct {
  id: number;
  name: string;
  category: string;
  image_url: string | null;
  storeCount: number;
  viewedAt: Date;
}
