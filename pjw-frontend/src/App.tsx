import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './Layout';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Deliveries from './pages/Deliveries';
import Sponsors from './pages/Sponsors';
import Admin from './pages/Admin';
import SignIn from './pages/SignIn';
// import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
