import type { SvgIconProps } from '@mui/material';
import { SvgIcon } from '@mui/material';

/** Xiaohongshu (小红书 / RedNote) has no icon in @mui/icons-material, so we
 * ship a minimal brand-mark approximation: a rounded square with the
 * signature "小红书" wordmark initial. */
export function XiaohongshuIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" />
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#fff"
        fontFamily="sans-serif"
      >
        小红
      </text>
    </SvgIcon>
  );
}

/** Simplified TikTok "note" glyph, since @mui/icons-material has no
 * official TikTok icon. */
export function TikTokIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M16.6 5.82c-.7-.66-1.09-1.6-1.09-2.6h-3.05v13.36c0 1.35-1.1 2.45-2.45 2.45a2.45 2.45 0 1 1 0-4.9c.25 0 .5.04.73.1v-3.1a5.5 5.5 0 0 0-.73-.05 5.5 5.5 0 0 0 0 11 5.5 5.5 0 0 0 5.5-5.5V9.1a7.1 7.1 0 0 0 4.15 1.33V7.37a4.28 4.28 0 0 1-3.06-1.55Z"
      />
    </SvgIcon>
  );
}
