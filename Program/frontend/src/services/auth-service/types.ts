export type RoleResponseDTO = {
    id: string | null;
    name: string;
    color?: string | null;
    permissions: string[];
};

export type CreateRoleRequestDTO = {
    name: string;
    permissions: string[];
    color?: string | null;
};

export type UpdateRoleRequestDTO = {
    name: string;
    permissions: string[];
    color?: string | null;
};

export type UserRolesResponseDTO = {
    userId: string;
    roles: string[];
};
