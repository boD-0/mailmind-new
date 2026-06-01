'use client'

import { LoadingScreen } from '@/components/ui/loading-screen'
import { useTranslation } from '@/components/I18nProvider'

export default function RootLoading() {
  const { t } = useTranslation()
  return <LoadingScreen message={t('common.loading')} />
}
