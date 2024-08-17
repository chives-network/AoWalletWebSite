// ** React Imports
import { useEffect, useState, Fragment } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import ChivesChat from './ChivesChat'
import ChivesChatOnlyChat from './ChivesChatOnlyChat'
import Chatroom from './Chatroom'
import Token from './Token'
import TokenOnlySendAndMint from './TokenOnlySendAndMint'
import MyProcessTxIds from './MyProcessTxIds'
import ChivesLottery from './ChivesLottery'
import ChivesFaucet from './ChivesFaucet'
import ChivesServerData from './ChivesServerData'
import ChivesEmail from './ChivesEmail'
import ChivesSwap from './ChivesSwap'
import ToolHelpText from '@views/Help/Tool'

import { useAuth } from '@/hooks/useAuth'

const LearnCenter = () => {
  // ** Hook

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
    
    handleResize();

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
                  <ToolHelpText />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 1 && (
        <Fragment>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesSwap auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesFaucet auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesChat auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesChatOnlyChat auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesEmail auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesServerData />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesLottery auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <Chatroom auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <Token auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <TokenOnlySendAndMint auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, mb: 6 }}>
              <MyProcessTxIds auth={auth} />
            </Card>
          </Grid>
        </Fragment>
      )}
    </Grid>
  );
  
}


export default LearnCenter
