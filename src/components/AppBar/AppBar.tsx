import * as React from "react";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import { TopNavigationProps } from "@cloudscape-design/components/top-navigation";
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { FC } from "react";

const AppBar: FC = () => {
  const [username, setUsername] = React.useState<string>("");

  React.useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        if (attributes?.email) {
          setUsername(attributes.email);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    load();
  }, []);

  const utilities: TopNavigationProps.Utility[] = [
    {
      type: "menu-dropdown",
      text: username,
      iconName: "user-profile",
      items: [
        { id: "profile", text: "Profile" },
        { id: "signout", text: "Sign out" }
      ]
    }
  ];

  const i18nStrings: TopNavigationProps.I18nStrings = {
    searchIconAriaLabel: "Search",
    searchDismissIconAriaLabel: "Close search",
    overflowMenuTriggerText: "More",
    overflowMenuTitleText: "All",
    overflowMenuBackIconAriaLabel: "Back",
    overflowMenuDismissIconAriaLabel: "Close menu"
  };

  return (
    <TopNavigation
      identity={{
        href: "#",
        title: "Online Document Manager",
      }}
      utilities={utilities}
      i18nStrings={i18nStrings}
    />
  );
};

export default AppBar;