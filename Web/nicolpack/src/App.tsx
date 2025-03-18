import { useState } from 'react'
import './App.css'
import { makeStyles, CssBaseline, createTheme, ThemeProvider } from '@material-ui/core';


const theme = createTheme({
    palette: {
        primary: {
            main: "#333996",
            light: '#3c44b126'
        },
        secondary: {
            main: "#f83245",
            light: '#f8324526'
        },
        background: {
            default: "#f4f5fd"
        },
    },
    overrides: {
        MuiAppBar: {
            root: {
                transform: 'translateZ(0)'
            }
        }
    },
    props: {
        MuiIconButton: {
            disableRipple: true
        }
    }
})

const useStyles = makeStyles({
    appMain: {
        paddingLeft: '20px',
        width: '100%'
    }
})

function App() {
    const classes = useStyles();

  return (
      <ThemeProvider theme={theme}>
          <div className={classes.appMain}>
          <h1></h1>
          </div>
          <CssBaseline />
      </ThemeProvider>
  )
}

export default App
