import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Deliveries from './pages/Deliveries';
import Sponsers from './pages/Sponsers';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/sponsors" element={<Sponsers />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
