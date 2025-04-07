
import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import BlockCard from './BlockCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, BarChart3, ReceiptIndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

const CHART_COLORS = {
  newRegistration: "#FFFF33",
  jointInspection: "#336633",
  workOrder: "#66FFFF",
  install: "#1E6AF4",
  installAndInspection: "#CC00CB"
};

const Dashboard: React.FC = () => {
  const { processedData, selectedDistrict, filterByDistrict } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'blockName' | 'total' | 'completion'>('blockName');

  const filteredBlocks = useMemo(() => {
    if (!processedData) return [];

    let blocks = Object.values(processedData.blocks);

    // Filter by district if selected
    if (selectedDistrict) {
      blocks = blocks.filter(block => 
        block.farmers.some(farmer => farmer["District Name"] === selectedDistrict)
      );
    }

    // Filter by search term
    if (searchTerm) {
      blocks = blocks.filter(block => 
        block.blockName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort blocks
    return [...blocks].sort((a, b) => {
      if (sortBy === 'blockName') {
        return a.blockName.localeCompare(b.blockName);
      } else if (sortBy === 'total') {
        return b.registrationStages.total - a.registrationStages.total;
      } else if (sortBy === 'completion') {
        // Calculate weighted completion based on progression through stages
        const completionA = a.registrationStages.total > 0 
          ? ((a.registrationStages.jointInspection * 0.25) + 
             (a.registrationStages.workOrder * 0.5) + 
             (a.registrationStages.install * 0.75) + 
             a.registrationStages.installAndInspection) / a.registrationStages.total
          : 0;
        const completionB = b.registrationStages.total > 0 
          ? ((b.registrationStages.jointInspection * 0.25) + 
             (b.registrationStages.workOrder * 0.5) + 
             (b.registrationStages.install * 0.75) + 
             b.registrationStages.installAndInspection) / b.registrationStages.total
          : 0;
        return completionB - completionA;
      }
      return 0;
    });
  }, [processedData, selectedDistrict, searchTerm, sortBy]);

  // Chart data preparation
  const overviewChartData = useMemo(() => {
    if (!filteredBlocks.length) return [];

    return filteredBlocks.map(block => ({
      name: block.blockName,
      'New Registration': block.registrationStages.newRegistration,
      'Joint Inspection': block.registrationStages.jointInspection,
      'Work Order': block.registrationStages.workOrder,
      'Install': block.registrationStages.install,
      'Install & Inspection': block.registrationStages.installAndInspection,
    }));
  }, [filteredBlocks]);
  
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Block Wise Data</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[200px]"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blockName">Block Name (A-Z)</SelectItem>
              <SelectItem value="total">Total Farmers</SelectItem>
              <SelectItem value="completion">Completion Rate</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedDistrict} 
            onValueChange={filterByDistrict}
            disabled={!processedData?.districts.length}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              {processedData?.districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {processedData && filteredBlocks.length > 0 ? (
        <>
          {/* GST Summary Card */}
          <Card className="border-green-200">
            <CardHeader className="pb-2 bg-green-50">
              <CardTitle className="text-base flex items-center text-green-700">
                <ReceiptIndianRupee className="mr-2 h-5 w-5" />
                GST Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(processedData.gstSubmittedTotal || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total GST amount across all eligible registrations
              </p>
            </CardContent>
          </Card>
        
          <Card className="overflow-hidden">
            <CardHeader className="bg-scheme-light pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Blocks Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-4">
              <div className="h-[300px] w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overviewChartData.slice(0, 10)} // Show only first 10 for better visibility
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70} 
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value) => [`${value} farmers`, '']}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                    <Bar dataKey="New Registration" stackId="a" fill={CHART_COLORS.newRegistration} />
                    <Bar dataKey="Joint Inspection" stackId="a" fill={CHART_COLORS.jointInspection} />
                    <Bar dataKey="Work Order" stackId="a" fill={CHART_COLORS.workOrder} />
                    <Bar dataKey="Install" stackId="a" fill={CHART_COLORS.install} />
                    <Bar dataKey="Install & Inspection" stackId="a" fill={CHART_COLORS.installAndInspection} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlocks.map((block) => (
              <Link 
                to={`/block/${encodeURIComponent(block.blockName)}`} 
                key={block.blockName}
                className="hover:no-underline"
              >
                <BlockCard key={block.blockName} blockData={block} />
              </Link>
            ))}
          </div>
          
          {filteredBlocks.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No blocks found matching your search criteria.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {processedData ? 'No data available. Please upload a CSV file with valid scheme data.' : 'Please upload a CSV file to view the dashboard.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
