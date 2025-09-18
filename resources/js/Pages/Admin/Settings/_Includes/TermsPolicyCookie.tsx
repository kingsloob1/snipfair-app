import CustomButton from '@/Components/common/CustomButton';
import { useForm } from '@inertiajs/react';
import JoditEditor from 'jodit-react-ts';
import 'jodit/es2021/jodit.min.css';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

interface TabData {
    id: string;
    label: string;
    content?: string | null;
}

interface TermsPolicyCookieProps {
    configs: {
        terms?: string | null;
        privacy_policy?: string | null;
        cookies?: string | null;
    };
}

export default function TermsPolicyCookie({ configs }: TermsPolicyCookieProps) {
    const [activeTab, setActiveTab] = useState('terms');

    const tabs: TabData[] = [
        { id: 'terms', label: 'Terms of Service', content: configs.terms },
        {
            id: 'privacy_policy',
            label: 'Privacy Policy',
            content: configs.privacy_policy,
        },
        { id: 'cookies', label: 'Cookie Policy', content: configs.cookies },
    ];

    const { data, setData, post, processing, errors } = useForm<{
        type: string;
        content: string;
    }>({
        type: activeTab,
        content: tabs.find((tab) => tab.id === activeTab)?.content || '',
    });

    // Jodit editor configuration - text only
    const config = {
        readonly: false,
        placeholder: 'Enter content...',
        height: 400,
        toolbarSticky: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        buttons: [
            'bold',
            'italic',
            'underline',
            '|',
            'ul',
            'ol',
            '|',
            'outdent',
            'indent',
            '|',
            'font',
            'fontsize',
            'brush',
            '|',
            'paragraph',
            '|',
            'align',
            '|',
            'undo',
            'redo',
            '|',
            'hr',
            'link',
            'unlink',
            '|',
            'selectall',
            'cut',
            'copy',
            'paste',
            '|',
            'source',
        ],
        removeButtons: [
            'image',
            'video',
            'file',
            'iframe',
            'table',
            'spellcheck',
            'speechRecognize',
            'preview',
            'print',
            'about',
        ],
        disablePlugins: [
            'paste',
            'drag-and-drop-element',
            'resizer',
            'add-new-line',
        ],
        uploader: {
            insertImageAsBase64URI: false,
            url: '',
        },
        filebrowser: {
            ajax: {
                url: '',
            },
        },
        image: {
            openOnDblClick: false,
            editSrc: false,
            useImageEditor: false,
            editTitle: false,
            editAlt: false,
            editLink: false,
            editSize: false,
            editBorderRadius: false,
            editMargins: false,
            editClass: false,
            editStyle: false,
            editId: false,
            resizable: false,
            removable: false,
        },
        link: {
            openInNewTabCheckbox: true,
            noFollowCheckbox: false,
            modeClassName: 'input',
        },
    };

    const handleTabChange = (tabId: string) => {
        const tab = tabs.find((t) => t.id === tabId);
        if (tab) {
            setActiveTab(tabId);
            setData({
                type: tabId,
                content: tab.content ?? '',
            });
        }
    };

    const handleContentChange = (content: string) => {
        setData('content', content);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update-policy'), {
            preserveScroll: true,
            onSuccess: () => {
                // Update the local tab content after successful submission
                const tabIndex = tabs.findIndex((tab) => tab.id === activeTab);
                if (tabIndex !== -1) {
                    tabs[tabIndex].content = data.content;
                }
            },
        });
    };

    const currentTab = tabs.find((tab) => tab.id === activeTab);
    return (
        <div className="bg-sf-white">
            <div className="grid grid-cols-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-6 py-3 font-medium transition-colors duration-200 ${
                            activeTab === tab.id
                                ? 'bg-sf-primary-paragraph text-white'
                                : 'bg-sf-white-card text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="border border-sf-primary-paragraph bg-sf-white">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-6"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <JoditEditor
                                    defaultValue={data.content}
                                    config={config}
                                    onChange={handleContentChange}
                                />

                                {errors.content && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.content}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <CustomButton
                                    variant="black"
                                    type="submit"
                                    fullWidth={false}
                                    loading={processing}
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Updating...'
                                        : `Update ${currentTab?.label}`}
                                </CustomButton>
                            </div>
                        </form>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
