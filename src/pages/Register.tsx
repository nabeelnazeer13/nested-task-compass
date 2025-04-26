
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      await signUp(data.email, data.password, data.name);
      toast({
        title: "Success",
        description: "Registration successful. Please check your email to verify your account.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Sign up to start managing your tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...register('name', { required: true })}
                type="text"
                placeholder="Full name"
                autoComplete="name"
              />
            </div>
            <div>
              <Input
                {...register('email', { required: true })}
                type="email"
                placeholder="Email address"
                autoComplete="email"
              />
            </div>
            <div>
              <Input
                {...register('password', { required: true })}
                type="password"
                placeholder="Password"
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col space-y-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
