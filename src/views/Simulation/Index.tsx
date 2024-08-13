// ** React Imports
import { useEffect, useState } from 'react'

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
import { Fragment } from 'react'

import { useAuth } from '@/hooks/useAuth'

const LearnCenter = () => {
  // ** Hook

  const auth = useAuth()

  const [loadingWallet, setLoadingWallet] = useState<number>(0)
  
  useEffect(()=>{
    if(auth && auth.connected == false) {
        setLoadingWallet(2)
    }
    if(auth && auth.connected == true && auth.address != '') {
        setLoadingWallet(1)
    }
  }, [auth])

  return (
    <Grid container sx={{maxWidth: '1152px', margin: '0 auto'}}>
      {loadingWallet == 0 && (
          <Grid container spacing={5}>
              <Grid item xs={12} justifyContent="flex-end">
                <Card sx={{ my: 6 }}>
                  <CardContent>
                    Loading Wallet Status
                  </CardContent>
                </Card>
              </Grid>
          </Grid>
      )}
      {loadingWallet == 2 && (
          <Grid container spacing={5}>
            <Grid item xs={12} justifyContent="flex-end">
              <Card sx={{ my: 6 }}>
                <CardContent>
                Please Connect Wallet First
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 1 && (
        <Fragment>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesFaucet />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesChat />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesChatOnlyChat />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesEmail />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesServerData />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <ChivesLottery />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <Chatroom />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <Token />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, p: 2, pb: 0 }}>
              <TokenOnlySendAndMint />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6, mb: 6 }}>
              <MyProcessTxIds />
            </Card>
          </Grid>
        </Fragment>
      )}
    </Grid>
  );
  
}


export default LearnCenter
