// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'

import AoSendMsgModel from './AoSendMsgModel'
import AoCreateProcessModel from './AoCreateProcessModel'
import AoGetPageRecordsModel from './AoGetPageRecordsModel'
import AoGetMessageModel from './AoGetMessageModel'
import AoWalletModel from './AoWalletModel'


const LearnCenter = () => {
  // ** Hook

  return (
    <Grid container sx={{maxWidth: '1152px', margin: '0 auto'}}>
      <Grid item xs={12}>
        <Card sx={{ mt: 6 }}>
          <AoWalletModel />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card sx={{ mt: 6 }}>
          <AoSendMsgModel />
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
    </Grid>
  );
  
}


export default LearnCenter
