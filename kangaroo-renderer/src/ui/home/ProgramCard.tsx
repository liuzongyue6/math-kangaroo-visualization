import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import type { ProgramCard as ProgramCardData } from './homeContent';
import { QrCodeGallery } from './QrCodeGallery';

type ProgramCardProps = {
  data: ProgramCardData;
  onSelect?: () => void;
};

export function ProgramCard({ data, onSelect }: ProgramCardProps) {
  const isAvailable = data.status === 'available';
  const isComingSoon = data.status === 'coming-soon';
  const isPreview = data.status === 'preview';

  return (
    <Card
      onClick={isAvailable ? onSelect : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        cursor: isAvailable ? 'pointer' : 'default',
        opacity: isComingSoon ? 0.72 : 1,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': isAvailable
          ? { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(31, 36, 48, 0.16)' }
          : undefined,
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: 40, lineHeight: 1 }}>{data.icon}</Box>
          {isComingSoon && (
            <Chip label="Coming Soon" size="small" color="default" sx={{ fontWeight: 700 }} />
          )}
          {isPreview && (
            <Chip label="扫码预览" size="small" color="secondary" sx={{ fontWeight: 700 }} />
          )}
        </Box>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {data.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {data.subtitle}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ flex: isPreview ? 0 : 1 }}>
          {data.description}
        </Typography>

        {isPreview && data.qrItems && (
          <Box sx={{ mt: 0.5 }}>
            <QrCodeGallery items={data.qrItems} size={110} />
          </Box>
        )}

        {!isPreview && (
          <Button
            variant={isAvailable ? 'contained' : 'outlined'}
            disabled={!isAvailable}
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) onSelect?.();
            }}
            sx={{ mt: 1 }}
          >
            {data.ctaLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
