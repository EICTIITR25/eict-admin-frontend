import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import colorConfigs from "../../configs/colorConfigs";
import { RouteType } from "../../routes/config";
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import SidebarItem from "./SidebarItem";
import sizeConfigs from "../../configs/sizeConfigs";

type Props = {
  item: RouteType;
  openMenu: string | null;
  setOpenMenu: (value: string | null) => void;
};

const SidebarItemCollapse = ({ item, openMenu, setOpenMenu }: Props) => {
  const isOpen = openMenu === item.state;

  const toggleOpen = () => {
    setOpenMenu(isOpen ? null : item.state); // Toggle based on isOpen
  };

  return (
    item.sidebarProps ? (
      <>
        <ListItemButton
          className="linkNav"
          onClick={toggleOpen} // Use toggleOpen function
          sx={{
            backgroundColor: isOpen ? colorConfigs.sidebar.activeBg : "unset",
            "&:hover": {
              backgroundColor: colorConfigs.sidebar.hoverBg,
            },
            paddingY: "6px",
            fontWeight: "700",
            paddingX: "6px",
            paddingRight: "20px",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <ListItemIcon
            className="IconNav"
            sx={{ color: colorConfigs.sidebar.color, minWidth: "20px", marginRight: "10px" }}
          >
            {item.sidebarProps.icon}
          </ListItemIcon>
          <ListItemText
            className="TextNav"
            disableTypography
            primary={
              <Typography sx={{ fontSize: sizeConfigs.sidebar.fontSize, fontWeight: "500", fontFamily: "inter" }}>
                {item.sidebarProps.displayText}
              </Typography>
            }
          />
          {isOpen ? <ExpandLessOutlinedIcon className="droparrow" /> : <ExpandMoreOutlinedIcon className="droparrow" />}
        </ListItemButton>

        <Collapse in={isOpen} timeout="auto">
          <List className="submenuItem">
            {item.child?.map((route, index) => (
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
          </List>
        </Collapse>
      </>
    ) : null
  );
};

export default SidebarItemCollapse;