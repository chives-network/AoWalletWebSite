import type { ReactNode } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Types Imports
import type { ThemeColor } from '@core/types'

// Styles Imports
import styles from './styles.module.css'

type LabelColor = {
  color: ThemeColor
  colorClass: string
}

// Constants
const icons = {
  Inbox: 'ri-mail-line',
  Starred: 'ri-star-line',
  Sent: 'ri-send-plane-line',
  Spam: 'ri-spam-2-line',
  Trash: 'ri-delete-bin-7-line'
}

const iconsToColor = (icon: string): string => {
  const iconsColorArray: { [key: string]: string } = {
    'Inbox': 'primary',
    'Starred': 'success',
    'Sent': 'default',
    'Spam': 'error',
    'Trash': 'warning'
  };

  return iconsColorArray[icon] || 'default';
};

export const labelColors: { [key: string]: LabelColor } = {
  personal: { color: 'success', colorClass: 'text-success' },
  company: { color: 'primary', colorClass: 'text-primary' },
  important: { color: 'warning', colorClass: 'text-warning' },
  private: { color: 'error', colorClass: 'text-error' }
}

const ScrollWrapper = ({ children, lgAbove }: { children: ReactNode; lgAbove: boolean }) => {
  if (lgAbove) {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>

    //return <div className='bs-full overflow-y-auto overflow-x-hidden'>{children}</div>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const SidebarLeft = (props: any) => {
  // Props
  const {
    store,
    lgAbove,
    folder,
    setFolder,
    leftSidebarOpen,
    leftSidebarWidth,
    composeTitle,
    toggleComposeOpen,
    setEmailDetailWindowOpen,
    handleLeftSidebarToggle,
    EmailCategoriesColors,
    label
  } = props

  const handleListItemClick = (Folder: string | null) => {
    setFolder(Folder)
    setEmailDetailWindowOpen(false)
    handleLeftSidebarToggle()
  }

  return (
    <>
      <Drawer
        open={leftSidebarOpen}
        onClose={handleLeftSidebarToggle}
        variant={lgAbove ? 'permanent' : 'temporary'}
        ModalProps={{
          disablePortal: true,
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: 9,
          display: 'block',
          position: lgAbove ? 'static' : 'absolute',
          '& .MuiDrawer-paper': {
            boxShadow: 'none',
            width: leftSidebarWidth,
            zIndex: lgAbove ? 2 : 'drawer',
            position: lgAbove ? 'static' : 'absolute'
          },
          '& .MuiBackdrop-root': {
            position: 'absolute'
          }
        }}
      >
        <CardContent>
          <Button fullWidth variant='contained' onClick={toggleComposeOpen}>
            {composeTitle}
          </Button>
        </CardContent>
        <ScrollWrapper lgAbove={lgAbove}>
          <div className='flex flex-col'>
            {Object.entries(icons).map(([key, value]) => (
              <Link
                key={key}
                href='#'
                onClick={(event: any)=>{
                  event.preventDefault();
                  handleListItemClick(key)
                }}
                prefetch
                className={classnames(
                  'flex items-center justify-between plb-1 pli-5 gap-2.5 bs-[32px] cursor-pointer',
                  {
                    [styles.activeSidebarListItem]: key === folder && !label
                  }
                )}
              >
                <div className='flex items-center gap-2.5'>
                  <i className={classnames(value, 'text-xl')} />
                  <Typography className='capitalize' color='inherit'>
                    {key}
                  </Typography>
                </div>
                {store && store.EmailRecordsCount && Number(store.EmailRecordsCount[key]) > 0 && (
                  <Chip
                    label={store.EmailRecordsCount[key]}
                    size='small'
                    variant='tonal'

                    //@ts-ignore
                    color={iconsToColor(key) as string}
                  />
                )}
              </Link>
            ))}
          </div>
          <div className='flex flex-col gap-4 plb-4'>
            <Typography variant='caption' className='uppercase pli-5'>
              Categories
            </Typography>
            <div className='flex flex-col gap-3'>
              {Object.keys(EmailCategoriesColors).map(labelName => (
                <Link
                  key={labelName}
                  href='#'
                  onClick={(event: any)=>{
                    event.preventDefault();
                    handleListItemClick(labelName)
                  }}
                  prefetch
                  className={classnames('flex items-center gap-x-2 pli-5 cursor-pointer', {
                    [styles.activeSidebarListItem]: labelName === label
                  })}
                >
                  <i className={classnames('ri-circle-fill text-xs', 'text-' + EmailCategoriesColors[labelName])} />
                  <Typography className='capitalize' color='inherit'>
                    {labelName}
                  </Typography>
                </Link>
              ))}
            </div>
          </div>
        </ScrollWrapper>
      </Drawer>
    </>
  )
}

export default SidebarLeft
