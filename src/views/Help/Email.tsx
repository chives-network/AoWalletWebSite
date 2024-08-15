// ** MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const Email = () => {
  return (
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 6 }}>Please Connect Wallet First</Typography>
              
              <Typography variant="h5" sx={{ mb: 3 }}>Email Functions:</Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>1 Send Email:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
              Supports sending encrypted emails to any AO address.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>2 Email List:</strong>
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
              Supports pagination display of emails, moving to other folders, marking as read, starring, etc.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>3 Read Emails:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
              Mark emails as read, reply to and forward emails, move to other folders, mark as read, star, etc.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>4 Reply and Forward:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
              Supports replying to or forwarding emails.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                <strong>5 Folder Support:</strong> 
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Starred, Spam, Trash, and directories Important, Social, Updates, Forums, Promotions.
              </Typography>
              

            </CardContent>
          </CardContent>
        </Grid>
      </Grid>
  )
}

export default Email
