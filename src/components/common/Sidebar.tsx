import { Avatar, Drawer, List, Stack, Toolbar, Box } from "@mui/material";
import assets from "../../assets";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import appRoutes from "../../routes/appRoutes";
import SidebarItem from "./SidebarItem";
import { useState } from "react";
import SidebarItemCollapse from "./SidebarItemCollapse";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  return (
    <Drawer className="sidebar_menu"
      variant="permanent"
      sx={{
        width: sizeConfigs.sidebar.width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sizeConfigs.sidebar.width,
          backgroundColor: colorConfigs.sidebar.bg,
          color: colorConfigs.sidebar.color,
        }
      }}
    >
      <List className="nav-item" disablePadding>
        <Toolbar className="topbarLogo">
          <img className='logo' src={assets.images.logo} />
        </Toolbar>
        <div className="menu_list">
          <div className="btnTop">
            <Link to="/live-class" className="btnLive">Live Class</Link>
            <Link to="/announcement" className="btnAnnouncement">Announcement</Link>
          </div>
          <h3>MAIN MENU</h3>

          {appRoutes.map((route, index) => (
            route.sidebarProps ? (
              route.child ? (
                <SidebarItemCollapse
                  item={route}
                  key={index}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                />
              ) : (
                <SidebarItem item={route} key={index} />
              )
            ) : null
          ))}
        </div>
      </List>
    </Drawer>
  );
};

export default Sidebar;