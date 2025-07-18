export type Categories = 'decades' | 'genres' | 'popularity';

export interface SidebarCategory {
  name: Categories;
  items: {
    name: string;
    trackCount: number;
    artistCount: number;
  }[];
}
