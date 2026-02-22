import { grey, blue } from './palette/colors';

const componentOverrides = {
  MuiCssBaseline: {
    styleOverrides: {
      '*': { scrollbarWidth: 'thin' },
      'h1, h2, h3, h4, h5, h6, p': { margin: 0 },
    },
  },
  MuiAppBar: {
    defaultProps: { color: 'inherit' },
    styleOverrides: {
      root: { boxShadow: 'none' },
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: 8,
      },
      outlined: {
        borderColor: grey[300],
      },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: `1px solid ${grey[200]}`,
        backgroundImage: 'none',
      },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontSize: '14px',
        fontWeight: 600,
        borderRadius: 8,
        padding: '8px 16px',
        lineHeight: 1.429,
      },
      sizeLarge: {
        fontSize: '16px',
        padding: '10px 22px',
        lineHeight: 1.375,
      },
      sizeSmall: {
        padding: '6px 10px',
        lineHeight: 1.286,
      },
      startIcon: { marginRight: 4, '& > *:nth-of-type(1)': { fontSize: 16 } },
      endIcon: { marginLeft: 4, '& > *:nth-of-type(1)': { fontSize: 16 } },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        borderRadius: 6,
      },
      sizeSmall: {
        height: 22,
        fontSize: '0.75rem',
      },
      sizeMedium: {
        height: 26,
      },
    },
  },
  MuiTextField: {
    defaultProps: { variant: 'outlined', size: 'small' },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: grey[300],
          borderWidth: 1,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: grey[400],
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: blue[500],
          borderWidth: 2,
        },
      },
      input: {
        padding: '8px 16px',
        height: '2rem',
        fontSize: 14,
      },
      inputSizeSmall: {
        padding: '8px 12px',
        height: '1.625rem',
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: { fontSize: 14 },
    },
  },
  MuiSelect: {
    styleOverrides: {
      select: {
        '&:focus': {
          backgroundColor: 'transparent',
          borderRadius: 8,
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        boxShadow: '6px 33px 46px 0px rgba(0,0,0,0.07), 1px 20px 19px 0px rgba(0,0,0,0.03)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        padding: '10px 16px',
        borderRadius: 8,
        color: grey[600],
        '&:hover': { backgroundColor: grey[100] },
        '&.Mui-selected': {
          backgroundColor: blue[50],
          color: blue[500],
          '&:hover': { backgroundColor: blue[50] },
        },
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: { color: 'inherit', minWidth: 36 },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: 14,
        minHeight: 40,
        padding: '8px 16px',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: 40 },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: { padding: 0 },
      switchBase: { padding: 0, margin: 2 },
      thumb: { boxShadow: 'none', backgroundColor: grey[50] },
      track: {
        backgroundColor: grey[300],
        opacity: '1 !important',
        borderRadius: 12,
      },
      sizeMedium: { height: 24, width: 36 },
      sizeSmall: { height: 20, width: 32 },
    },
  },
  MuiTooltip: {
    defaultProps: { arrow: true, placement: 'top' },
    styleOverrides: {
      tooltip: {
        backgroundColor: grey[800],
        fontSize: '0.75rem',
        padding: '8px 10px',
      },
      arrow: { color: grey[800] },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: { '& .MuiSnackbarContent-root': { borderRadius: 8 } },
    },
  },
  MuiDataGrid: {
    defaultProps: {
      disableRowSelectionOnClick: true,
      disableColumnMenu: true,
      columnHeaderHeight: 48,
    },
    styleOverrides: {
      root: {
        border: 'none',
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: grey[50],
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        },
        '& .MuiDataGrid-columnSeparator': {
          display: 'none',
        },
        '& .MuiDataGrid-cell': {
          fontSize: 14,
          color: grey[600],
          borderBottom: `1px solid ${grey[200]}`,
        },
        '& .MuiDataGrid-footerContainer': {
          backgroundColor: grey[50],
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          borderTop: 'none',
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: grey[50],
        },
        '& .MuiDataGrid-row.Mui-selected': {
          backgroundColor: `${blue[50]}`,
          '&:hover': { backgroundColor: blue[50] },
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      separator: { fontSize: 16 },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: { borderRadius: 2 },
      bar: { borderRadius: 2 },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      circle: { strokeLinecap: 'round' },
    },
  },
  MuiStack: {
    defaultProps: { useFlexGap: true },
  },
  MuiTypography: {
    defaultProps: { variantMapping: { subtitle2: 'p' } },
  },
};

export default componentOverrides;
