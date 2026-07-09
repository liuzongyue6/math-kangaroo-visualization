import { Box, Typography } from '@mui/material';
import type { QrItem } from './homeContent';

type QrCodeGalleryProps = {
  items: QrItem[];
  /** Tile width in px. Use a smaller size (e.g. 110) for compact, inline
   * strips such as the AP Calculus preview card. */
  size?: number;
};

/** Renders nothing when items is empty, so the section can be emptied out
 * without leaving a visual gap. */
export function QrCodeGallery({ items, size = 160 }: QrCodeGalleryProps) {
  if (items.length === 0) return null;

  // Compact strips (e.g. the AP Calculus preview card) keep the smaller
  // caption; larger standalone galleries get a more readable one.
  const captionVariant = size >= 180 ? 'subtitle1' : 'caption';

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            width: size,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: 2,
            boxShadow: '0 4px 14px rgba(31, 36, 48, 0.08)',
          }}
        >
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}${item.imageSrc.replace(/^\//, '')}`}
            alt={item.title}
            sx={{
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'contain',
              borderRadius: 2,
              bgcolor: 'background.default',
            }}
          />
          <Typography
            variant={captionVariant}
            sx={{ display: 'block', mt: 1.5, fontWeight: 700 }}
          >
            {item.title}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
