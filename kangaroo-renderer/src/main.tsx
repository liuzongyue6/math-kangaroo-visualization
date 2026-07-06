import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppBar,
  Alert,
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';
import '@fontsource/roboto/700.css';
import { theme } from './theme';
import { ProblemPlayer } from './player/ProblemPlayer';
import type { ProblemConfig, ProblemManifest, ProblemManifestEntry } from './types/problem';
import './index.css';

/** "MK_G1_2" -> "Grade 1-2"; falls back to the raw grade string if unparseable. */
function formatGradeLabel(grade: string): string {
  const match = grade.match(/G(\d+)_(\d+)/);
  if (!match) return grade;
  return `Grade ${match[1]}-${match[2]}`;
}

function App() {
  const [manifest, setManifest] = useState<ProblemManifestEntry[] | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [config, setConfig] = useState<ProblemConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}problems/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load problem manifest');
        return r.json();
      })
      .then((data: ProblemManifest) => {
        setManifest(data.problems);
        if (data.problems.length > 0) {
          setSelected(data.problems[0].id);
        }
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!manifest || !selected) return;
    const problem = manifest.find((p) => p.id === selected);
    if (!problem) return;

    setConfig(null);
    setError(null);

    fetch(`${import.meta.env.BASE_URL}${problem.path}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${import.meta.env.BASE_URL}${problem.path}`);
        return r.json();
      })
      .then((data: ProblemConfig) => setConfig(data))
      .catch((e: Error) => setError(e.message));
  }, [manifest, selected]);

  const grouped = useMemo(() => {
    if (!manifest) return [];
    const grades = Array.from(new Set(manifest.map((p) => p.grade))).sort();
    return grades.map((grade) => ({
      grade,
      problems: manifest
        .filter((p) => p.grade === grade)
        .slice()
        .sort((a, b) => a.year.localeCompare(b.year)),
    }));
  }, [manifest]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ gap: 3, flexWrap: 'wrap', py: 1.5 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
            🦘 Math Kangaroo Visualizations
          </Typography>
          <FormControl size="small" sx={{ minWidth: 260, ml: 'auto' }}>
            <InputLabel id="problem-select-label">Problem</InputLabel>
            <Select
              labelId="problem-select-label"
              label="Problem"
              value={selected}
              onChange={handleChange}
              disabled={!manifest || manifest.length === 0}
            >
              {grouped.map((group) => [
                <MenuItem key={group.grade} disabled divider sx={{ opacity: 1, fontWeight: 700 }}>
                  {formatGradeLabel(group.grade)}
                </MenuItem>,
                ...group.problems.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ pl: 3 }}>
                    {p.title}
                  </MenuItem>
                )),
              ])}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 6, pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        {!error && config && <ProblemPlayer key={config.meta.id} config={config} />}
        {!error && !config && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 8, color: 'text.secondary' }}>
            <CircularProgress size={22} />
            <Typography>Loading problem…</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
