import { getRoleBg, getRoleColor, getRoleLabel, type Role } from '@msp/shared';
import { cn } from '../../_internal/cn';

export interface RoleBadgeProps {
  role: Role;
  className?: string;
}

/**
 * 角色徽章 - 复用 @msp/shared ROLE_CONFIG 的颜色与中文标签
 */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        getRoleBg(role),
        getRoleColor(role),
        className,
      )}
    >
      {getRoleLabel(role)}
    </span>
  );
}
