import React from 'react';
import {Button, Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/react";
import {useInputStore} from "../../shared";


export const DataFilePathModal: React.FC = () => {
 const {filePaths, setFilePaths} = useInputStore()

 const [dataFilePath, setDataFilePath] = React.useState<string>();
 const [sensorDataFilePath, setSensorDataFilePath] = React.useState<string>();

 const submitButtonDisabled = !Boolean(dataFilePath) || !Boolean(sensorDataFilePath);

 const onSubmit = () => dataFilePath && sensorDataFilePath && setFilePaths({dataFilePath, sensorDataFilePath})

 return (
	<Modal isOpen={filePaths===undefined} isDismissable={false} hideCloseButton>
	 <ModalContent>
		<ModalHeader>
		 Выбор пути считываемых фалов
		</ModalHeader>
		<ModalBody>
		 <Card>
			<CardHeader>Укажите путь до файла в данными</CardHeader>
			<CardBody>
			 <Input type={'file'} title={"Data File Path"} onChange={(e)=>setDataFilePath(e.target.value)} />
			</CardBody>
		 </Card>
		 <Card>
			<CardHeader>Укажите путь до файла c данными сенсоров</CardHeader>
			<CardBody>
			 <Input type={'file'} title={"Sensor Data File Path"} onChange={(e) => setSensorDataFilePath(e.target.value)}/>
			</CardBody>
		 </Card>
		</ModalBody>
		<ModalFooter>
		 <Button isDisabled={submitButtonDisabled} color={'primary'} onClick={onSubmit}>Submit</Button>
		</ModalFooter>
	 </ModalContent>
	</Modal>
 );
};
