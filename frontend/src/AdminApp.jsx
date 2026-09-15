import AdminCMS from './components/AdminCMS.jsx'

export default function AdminApp() {
  return (
    <AdminCMS
      isOpen
      standalone
      onClose={() => {
        window.location.assign('/')
      }}
    />
  )
}
