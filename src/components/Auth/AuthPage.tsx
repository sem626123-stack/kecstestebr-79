import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react';
import loginCharacter from '@/assets/login-character.png';

interface AuthPageProps {
  onBack: () => void;
}

const AuthPage = ({ onBack }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('🔐 Starting authentication process...');

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        const { error, data } = await signUp(
          formData.email,
          formData.password,
          'varejo', // Setor padrão, apenas admin pode alterar
          formData.phone
        );

        if (error) throw error;

        if (data.user && !data.session) {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta. Enquanto isso, você pode navegar como visitante.",
          });
        } else {
          toast({
            title: "Cadastro realizado!",
            description: "Conta criada com sucesso!",
          });
        }
      } else {
        console.log('🔐 Attempting login...');
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;

        console.log('✅ Login successful');
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
        setTimeout(() => onBack(), 100);
      }
    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Authentication process finished');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      
      toast({
        title: "Login realizado!",
        description: "Bem-vindo!",
      });
      setTimeout(() => onBack(), 100);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer login com Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Floating Elements Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-primary/10 rounded-full animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Side - Character & Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
          <div className="text-center space-y-8 px-8">
            {/* Character with Animation */}
            <div className={`transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative">
                <img 
                  src={loginCharacter} 
                  alt="Bem-vindo" 
                  className="w-80 h-auto mx-auto animate-float-gentle filter drop-shadow-2xl"
                />
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full scale-75 animate-pulse-soft" />
              </div>
            </div>

            {/* Welcome Text */}
            <div className={`space-y-4 transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Bem-vindo de volta!
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Acesse sua conta e descubra os melhores preços em componentes de PC
              </p>
            </div>

            {/* Animated Stats */}
            <div className={`grid grid-cols-3 gap-6 max-w-md mx-auto transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="text-center space-y-1 animate-fade-in-up">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Produtos</div>
              </div>
              <div className="text-center space-y-1 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                <div className="text-2xl font-bold text-primary">1K+</div>
                <div className="text-xs text-muted-foreground">Clientes</div>
              </div>
              <div className="text-center space-y-1 animate-fade-in-up" style={{animationDelay: '400ms'}}>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-xs text-muted-foreground">Suporte</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <Card className={`w-full max-w-md shadow-elegant border-0 bg-card/80 backdrop-blur-sm transition-all duration-1000 ${mounted ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-10 opacity-0 scale-95'}`}>
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                    {isSignUp ? 'Criar Conta' : 'Entrar'}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {isSignUp ? 'Cadastre-se para acessar preços especiais' : 'Entre com sua conta'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className={`space-y-2 transition-all duration-500 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-12 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    placeholder="seu@email.com"
                  />
                </div>

                {/* Phone Field for Sign Up */}
                {isSignUp && (
                  <div className={`space-y-2 transition-all duration-500 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                    <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      Telefone (opcional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="h-12 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                )}

                {/* Password Field */}
                <div className={`space-y-2 transition-all duration-500 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="h-12 pr-12 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field for Sign Up */}
                {isSignUp && (
                  <div className={`space-y-2 transition-all duration-500 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                      <Lock className="h-4 w-4" />
                      Confirmar Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="h-12 pr-12 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className={`w-full h-12 bg-gradient-primary hover:shadow-glow transition-all duration-500 delay-600 ${loading ? 'animate-pulse' : ''} ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </div>
                  ) : (
                    isSignUp ? 'Criar Conta' : 'Entrar'
                  )}
                </Button>

                {/* Divider */}
                <div className={`relative transition-all duration-500 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      ou
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button 
                  type="button" 
                  variant="outline" 
                  className={`w-full h-12 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 delay-800 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </Button>

                {/* Toggle Sign Up/In */}
                <div className={`text-center transition-all duration-500 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {isSignUp 
                      ? 'Já tem uma conta? Faça login' 
                      : 'Não tem conta? Cadastre-se'
                    }
                  </Button>
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Nota: O setor será definido pelo administrador após aprovação
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;