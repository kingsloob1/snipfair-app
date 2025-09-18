import { Mail } from 'lucide-react';

const Contact: React.FC = () => {
    return (
        <div className="w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6">
            <h2 className="mb-5 text-base font-bold text-sf-black md:text-lg">
                Contact Customer Care
            </h2>
            {/* <div className="mb-4 flex items-center gap-2 text-sm text-sf-primary-paragraph">
                <Phone className="h-4 w-4" />
                <span>(555) 567 8009</span>
            </div> */}
            <div className="mb-4 flex items-center gap-2 text-sm text-sf-primary-paragraph">
                <Mail className="h-4 w-4" />
                <span>support@snipfair.com</span>
            </div>
        </div>
    );
};

export default Contact;
