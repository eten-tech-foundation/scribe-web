export interface User {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'invited' | 'verified';
}

// Mock data
export const mockUsers: User[] = [
  {
    id: '1',
    displayName: 'Alice Johnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@company.com',
    role: 'Organization Manager',
    status: 'verified',
  },
  {
    id: '2',
    displayName: 'Bob Smith',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob@company.com',
    role: 'Team Member',
    status: 'verified',
  },
  {
    id: '3',
    displayName: 'Carol Davis',
    firstName: 'Carol',
    lastName: 'Davis',
    email: 'carol@company.com',
    role: 'Team Member',
    status: 'invited',
  },
  {
    id: '4',
    displayName: 'David Wilson',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david@company.com',
    role: 'Team Lead',
    status: 'verified',
  },
  {
    id: '5',
    displayName: 'Eva Brown',
    firstName: 'Eva',
    lastName: 'Brown',
    email: 'eva@company.com',
    role: 'Team Member',
    status: 'invited',
  },
];
