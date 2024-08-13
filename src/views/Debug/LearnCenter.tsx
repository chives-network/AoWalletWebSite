import { useState, useEffect, Fragment } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

import { useAuth } from '@/hooks/useAuth'

import AoSendMsgModel from './AoSendMsgModel'
import AoCreateProcessModel from './AoCreateProcessModel'
import AoGetPageRecordsModel from './AoGetPageRecordsModel'
import AoGetMessageModel from './AoGetMessageModel'
import AoWalletModel from './AoWalletModel'


const LearnCenter = () => {
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
                  Loading Wallet Status
              </Grid>
          </Grid>
      )}
      {loadingWallet == 2 && (
          <Grid container spacing={5}>
              <Grid item xs={12} justifyContent="flex-end">
                  Please Connect Wallet First
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
              <AoGetPageRecordsModel auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ mt: 6 }}>
              <AoGetMessageModel auth={auth} />
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ mt: 6, mb: 6 }}>
              <AoCreateProcessModel auth={auth} />
            </Card>
          </Grid>
        </Fragment>
      )}
    </Grid>
  );
  
}

export default LearnCenter
