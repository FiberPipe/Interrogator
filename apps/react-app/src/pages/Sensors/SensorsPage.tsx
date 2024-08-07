import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

export const SensorsPage: React.FC = () => {
  return (
    <Table aria-label="Example static collection table" style={{ width: 400 }}>
      <TableHeader>
        <TableColumn>ID</TableColumn>
        <TableColumn>AVG</TableColumn>
        {/* <TableColumn>MIN</TableColumn> */}
        {/* <TableColumn>Current</TableColumn> */}
        <TableColumn>
          <input placeholder="kfslk" />
        </TableColumn>
      </TableHeader>
      <TableBody>
        <TableRow key="1">
          <TableCell>Tony Reichert</TableCell>
          <TableCell>CEO</TableCell>
          <TableCell>
            <Input />
          </TableCell>
        </TableRow>
        <TableRow key="2">
          <TableCell>Zoey Lang</TableCell>
          <TableCell>Technical Lead</TableCell>
          <TableCell>Paused</TableCell>
        </TableRow>
        <TableRow key="3">
          <TableCell>Jane Fisher</TableCell>
          <TableCell>Senior Developer</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow key="4">
          <TableCell>William Howard</TableCell>
          <TableCell>Community Manager</TableCell>
          <TableCell>Vacation</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
