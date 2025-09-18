import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import { useState } from 'react';
import FAQs from './_Includes/FAQs';
import FeaturedMedia from './_Includes/FeaturedMedia';
import FeaturedStylists from './_Includes/FeaturedStylists';
import ReviewMonitoring from './_Includes/ReviewMonitoring';
import StylesMedia from './_Includes/StylesMedia';

interface StylesMedia {
    id: number;
    model_id: string;
    type: 'styles' | 'media';
    url: string;
}

interface ImagesMedia {
    id: number;
    slug: string;
    type: 'portfolio' | 'proof';
    image: string;
}
interface ContentProps {
    reviews: {
        id: number;
        rating: number;
        comment: string;
        appointment: {
            customer: string;
            stylist: string;
        };
        created_at: string;
    }[];
    faqs: {
        id: number;
        question: string;
        answer: string;
        category: string;
        created_at: string;
    }[];
    stylists_for_featured: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        total_appointments: number;
        total_earnings: number;
        average_rating: number;
        portfolios_count: number;
        total_reviews: number;
        is_featured: boolean;
    }[];
    featured_media: string[];
    styles_images: StylesMedia[];
    media_images: StylesMedia[];
    all_images: ImagesMedia[];
    // portfolios: ImagesMedia[];
    // proofs: ImagesMedia[];
}

// 'id' => $proof->appointment->portfolio->id,
//                 'slug' => $proof->id . '_' . $index,
//                 'type' => 'proof',
//                 'image' => $image, //styles_media,proofs,portfolios,all_images

export default function Contents({
    reviews,
    stylists_for_featured,
    faqs,
    featured_media,
    styles_images,
    media_images,
    all_images,
    // portfolios,
    // proofs,
}: ContentProps) {
    const [activeTab, setActiveTab] = useState<
        | 'media'
        | 'reviews'
        | 'faqs'
        | 'featured'
        | 'styles_images'
        | 'media_images'
    >('media');

    const routes = [
        {
            name: 'Manage Content',
            path: route('admin.contents'),
            active: false,
        },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(
            value as
                | 'media'
                | 'reviews'
                | 'faqs'
                | 'featured'
                | 'styles_images'
                | 'media_images',
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'media':
                return <FeaturedMedia featured_media={featured_media} />;
            case 'reviews':
                return <ReviewMonitoring reviews={reviews} />;
            case 'faqs':
                return <FAQs faqs={faqs} />;
            case 'featured':
                return <FeaturedStylists stylists={stylists_for_featured} />;
            case 'styles_images':
                return (
                    <StylesMedia
                        styles_media={styles_images}
                        all_media={all_images}
                        variant="styles"
                    />
                );
            case 'media_images':
                return (
                    <StylesMedia
                        styles_media={media_images}
                        all_media={all_images}
                        variant="media"
                    />
                );
        }
    };
    const getTabDisplayText = () => {
        switch (activeTab) {
            case 'media':
                return 'Featured Media';
            case 'reviews':
                return 'Reviews';
            case 'faqs':
                return 'FAQs';
            case 'featured':
                return 'Featured Stylists';
            case 'styles_images':
                return 'Trending Styles';
            case 'media_images':
                return 'Featured Media';
            default:
                return 'Featured Media';
        }
    };

    return (
        <AdminAccountLayout header="Admin Contents">
            <StylistNavigationSteps
                routes={routes}
                sub="Manage website content and featured stylists"
            >
                <Select value={activeTab} onValueChange={handleTabChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={getTabDisplayText()} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="media">Featured Media</SelectItem>
                        <SelectItem value="reviews">Reviews</SelectItem>
                        <SelectItem value="faqs">FAQs</SelectItem>
                        <SelectItem value="featured">
                            Featured Stylists
                        </SelectItem>
                        <SelectItem value="styles_images">
                            Trending Styles
                        </SelectItem>
                        <SelectItem value="media_images">
                            Featured Media
                        </SelectItem>
                    </SelectContent>
                </Select>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                {renderTabContent()}
            </section>
        </AdminAccountLayout>
    );
}
