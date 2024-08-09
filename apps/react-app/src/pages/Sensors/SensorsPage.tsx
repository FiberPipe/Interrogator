import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

export const SensorsPage: React.FC = () => {
  const data: any = [
    {
      id: 1,
      time: "00:00:07.359",
      wavelength: 1558.728,
      displacement: -7.5e-5,
      potPin1: 0.220919,
      potPin2: 0.151515,
    },
    {
      id: 2,
      time: "00:00:07.359",
      wavelength: 1558.725,
      displacement: -7.5e-5,
      potPin1: 0.220919,
      potPin2: 0.151515,
    },
  ];
  return (
    <>
      <Table
        aria-label="Example static collection table"
        style={{ width: 400 }}
      >
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn> </TableColumn>
          <TableColumn>Range min</TableColumn>
          <TableColumn>Alarm min</TableColumn>
          <TableColumn>Current</TableColumn>
          <TableColumn>Alarm max</TableColumn>
          <TableColumn>Range max</TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((d: any) => (
            <TableRow key="1">
              <TableCell>{`${d.id}_WL`}</TableCell>
              <TableCell>mE</TableCell>
              <TableCell>200</TableCell>
              <TableCell>199</TableCell>
              <TableCell>{d.wavelength}</TableCell>
              <TableCell>301</TableCell>
              <TableCell>300</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p>FBG</p>
      <Table
        aria-label="Example static collection table"
        style={{ width: 400 }}
      >
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Avg.</TableColumn>
          <TableColumn>Min</TableColumn>
          <TableColumn>Current</TableColumn>
          <TableColumn>Max</TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((d: any) => (
            <TableRow key="1">
              <TableCell>{`FBG_${d.id}`}</TableCell>
              <TableCell>200</TableCell>
              <TableCell>199</TableCell>
              <TableCell>{d.wavelength}</TableCell>
              <TableCell>301</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
