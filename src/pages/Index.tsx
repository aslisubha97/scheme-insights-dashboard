
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BarChart3, UploadCloud, PieChart } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.14))]">
      <div className="w-full max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-scheme-pmksy to-scheme-bksy bg-clip-text text-transparent">
          PMKSY & BKSY Scheme Insights Dashboard
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Track the progress of PMKSY and BKSY schemes with comprehensive dashboards and financial reports.
          Upload CSV data and gain valuable insights into your schemes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-scheme-pmksy">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="rounded-full bg-scheme-pmksy/10 p-3 mb-4">
                <UploadCloud className="h-8 w-8 text-scheme-pmksy" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Upload Data</h2>
              <p className="text-gray-600 text-sm mb-4 text-center">
                Import CSV files containing farmer registration details and scheme information
              </p>
              <Button className="w-full bg-scheme-pmksy hover:bg-scheme-pmksy/90" asChild>
                <Link to="/upload">Start Upload</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-scheme-accent">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="rounded-full bg-scheme-accent/10 p-3 mb-4">
                <BarChart3 className="h-8 w-8 text-scheme-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-2">View Dashboard</h2>
              <p className="text-gray-600 text-sm mb-4 text-center">
                Visualize block-wise registration stages and monitor implementation progress
              </p>
              <Button className="w-full bg-scheme-accent hover:bg-scheme-accent/90" asChild>
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-scheme-bksy">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="rounded-full bg-scheme-bksy/10 p-3 mb-4">
                <PieChart className="h-8 w-8 text-scheme-bksy" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Financial Reports</h2>
              <p className="text-gray-600 text-sm mb-4 text-center">
                Access detailed financial metrics for PMKSY and BKSY schemes
              </p>
              <Button className="w-full bg-scheme-bksy hover:bg-scheme-bksy/90" asChild>
                <Link to="/finance">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-3">Getting Started</h3>
          <ol className="text-left list-decimal list-inside space-y-2 text-gray-600">
            <li>Upload your scheme CSV data using the Upload Data feature</li>
            <li>Navigate to the Dashboard to view block-wise status and progress</li>
            <li>Check Financial Reports for detailed payment information</li>
            <li>Filter data by district or block for more specific insights</li>
            <li>Export filtered data for offline analysis or reporting</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Index;
