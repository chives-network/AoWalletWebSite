// ** MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const Faucet = () => {
  return (
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 6 }}>Please Connect Wallet First</Typography>
              
              <Typography variant="h5" sx={{ mb: 3 }}>Faucet Functions:</Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
              Faucet is a Faucet aggregation for Token.
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
              Users only need to click on a Token to receive a certain amount of Token
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
              Users can receive a certain amount of Token at once or daily.
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
              If you are a project owner, you can recharge amount to extend the usage time of the Faucet.
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
              If the Faucet balance is insufficient, the Faucet will automatically hide this token.
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
              If you want to join your token in the Faucet, please contact AoWallet.
              </Typography>
              

            </CardContent>
          </CardContent>
        </Grid>
      </Grid>
  )
}

export default Faucet
