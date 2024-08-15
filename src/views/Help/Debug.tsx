// ** MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const Debug = () => {
  return (
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 6 }}>Please Connect Wallet First</Typography>
              
              <Typography variant="h5" sx={{ mb: 3 }}>Debug Functions (Only for developer):</Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                1 Debug Process
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                2 Send Message
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                3 Load Blueprint
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                4 Integrated Commands
              </Typography>

            </CardContent>
          </CardContent>
        </Grid>
      </Grid>
  )
}

export default Debug
