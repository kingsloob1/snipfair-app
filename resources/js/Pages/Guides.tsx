import AnimatedSweep from '@/Components/common/AnimatedSweep';
import GradientButton from '@/Components/common/GradientButton';
import RegisterSteps from '@/Components/stylist/RegisterSteps';
import ResumeTutorialCard from '@/Components/stylist/ResumeTutorialCard';
import ViewTutorialCard from '@/Components/stylist/ViewTutorialCard';
// import Cta from '@/Components/home/Cta';
// import Faqs from '@/Components/home/Faqs';
// import Featured from '@/Components/home/Featured';
// import Hero from '@/Components/home/Hero';
// import HowItWorks from '@/Components/home/HowItWorks';
// import Services from '@/Components/home/Services';
// import Testimonial from '@/Components/home/Testimonial';
// import Trending from '@/Components/home/Trending';
// import Footer from '@/Components/layout/Footer';
// import Navbar from '@/Components/layout/Navbar';

export default function Guides() {
    return (
        <>
            {/* <h1>Guides</h1> */}
            <AnimatedSweep />
            <RegisterSteps
                steps={[
                    'Personal Info',
                    'Verification',
                    'Skill Details',
                    'Certification',
                    'Complete',
                ]}
                currentStep={6}
            />
            <ResumeTutorialCard />
            <ViewTutorialCard />
            <GradientButton
                text="My Button"
                className="px-2 py-1 text-sm font-normal"
            />
            {/* <Navbar /> */}
            {/* <Hero />
            <Trending />
            <Services />
            <HowItWorks />
            <Featured />
            <Testimonial />
            <Faqs />
            <Cta />
            <Footer /> */}
            {/* <SearchDialog /> */}
        </>
    );
}
