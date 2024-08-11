// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

type Props = {
  activeStep: number
  isLastStep: boolean
  handleNext: () => void
  handlePrev: () => void
}

const Submit = ({ activeStep, isLastStep, handleNext, handlePrev }: Props) => {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex flex-col items-center gap-1'>
          <Typography variant='h5'>Submit 🥳</Typography>
          <Typography variant='body2'>Submit to kickstart your project.</Typography>
        </div>
        <img alt='submit-img' src='/images/illustrations/characters-with-objects/4.png' height={174} />
      </div>
      <div className='flex items-center justify-between'>
        <Button
          variant='outlined'
          color='secondary'
          disabled={activeStep === 0}
          onClick={handlePrev}
        >
          Previous
        </Button>
        <Button
          variant='contained'
          color={isLastStep ? 'success' : 'primary'}
          onClick={handleNext}
          endIcon={
            isLastStep ? (
              <i className='ri-check-line' />
            ) : (
              <i className='ri-check-line' />
            )
          }
        >
          {isLastStep ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  )
}

export default Submit
