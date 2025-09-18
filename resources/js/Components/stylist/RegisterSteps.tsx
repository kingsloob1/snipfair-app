import { Step, Stepper } from 'react-form-stepper';

const RegisterSteps = ({
    steps,
    currentStep,
}: {
    steps: string[];
    currentStep: number;
}) => {
    const styleConfig = {
        activeBgColor: '#9333EA',
        completedBgColor: '#10B981',
        inactiveBgColor: '#D1D5DB',
        activeTextColor: '#FFFFFF',
        completedTextColor: '#FFFFFF',
        inactiveTextColor: '#FFFFFF',
        size: '2rem',
        fontWeight: 500,
        circleFontSize: '1rem',
        labelFontSize: '0.75rem',
        borderRadius: '50%',
    };

    const connectorStyleConfig = {
        disabledColor: '#D1D5DB',
        activeColor: '#9333EA',
        completedColor: '#10B981',
        size: 2,
        style: 'solid',
    };
    return (
        <div className="no-scrollbar mx-auto flex w-full max-w-[560px] items-center justify-between overflow-x-auto p-4">
            <div className="min-w-96">
                <Stepper
                    className="w-full !p-0"
                    activeStep={currentStep - 1}
                    styleConfig={styleConfig}
                    connectorStyleConfig={connectorStyleConfig}
                    connectorStateColors={true}
                >
                    {steps.map((step, index) => (
                        <Step key={index} label={step} />
                    ))}
                </Stepper>
            </div>
        </div>
    );
};

export default RegisterSteps;
