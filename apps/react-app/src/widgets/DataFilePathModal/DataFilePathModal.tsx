import React from 'react';
import {Button, Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/react";
import {useInputStore} from "../../shared";


export const DataFilePathModal: React.FC = () => {
 const {filePaths, setFilePaths} = useInputStore()

 const [dataFilePath, setDataFilePath] = React.useState<string>();
 const [sensorDataFilePath, setSensorDataFilePath] = React.useState<string>();

 const submitButtonDisabled = !Boolean(dataFilePath) || !Boolean(sensorDataFilePath);

 const onSubmit = () => dataFilePath && sensorDataFilePath && setFilePaths({dataFilePath, sensorDataFilePath})

 const selectDataFilePath = async (e: React.MouseEvent) => {
	 e.preventDefault();
	 const path = await window.electron.selectFile();
	 setDataFilePath(path);
 }

 const selectSensorsDataFilePath = async (e: React.MouseEvent) => {
 	e.preventDefault();
 	const path = await window.electron.selectFile();
	setSensorDataFilePath(path);
 }

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
			 <Input onClick={selectDataFilePath} placeholder={"Data File Path"} value={dataFilePath} />
			</CardBody>
		 </Card>
		 <Card>
			<CardHeader>Укажите путь до файла c данными сенсоров</CardHeader>
			<CardBody>
				<Input onClick={selectSensorsDataFilePath} placeholder={"Sensors Data File Path"} value={sensorDataFilePath} />
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
