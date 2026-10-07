import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Buses from './pages/Buses';
import BusDetail from './pages/BusDetail';
import RoutesPage from './pages/Routes';
import RouteDetail from './pages/RouteDetail';
import Passengers from './pages/Passengers';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buses" element={<Buses />} />
          <Route path="/buses/:busId" element={<BusDetail />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:routeId" element={<RouteDetail />} />
          <Route path="/passengers" element={<Passengers />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

