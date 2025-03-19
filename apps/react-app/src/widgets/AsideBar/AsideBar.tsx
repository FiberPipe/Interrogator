import React from "react";
import { Drawer, DrawerContent, useDisclosure } from "@heroui/react";
import styles from "./AsideBar.module.css";
import { Logo, LineGraphIcon, BarGraphIcon, Table } from "../../shared/assets";

export const AsideBar = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [backdrop, setBackdrop] = React.useState("opaque");

  return (
    <>
      {/* {isOpen === false && (
        <Button
          onPress={() => {
            onOpen();
          }}
        >
          sd
        </Button>
      )} */}

      {
        <div className={styles.asideClosed}>
          <img src={Logo} alt="Logo" className={styles.image} />
          <img src={Table} alt="Sensors" className={styles.image} />
          <img src={LineGraphIcon} alt="Graphs" className={styles.image} />
          <img src={BarGraphIcon} alt="Acqusition" className={styles.image} />
          {/* <Image alt="Logo mini" src={Logo?ini} width={50} /> */}
        </div>
      }
      <Drawer
        backdrop={backdrop as any}
        isOpen={isOpen}
        placement="left"
        onOpenChange={onOpenChange}
        size="sm"
      >
        <DrawerContent>{(onClose) => <>12345</>}</DrawerContent>
      </Drawer>
    </>
  );
};
