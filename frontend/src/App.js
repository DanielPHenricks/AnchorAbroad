import './App.css';
import { PageTableMap } from './components/MarkerComponent';
import { Navbar } from './components/Navbar';
import AuthWrapper from './components/AuthWrapper';

function App() {
  return (
    <div className="App">
      <AuthWrapper> 
        <PageTableMap />
      </AuthWrapper>
    </div>  
  );
}

export default App;
