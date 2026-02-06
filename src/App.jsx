// import Dashboard from "./pages/Dashboard";
import NewDashboard from './pages/NewDashboard';
import { AppProvider } from './context/AppContext';

function App(){
  return (
     <AppProvider>
    {/* <Dashboard/> */}
    <NewDashboard/>
    </AppProvider>
  )
}

export default App;