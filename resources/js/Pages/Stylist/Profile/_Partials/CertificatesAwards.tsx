import CustomButton from '@/Components/common/CustomButton';
import { PencilLine } from 'lucide-react';
import CertificationCard from './CertificateCard';

interface CertificationData {
    id: number;
    certificate_file: string | null;
    title: string;
    issuer: string;
    status: string;
    skill?: string;
    about?: string;
}

interface PayoutSettingsProps {
    addNewCertificate?: () => void;
    certifications: CertificationData[];
}

const CertificatesAwards = ({
    addNewCertificate,
    certifications,
}: PayoutSettingsProps) => {
    const handleEdit = (id: number): void => {
        console.log(`Edit certification with ID: ${id}`);
        // Add your edit logic here
    };

    const handleDelete = (id: number): void => {
        console.log(`Delete certification with ID: ${id}`);
        // Add your delete logic here
    };
    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-sf-stroke py-4">
                <h3 className="text-lg font-semibold text-sf-black md:text-xl xl:text-2xl">
                    Skills & Certifications
                </h3>
                <CustomButton
                    variant="secondary"
                    onClick={addNewCertificate}
                    fullWidth={false}
                >
                    <div className="flex gap-2">
                        <PencilLine className="h-4 w-4" />
                        <span className="text-sm font-medium">Add New</span>
                    </div>
                </CustomButton>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {certifications.map((cert: CertificationData) => (
                    <CertificationCard
                        key={cert.id}
                        logoSrc={`/storage/${cert.certificate_file}`}
                        title={cert.title}
                        issuer={cert.issuer}
                        verified={cert.status === 'verified'}
                        role={cert.skill}
                        description={cert.about}
                        onEdit={() => handleEdit(cert.id)}
                        onDelete={() => handleDelete(cert.id)}
                    />
                ))}
            </div>

            {certifications.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center">
                    <p className="text-center italic text-sf-gray-zinc">
                        No certifications available
                    </p>
                </div>
            )}
        </div>
    );
};

export default CertificatesAwards;
