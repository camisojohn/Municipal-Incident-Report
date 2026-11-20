import { AuthProvider, useAuth } from "./auth";
import { IncidentsProvider } from "./incidents";
import Home from "./Home";
import Login from "./Login";

function Shell() {
  const { user } = useAuth();
  return user ? <Home /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <IncidentsProvider>
        <Shell />
      </IncidentsProvider>
    </AuthProvider>
  );
}
