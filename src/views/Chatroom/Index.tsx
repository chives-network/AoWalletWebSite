// ** React Imports
import { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import AppModel from '@views/Chatroom/Model'

// ** Axios Imports
import axios from 'axios'
import authConfig from '@configs/auth'
import { useAuth } from '@/hooks/useAuth'

const AllApp = () => {

  // ** Hook
  const [pageid, setPageid] = useState<number>(0)
  const [show, setShow] = useState<boolean>(false)
  const [loadingAllData, setLoadingAllData] = useState<boolean>(false)
  const [app, setApp] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingText, setLoadingText] = useState<string>('Loading')
  const [appId, setAppId] = useState<string>('')
  
  const [type, setType] = useState<string>("ALL")
  const [search, setSearch] = useState<string>("ALL")

  const auth = useAuth()
  
  const [loadingWallet, setLoadingWallet] = useState<number>(0)
  
  useEffect(()=>{
    if(auth && auth.connected == false) {
        setLoadingWallet(2)
    }
    if(auth && auth.connected == true && auth.address) {
        setLoadingWallet(1)
    }
  }, [auth])

  useEffect(() => {
    
    getAppsPage()
    console.log("type", type, search)
    
  }, [])

  const handleSearchFilter = async function (Item: string) {
    setPageid(0)
    setLoadingAllData(false)
    setApp([])
    setType("ALL")
    setSearch(Item)
    setAppId("")
  }

  const getAppsPage = async function () {
    const pagesize = 20

    if(loadingAllData == false)  {
      try {
        setLoading(true)
        const RS = await axios.get('https://raw.githubusercontent.com/chives-network/AoWalletWebsite/main/collection/chatroom.json', { headers: { 'Content-Type': 'application/json'} }).then(res=>res.data)

        if(RS) {
          const appInitial: string[] = []
          RS.map((Item: any)=>{
            appInitial.push(Item)
          })
          if(RS.length < pagesize && pageid >= 0) {
            setLoadingAllData(true)
          }
          setApp([...app, ...appInitial].filter((element) => element != null))
          setAppId("")
          window.localStorage.setItem(authConfig.AoConnectChatRoom, JSON.stringify([...app, ...appInitial]))
        }
        const timer = setTimeout(() => {
          setLoading(false);
        }, 500);  

        return () => {
          clearTimeout(timer);
        };
      }
      catch(Error: any) {
          console.error("getAppsPage Error:", Error)
      }
    }
    else {
      setLoading(true)
      setLoadingText('Finished')
      const timer2 = setTimeout(() => {
        setLoading(false);
      }, 500);

      return () => {
        clearTimeout(timer2);
      };
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
      setPageid(pageid + 1)

      //getAppsPage();
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [app]); 

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
      {loadingWallet == 1 && app && (
      <AppModel app={app} loading={loading} loadingText={loadingText} appId={appId} setAppId={setAppId} show={show} setShow={setShow} handleSearchFilter={handleSearchFilter}/>
      )}
    </Grid>
  )
}


export default AllApp
