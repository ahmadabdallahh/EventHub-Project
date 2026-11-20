import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = {
    id: string;
    name: string;
    placeholder: string;
    className?: string;
};

// Renders the password field plus a show/hide toggle. The parent supplies
// the `relative` wrapper (and the leading Lock icon), so this returns a
// bare fragment: input + absolutely-positioned toggle button.
const PasswordInput = ({ id, name, placeholder, className }: PasswordInputProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <>
            <input
                id={id}
                type={isVisible ? 'text' : 'password'}
                name={name}
                placeholder={placeholder}
                className={className}
            />
            <button
                type="button"
                onClick={() => setIsVisible((prev) => !prev)}
                aria-label={isVisible ? 'Hide password' : 'Show password'}
                aria-pressed={isVisible}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 transition hover:text-primary-400 focus:text-primary-400 focus:outline-none"
            >
                {isVisible ? (
                    <EyeOff aria-hidden="true" className="h-4 w-4" />
                ) : (
                    <Eye aria-hidden="true" className="h-4 w-4" />
                )}
            </button>
        </>
    );
};

export default PasswordInput;
