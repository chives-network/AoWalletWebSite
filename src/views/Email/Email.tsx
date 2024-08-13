// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'

// ** Hooks
import { useSettings } from '@core/hooks/useSettings'

// ** Email App Component Imports
import EmailList from '@views/Email/EmailList'
import SidebarLeft from '@views/Email/SidebarLeft'
import ComposePopup from '@views/Email/ComposePopup'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

// ** Context
import { useAuth } from '@/hooks/useAuth'

// ** Variables
const EmailCategoriesColors: any = {
  Important: 'error',
  Social: 'info',
  Updates: 'success',
  Forums: 'primary',
  Promotions: 'warning'
}

const EmailAppLayout = () => {
  // ** Hook
  const { t } = useTranslation()

  // ** States
  const [query, setQuery] = useState<string>('')
  const [emailDetailWindowOpen, setEmailDetailWindowOpen] = useState<boolean>(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [folder, setFolder] = useState<string>('Inbox')
  const [loading, setLoading] = useState<boolean>(false)
  const [noEmailText, setNoEmailText] = useState<string>("No Email")
  const [currentEmail, setCurrentEmail] = useState<any>(null)
  const [counter, setCounter] = useState<number>(0)


  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const lgAbove = useMediaQuery(theme.breakpoints.up('lg'))
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))
  const smAbove = useMediaQuery(theme.breakpoints.up('sm'))

  const composePopupWidth = mdAbove ? 754 : smAbove ? 520 : '100%'
  const [composeTitle, setComposeTitle] = useState<string>(`${t(`Compose`)}`)
  const [composeOpen, setComposeOpen] = useState<boolean>(false)
  const toggleComposeOpen = () => setComposeOpen(!composeOpen)
  
  //const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const hidden = true

  // ** Vars
  const leftSidebarWidth = 260
  const { skin } = settings

  const auth = useAuth()

  const [loadingWallet, setLoadingWallet] = useState<number>(0)
  const [currentAoAddress, setMyAoConnectTxId] = useState<string>('')

  useEffect(()=>{
    if(auth && auth.connected == false) {
        setLoadingWallet(2)
    }
    if(auth && auth.connected == true && auth.address != '') {
        setLoadingWallet(1)
        setMyAoConnectTxId(auth.address as string);
    }
  }, [auth])


  // ** State
  const [paginationModel, setPaginationModel] = useState({ page: 1, pageSize: 12 })
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPaginationModel({ ...paginationModel, page });
    console.log("handlePageChange", event)
  }

  useEffect(() => {
    if(true && currentAoAddress && currentAoAddress.length == 43) {
      setLoading(true)
      console.log("loading", loading)
      setNoEmailText('Loading...')

      /*
      dispatch(
        fetchData({
          address: String(currentAoAddress),
          pageId: paginationModel.page - 1,
          pageSize: paginationModel.pageSize,
          folder: folder
        })
      ).then(()=>{
        setLoading(false)
        console.log("loading", loading)
        setNoEmailText('No Email')
      })
      */
      setComposeOpen(false)
      setComposeTitle(`${t(`Compose`)}`)
    }
  }, [paginationModel, folder, currentAoAddress, counter])

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  return (
      <Grid container sx={{maxWidth: '1152px', margin: '0 auto', maxHeight: '1152px'}}>
      {loadingWallet == 0 && (
          <Grid container spacing={5}>
              <Grid item xs={12} justifyContent="flex-end">
                <Card sx={{ my: 6 }}>
                  <CardContent>
                    Loading Wallet Status
                  </CardContent>
                </Card>
              </Grid>
          </Grid>
      )}
      {loadingWallet == 2 && (
          <Grid container spacing={5}>
            <Grid item xs={12} justifyContent="flex-end">
              <Card sx={{ my: 6 }}>
                <CardContent>
                Please Connect Wallet First
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 1 && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: skin === 'bordered' ? 0 : 6,
            ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
          }}
        >
          <SidebarLeft
            store={null}
            hidden={hidden}
            lgAbove={lgAbove}
            dispatch={'ltr'}
            folder={folder}
            setFolder={setFolder}
            emailDetailWindowOpen={emailDetailWindowOpen}
            leftSidebarOpen={leftSidebarOpen}
            leftSidebarWidth={leftSidebarWidth}
            composeTitle={composeTitle}
            toggleComposeOpen={toggleComposeOpen}
            setEmailDetailWindowOpen={setEmailDetailWindowOpen}
            handleLeftSidebarToggle={handleLeftSidebarToggle}
            EmailCategoriesColors={EmailCategoriesColors}
          />
          <EmailList
            query={query}
            store={null}
            hidden={hidden}
            lgAbove={lgAbove}
            setQuery={setQuery}
            direction={'ltr'}
            folder={folder}
            EmailCategoriesColors={EmailCategoriesColors}
            currentEmail={currentEmail}
            setCurrentEmail={setCurrentEmail}
            emailDetailWindowOpen={emailDetailWindowOpen}
            setEmailDetailWindowOpen={setEmailDetailWindowOpen}
            paginationModel={paginationModel}
            handlePageChange={handlePageChange}
            loading={loading}
            setLoading={setLoading}
            noEmailText={noEmailText}
            auth={auth}
            currentAoAddress={currentAoAddress}
            counter={counter}
            setCounter={setCounter}
            setComposeOpen={setComposeOpen}
          />
          <ComposePopup
            mdAbove={mdAbove}
            composeOpen={composeOpen}
            composePopupWidth={composePopupWidth}
            toggleComposeOpen={toggleComposeOpen}
            currentAoAddress={currentAoAddress}
            auth={auth}
            currentEmail={currentEmail}
            folder={folder}
          />
        </Box>
      )}
      </Grid>
  )
}

export default EmailAppLayout
