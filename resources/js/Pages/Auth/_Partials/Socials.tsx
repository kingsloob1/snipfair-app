import { Apple, Facebook, Google } from '@/Components/icon/Icons';

export default function Socials({
    role = 'customer',
}: {
    role?: 'customer' | 'stylist';
}) {
    const handleGoogleSignIn = (role: 'customer' | 'stylist') => {
        // Use Inertia to navigate to the Google OAuth route
        window.location.href = route(`auth.google.${role}`);

        // Alternative: If you prefer using router.visit()
        // router.visit(route(`auth.google.${role}`));
    };
    return (
        <div className="flex w-full justify-center gap-7">
            <button
                onClick={() => handleGoogleSignIn(role)}
                className="flex items-center justify-center gap-2 rounded-full bg-sf-primary-background px-3.5 py-2.5 text-sm shadow-sm transition-all duration-300 hover:bg-sf-stroke/70 hover:shadow-lg active:scale-95"
            >
                <Google className="h-5 w-5" />
                Sign in With Google
            </button>
            <button className="hidden h-10 w-10 items-center justify-center rounded-full bg-sf-primary-background hover:bg-sf-stroke">
                <Facebook className="h-7 w-7" />
            </button>
            <button className="hidden h-10 w-10 items-center justify-center rounded-full bg-sf-primary-background hover:bg-sf-stroke">
                <Apple className="h-7 w-7" />
            </button>
        </div>
    );
}
