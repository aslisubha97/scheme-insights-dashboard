
import React, { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToCSV } from '@/utils/csvParser';
import { FarmerData } from '@/types';
import { Link } from 'react-router-dom';

const InvoiceDuePage: React.FC = () => {
  const { processedData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const invoiceDueFarmers = useMemo(() => {
    if (!processedData) return [];
    
    // Filter farmers with irrigation type = 'Portable sprinkler' and without tax invoice
    return processedData.allFarmers.filter(farmer => 
      farmer["Irrigation Type"]?.toLowerCase().includes('portable sprinkler') && 
      (!farmer["Tax Inv. No."] || farmer["Tax Inv. No."].trim() === '')
    );
  }, [processedData]);
  
  const filteredFarmers = useMemo(() => {
    if (!searchTerm.trim()) return invoiceDueFarmers;
    
    const term = searchTerm.toLowerCase();
    return invoiceDueFarmers.filter(farmer => 
      farmer["Name of Beneficiary"]?.toLowerCase().includes(term) || 
      farmer["Farmer Registration Number"]?.toLowerCase().includes(term) ||
      farmer["Block Name"]?.toLowerCase().includes(term)
    );
  }, [invoiceDueFarmers, searchTerm]);
  
  const handleExport = () => {
    if (filteredFarmers.length === 0) return;
    
    // Export only the selected fields
    const exportData = filteredFarmers.map(farmer => ({
      'Registration Number': farmer["Farmer Registration Number"],
      'Name': farmer["Name of Beneficiary"],
      'Block Name': farmer["Block Name"],
      'Irrigation Type': farmer["Irrigation Type"],
      'Current Status': farmer["Current Status"]
    }));
    
    exportToCSV(exportData, `invoice-due-list-${new Date().toISOString().slice(0, 10)}.csv`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/finance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Invoice Due List</h2>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={filteredFarmers.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <CardTitle className="text-lg">
              Portable Sprinkler Farmers with Pending Invoices 
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredFarmers.length} records)
              </span>
            </CardTitle>
            
            <div className="relative md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFarmers.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Registration Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Block Name</TableHead>
                    <TableHead>Irrigation Type</TableHead>
                    <TableHead>Current Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFarmers.map((farmer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{farmer["Farmer Registration Number"]}</TableCell>
                      <TableCell>{farmer["Name of Beneficiary"]}</TableCell>
                      <TableCell>{farmer["Block Name"]}</TableCell>
                      <TableCell>{farmer["Irrigation Type"]}</TableCell>
                      <TableCell>{farmer["Current Status"]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {processedData ? 'No portable sprinkler farmers with invoices due' : 'Please upload data to view invoice due list'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDuePage;
