// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// ** Demo Components Imports
import FileUploaderMultiple from '@views/form/FileUploaderMultiple'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

const UploadFiles = () => {
  // ** Hook
  const { t } = useTranslation()
  
  return (
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12}>
            <FileUploaderMultiple />
        </Grid>
      </Grid>
  )
}

export default UploadFiles
