import { Link, Outlet } from "react-router-dom";
import { useLogout } from "../api/hooks.ts";

// App shell for authenticated pages: header with title + logout, then the page.
export default function Layout() {
  const logout = useLogout();
  return (
    <>
      <header className="app-header">
        <h1>
          <Link to="/">Password Manager</Link>
        </h1>
        <button
          className="secondary"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Log out
        </button>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
