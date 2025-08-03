import { Flex } from "@gravity-ui/uikit";
import React from "react";
import block from 'bem-cn-lite';
import './pageContainer.css';
import { Footer } from "@gravity-ui/navigation";

interface PageContainerProps {
  children: React.ReactNode;
};

const b = block('page-container')

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <Flex direction={"column"} justifyContent={"space-between"} className={b()}>
      <main className={b('main')}>
        {children}

      </main>
      <Footer copyright={"© LLC Fiber Pipe"} withDivider={true} />
    </Flex>
  )

};
