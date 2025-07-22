export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  username: string;
}

export interface Column {
  key: string;
  label: string;
  accessor: (user: User) => React.ReactNode;
}

export interface UserFormValues {
  email: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
}
