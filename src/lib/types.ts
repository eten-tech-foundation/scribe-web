export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: number;
  status?: string;
  organization: number;
  createdBy?: number;
  isActive?: boolean;
}
