import { useState, useEffect, Fragment } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'

import { useAuth } from '@/hooks/useAuth'

import AoSendMsgModel from './AoSendMsgModel'
import AoCreateProcessModel from './AoCreateProcessModel'
import AoGetPageRecordsModel from './AoGetPageRecordsModel'
import AoGetMessageModel from './AoGetMessageModel'
import AoWalletModel from './AoWalletModel'
import DebugHelpText from '@views/Help/Debug'


const LearnCenter = () => {
  const auth = useAuth()

  const [loadingWallet, setLoadingWallet] = useState<number>(0)

  useEffect(()=>{
    if(auth && auth.connected == false) {
        setLoadingWallet(2)
    }
    if(auth && auth.connected == true && auth.address) {
        setLoadingWallet(1)
    }
  }, [auth])

  const [windowWidth, setWindowWidth] = useState('1152px');
  useEffect(() => {
    const handleResize = () => {
      if(window.innerWidth >=1920)   {
        setWindowWidth('1392px');
      }
      else if(window.innerWidth < 1920 && window.innerWidth > 1440)   {
        setWindowWidth('1152px');
      }
      else if(window.innerWidth <= 1440 && window.innerWidth > 1200)   {
        setWindowWidth('1152px');
      }
      else if(window.innerWidth <= 1200 && window.innerWidth > 900)   {
        setWindowWidth('852px');
      }
      else if(window.innerWidth <= 900)   {
        setWindowWidth('90%');
      }
      console.log("window.innerWidth1 ", window.innerWidth)
      console.log("window.windowWidth2 ", windowWidth)
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  
  return (
    <Grid container sx={{maxWidth: windowWidth, margin: '0 auto'}}>
      {loadingWallet == 0 && (
          <Grid container spacing={5}>
            <Grid item xs={12} justifyContent="center">
              <Card sx={{ my: 6, width: '100%', height: '800px' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  Loading Wallet Status
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 2 && (
          <Grid container spacing={5}>
            <Grid item xs={12} justifyContent="center">
              <Card sx={{ my: 6, width: '100%', height: '800px' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <DebugHelpText />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 1 && (
        <Fragment>
          <Grid item xs={12}>
            <Card sx={{ mt: 6 }}>
              <AoWalletModel auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6 }}>
              <AoSendMsgModel auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6 }}>
              <AoGetPageRecordsModel />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6 }}>
              <AoGetMessageModel />
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ mt: 6, mb: 6 }}>
              <AoCreateProcessModel />
            </Card>
          </Grid>
        </Fragment>
      )}
    </Grid>
  );
  
}

export default LearnCenter
