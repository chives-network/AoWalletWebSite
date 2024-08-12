// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Styled Component

// ** Demo Components Imports
import SendOutForm from '@views/form/SendOutForm'

const SendOut = () => {
  return (
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12}>
            <SendOutForm />
        </Grid>
      </Grid>
  )
}

export default SendOut
