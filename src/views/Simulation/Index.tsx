// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

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


const LearnCenter = () => {
  // ** Hook

  return (
    <Grid container sx={{maxWidth: '1152px', margin: '0 auto'}}>
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
    </Grid>
  );
  
}


export default LearnCenter
