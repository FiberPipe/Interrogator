import { useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { History } from 'lucide-react';

import { useDashboardHistory } from '../../../features/dashboard-history';
import type { HistoryRange } from '../../../features/dashboard-history';

const RANGES: HistoryRange[] = ['1h', '24h', '7d'];

interface HistoricalPanelProps {
  port: string | null;
}

export const HistoricalPanel = ({ port }: HistoricalPanelProps) => {
  const { t } = useTranslation();
  const { stats, loading, error, loaded, range, setRange, load } = useDashboardHistory(port);

  // Первая загрузка при открытии панели/смене порта.
  useEffect(() => {
    if (port !== null) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [port]);

  return (
    <Card shadow="sm">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-default-500" />
          <h3 className="text-lg font-semibold">{t('dashboard.history.title')}</h3>
        </div>

        <div className="flex items-center gap-2">
          <ButtonGroup size="sm" variant="flat">
            {RANGES.map((value) => (
              <Button
                key={value}
                color={range === value ? 'primary' : 'default'}
                onClick={() => setRange(value)}
                isDisabled={port === null || loading}
              >
                {t(`dashboard.history.range.${value}`)}
              </Button>
            ))}
          </ButtonGroup>

          <Button
            size="sm"
            color="primary"
            onClick={() => void load()}
            isDisabled={port === null || loading}
          >
            {t('dashboard.history.load')}
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner label={t('dashboard.history.loading')} />
          </div>
        ) : error !== null ? (
          <p className="text-danger text-sm">{error}</p>
        ) : loaded && stats.length === 0 ? (
          <p className="text-default-400 text-sm py-4 text-center">
            {t('dashboard.history.noData')}
          </p>
        ) : (
          <Table aria-label={t('dashboard.history.title')} removeWrapper>
            <TableHeader>
              <TableColumn>{t('dashboard.history.columns.channel')}</TableColumn>
              <TableColumn>{t('dashboard.history.columns.count')}</TableColumn>
              <TableColumn>{t('dashboard.history.columns.min')}</TableColumn>
              <TableColumn>{t('dashboard.history.columns.max')}</TableColumn>
              <TableColumn>{t('dashboard.history.columns.avg')}</TableColumn>
            </TableHeader>
            <TableBody emptyContent={t('dashboard.history.noData')}>
              {stats.map((row) => (
                <TableRow key={row.channel}>
                  <TableCell>{t('dashboard.channel.label', { index: row.channel })}</TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell>{row.min.toFixed(3)}</TableCell>
                  <TableCell>{row.max.toFixed(3)}</TableCell>
                  <TableCell>{row.avg.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};
