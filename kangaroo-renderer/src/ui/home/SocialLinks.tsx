import YouTubeIcon from '@mui/icons-material/YouTube';
import { Box, IconButton, Tooltip } from '@mui/material';
import { SOCIAL_LINKS } from './homeContent';
import { TikTokIcon, XiaohongshuIcon } from './brandIcons';

const ICONS = {
  youtube: YouTubeIcon,
  xiaohongshu: XiaohongshuIcon,
  tiktok: TikTokIcon,
} as const;

const COLORS: Record<string, string> = {
  youtube: '#ff0000',
  xiaohongshu: '#ff2442',
  tiktok: '#010101',
};

export function SocialLinks() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
      {SOCIAL_LINKS.map((link) => {
        const Icon = ICONS[link.id];
        const isPlaceholder = link.href === '#';
        return (
          <Tooltip key={link.id} title={isPlaceholder ? `${link.label}（即将开放）` : link.label}>
            <span>
              <IconButton
                component="a"
                href={link.href}
                target={isPlaceholder ? undefined : '_blank'}
                rel={isPlaceholder ? undefined : 'noreferrer'}
                disabled={isPlaceholder}
                aria-label={link.label}
                sx={{
                  bgcolor: 'background.paper',
                  color: COLORS[link.id],
                  boxShadow: '0 4px 14px rgba(31, 36, 48, 0.1)',
                  '&:hover': { bgcolor: 'background.paper', opacity: 0.85 },
                }}
              >
                <Icon />
              </IconButton>
            </span>
          </Tooltip>
        );
      })}
    </Box>
  );
}
