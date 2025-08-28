export interface Room {
  id: string;
  name: string;
  isPublic: boolean;
  categorySlug: string;
  limit: number;
  joinCode: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  categoryName: string;
  totalPlayers: number;
}
