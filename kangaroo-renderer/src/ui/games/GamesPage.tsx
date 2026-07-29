import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { GAMES } from './gamesContent';
import type { GameEntry } from './gamesContent';

/** Resolves a public/ path (e.g. '/games/foo/index.html') against the
 * Vite base URL, matching SlidesPage / QR images. */
function toPublicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

/** Mini-game picker: list entries from gamesContent, embed the selected
 * HTML game in an iframe, with an "open in new tab" fallback. */
export function GamesPage() {
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    if (selectedId || GAMES.length === 0) return;
    setSelectedId(GAMES[0].id);
  }, [selectedId]);

  const selected: GameEntry | undefined = GAMES.find((g) => g.id === selectedId);

  if (GAMES.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 8 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          小游戏即将上线 · Games coming soon
        </Typography>
        <Typography variant="body2">
          把 HTML 游戏放进 public/games/ 并在 gamesContent.ts 登记后即可出现。
        </Typography>
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
        <List dense disablePadding>
          {GAMES.map((game) => (
            <ListItemButton
              key={game.id}
              selected={game.id === selectedId}
              onClick={() => setSelectedId(game.id)}
            >
              <ListItemText primary={game.title} secondary={game.description} />
            </ListItemButton>
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
                在新标签页打开
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
                allow="fullscreen"
                sx={{ width: '100%', height: '100%', border: 'none' }}
              >
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <SportsEsportsIcon sx={{ fontSize: 40, mb: 1 }} />
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
