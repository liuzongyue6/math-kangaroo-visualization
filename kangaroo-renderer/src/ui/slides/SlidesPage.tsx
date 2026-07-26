import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { SLIDE_GRADE_LABELS } from './slidesContent';
import type { SlideDeck, SlideGrade, SlideManifest } from './slidesContent';

/** Resolves a public/ path (e.g. '/slides/MK_G1_2/foo.pdf') against the
 * Vite base URL, matching the pattern used for QR code images. */
function toPublicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

const GRADE_ORDER: SlideGrade[] = ['MK_G1_2', 'MK_G5_6'];

/** Class-slide (PDF) viewer for parents: pick a lesson from the
 * grade-grouped list, preview it inline via an iframe, with an
 * "open in new tab" fallback for browsers (notably in-app/mobile
 * browsers) that don't render embedded PDFs well.
 *
 * The deck list is auto-discovered at build time — see
 * scripts/build-slides-manifest.mjs — so this component only needs to
 * fetch public/slides/manifest.json, exactly like the problem picker
 * fetches problems/manifest.json in main.tsx. */
export function SlidesPage() {
  const [decks, setDecks] = useState<SlideDeck[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}slides/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load slides manifest');
        return r.json();
      })
      .then((data: SlideManifest) => setDecks(data.decks))
      .catch((e: Error) => setError(e.message));
  }, []);

  const grouped = useMemo(() => {
    if (!decks) return [];
    return GRADE_ORDER.map((grade) => ({
      grade,
      decks: decks
        .filter((d) => d.grade === grade)
        .slice()
        .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || a.title.localeCompare(b.title)),
    })).filter((g) => g.decks.length > 0);
  }, [decks]);

  useEffect(() => {
    if (selectedId || grouped.length === 0) return;
    setSelectedId(grouped[0].decks[0].id);
  }, [grouped, selectedId]);

  const selected = decks?.find((d) => d.id === selectedId);

  if (error) {
    return (
      <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!decks) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 8, color: 'text.secondary' }}>
        <CircularProgress size={22} />
        <Typography>Loading slides…</Typography>
      </Box>
    );
  }

  if (decks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 8 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          课件即将上线 · Slides coming soon
        </Typography>
        <Typography variant="body2">老师正在整理上课课件，敬请期待。</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        width: '100%',
        alignItems: { xs: 'stretch', md: 'flex-start' },
      }}
    >
      <Paper sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0, borderRadius: 3, overflow: 'hidden' }}>
        <List dense disablePadding subheader={<li />}>
          {grouped.map((group) => (
            <li key={group.grade}>
              <ul style={{ padding: 0 }}>
                <ListSubheader sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                  {SLIDE_GRADE_LABELS[group.grade]}
                </ListSubheader>
                {group.decks.map((deck) => (
                  <ListItemButton
                    key={deck.id}
                    selected={deck.id === selectedId}
                    onClick={() => setSelectedId(deck.id)}
                  >
                    <ListItemText primary={deck.title} secondary={deck.date} />
                  </ListItemButton>
                ))}
              </ul>
            </li>
          ))}
        </List>
      </Paper>

      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        {selected && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selected.title}
              </Typography>
              <Button
                component="a"
                href={toPublicUrl(selected.fileSrc)}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon />}
              >
                在新标签页打开 / 下载
              </Button>
            </Box>
            <Paper
              variant="outlined"
              sx={{ borderRadius: 3, overflow: 'hidden', height: '80vh', bgcolor: 'background.default' }}
            >
              <Box
                component="iframe"
                src={toPublicUrl(selected.fileSrc)}
                title={selected.title}
                sx={{ width: '100%', height: '100%', border: 'none' }}
              >
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <PictureAsPdfIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography>当前浏览器不支持内嵌预览，请点击上方按钮在新标签页打开。</Typography>
                </Box>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
