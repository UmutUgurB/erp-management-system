'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Copy,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

interface TwoFactorAuthProps {
  isEnabled: boolean;
  onEnable: (code: string) => Promise<void>;
  onDisable: () => Promise<void>;
  onVerify: (code: string) => Promise<boolean>;
}

export default function TwoFactorAuth({ 
  isEnabled, 
  onEnable, 
  onDisable, 
  onVerify 
}: TwoFactorAuthProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isEnabled) {
      setStep('enabled');
    }
  }, [isEnabled]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to generate QR code and secret
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, this would come from your API
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const mockQRCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
      
      setSecretKey(mockSecret);
      setQrCode(mockQRCode);
      setStep('verify');
      
      addNotification('success', 'Başarılı!', 'QR kod başarıyla oluşturuldu.');
    } catch (error) {
      addNotification('error', 'Hata!', 'QR kod oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      addNotification('error', 'Hata!', 'Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await onVerify(verificationCode);
      
      if (isValid) {
        await onEnable(verificationCode);
        setStep('enabled');
        generateBackupCodes();
        addNotification('success', 'Başarılı!', 'İki faktörlü kimlik doğrulama etkinleştirildi.');
      } else {
        addNotification('error', 'Hata!', 'Doğrulama kodu hatalı.');
      }
    } catch (error) {
      addNotification('error', 'Hata!', 'Doğrulama sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      await onDisable();
      setStep('setup');
      setVerificationCode('');
      setQrCode('');
      setSecretKey('');
      setBackupCodes([]);
      addNotification('success', 'Başarılı!', 'İki faktörlü kimlik doğrulama devre dışı bırakıldı.');
    } catch (error) {
      addNotification('error', 'Hata!', 'Devre dışı bırakma sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackupCodes = () => {
    // Generate 8 backup codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
    addNotification('success', 'Kopyalandı!', 'Gizli anahtar panoya kopyalandı.');
  };

  const downloadBackupCodes = () => {
    const content = `ERP Sistemi - Yedek Kodlar\n\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nBu kodları güvenli bir yerde saklayın.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'enabled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            İki Faktörlü Kimlik Doğrulama Aktif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">Güvenlik etkinleştirildi</span>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Yedek Kodlar</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Ana cihazınıza erişiminiz olmadığında kullanmak için yedek kodlar:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-2 rounded text-center font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
              <Download className="h-4 w-4 mr-2" />
              İndir
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Devre Dışı Bırakılıyor...
                </div>
              ) : (
                'Devre Dışı Bırak'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            İki Faktörlü Kimlik Doğrulama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Mobil Uygulama ile Doğrulama
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Google Authenticator veya benzeri bir uygulama kullanarak güvenliğinizi artırın.
                </p>
              </div>
            </div>

            {step === 'setup' && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  İki Faktörlü Kimlik Doğrulama
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Hesabınızı daha güvenli hale getirmek için iki faktörlü kimlik doğrulamayı etkinleştirin.
                </p>
                <Button onClick={generateQRCode} disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Hazırlanıyor...
                    </div>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Etkinleştir
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === 'verify' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <h4 className="font-medium mb-4">QR Kodu Tarayın</h4>
                    <div className="bg-white p-4 rounded-lg border inline-block">
                      <img 
                        src={qrCode} 
                        alt="QR Code" 
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Google Authenticator uygulamasında QR kodu tarayın
                    </p>
                  </div>

                  {/* Manual Setup */}
                  <div>
                    <h4 className="font-medium mb-4">Manuel Kurulum</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Gizli Anahtar
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={secretKey}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm font-mono"
                          />
                          <Button variant="outline" size="sm" onClick={copySecretKey}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        QR kod çalışmıyorsa, bu anahtarı manuel olarak girin.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Doğrulama</h4>
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      6 Haneli Doğrulama Kodu
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Uygulamada görünen 6 haneli kodu girin
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
                      {isLoading ? (
                        <div className="flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Doğrulanıyor...
                        </div>
                      ) : (
                        'Doğrula ve Etkinleştir'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 