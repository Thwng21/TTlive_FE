import { StatsBadge } from '@/components/features/home/StatsBadge';
import { useTranslations } from 'next-intl';

export const StatsBadgeWrapper = () => {
    const t = useTranslations('HomePage');
    return <StatsBadge text={t('online')} />;
};
