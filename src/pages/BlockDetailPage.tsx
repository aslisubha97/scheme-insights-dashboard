
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Home } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const BlockDetailPage: React.FC = () => {
  const { blockName } = useParams<{ blockName: string }>();
  const navigate = useNavigate();
  const { processedData } = useData();
  
  const blockData = useMemo(() => {
    if (!processedData || !blockName) return null;
    return processedData.blocks[decodeURIComponent(blockName)];
  }, [processedData, blockName]);
  
  const irrigationTypeData = useMemo(() => {
    if (!blockData) return [];
    
    const irrigationTypes = new Map<string, number>();
    
    blockData.farmers.forEach(farmer => {
      const type = farmer["Irrigation Type"] || "Unknown";
      irrigationTypes.set(type, (irrigationTypes.get(type) || 0) + 1);
    });
    
    return Array.from(irrigationTypes).map(([name, value]) => ({ name, value }));
  }, [blockData]);
  
  const gramPanchayetData = useMemo(() => {
    if (!blockData) return [];
    
    const gramPanchayets = new Map<string, number>();
    
    blockData.farmers.forEach(farmer => {
      const gp = farmer["Gram Panchayet"] || "Unknown";
      gramPanchayets.set(gp, (gramPanchayets.get(gp) || 0) + 1);
    });
    
    return Array.from(gramPanchayets)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [blockData]);
  
  // Calculate GST and Invoice Due statistics
  const financialStats = useMemo(() => {
    if (!blockData) return { gstSubmitted: 0, invoicesDue: 0, irrigationTypeDue: [] };
    
    let gstSubmitted = 0;
    let invoicesDue = 0;
    const irrigationTypeDueMap = new Map<string, number>();
    
    // We're only interested in farmers at work order stage or beyond
    const eligibleFarmers = blockData.farmers.filter(farmer => 
      ["work order", "install", "install & inspection"].some(stage => 
        farmer["Current Status"]?.toLowerCase()?.includes(stage)
      )
    );
    
    eligibleFarmers.forEach(farmer => {
      const hasTaxInvoice = farmer["Tax Inv. No."] && farmer["Tax Inv. No."].trim() !== "";
      const gstAmount = 
        (parseFloat(farmer["GST Amount"] || "0") || 0) + 
        (parseFloat(farmer["GST Amount (Addl. Item)"] || "0") || 0);
      
      // All GST is considered "submitted" for our dashboard
      gstSubmitted += gstAmount;
      
      // Track invoices due (no tax invoice number)
      if (!hasTaxInvoice) {
        invoicesDue++;
        
        // Extract irrigation type and count for invoice due
        const irrigationType = farmer["Irrigation Type"] || "Unknown";
        
        // Try to extract numbers and type
        let extractedType = irrigationType;
        const matches = irrigationType.match(/([a-zA-Z\s]+)([0-9]+)/);
        if (matches && matches.length > 1) {
          extractedType = matches[1].trim();
        }
        
        irrigationTypeDueMap.set(
          extractedType, 
          (irrigationTypeDueMap.get(extractedType) || 0) + 1
        );
      }
    });
    
    const irrigationTypeDue = Array.from(irrigationTypeDueMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    
    return { gstSubmitted, invoicesDue, irrigationTypeDue };
  }, [blockData]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  if (!blockData) {
    return (
      <div className="text-center py-16">
        <p>Block not found or data not loaded.</p>
        <Button 
          onClick={() => navigate('/')} 
          className="mt-4"
          variant="outline"
        >
          <Home className="mr-2 h-4 w-4" /> Return to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{blockName} Block Details</h1>
        </div>
      </div>
      
      {/* Financial Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-yellow-50 pb-2">
            <CardTitle className="text-lg">Financial Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">GST Submitted</p>
                <p className="text-xl font-bold text-green-600">
                  ₹{financialStats.gstSubmitted.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Invoices Due</p>
                <p className="text-xl font-bold text-blue-600">
                  {financialStats.invoicesDue}
                </p>
              </div>
            </div>
            
            {/* Invoice Due by Irrigation Type */}
            {financialStats.irrigationTypeDue.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Invoice Due by Irrigation Type</h3>
                <div className="space-y-1.5">
                  {financialStats.irrigationTypeDue.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{item.type}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Registration Stages */}
        <Card>
          <CardHeader className="bg-blue-50 pb-2">
            <CardTitle className="text-lg">Registration Stages</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>New Registration</span>
                <span className="font-medium">{blockData.registrationStages.newRegistration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Joint Inspection</span>
                <span className="font-medium">{blockData.registrationStages.jointInspection}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Work Order</span>
                <span className="font-medium">{blockData.registrationStages.workOrder}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Install</span>
                <span className="font-medium">{blockData.registrationStages.install}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Install & Inspection</span>
                <span className="font-medium">{blockData.registrationStages.installAndInspection}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between items-center font-bold">
                <span>Total</span>
                <span>{blockData.registrationStages.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Irrigation Type Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Irrigation Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={irrigationTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {irrigationTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} farmers`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Gram Panchayat Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gram Panchayat-wise Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={gramPanchayetData.slice(0, 10)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`${value} farmers`, '']} />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockDetailPage;
