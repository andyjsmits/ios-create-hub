import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const Verified = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/', { replace: true }), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Email Verified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Thanks for confirming your email. Redirecting you to PULSE…
          </p>
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verified;

