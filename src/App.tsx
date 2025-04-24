
import { useUserStore } from './store/userStore';
import { SigninForm } from './components/SigninForm';
import { Dashboard } from './pages/Dashboard';


function App() {
  const user = useUserStore((s) => s.user);
  return <>{user ? <Dashboard /> : <SigninForm />}</>;
}

export default App;
