import { useEffect, useState } from "react";

interface BarGraphProps {
  data: { name: string; uv: number; pv: number }[];
}

export const BarGraphBuilder: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "../../../../../packages/data-generator/data.json"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData: any[] = await response.json();
        console.log("Response Text:", response);
        // setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Изначально загрузить данные

    const interval = setInterval(() => {
      fetchData(); // Обновлять данные каждую секунду
    }, 1000);

    return () => clearInterval(interval); // Очищаем интервал при размонтировании компонента
  }, []);

  return (
    <div>
      <h3>Последние строки файла:</h3>
      <pre>{data}</pre>
    </div>
  );
};
