import { useNavigate, useLocation } from 'react-router-dom';
import { Divider, Button, Tooltip } from '@heroui/react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { documentationLinks, menuItems } from '../model/constants';
import { getAppVersion } from '../../../shared/lib';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen border-r border-default-200 bg-background/60 backdrop-blur-xl flex flex-col"
    >
      {/* Header/Logo */}
      <div className="p-6 pb-4">
        <motion.div
          initial={false}
          animate={{ scale: collapsed ? 0.8 : 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {collapsed ? 'S' : 'SM'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  FiberPipe
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Divider />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          const button = (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                transition-all duration-200 relative overflow-hidden
                ${
                  isActive
                    ? 'text-primary font-semibold shadow-lg'
                    : 'text-default-600 hover:text-default-900 hover:bg-default-100'
                }
              `}
              whileHover={{ scale: 1.02, x: collapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMenuItem"
                  className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}

              {/* Индикатор слева */}
              {isActive && (
                <motion.div
                  layoutId="activeMenuIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}

              <div
                className={`
                  relative z-10 p-2 rounded-lg transition-colors
                  ${isActive ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-transparent'}
                `}
              >
                <Icon className="w-5 h-5" />
              </div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 text-sm"
                  >
                    {t(item.labelKey)}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && !collapsed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto relative z-10"
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </motion.div>
              )}
            </motion.button>
          );

          // Если collapsed, оборачиваем в Tooltip
          if (collapsed) {
            return (
              <Tooltip key={item.id} content={t(item.labelKey)} placement="right" delay={0}>
                {button}
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-3">
        <Divider />

        {/* Documentation Links */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {documentationLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-default-500 hover:text-primary hover:bg-default-100 rounded-lg transition-all group"
                >
                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{link.label}</span>
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle */}
        <Tooltip
          content={collapsed ? t('navigation.expand') : t('navigation.collapse')}
          placement="right"
          delay={0}
        >
          <Button
            variant="flat"
            className="w-full"
            onPress={() => setCollapsed(!collapsed)}
            startContent={
              collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            }
          >
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {t('navigation.collapse')}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </Tooltip>

        {/* Version Info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-default-400"
            >
              v{getAppVersion()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
