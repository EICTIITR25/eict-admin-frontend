import { ListItemButton, ListItemIcon } from "@mui/material";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import colorConfigs from "../../configs/colorConfigs";
import { RootState } from "../../redux/store";
import sizeConfigs from "../../configs/sizeConfigs";
import { RouteType } from "../../routes/config";

type Props = {
  item: RouteType;
};

const SidebarItem = ({ item }: Props) => {
  const { appState } = useSelector((state: RootState) => state.appState);

  return (
    item.sidebarProps && item.path ? (
      <ListItemButton className="linkNav"
        component={Link}
        to={item.path}
        sx={{
          "&: hover": {
            backgroundColor: colorConfigs.sidebar.hoverBg
          },
          fontSize: sizeConfigs.sidebar.fontSize,
          backgroundColor: appState === item.state ? colorConfigs.sidebar.activeBg : "unset",
          paddingY: "6px",
          paddingX: "8px",
          fontWeight:"700",
          borderRadius: '8px',

        }}
      >
        <ListItemIcon className="IconNav" sx={{
          color: colorConfigs.sidebar.color,
          minWidth:"20px",
          marginRight:"10px",
        }}>
          {item.sidebarProps.icon && item.sidebarProps.icon}
        </ListItemIcon>
        {item.sidebarProps.displayText}
      </ListItemButton>
    ) : null
  );
};

export default SidebarItem;