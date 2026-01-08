import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ManualList from './pages/ManualList'
import ManualQuery from './pages/ManualQuery'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/manuals" replace />} />
          <Route path="/manuals" element={<ManualList />} />
          <Route path="/manuals/:id/query" element={<ManualQuery />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
