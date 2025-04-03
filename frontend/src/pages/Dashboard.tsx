import { Outlet } from 'react-router-dom';
import DashboardLayout from '../Layouts/Dashboard';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}