
'use client';

import { Trophy, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase/provider';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { LoginDialog } from './LoginDialog';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSignIn = (email: string, password: string) => {
    initiateEmailSignIn(auth, email, password, (error) => {
        toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
        })
    });
    setLoginDialogOpen(false);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2 mr-auto">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl font-headline">RankMaster</span>
          </Link>

          {isUserLoading ? (
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user.email ? user.email.charAt(0).toUpperCase() : (user.isAnonymous ? 'A' : 'U')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email || (user.isAnonymous ? 'Anonymous User' : 'User')}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.uid}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setLoginDialogOpen(true)} variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </header>
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLogin={handleSignIn}
      />
    </>
  );
}
