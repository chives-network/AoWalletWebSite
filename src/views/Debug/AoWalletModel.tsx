// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

const AoWalletModel = ({ auth }: any) => {
  // ** Hook
  const { t } = useTranslation()

  const [toolInfo, setToolInfo] = useState<any>({})

  const handleConnect = async () => {
    setToolInfo((prevState: any)=>({
        ...prevState,
        connected: auth.connected ? 'Yes' : 'No',
        strategy: auth.strategy,
        address: auth.address,
        name: auth.walletNames[auth.address as string],
        walletNames: JSON.stringify(auth.walletNames),
        addresses: auth.addresses,
        publicKey: auth.publicKey
    }))
    console.log("AoWalletModel setToolInfo auth", auth)
  }

  return (
    <Fragment>
    
    <Card>
        <CardHeader title={`${t('Check Chrome Extension Wallet')}`} />
        <CardContent>
            <Grid container spacing={5}>
                <Grid item xs={12} justifyContent="flex-end">
                    <Button type='submit' sx={{mt: 1}} variant='contained' size='large' onClick={()=>handleConnect()}>
                        Check Wallet Status
                    </Button>

                    {toolInfo && Object.keys(toolInfo).map((Item: any, Index: number)=>{

                        return (
                            <Fragment key={Index}>
                                <Grid sx={{my: 2}}>
                                    <Typography noWrap variant='body2' sx={{display: 'inline', mr: 1}}>{Item}:</Typography>
                                    <Typography noWrap variant='body2' sx={{display: 'inline', color: 'primary.main'}}>{toolInfo[Item] as string}</Typography>
                                </Grid>
                            </Fragment>
                        )

                    })}

                </Grid>

            </Grid>
        </CardContent>
    </Card>

    </Fragment>
  )
}

export default AoWalletModel
