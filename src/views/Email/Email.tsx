// ** React Imports
import { useState, useEffect, memo } from 'react'

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
import EmailLeft from '@views/Email/EmailLeft'
import ComposePopup from '@views/Email/ComposePopup'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

// ** Context
import { useAuth } from '@/hooks/useAuth'
import authConfig from '@/configs/auth'

import { ChivesEmailGetMyEmailRecords } from '@/functions/AoConnect/ChivesEmail'

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
  const [store, setStore] = useState<any>(null)

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
    if(true && currentAoAddress && currentAoAddress.length == 43 && folder && paginationModel && paginationModel.page) {
      setLoading(true)
      setNoEmailText('Loading...')
      const params = {
        address: String(currentAoAddress),
        pageId: paginationModel.page - 1,
        pageSize: paginationModel.pageSize,
        folder: folder
      }
      console.log("paramsparamsparamsparams", params, counter)
      handleGetEmailData(params)
      setComposeOpen(false)
      setComposeTitle(`${t(`Compose`)}`)
    }
  }, [paginationModel, folder, currentAoAddress, counter])

  const handleGetEmailData = async (params: any) => {
      const startIndex = params.pageId * params.pageSize + 1
      const endIndex = (params.pageId+1) * params.pageSize
      const ChivesEmailGetMyEmailRecordsData1 = await ChivesEmailGetMyEmailRecords(authConfig.AoConnectChivesEmailServerData, params.address, params.folder ?? "Inbox", String(startIndex), String(endIndex))
      if(ChivesEmailGetMyEmailRecordsData1) {
        console.log("ChivesEmailGetMyEmailRecordsData1", ChivesEmailGetMyEmailRecordsData1)
        const [filterEmails, totalRecords, emailFolder, startIndex, endIndex, EmailRecordsCount, recordsUnRead] = ChivesEmailGetMyEmailRecordsData1
        setLoading(false)
        if(filterEmails && filterEmails.length == 0) {
          setNoEmailText('No Email')
        }
        setStore({ ...{data: filterEmails, total: totalRecords, emailFolder, startIndex, endIndex, EmailRecordsCount, recordsUnRead}, filter: params, allPages: Math.ceil(totalRecords / 10) })
      }
      else {
        setLoading(false)
        setNoEmailText('No Email')
        //setStore({ ...{data: [], total : 0, emailFolder: params.folder, startIndex: '0', endIndex: '10', EmailRecordsCount: {}, recordsUnRead:{} }, filter: params, allPages: 0 })
      }
  }
  console.log("setStore", store)

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)

  return (
      <Grid container sx={{maxWidth: '1152px', margin: '0 auto'}}>
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
      {loadingWallet == 1 && store == null && (
          <Grid container spacing={5}>
            <Grid item xs={12} justifyContent="flex-end">
              <Card sx={{ my: 6 }}>
                <CardContent>
                Loading data from Email Server
                </CardContent>
              </Card>
            </Grid>
          </Grid>
      )}
      {loadingWallet == 1 && store && (
        <Box
          sx={{
            width: '100%',
            height: '800px',
            display: 'flex',
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative',
            my: 6,
            boxShadow: skin === 'bordered' ? 0 : 6,
            ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
          }}
        >
          <EmailLeft
            store={store}
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
            store={store}
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

export default memo(EmailAppLayout)
