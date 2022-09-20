const colors = {
  primaryColor1: '#2f54eb',
  primaryColor2: '#1d39c4',
  primaryColor3: '#10239e',
  primaryColor4: '#061178',
  neutralColor1: '#ffffff',
  neutralColor2: '#F5F5F5',
  neutralColor3: '#1f1f1f',
  neutralColor4: '#65676C',
  neutralColor5: '#4B4B4B',
  borderColor1: '#D9D9D9',
};

const themes = {
  space: [0, 8, 16, 24, 32, 48],
  fontSizes: [12, 14, 16, 20, 24, 30, 38],
  fontWeights: [400, 500, 700],
  colors: {
    ...colors,
  },
  buttons: {
    primary: {
      color: colors.neutralColor1,
      backgroundColor: colors.primaryColor1,
      '&:hover, &:focus': {
        color: colors.neutralColor1,
        backgroundColor: colors.primaryColor2,
      },
      '&:active': {
        color: colors.neutralColor1,
        backgroundColor: colors.primaryColor3,
      },
    },
  },
};

export default themes;
