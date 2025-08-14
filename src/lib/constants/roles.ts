export const ROLES = {
  1: 'Manager',
  2: 'Translator',
} as const;

export const roleOptions = [
  { value: '1', label: 'Manager' },
  { value: '2', label: 'Translator' },
];

export const getRoleLabel = (roleNumber: number): string => {
  return ROLES[roleNumber as keyof typeof ROLES];
};
