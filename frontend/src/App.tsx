import './App.css'
import CueBeatsProvider from './contexts/CueBeatsProvider'
import HomePage from './sections/HomePage'

function App() {
  return (
    <CueBeatsProvider>
      <HomePage />
    </CueBeatsProvider>
  )
}

export default App
