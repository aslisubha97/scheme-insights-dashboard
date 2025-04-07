
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
import { Progress } from '@/components/ui/progress';

interface BlockCardProps {
  blockData: BlockData;
  onClick?: () => void;
}

const BlockCard: React.FC<BlockCardProps> = ({ blockData, onClick }) => {
  const isMobile = useIsMobile();
  const { blockName, registrationStages } = blockData;
  
  // Define the chart data with consistent colors and names
  const chartData = [
    { name: 'New Registration', value: registrationStages.newRegistration, color: '#FFFF33' },
    { name: 'Joint Inspection', value: registrationStages.jointInspection, color: '#336633' },
    { name: 'Work Order', value: registrationStages.workOrder, color: '#66FFFF' },
    { name: 'Install', value: registrationStages.install, color: '#1E6AF4' },
    { name: 'Install & Inspection', value: registrationStages.installAndInspection, color: '#CC00CB' },
  ].filter(item => item.value > 0);
  
  // Calculate completion rate based on the progression through stages
  const completionRate = registrationStages.total > 0
    ? (((registrationStages.jointInspection * 0.25) + 
        (registrationStages.workOrder * 0.5) + 
        (registrationStages.install * 0.75) + 
        (registrationStages.installAndInspection)) / 
       registrationStages.total * 100).toFixed(1)
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
          
          <div className="h-[140px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 30 : 35}
                    outerRadius={isMobile ? 45 : 55}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value} farmers`, name]}
                    contentStyle={{ borderRadius: '4px', fontSize: '12px' }}
                  />
                  {!isMobile && (
                    <Legend 
                      layout="vertical" 
                      align="right"
                      verticalAlign="middle"
                      iconSize={10}
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
      <CardFooter className="border-t bg-gray-50 py-3 px-4">
        <div className="w-full space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Completion Rate</span>
            <span className="text-xs font-semibold">{completionRate}%</span>
          </div>
          <Progress value={parseFloat(completionRate)} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlockCard;
