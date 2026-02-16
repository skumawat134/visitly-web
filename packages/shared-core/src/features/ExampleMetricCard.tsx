import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@visitly/ui';
// import { useApi } from '@visitly/api-client'; // Example import

interface ExampleMetricCardProps {
    title: string;
    value: string | number;
    description?: string;
}

/**
 * A sample high-level business component that uses @visitly/ui
 * and can be reused across MFEs.
 */
export const ExampleMetricCard: React.FC<ExampleMetricCardProps> = ({ title, value, description }) => {
    return (
        <Card className="tw:shadow-sm">
            <CardHeader className="tw:flex tw:flex-row tw:items-center tw:justify-between tw:space-y-0 tw:pb-2">
                <CardTitle className="tw:text-sm tw:font-medium">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="tw:text-2xl tw:font-bold">{value}</div>
                {description && (
                    <p className="tw:text-xs tw:text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
