// ** MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const Tool = () => {
  return (
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 6 }}>Please Connect Wallet First</Typography>
              
              <Typography variant="h5" sx={{ mb: 3 }}>Tool Functions (Only for developer):</Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                1 Simulation Chatroom 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                2 Simulation Chives Chat 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                3 Simulation Chives Chat Only Chat 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                4 Simulation Chives Email 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                5 Simulation Chives Faucet 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                6 Simulation Chives Lottery 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                7 Simulation Chives Server Data 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                8 Simulation Token 
              </Typography>

            </CardContent>
          </CardContent>
        </Grid>
      </Grid>
  )
}

export default Tool
