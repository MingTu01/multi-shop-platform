// Logo 组件 - 多店管理平台品牌标识
import type { SVGProps } from 'react';

export interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
}

/**
 * MSP Logo - 翡翠绿主题，现代几何风格
 */
export function Logo({ size = 32, showText = true, ...props }: LogoProps) {
  return (
    <svg
      width={showText ? size * 4 : size}
      height={size}
      viewBox={showText ? '0 0 128 32' : '0 0 32 32'}
      fill="none"
      aria-label="多店管理平台"
      {...props}
    >
      {/* Logo 图标部分 - 翡翠绿渐变 */}
      <defs>
        <linearGradient id="msp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* 主图标：三层叠加的几何图形代表多店 */}
      <rect x="2" y="6" width="12" height="20" rx="2" fill="url(#msp-gradient)" opacity="0.3" />
      <rect x="10" y="4" width="12" height="22" rx="2" fill="url(#msp-gradient)" opacity="0.6" />
      <rect x="18" y="2" width="12" height="24" rx="2" fill="url(#msp-gradient)" />
      
      {/* 连接线代表统一管理 */}
      <path d="M8 16 L14 16 L20 16" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <circle cx="8" cy="16" r="2" fill="#059669" opacity="0.8" />
      <circle cx="14" cy="16" r="2" fill="#059669" opacity="0.8" />
      <circle cx="20" cy="16" r="2" fill="#059669" opacity="0.8" />
      
      {/* 文字部分 */}
      {showText && (
        <text
          x="36"
          y="22"
          fill="#0f172a"
          fontSize="14"
          fontWeight="600"
          fontFamily="system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
        >
          多店管理平台
        </text>
      )}
    </svg>
  );
}