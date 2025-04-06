
import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { BlockData } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface BlockCardProps {
  blockData: BlockData;
  onClick?: () => void;
}

const BlockCard: React.FC<BlockCardProps> = ({ blockData, onClick }) => {
  const isMobile = useIsMobile();
  const { blockName, registrationStages } = blockData;
  
  // Prepare data for chart
  const chartData = [
    { name: 'New Registration', value: registrationStages.newRegistration, color: '#3b82f6' },
    { name: 'Joint Inspection', value: registrationStages.jointInspection, color: '#10b981' },
    { name: 'Work Order', value: registrationStages.workOrder, color: '#f59e0b' },
    { name: 'Install', value: registrationStages.install, color: '#8b5cf6' },
    { name: 'Install & Inspection', value: registrationStages.installAndInspection, color: '#14b8a6' },
  ].filter(item => item.value > 0);
  
  // Calculate completion rate
  const completionRate = registrationStages.total > 0
    ? ((registrationStages.installAndInspection / registrationStages.total) * 100).toFixed(1)
    : '0.0';
    
  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="bg-scheme-light pb-2">
        <CardTitle className="text-lg font-bold">{blockName}</CardTitle>
        <CardDescription>
          Total Farmers: <span className="font-semibold text-scheme-pmksy">{registrationStages.total}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Registration Stages</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs">New Registration</span>
                <span className="text-xs font-medium">{registrationStages.newRegistration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Joint Inspection</span>
                <span className="text-xs font-medium">{registrationStages.jointInspection}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Work Order</span>
                <span className="text-xs font-medium">{registrationStages.workOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Install</span>
                <span className="text-xs font-medium">{registrationStages.install}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Install & Inspection</span>
                <span className="text-xs font-medium">{registrationStages.installAndInspection}</span>
              </div>
            </div>
          </div>
          
          <div className="h-[120px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 25 : 30}
                    outerRadius={isMobile ? 40 : 45}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} farmers`, '']}
                    contentStyle={{ borderRadius: '4px', fontSize: '12px' }}
                  />
                  {!isMobile && (
                    <Legend 
                      layout="vertical" 
                      align="right"
                      verticalAlign="middle"
                      iconSize={8}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', paddingLeft: '10px' }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 py-2 px-4">
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-gray-500">Completion Rate</span>
          <span className="text-xs font-semibold">{completionRate}%</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlockCard;
