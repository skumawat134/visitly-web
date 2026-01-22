import { useAuthStore } from "@visitly/app-store";
import { Outlet } from "react-router-dom";

function AppLayout() {
    // const auth = useAuthStore();
  
    // if (auth.status !== 'authenticated') {
    //   return <Outlet />; // login / public pages
    // }
  
    return (
      <div className="app-shell">
        {/* <Header /> */}
        <div className="body">
          {/* <Sidebar /> */}
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    );
  }
  
  export default AppLayout;