import { createTheme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import shadows from './shadows';
import componentOverrides from './componentOverrides';

const theme = createTheme({
  palette,
  typography,
  shadows,
  shape: { borderRadius: 8 },
  components: componentOverrides,
});

export default theme;
