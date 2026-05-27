import './App.css'

import {
  HashRouter,
  Route,
  Routes,
  Navigate
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import { Layout } from './components/Layout';
import Login from "./pages/Login";
import Register from './pages/Register';
import Parques from './pages/Parques';
import {Home} from './components/Home';
import MisReservaciones from './pages/MisReservaciones';
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <HashRouter>
      <Routes>

        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path="/parques" element={<Parques />} />
          <Route path='/reservar' element={<MisReservaciones />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrarse" element={<Register />} />
        </Route>
 
        


      </Routes>
    </HashRouter>
  )
}

export default App