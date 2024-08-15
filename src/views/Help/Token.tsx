// ** MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const Token = () => {
  return (
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 6 }}>Please Connect Wallet First</Typography>
              
              <Typography variant="h5" sx={{ mb: 3 }}>Token Functions:</Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>1 Issue Token:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
              Support for setting Token's symbol, name, total supply, etc.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>2 Mint Token:</strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Mint a certain amount of Token for existing Tokens.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>3 Airdrop Token:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Support for sending Tokens to multiple addresses and amounts at once.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>4 All Token Transaction Records:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                View all send and receive records for the entire Token.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>5 My Transaction Records:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                All transaction records for the current user.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>6 Send Records:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                View send records for the entire Token.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>7 Receive Records:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                View receive records for the entire Token.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>8 All Holders:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                List all addresses and amounts holding the current Token.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>9 Send Token:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Send Tokens to external addresses.
              </Typography>

            </CardContent>
          </CardContent>
        </Grid>
      </Grid>
  )
}

export default Token
