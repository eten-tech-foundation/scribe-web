import { USER_ROLES } from '@/utils/constants';

export const rolesUtils = {
  getRoleNameById: (id: string | number) => USER_ROLES.find(role => role.id === Number(id))?.name,
  getRoleIdByName: (name: string) => USER_ROLES.find(role => role.name === name)?.id,
};
