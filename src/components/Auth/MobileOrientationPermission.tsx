import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, RotateCw } from 'lucide-react';

interface MobileOrientationPermissionProps {
  onPermissionGranted: () => void;
}

const MobileOrientationPermission = ({ onPermissionGranted }: MobileOrientationPermissionProps) => {
  const [needsPermission, setNeedsPermission] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Check if we're on mobile and if permission is needed
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const needsDeviceOrientationPermission = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    
    if (isMobile && needsDeviceOrientationPermission) {
      setNeedsPermission(true);
    } else if (isMobile) {
      // Android or older iOS - no permission needed, just activate
      onPermissionGranted();
    }
  }, [onPermissionGranted]);

  const requestPermission = async () => {
    setRequesting(true);
    
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setNeedsPermission(false);
          onPermissionGranted();
        }
      }
    } catch (error) {
      console.log('DeviceOrientation permission denied');
    } finally {
      setRequesting(false);
    }
  };

  if (!needsPermission) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-lg p-6 max-w-sm w-full shadow-elegant text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Experiência Interativa</h3>
          <p className="text-sm text-muted-foreground">
            Permita o acesso ao sensor de movimento para que o personagem reaja ao movimento do seu celular
          </p>
        </div>

        <Button 
          onClick={requestPermission}
          disabled={requesting}
          className="w-full bg-gradient-primary"
        >
          {requesting ? (
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin" />
              Solicitando...
            </div>
          ) : (
            'Ativar Movimento'
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Você pode pular esta etapa e usar apenas o mouse
        </p>
      </div>
    </div>
  );
};

export default MobileOrientationPermission;