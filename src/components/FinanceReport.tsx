
import React, { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { exportToCSV } from '@/utils/csvParser';

const FinanceReport: React.FC = () => {
  const { processedData, selectedDistrict, filterByDistrict } = useData();
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  
  const blocks = useMemo(() => {
    if (!processedData) return [];
    
    let filteredBlocks = Object.values(processedData.blocks);
    
    if (selectedDistrict) {
      filteredBlocks = filteredBlocks.filter(block => 
        block.farmers.some(farmer => farmer["District Name"] === selectedDistrict)
      );
    }
    
    return filteredBlocks;
  }, [processedData, selectedDistrict]);
  
  const financialData = useMemo(() => {
    if (!processedData) return null;
    
    if (selectedBlock === 'all') {
      // Aggregate data for all blocks
      const aggregatedData = {
        pmksy: { totalPaid: 0, cgst: 0, sgst: 0, tds: 0 },
        bksy: { totalPaid: 0, cgst: 0, sgst: 0, tds: 0 }
      };
      
      blocks.forEach(block => {
        aggregatedData.pmksy.totalPaid += block.financialData.pmksy.totalPaid;
        aggregatedData.pmksy.cgst += block.financialData.pmksy.cgst;
        aggregatedData.pmksy.sgst += block.financialData.pmksy.sgst;
        aggregatedData.pmksy.tds += block.financialData.pmksy.tds;
        
        aggregatedData.bksy.totalPaid += block.financialData.bksy.totalPaid;
        aggregatedData.bksy.cgst += block.financialData.bksy.cgst;
        aggregatedData.bksy.sgst += block.financialData.bksy.sgst;
        aggregatedData.bksy.tds += block.financialData.bksy.tds;
      });
      
      return aggregatedData;
    } else {
      // Return data for selected block
      const selectedBlockData = blocks.find(block => block.blockName === selectedBlock);
      return selectedBlockData ? selectedBlockData.financialData : null;
    }
  }, [processedData, selectedBlock, blocks]);
  
  // Chart data
  const barChartData = useMemo(() => {
    return blocks.map(block => ({
      name: block.blockName,
      'PMKSY Amount': block.financialData.pmksy.totalPaid,
      'BKSY Amount': block.financialData.bksy.totalPaid,
    })).sort((a, b) => (b['PMKSY Amount'] + b['BKSY Amount']) - (a['PMKSY Amount'] + a['BKSY Amount']))
    .slice(0, 10); // Show top 10 for better visibility
  }, [blocks]);
  
  const pmksyPieChartData = useMemo(() => {
    if (!financialData) return [];
    
    return [
      { name: 'Amount Paid', value: financialData.pmksy.totalPaid, color: '#1e40af' },
      { name: 'CGST', value: financialData.pmksy.cgst, color: '#3b82f6' },
      { name: 'SGST', value: financialData.pmksy.sgst, color: '#93c5fd' },
      { name: 'TDS', value: financialData.pmksy.tds, color: '#bfdbfe' },
    ].filter(item => item.value > 0);
  }, [financialData]);
  
  const bksyPieChartData = useMemo(() => {
    if (!financialData) return [];
    
    return [
      { name: 'Amount Paid', value: financialData.bksy.totalPaid, color: '#0d9488' },
      { name: 'CGST', value: financialData.bksy.cgst, color: '#14b8a6' },
      { name: 'SGST', value: financialData.bksy.sgst, color: '#5eead4' },
      { name: 'TDS', value: financialData.bksy.tds, color: '#99f6e4' },
    ].filter(item => item.value > 0);
  }, [financialData]);

  const handleExport = () => {
    if (!processedData) return;
    
    let dataToExport = processedData.allFarmers;
    
    if (selectedDistrict) {
      dataToExport = dataToExport.filter(farmer => 
        farmer["District Name"] === selectedDistrict
      );
    }
    
    if (selectedBlock && selectedBlock !== 'all') {
      dataToExport = dataToExport.filter(farmer => 
        farmer["Block Name"] === selectedBlock
      );
    }
    
    exportToCSV(dataToExport, `finance-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Format currency
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
        <h2 className="text-2xl font-bold">Finance Reports</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
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
          
          <Select 
            value={selectedBlock} 
            onValueChange={setSelectedBlock}
            disabled={!blocks.length}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Blocks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {blocks.map((block) => (
                <SelectItem key={block.blockName} value={block.blockName}>
                  {block.blockName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            onClick={handleExport}
            disabled={!processedData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      {processedData && financialData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-scheme-pmksy/5 border-scheme-pmksy/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-scheme-pmksy">PMKSY Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(financialData.pmksy.totalPaid)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-scheme-bksy/5 border-scheme-bksy/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-scheme-bksy">BKSY Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(financialData.bksy.totalPaid)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total GST (CGST + SGST)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    financialData.pmksy.cgst + 
                    financialData.pmksy.sgst + 
                    financialData.bksy.cgst + 
                    financialData.bksy.sgst
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total TDS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(financialData.pmksy.tds + financialData.bksy.tds)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Block-wise Fund Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), '']}
                        contentStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="PMKSY Amount" fill="#1e40af" barSize={20} />
                      <Bar dataKey="BKSY Amount" fill="#0d9488" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="pmksy">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pmksy" className="data-[state=active]:bg-scheme-pmksy/10">PMKSY Details</TabsTrigger>
                <TabsTrigger value="bksy" className="data-[state=active]:bg-scheme-bksy/10">BKSY Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pmksy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-scheme-pmksy">
                      <PieChartIcon className="mr-2 h-5 w-5" />
                      PMKSY Fund Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pmksyPieChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={60}
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pmksyPieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Amount Paid:</span>
                        <span className="font-medium">{formatCurrency(financialData.pmksy.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">CGST:</span>
                        <span className="font-medium">{formatCurrency(financialData.pmksy.cgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">SGST:</span>
                        <span className="font-medium">{formatCurrency(financialData.pmksy.sgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">TDS:</span>
                        <span className="font-medium">{formatCurrency(financialData.pmksy.tds)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="bksy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-scheme-bksy">
                      <PieChartIcon className="mr-2 h-5 w-5" />
                      BKSY Fund Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={bksyPieChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={60}
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {bksyPieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Amount Paid:</span>
                        <span className="font-medium">{formatCurrency(financialData.bksy.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">CGST:</span>
                        <span className="font-medium">{formatCurrency(financialData.bksy.cgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">SGST:</span>
                        <span className="font-medium">{formatCurrency(financialData.bksy.sgst)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">TDS:</span>
                        <span className="font-medium">{formatCurrency(financialData.bksy.tds)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {processedData ? 'No financial data available for the selected filters.' : 'Please upload a CSV file to view financial reports.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FinanceReport;
