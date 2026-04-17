import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Deliveries from './pages/Deliveries';
import Sponsors from './pages/Sponsors';
import Login from './pages/Login';
import { CartProvider } from './state/cart';
// import './index.css'

function App() {
  return (
    <Router>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </CartProvider>
    </Router>
  );
}

export default App;
