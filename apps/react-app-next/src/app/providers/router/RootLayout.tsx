import { Flex } from '@gravity-ui/uikit';
import { AppAsideHeader } from "@widgets/index";
import { PageContainer } from "@shared/ui";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  return (
    <Flex direction={"row"}>
      <AppAsideHeader />
      <PageContainer children={<Outlet />} />
    </Flex>
  );
};
