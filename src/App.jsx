import AppRoutes from './routes/AppRoutes';
import PushNotificationManager from './components/PushNotificationManager';
import './index.css';

function App() {
  return (
    <>
      <PushNotificationManager />
      <AppRoutes />
    </>
  );
}

export default App;
